import { endpoint, json, assertSameOrigin, ApiError } from "@/lib/server/api";
import { requireUser } from "@/lib/server/session";
import { ownedListing, lockDraft } from "@/lib/server/listings";
import { getDb } from "@/lib/server/db";
import { roomSections, type RoomSection } from "@/lib/validation";
import type { RoomType } from "@/generated/prisma/enums";

export const runtime = "nodejs";

export function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; photoId: string }> }
) {
  return endpoint(async () => {
    assertSameOrigin(request);
    const user = await requireUser(request, true);
    const { id, photoId } = await context.params;
    const listing = await ownedListing(id, user.id);
    if (!["DRAFT", "REJECTED"].includes(listing.status)) {
      throw new ApiError(409, "This listing is locked or has already been submitted.");
    }

    const payload = (await request.json()) as { section?: string; label?: string };
    const data: { section?: RoomType; label?: string | null } = {};

    if (payload.section) {
      const rawSection = payload.section.toUpperCase();
      if (roomSections.includes(rawSection as RoomSection)) {
        data.section = rawSection as RoomType;
      }
    }

    if (payload.label !== undefined) {
      data.label = payload.label?.trim() || null;
    }

    const updated = await getDb().$transaction(async (tx) => {
      await lockDraft(tx, id, user.id);
      return tx.photo.update({
        where: { id: photoId, listingId: id },
        data,
        select: {
          id: true,
          url: true,
          section: true,
          label: true,
          sortOrder: true,
        },
      });
    });

    return json(updated);
  });
}

export function DELETE(
  request: Request,
  context: { params: Promise<{ id: string; photoId: string }> }
) {
  return endpoint(async () => {
    assertSameOrigin(request);
    const user = await requireUser(request, true);
    const { id, photoId } = await context.params;
    const listing = await ownedListing(id, user.id);
    if (!["DRAFT", "REJECTED"].includes(listing.status)) {
      throw new ApiError(409, "This listing is locked or has already been submitted.");
    }

    await getDb().$transaction(async (tx) => {
      await lockDraft(tx, id, user.id);
      await tx.photo.delete({
        where: { id: photoId, listingId: id },
      });
    });

    return json({ deleted: true });
  });
}
