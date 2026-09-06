import { endpoint, json, assertSameOrigin, ApiError } from "@/lib/server/api";
import { requireUser } from "@/lib/server/session";
import { lockDraft } from "@/lib/server/listings";
import { getDb } from "@/lib/server/db";
export function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return endpoint(async () => {
    assertSameOrigin(request);
    const user = await requireUser(request, true);
    const { id } = await context.params;
    const listing = await getDb().$transaction(async (tx) => {
      await lockDraft(tx, id, user.id);
      const rooms = await tx.room.findMany({ where: { listingId: id }, include: { _count: { select: { photos: true } } } });
      if (!rooms.length || rooms.some((room) => !room.measuredAt || !room.areaSqm || !room._count.photos)) {
        throw new ApiError(422, "Add a photo and save a measurement for every room before submitting.");
      }
      // Manual evidence requires review. No fabricated AI job or auto-publication.
      return tx.listing.update({ where: { id }, data: { status: "IN_REVIEW", totalAreaSqm: rooms.reduce((sum, room) => sum + Number(room.areaSqm), 0), measurementConfidence: null }, select: { id: true, status: true } });
    });
    return json(listing);
  });
}
