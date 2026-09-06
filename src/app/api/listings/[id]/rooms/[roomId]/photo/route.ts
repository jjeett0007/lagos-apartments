import { Prisma } from "@/generated/prisma/client";
import { createHash } from "node:crypto";
import { endpoint, json, assertSameOrigin, ApiError } from "@/lib/server/api";
import { requireUser } from "@/lib/server/session";
import { ownedListing, lockDraft } from "@/lib/server/listings";
import { getDb, ConfigurationError } from "@/lib/server/db";
export const runtime = "nodejs";
export function POST(request: Request, context: { params: Promise<{ id: string; roomId: string }> }) {
  return endpoint(async () => {
    assertSameOrigin(request);
    const user = await requireUser(request, true);
    const { id, roomId } = await context.params;
    const listing = await ownedListing(id, user.id);
    if (!["DRAFT", "REJECTED"].includes(listing.status) || !listing.rooms.some((room) => room.id === roomId)) throw new ApiError(409, "This room cannot be edited.");
    if (!process.env.CLOUDINARY_URL) throw new ConfigurationError("Photo storage is not connected yet. Your listing draft is saved; try uploading again later.");
    const config = new URL(process.env.CLOUDINARY_URL);
    if (config.protocol !== "cloudinary:" || !config.username || !config.password || !config.hostname) throw new ConfigurationError("Photo storage is not configured correctly.");
    const reader = request.body?.getReader();
    if (!reader) throw new ApiError(400, "Choose a room photo.");
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 4 * 1024 * 1024 + 65536) { await reader.cancel(); throw new ApiError(413, "Choose a photo smaller than 4 MB."); }
      chunks.push(value);
    }
    let form: FormData;
    try { form = await new Response(new Blob(chunks as BlobPart[]), { headers: { "Content-Type": request.headers.get("content-type") ?? "" } }).formData(); }
    catch { throw new ApiError(400, "Choose a valid room photo."); }
    const file = form.get("photo");
    if (!(file instanceof File) || !file.size || file.size > 4 * 1024 * 1024) throw new ApiError(400, "Choose a photo smaller than 4 MB.");
    const head = Buffer.from(await file.slice(0, 12).arrayBuffer());
    const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
    const isPng = head.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const isWebp = head.subarray(0, 4).toString() === "RIFF" && head.subarray(8, 12).toString() === "WEBP";
    if (!isJpeg && !isPng && !isWebp) throw new ApiError(400, "Choose a JPG, PNG, or WebP photo.");
    const timestamp = String(Math.floor(Date.now() / 1000));
    const folder = `eko-space/${user.id}/${id}/${roomId}`;
    const signature = createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}${decodeURIComponent(config.password)}`).digest("hex");
    const upload = new FormData();
    upload.set("file", file); upload.set("folder", folder); upload.set("timestamp", timestamp);
    upload.set("api_key", decodeURIComponent(config.username)); upload.set("signature", signature);
    const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(config.hostname)}/image/upload`, { method: "POST", body: upload, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new ApiError(502, "The photo could not be stored. Please try again.");
    const photo = await response.json() as { secure_url: string; public_id: string; width: number; height: number };
    const saved = await getDb().$transaction(async (tx) => {
      await lockDraft(tx, id, user.id);
      if (!await tx.room.findFirst({ where: { id: roomId, listingId: id } })) throw new ApiError(404, "Room not found.");
      // A different source photo invalidates the current measurement, preserving history.
      await tx.room.update({ where: { id: roomId }, data: { areaSqm: null, measuredAt: null, confidence: null, boundary: Prisma.JsonNull, correctedBoundary: Prisma.JsonNull, referenceCorners: Prisma.JsonNull, referenceKind: null, referenceWidthMeters: null, referenceHeightMeters: null, captureMethod: null, verificationStatus: "UNMEASURED" } });
      const totals = await tx.room.aggregate({ where: { listingId: id }, _sum: { areaSqm: true } });
      await tx.listing.update({ where: { id }, data: { totalAreaSqm: totals._sum.areaSqm, measurementConfidence: null } });
      return tx.photo.create({ data: { listingId: id, roomId, url: photo.secure_url, storageKey: photo.public_id, width: photo.width, height: photo.height, altText: `${listing.rooms.find((r) => r.id === roomId)?.name ?? "Room"} photo` } });
    });
    return json(saved, 201);
  });
}
