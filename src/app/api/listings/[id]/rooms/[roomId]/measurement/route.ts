import { endpoint, json, body, ApiError } from "@/lib/server/api";
import { requireUser } from "@/lib/server/session";
import { lockDraft } from "@/lib/server/listings";
import { getDb } from "@/lib/server/db";
import { measurementSaveSchema } from "@/lib/validation";
import { calculateMeasurement } from "@/lib/measurement-validation";
export function PUT(request: Request, context: { params: Promise<{ id: string; roomId: string }> }) {
  return endpoint(async () => {
    const user = await requireUser(request, true);
    const { photoId, ...input } = await body(request, measurementSaveSchema);
    let measurement;
    try { measurement = calculateMeasurement(input); }
    catch { throw new ApiError(400, "Adjust the floor and reference corners to form a valid measurement."); }
    const { id, roomId } = await context.params;
    const result = await getDb().$transaction(async (tx) => {
      await lockDraft(tx, id, user.id);
      const room = await tx.room.findFirst({ where: { id: roomId, listingId: id } });
      if (!room) throw new ApiError(404, "Room not found.");
      const photo = await tx.photo.findFirst({ where: { roomId, listingId: id }, orderBy: { createdAt: "desc" } });
      if (!photo) throw new ApiError(422, "Upload the room photo before saving its measurement.");
      if (photo.id !== photoId) throw new ApiError(409, "The room photo has changed. Reload the capture before saving.");
      const updated = await tx.room.update({ where: { id: roomId }, data: {
        areaSqm: measurement.areaSqm, boundary: measurement.boundary, correctedBoundary: measurement.boundary,
        referenceCorners: measurement.reference.corners, referenceKind: measurement.reference.kind,
        referenceWidthMeters: measurement.reference.widthMeters, referenceHeightMeters: measurement.reference.heightMeters,
        correctionCount: measurement.correctionCount, measuredAt: new Date(), captureMethod: "PHOTO_REFERENCE", confidence: null,
        // Manual calibration is an estimate, never an AI or scout verification.
        verificationStatus: "MANUAL_ESTIMATED",
        measurementHistory: { create: { photoId, areaSqm: measurement.areaSqm, boundary: measurement.boundary, reference: measurement.reference, captureMethod: "PHOTO_REFERENCE", correctionCount: measurement.correctionCount } },
      } });
      const aggregate = await tx.room.aggregate({ where: { listingId: id }, _sum: { areaSqm: true } });
      await tx.listing.update({ where: { id }, data: { totalAreaSqm: aggregate._sum.areaSqm, measurementConfidence: null, verificationStatus: "MANUAL_ESTIMATED" } });
      return updated;
    });
    return json(result);
  });
}
