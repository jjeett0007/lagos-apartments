import { createHash, randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { endpoint, json, assertSameOrigin, ApiError } from "@/lib/server/api";
import { requireUser } from "@/lib/server/session";
import { ownedListing, lockDraft } from "@/lib/server/listings";
import { getDb } from "@/lib/server/db";
import { roomSections, type RoomSection } from "@/lib/validation";
import type { RoomType } from "@/generated/prisma/enums";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/server/cloudinary";

export const runtime = "nodejs";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // 8MB

function isImageBuffer(head: Buffer) {
  const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
  const isPng = head.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isWebp = head.subarray(0, 4).toString() === "RIFF" && head.subarray(8, 12).toString() === "WEBP";
  return isJpeg || isPng || isWebp;
}

export function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return endpoint(async () => {
    const user = await requireUser(request, true);
    const { id } = await context.params;
    await ownedListing(id, user.id);
    const photos = await getDb().photo.findMany({
      where: { listingId: id },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        url: true,
        section: true,
        label: true,
        sortOrder: true,
        createdAt: true,
      },
    });
    return json({ photos });
  });
}

export function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return endpoint(async () => {
    assertSameOrigin(request);
    const user = await requireUser(request, true);
    const { id } = await context.params;
    const listing = await ownedListing(id, user.id);
    if (!["DRAFT", "REJECTED"].includes(listing.status)) {
      throw new ApiError(409, "This listing is locked or has already been submitted.");
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      throw new ApiError(400, "Invalid form data submission.");
    }

    // Support single 'photo' or 'file', or multiple files
    const fileEntries = form.getAll("photos").concat(form.getAll("photo")).concat(form.getAll("file"));
    const files = fileEntries.filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length === 0) {
      throw new ApiError(400, "Select at least one apartment photo to upload.");
    }

    // Section and label from form
    const rawSection = (form.get("section") as string | null)?.toUpperCase() ?? "OTHER";
    const section: RoomType = roomSections.includes(rawSection as RoomSection) ? (rawSection as RoomType) : "OTHER";
    const label = (form.get("label") as string | null)?.trim() || null;

    const db = getDb();
    const currentCount = await db.photo.count({ where: { listingId: id } });

    const createdPhotos = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > MAX_PHOTO_BYTES) {
        throw new ApiError(413, `Photo "${file.name}" exceeds the 8 MB size limit.`);
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      if (buffer.length < 12 || !isImageBuffer(buffer.subarray(0, 12))) {
        throw new ApiError(400, `File "${file.name}" must be a valid JPG, PNG, or WebP image.`);
      }

      let photoUrl = "";
      let storageKey = "";
      let width: number | undefined;
      let height: number | undefined;

      // Upload to Cloudinary if credentials are configured
      if (isCloudinaryConfigured()) {
        try {
          const result = await uploadToCloudinary({
            file: buffer,
            filename: file.name,
            folder: `eko-space/${user.id}/${id}`,
            tags: ["listing", id, section.toLowerCase()],
          });
          photoUrl = result.secureUrl;
          storageKey = result.publicId;
          width = result.width;
          height = result.height;
        } catch (err) {
          console.error("Cloudinary upload failed, falling back to local storage:", err);
          // Gracefully fall back to local disk storage
        }
      }

      // If not stored in Cloudinary, store locally in public/uploads/listings/<id>
      if (!photoUrl) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
        const relativeDir = join("uploads", "listings", id);
        const absoluteDir = join(process.cwd(), "public", relativeDir);

        await mkdir(absoluteDir, { recursive: true });
        await writeFile(join(absoluteDir, filename), buffer);

        photoUrl = `/${relativeDir}/${filename}`.replace(/\\/g, "/");
        storageKey = `local:${id}:${filename}`;
      }

      const photoRecord = await db.$transaction(async (tx) => {
        await lockDraft(tx, id, user.id);
        return tx.photo.create({
          data: {
            listingId: id,
            url: photoUrl,
            storageKey,
            section,
            label,
            width,
            height,
            altText: label || `${section.replaceAll("_", " ")} photo`,
            sortOrder: currentCount + i,
          },
          select: {
            id: true,
            url: true,
            section: true,
            label: true,
            sortOrder: true,
            createdAt: true,
          },
        });
      });

      createdPhotos.push(photoRecord);
    }

    return json({ photos: createdPhotos }, 201);
  });
}
