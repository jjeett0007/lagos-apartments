import { Prisma } from "@/generated/prisma/client";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { endpoint, json, assertSameOrigin, ApiError } from "@/lib/server/api";
import { requireUser } from "@/lib/server/session";
import { ownedListing, lockDraft } from "@/lib/server/listings";
import { getDb } from "@/lib/server/db";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/server/cloudinary";

export const runtime = "nodejs";

export function POST(
  request: Request,
  context: { params: Promise<{ id: string; roomId: string }> }
) {
  return endpoint(async () => {
    assertSameOrigin(request);
    const user = await requireUser(request, true);
    const { id, roomId } = await context.params;
    const listing = await ownedListing(id, user.id);
    if (!["DRAFT", "REJECTED"].includes(listing.status) || !listing.rooms.some((room) => room.id === roomId)) {
      throw new ApiError(409, "This room cannot be edited.");
    }

    const reader = request.body?.getReader();
    if (!reader) throw new ApiError(400, "Choose a room photo.");
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 8 * 1024 * 1024 + 65536) {
        await reader.cancel();
        throw new ApiError(413, "Choose a photo smaller than 8 MB.");
      }
      chunks.push(value);
    }

    let form: FormData;
    try {
      form = await new Response(new Blob(chunks as BlobPart[]), {
        headers: { "Content-Type": request.headers.get("content-type") ?? "" },
      }).formData();
    } catch {
      throw new ApiError(400, "Choose a valid room photo.");
    }

    const file = form.get("photo");
    if (!(file instanceof File) || !file.size || file.size > 8 * 1024 * 1024) {
      throw new ApiError(400, "Choose a photo smaller than 8 MB.");
    }

    const head = Buffer.from(await file.slice(0, 12).arrayBuffer());
    const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
    const isPng = head.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    const isWebp = head.subarray(0, 4).toString() === "RIFF" && head.subarray(8, 12).toString() === "WEBP";
    if (!isJpeg && !isPng && !isWebp) {
      throw new ApiError(400, "Choose a JPG, PNG, or WebP photo.");
    }

    let photoUrl = "";
    let storageKey = "";
    let width: number | null = null;
    let height: number | null = null;

    // Upload to Cloudinary if credentials are configured
    if (isCloudinaryConfigured()) {
      try {
        const uploadResult = await uploadToCloudinary({
          file,
          filename: file.name,
          folder: `eko-space/${user.id}/${id}/${roomId}`,
          tags: ["room-photo", id, roomId],
        });
        photoUrl = uploadResult.secureUrl;
        storageKey = uploadResult.publicId;
        width = uploadResult.width;
        height = uploadResult.height;
      } catch (err) {
        console.error("Cloudinary upload failed, falling back to local storage:", err);
      }
    }

    // Fall back to local storage if Cloudinary is not configured or upload failed
    if (!photoUrl) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const filename = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
      const relativeDir = join("uploads", "listings", id, "rooms", roomId);
      const absoluteDir = join(process.cwd(), "public", relativeDir);

      await mkdir(absoluteDir, { recursive: true });
      await writeFile(join(absoluteDir, filename), Buffer.from(await file.arrayBuffer()));

      photoUrl = `/${relativeDir}/${filename}`.replace(/\\/g, "/");
      storageKey = `local:${id}:${roomId}:${filename}`;
    }

    const saved = await getDb().$transaction(async (tx) => {
      await lockDraft(tx, id, user.id);
      if (!(await tx.room.findFirst({ where: { id: roomId, listingId: id } }))) {
        throw new ApiError(404, "Room not found.");
      }
      // A different source photo invalidates the current measurement, preserving history.
      await tx.room.update({
        where: { id: roomId },
        data: {
          areaSqm: null,
          measuredAt: null,
          confidence: null,
          boundary: Prisma.JsonNull,
          correctedBoundary: Prisma.JsonNull,
          referenceCorners: Prisma.JsonNull,
          referenceKind: null,
          referenceWidthMeters: null,
          referenceHeightMeters: null,
          captureMethod: null,
          verificationStatus: "UNMEASURED",
        },
      });
      const totals = await tx.room.aggregate({ where: { listingId: id }, _sum: { areaSqm: true } });
      await tx.listing.update({
        where: { id },
        data: { totalAreaSqm: totals._sum.areaSqm, measurementConfidence: null },
      });
      return tx.photo.create({
        data: {
          listingId: id,
          roomId,
          url: photoUrl,
          storageKey,
          width,
          height,
          altText: `${listing.rooms.find((r) => r.id === roomId)?.name ?? "Room"} photo`,
        },
      });
    });

    return json(saved, 201);
  });
}
