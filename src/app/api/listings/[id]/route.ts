import { endpoint, json, body, assertSameOrigin, ApiError } from "@/lib/server/api";
import { requireUser } from "@/lib/server/session";
import { ownedListing, saveDraft } from "@/lib/server/listings";
import { draftSchema } from "@/lib/validation";
import { getDb } from "@/lib/server/db";
type Context = { params: Promise<{ id: string }> };
export function GET(request: Request, context: Context) {
  return endpoint(async () => json(await ownedListing((await context.params).id, (await requireUser(request, true)).id)));
}
export function PATCH(request: Request, context: Context) {
  return endpoint(async () => {
    const user = await requireUser(request, true);
    return json(await saveDraft(await body(request, draftSchema), user.id, (await context.params).id));
  });
}
export function DELETE(request: Request, context: Context) {
  return endpoint(async () => {
    assertSameOrigin(request);
    const user = await requireUser(request, true);
    const result = await getDb().listing.updateMany({ where: { id: (await context.params).id, listerId: user.id }, data: { status: "ARCHIVED" } });
    if (!result.count) throw new ApiError(404, "Listing not found.");
    return json({ archived: true });
  });
}
