import "server-only";
import { getDb } from "./db";
export async function getDashboard(userId: string) {
  const db = getDb();
  const [listings, statuses, views, enquiries, trustScore] = await Promise.all([
    db.listing.findMany({ where: { listerId: userId }, orderBy: { updatedAt: "desc" }, take: 50, include: { _count: { select: { rooms: true, conversations: true } } } }),
    db.listing.groupBy({ by: ["status"], where: { listerId: userId }, _count: true }),
    db.listing.aggregate({ where: { listerId: userId }, _sum: { viewCount: true } }),
    db.conversation.count({ where: { listerId: userId } }),
    db.trustScore.findUnique({ where: { userId } }),
  ]);
  return { listings, statuses, views: views._sum.viewCount ?? 0, enquiries, trustScore };
}
