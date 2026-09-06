import { endpoint, json, body } from "@/lib/server/api";
import { requireUser } from "@/lib/server/session";
import { browseListings, saveDraft } from "@/lib/server/listings";
import { draftSchema } from "@/lib/validation";
export function GET(request: Request) { return endpoint(async () => json(await browseListings(new URL(request.url).searchParams))); }
export function POST(request: Request) {
  return endpoint(async () => {
    const user = await requireUser(request, true);
    return json(await saveDraft(await body(request, draftSchema), user.id), 201);
  });
}
