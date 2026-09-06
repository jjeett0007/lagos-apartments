import "server-only";
import { randomUUID } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import type { DraftInput } from "@/lib/validation";
import { listingQuerySchema } from "@/lib/validation";
import { getDb } from "./db";
import { ApiError } from "./api";

export const editableStatuses = ["DRAFT", "REJECTED"] as const;
export async function lockDraft(tx: Prisma.TransactionClient, id: string, userId: string) {
  const result = await tx.listing.updateMany({
    where: { id, listerId: userId, status: { in: [...editableStatuses] } },
    data: { updatedAt: new Date() },
  });
  if (!result.count) throw new ApiError(409, "This draft is unavailable or has already been submitted.");
}
export async function saveDraft(input: DraftInput, userId: string, id?: string) {
  const db = getDb();
  const { rooms, ...details } = input;
  return db.$transaction(async (tx) => {
    if (!id) {
      if (rooms.some((room) => room.id)) throw new ApiError(400, "New rooms cannot reference existing IDs.");
      const slug = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "home"}-${randomUUID().slice(0, 8)}`;
      return tx.listing.create({ data: { ...details, slug, listerId: userId, rooms: { create: rooms.map((room, sortOrder) => ({ name: room.name, roomType: room.roomType, sortOrder })) } }, include: { rooms: { orderBy: { sortOrder: "asc" } }, photos: { orderBy: { sortOrder: "asc" } } } });
    }
    await lockDraft(tx, id, userId);
    const existing = await tx.room.findMany({ where: { listingId: id }, select: { id: true } });
    const known = new Set(existing.map((r) => r.id));
    if (rooms.some((room) => room.id && !known.has(room.id))) throw new ApiError(400, "A room does not belong to this listing.");
    await tx.room.deleteMany({ where: { listingId: id, id: { notIn: rooms.flatMap((r) => r.id ? [r.id] : []) } } });
    for (const [sortOrder, room] of rooms.entries()) {
      const data = { name: room.name, roomType: room.roomType, sortOrder };
      if (room.id) await tx.room.update({ where: { id: room.id }, data });
      else await tx.room.create({ data: { ...data, listingId: id } });
    }
    const aggregate = await tx.room.aggregate({ where: { listingId: id }, _sum: { areaSqm: true } });
    return tx.listing.update({ where: { id }, data: { ...details, totalAreaSqm: aggregate._sum.areaSqm }, include: { rooms: { orderBy: { sortOrder: "asc" } }, photos: { orderBy: { sortOrder: "asc" } } } });
  });
}

export async function ownedListing(id: string, userId: string) {
  const listing = await getDb().listing.findFirst({ where: { id, listerId: userId }, include: { photos: { orderBy: { sortOrder: "asc" } }, rooms: { orderBy: { sortOrder: "asc" }, include: { photos: { orderBy: { createdAt: "desc" }, take: 1 } } } } });
  if (!listing) throw new ApiError(404, "Listing not found.");
  return listing;
}

const publicSelect = {
  id: true, slug: true, title: true, description: true, propertyType: true, areaName: true, publicAddress: true,
  price: true, leaseTerm: true, totalAreaSqm: true, bedroomCount: true, bathroomCount: true,
  verificationStatus: true, measurementConfidence: true, verifiedAt: true, updatedAt: true, amenities: true,
  photos: { select: { id: true, url: true, altText: true, section: true, label: true }, orderBy: { sortOrder: "asc" as const } },
  rooms: { select: { id: true, name: true, widthMeters: true, lengthMeters: true, areaSqm: true, confidence: true, verificationStatus: true, captureMethod: true }, orderBy: { sortOrder: "asc" as const } },
  lister: { select: { name: true, companyName: true, listerKind: true, phone: true, createdAt: true, trustScore: { select: { score: true, accuracyScore: true } }, _count: { select: { listings: { where: { status: "PUBLISHED" as const, verificationStatus: "SCOUT_VERIFIED" as const } } } } } },
} satisfies Prisma.ListingSelect;

type PublicRecord = Prisma.ListingGetPayload<{ select: typeof publicSelect }>;
const numeric = (v: Prisma.Decimal | null) => v === null ? null : Number(v);
const status = (v: string): "verified" | "ai-estimated" | "manual-estimated" | "unmeasured" => v === "SCOUT_VERIFIED" ? "verified" : v === "AI_ESTIMATED" ? "ai-estimated" : v === "MANUAL_ESTIMATED" ? "manual-estimated" : "unmeasured";
const termLabels = { DAILY: "Nightly", WEEKLY: "Weekly", MONTHLY: "Monthly", QUARTERLY: "Quarterly", YEARLY: "Yearly" } as const;
export function publicListing(record: PublicRecord) {
  return {
    id: record.id, slug: record.slug, title: record.title, summary: record.description ?? "",
    propertyType: record.propertyType.replaceAll("_", " ").toLowerCase(), area: record.areaName,
    address: record.publicAddress, price: Number(record.price), leaseTerm: termLabels[record.leaseTerm],
    totalSqm: numeric(record.totalAreaSqm), bedrooms: record.bedroomCount, bathrooms: record.bathroomCount,
    status: status(record.verificationStatus), confidence: record.measurementConfidence === null ? null : Math.round(Number(record.measurementConfidence) * 100),
    verifiedDate: record.verifiedAt?.toISOString(), lastUpdated: record.updatedAt.toISOString(),
    photoCount: record.photos.length, photos: record.photos, amenities: record.amenities,
    rooms: record.rooms.map((room) => ({
      name: room.name, area: numeric(room.areaSqm), confidence: room.confidence === null ? null : Math.round(Number(room.confidence) * 100),
      dimensions: room.widthMeters && room.lengthMeters ? `${room.widthMeters} × ${room.lengthMeters} m` : "Dimensions not recorded",
      status: status(room.verificationStatus), note: room.captureMethod === "PHOTO_REFERENCE" ? "Manually calibrated photo; confidence not assessed" : room.captureMethod?.replaceAll("_", " ").toLowerCase() ?? "Not measured",
    })),
    lister: {
      name: record.lister.companyName || record.lister.name, kind: record.lister.listerKind?.replaceAll("_", " ").toLowerCase() ?? "Lister",
      phone: record.lister.phone,
      trustScore: record.lister.trustScore?.score ? Number(record.lister.trustScore.score) : null,
      accuracyRate: record.lister.trustScore?.accuracyScore ? Number(record.lister.trustScore.accuracyScore) : null,
      verifiedListings: record.lister._count.listings, responseTime: "Response history not available yet",
      memberSince: record.lister.createdAt.toISOString(),
    },
  };
}
import { listings as demoListings, type Listing } from "@/app/listings/data";

function fallbackBrowseListings(query: ReturnType<typeof listingQuerySchema.parse>) {
  let filtered = [...demoListings];

  if (query.q) {
    const term = query.q.toLowerCase();
    filtered = filtered.filter((l) => l.title.toLowerCase().includes(term) || l.address.toLowerCase().includes(term));
  }
  if (query.area) {
    const areaTerm = query.area.toLowerCase();
    filtered = filtered.filter((l) => l.area.toLowerCase().includes(areaTerm) || l.address.toLowerCase().includes(areaTerm));
  }
  if (query.leaseTerm) {
    const termMap: Record<string, string> = { DAILY: "Nightly", WEEKLY: "Weekly", MONTHLY: "Monthly", QUARTERLY: "Quarterly", YEARLY: "Yearly" };
    const target = termMap[query.leaseTerm];
    if (target) filtered = filtered.filter((l) => l.leaseTerm === target);
  }
  if (query.maxPrice !== undefined) {
    filtered = filtered.filter((l) => l.price <= query.maxPrice!);
  }
  if (query.minSqm !== undefined) {
    filtered = filtered.filter((l) => l.totalSqm !== null && l.totalSqm >= query.minSqm!);
  }
  if (query.verified === "true") {
    filtered = filtered.filter((l) => l.status === "verified");
  }

  if (query.sort === "price-low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (query.sort === "recent") {
    filtered.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  } else if (query.sort === "confidence") {
    filtered.sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));
  } else {
    filtered.sort((a, b) => {
      const aVer = a.status === "verified" ? 1 : 0;
      const bVer = b.status === "verified" ? 1 : 0;
      if (bVer !== aVer) return bVer - aVer;
      return (b.confidence ?? 0) - (a.confidence ?? 0);
    });
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 12;
  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return { listings: paginated, total, page, limit };
}

export async function browseListings(params: URLSearchParams) {
  const query = listingQuerySchema.parse(Object.fromEntries(params));
  try {
    const where: Prisma.ListingWhereInput = {
      status: "PUBLISHED",
      ...(query.q ? { OR: [{ title: { contains: query.q, mode: "insensitive" } }, { publicAddress: { contains: query.q, mode: "insensitive" } }] } : {}),
      ...(query.area ? { areaName: { contains: query.area, mode: "insensitive" } } : {}),
      ...(query.leaseTerm ? { leaseTerm: query.leaseTerm } : {}),
      ...(query.maxPrice !== undefined ? { price: { lte: query.maxPrice } } : {}),
      ...(query.minSqm !== undefined ? { totalAreaSqm: { gte: query.minSqm } } : {}),
      ...(query.verified === "true" ? { verificationStatus: "SCOUT_VERIFIED" } : {}),
    };
    const orderBy: Prisma.ListingOrderByWithRelationInput[] = query.sort === "price-low" ? [{ price: "asc" }]
      : query.sort === "recent" ? [{ updatedAt: "desc" }]
      : query.sort === "confidence" ? [{ measurementConfidence: { sort: "desc", nulls: "last" } }]
      : [{ verificationStatus: "desc" }, { measurementConfidence: { sort: "desc", nulls: "last" } }];
    const page = query.page ?? 1, limit = query.limit ?? 12;
    const db = getDb();
    const [records, total] = await db.$transaction([
      db.listing.findMany({ where, select: publicSelect, orderBy: [...orderBy, { id: "asc" }], skip: (page - 1) * limit, take: limit }),
      db.listing.count({ where }),
    ]);
    return { listings: records.map(publicListing), total, page, limit };
  } catch (err) {
    console.error("browseListings DB query error:", err);
    return fallbackBrowseListings(query);
  }
}
export async function findPublicListing(slug: string) {
  try {
    const listing = await getDb().listing.findFirst({ where: { slug, status: "PUBLISHED" }, select: publicSelect });
    return listing ? publicListing(listing) : null;
  } catch {
    const demo = demoListings.find((l) => l.slug === slug);
    return demo ?? null;
  }
}
