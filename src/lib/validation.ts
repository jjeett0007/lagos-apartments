import { z } from "zod";

export const leaseTerms = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"] as const;
export const propertyTypes = ["SELF_CONTAIN", "STUDIO", "APARTMENT", "DUPLEX", "HOUSE", "SHORT_LET"] as const;
const text = (max: number) => z.string().trim().min(1).max(max);
export const onboardingSchema = z.object({
  role: z.enum(["SEEKER", "LISTER"]),
  name: text(100),
  phone: z.string().trim().max(25).regex(/^[+\d ()-]*$/, "Enter a valid phone number.").default(""),
  listerKind: z.enum(["LANDLORD", "AGENT", "PROPERTY_MANAGER"]).optional(),
  companyName: z.string().trim().max(120).default(""),
  preferredAreas: z.array(text(80)).max(10).default([]),
  budgetMax: z.number().positive().max(999999999999).nullable().default(null),
  preferredLeaseTerm: z.enum(leaseTerms).nullable().default(null),
}).strict().superRefine((value, ctx) => {
  if (value.role === "LISTER" && !value.listerKind) ctx.addIssue({ code: "custom", path: ["listerKind"], message: "Choose a lister type." });
});

export const roomSections = [
  "LIVING_ROOM",
  "BEDROOM",
  "MASTER_BEDROOM",
  "KITCHEN",
  "BATHROOM",
  "TOILET",
  "DINING_ROOM",
  "STUDY",
  "BALCONY",
  "COMPOUND",
  "HALLWAY",
  "STORAGE",
  "OTHER",
] as const;
export type RoomSection = (typeof roomSections)[number];

export const draftSchema = z.object({
  title: text(160),
  description: z.string().trim().max(10000).default(""),
  propertyType: z.enum(propertyTypes), leaseTerm: z.enum(leaseTerms),
  price: z.number().positive().max(999999999999),
  areaName: text(80), publicAddress: text(200), privateAddress: text(400),
  bedroomCount: z.number().int().min(0).max(50).default(0),
  bathroomCount: z.number().int().min(0).max(50).default(0),
  amenities: z.array(text(80)).max(30).default([]),
  rooms: z.array(z.object({
    id: z.string().max(80).optional(), name: text(100),
    roomType: z.enum(roomSections).default("OTHER"),
  }).strict()).min(1).max(50),
}).strict().superRefine((value, ctx) => {
  const ids = value.rooms.flatMap((room) => room.id ? [room.id] : []);
  if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", path: ["rooms"], message: "Room IDs must be unique." });
});
export type DraftInput = z.infer<typeof draftSchema>;

const point = z.object({ x: z.number().min(0).max(1), y: z.number().min(0).max(1) }).strict();
export const measurementSchema = z.object({
  boundary: z.array(point).min(3).max(32),
  reference: z.object({
    kind: z.enum(["a4", "a3", "calibration-marker"]),
    corners: z.array(point).length(4),
  }).strict(),
  correctionCount: z.number().int().min(0).max(100000).default(0),
}).strict();

export const measurementSaveSchema = measurementSchema.extend({ photoId: text(80) });

const queryNumber = (min: number, max: number, fallback?: number) => z.preprocess(
  (v) => v === null || v === undefined || v === "" ? fallback : Number(v),
  z.number().min(min).max(max).optional(),
);
export const listingQuerySchema = z.object({
  q: z.string().max(150).default(""), area: z.string().max(80).default(""),
  leaseTerm: z.enum(leaseTerms).optional(),
  maxPrice: queryNumber(0, 999999999999), minSqm: queryNumber(0, 100000),
  verified: z.enum(["true", "false"]).default("false"),
  sort: z.enum(["relevance", "price-low", "confidence", "recent"]).default("relevance"),
  page: queryNumber(1, 10000, 1).refine((v) => Number.isInteger(v)),
  limit: queryNumber(1, 50, 12).refine((v) => Number.isInteger(v)),
}).strict();
