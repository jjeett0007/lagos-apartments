import { endpoint, json, ApiError } from "@/lib/server/api";
import { findPublicListing } from "@/lib/server/listings";
export function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  return endpoint(async () => {
    const listing = await findPublicListing((await context.params).slug);
    if (!listing) throw new ApiError(404, "Listing not found.");
    return json(listing);
  });
}
