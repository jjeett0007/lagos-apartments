import { endpoint, json, assertSameOrigin, ApiError } from "@/lib/server/api";
import { requireUser } from "@/lib/server/session";
import { getDb } from "@/lib/server/db";
type Context = { params: Promise<{ id: string }> };
export function PUT(request: Request, context: Context) {
  return endpoint(async () => {
    assertSameOrigin(request);
    const user = await requireUser(request);
    const { id: listingId } = await context.params;
    if (!await getDb().listing.findFirst({ where: { id: listingId, status: "PUBLISHED" }, select: { id: true } })) throw new ApiError(404, "Listing not found.");
    await getDb().savedListing.upsert({ where: { userId_listingId: { userId: user.id, listingId } }, create: { userId: user.id, listingId }, update: {} });
    return json({ saved: true });
  });
}
export function DELETE(request: Request, context: Context) {
  return endpoint(async () => {
    assertSameOrigin(request);
    const user = await requireUser(request);
    await getDb().savedListing.deleteMany({ where: { userId: user.id, listingId: (await context.params).id } });
    return json({ saved: false });
  });
}
export function GET(request: Request, context: Context) {
  return endpoint(async () => {
    const user = await requireUser(request);
    const listingId = (await context.params).id;
    return json({ saved: Boolean(await getDb().savedListing.findUnique({ where: { userId_listingId: { userId: user.id, listingId } } })) });
  });
}
