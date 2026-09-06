import { endpoint, json } from "@/lib/server/api";
import { requireUser } from "@/lib/server/session";
import { getDb } from "@/lib/server/db";
export function GET(request: Request) {
  return endpoint(async () => {
    const user = await requireUser(request, true);
    return json(await getDb().listing.findMany({ where: { listerId: user.id }, orderBy: { updatedAt: "desc" }, take: 100, include: { _count: { select: { rooms: true } } } }));
  });
}
