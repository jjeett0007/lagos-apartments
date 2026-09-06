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
      const photoCount = await tx.photo.count({ where: { listingId: id } });
      if (photoCount === 0) {
        throw new ApiError(422, "Please upload at least one property photo before submitting.");
      }
      const rooms = await tx.room.findMany({ where: { listingId: id } });
      const measuredRooms = rooms.filter((r) => r.areaSqm !== null);
      const totalArea = measuredRooms.reduce((sum, room) => sum + Number(room.areaSqm), 0);
      return tx.listing.update({
        where: { id },
        data: {
          status: "IN_REVIEW",
          totalAreaSqm: totalArea > 0 ? totalArea : null,
          measurementConfidence: null,
        },
        select: { id: true, status: true },
      });
    });
    return json(listing);
  });
}
