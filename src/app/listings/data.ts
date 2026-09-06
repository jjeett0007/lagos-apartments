export type VerificationStatus = "verified" | "ai-estimated" | "manual-estimated" | "unmeasured";

export type ListingRoom = {
  name: string;
  dimensions: string;
  area: number | null;
  confidence: number | null;
  status: VerificationStatus;
  note: string;
};

export type Listing = {
  id: string;
  photos: { url: string; altText: string | null }[];
  slug: string;
  title: string;
  propertyType: string;
  area: string;
  address: string;
  price: number;
  leaseTerm: "Yearly" | "Monthly" | "Nightly" | "Weekly" | "Quarterly";
  totalSqm: number | null;
  bedrooms: number;
  bathrooms: number;
  status: VerificationStatus;
  confidence: number | null;
  verifiedDate?: string;
  lastUpdated: string;
  photoCount: number;
  summary: string;
  amenities: string[];
  rooms: ListingRoom[];
  lister: {
    name: string;
    kind: string;
    trustScore: number | null;
    responseTime: string;
    memberSince: string;
    verifiedListings: number;
    accuracyRate: number | null;
  };
};

export const lagosAreas = ["All Lagos", "Lekki", "Yaba", "Ikeja", "Surulere", "Ajah"] as const;

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}
export function verificationLabel(status: VerificationStatus) {
  return { verified: "Scout verified", "ai-estimated": "AI-estimated", "manual-estimated": "Manual estimate", unmeasured: "Not measured" }[status];
}

export const listings: Listing[] = [
  {
    id: "demo-sunlit-two-bed-ikate",
    photos: [{ url: "/images/hero_apartment_lagos.jpg", altText: "Sunlit two-bedroom in Ikate Lekki" }],
    slug: "sunlit-two-bed-ikate",
    title: "Sunlit two-bedroom in Ikate",
    propertyType: "2-bedroom flat",
    area: "Lekki",
    address: "Ikate Elegushi, Lekki",
    price: 5_800_000,
    leaseTerm: "Yearly",
    totalSqm: 78.4,
    bedrooms: 2,
    bathrooms: 2,
    status: "verified",
    confidence: 96,
    verifiedDate: "2026-08-28T10:00:00.000Z",
    lastUpdated: "2026-09-04T09:00:00.000Z",
    photoCount: 12,
    summary: "A well-lit second-floor flat on a quiet residential street. Every interior room was measured during an in-person scout visit; circulation and balcony areas are shown separately.",
    amenities: ["Dedicated parking", "Prepaid meter", "Borehole water", "Balcony"],
    rooms: [
      { name: "Living room", dimensions: "5.20 × 4.10 m", area: 21.3, confidence: 98, status: "verified", note: "Laser measured" },
      { name: "Primary bedroom", dimensions: "4.10 × 3.70 m", area: 15.2, confidence: 97, status: "verified", note: "Laser measured" },
      { name: "Bedroom two", dimensions: "3.60 × 3.20 m", area: 11.5, confidence: 96, status: "verified", note: "Laser measured" },
      { name: "Kitchen", dimensions: "3.10 × 2.40 m", area: 7.4, confidence: 94, status: "verified", note: "Scout corrected one corner" },
    ],
    lister: { name: "Harbour Homes Lagos", kind: "Property manager", trustScore: 92, responseTime: "Usually within 18 minutes", memberSince: "2024-03-01T00:00:00.000Z", verifiedListings: 18, accuracyRate: 96 },
  },
  {
    id: "demo-compact-one-bed-yaba",
    photos: [{ url: "/images/lagos_yaba_flat.jpg", altText: "Compact modern flat near Sabo Yaba" }],
    slug: "compact-one-bed-yaba",
    title: "Compact one-bedroom near Sabo",
    propertyType: "1-bedroom flat",
    area: "Yaba",
    address: "Sabo, Yaba",
    price: 2_400_000,
    leaseTerm: "Yearly",
    totalSqm: 42.7,
    bedrooms: 1,
    bathrooms: 1,
    status: "ai-estimated",
    confidence: 84,
    lastUpdated: "2026-09-01T11:30:00.000Z",
    photoCount: 8,
    summary: "A practical one-bedroom within walking distance of Sabo. Measurements are based on calibrated room photos and remain AI-estimated until a scout visit.",
    amenities: ["Prepaid meter", "Gated compound", "Water storage"],
    rooms: [
      { name: "Living room", dimensions: "4.30 × 3.50 m", area: 15.1, confidence: 87, status: "ai-estimated", note: "A4 calibration reference" },
      { name: "Bedroom", dimensions: "3.70 × 3.20 m", area: 11.8, confidence: 84, status: "ai-estimated", note: "A4 calibration reference" },
      { name: "Kitchen", dimensions: "2.50 × 2.10 m", area: 5.3, confidence: 79, status: "ai-estimated", note: "One edge partly obscured" },
    ],
    lister: { name: "Tobi Akinwale", kind: "Independent agent", trustScore: 83, responseTime: "Usually within 1 hour", memberSince: "2025-01-01T00:00:00.000Z", verifiedListings: 5, accuracyRate: 89 },
  },
  {
    id: "demo-garden-studio-ikeja-gra",
    photos: [{ url: "/images/room_calibration_demo.jpg", altText: "Garden studio in Ikeja GRA" }],
    slug: "garden-studio-ikeja-gra",
    title: "Garden studio in Ikeja GRA",
    propertyType: "Studio apartment",
    area: "Ikeja",
    address: "Ikeja GRA, Ikeja",
    price: 285_000,
    leaseTerm: "Monthly",
    totalSqm: 31.2,
    bedrooms: 0,
    bathrooms: 1,
    status: "verified",
    confidence: 94,
    verifiedDate: "2026-08-19T14:00:00.000Z",
    lastUpdated: "2026-08-30T08:15:00.000Z",
    photoCount: 10,
    summary: "A furnished ground-floor studio with a private garden entrance. A scout verified the main room and bathroom; the outdoor patio is not included in the stated area.",
    amenities: ["Furnished", "Backup power", "Wi-Fi included", "Private entrance"],
    rooms: [
      { name: "Studio room", dimensions: "5.40 × 4.45 m", area: 24, confidence: 96, status: "verified", note: "Laser measured" },
      { name: "Bathroom", dimensions: "2.60 × 2.10 m", area: 5.5, confidence: 92, status: "verified", note: "Laser measured" },
    ],
    lister: { name: "Mainland Stays", kind: "Short-let operator", trustScore: 95, responseTime: "Usually within 10 minutes", memberSince: "2023-07-01T00:00:00.000Z", verifiedListings: 31, accuracyRate: 98 },
  },
  {
    id: "demo-three-bed-adeniran-ogunsanya",
    photos: [],
    slug: "three-bed-adeniran-ogunsanya",
    title: "Renovated three-bedroom flat",
    propertyType: "3-bedroom flat",
    area: "Surulere",
    address: "Adeniran Ogunsanya, Surulere",
    price: 4_200_000,
    leaseTerm: "Yearly",
    totalSqm: 104.8,
    bedrooms: 3,
    bathrooms: 3,
    status: "ai-estimated",
    confidence: 78,
    lastUpdated: "2026-08-28T16:45:00.000Z",
    photoCount: 14,
    summary: "A recently renovated family flat with generous shared space. Two room outlines were manually corrected after furniture obscured floor edges.",
    amenities: ["All rooms en-suite", "Visitor parking", "Security", "Store room"],
    rooms: [
      { name: "Living room", dimensions: "6.10 × 4.50 m", area: 27.5, confidence: 82, status: "ai-estimated", note: "Door used as scale reference" },
      { name: "Primary bedroom", dimensions: "4.60 × 4.10 m", area: 18.9, confidence: 80, status: "ai-estimated", note: "One corner corrected" },
      { name: "Bedroom two", dimensions: "4.00 × 3.50 m", area: 14, confidence: 76, status: "ai-estimated", note: "Floor edge partly obscured" },
      { name: "Bedroom three", dimensions: "3.70 × 3.40 m", area: 12.6, confidence: 74, status: "ai-estimated", note: "Two corners corrected" },
    ],
    lister: { name: "Keyline Realty", kind: "Estate agency", trustScore: 76, responseTime: "Usually within 3 hours", memberSince: "2025-11-01T00:00:00.000Z", verifiedListings: 2, accuracyRate: 82 },
  },
  {
    id: "demo-waterside-two-bed-ajah",
    photos: [],
    slug: "waterside-two-bed-ajah",
    title: "Quiet two-bedroom off Badore Road",
    propertyType: "2-bedroom flat",
    area: "Ajah",
    address: "Badore, Ajah",
    price: 3_100_000,
    leaseTerm: "Yearly",
    totalSqm: 69.6,
    bedrooms: 2,
    bathrooms: 2,
    status: "verified",
    confidence: 93,
    verifiedDate: "2026-08-12T13:00:00.000Z",
    lastUpdated: "2026-08-23T10:30:00.000Z",
    photoCount: 11,
    summary: "A calm two-bedroom in a serviced compound. The advertised total excludes the shared stairwell and includes only private internal floor area.",
    amenities: ["24-hour security", "Parking", "Water treatment", "Service balcony"],
    rooms: [
      { name: "Living room", dimensions: "5.00 × 3.90 m", area: 19.5, confidence: 96, status: "verified", note: "Laser measured" },
      { name: "Primary bedroom", dimensions: "4.00 × 3.60 m", area: 14.4, confidence: 94, status: "verified", note: "Laser measured" },
      { name: "Bedroom two", dimensions: "3.70 × 3.25 m", area: 12, confidence: 92, status: "verified", note: "Laser measured" },
      { name: "Kitchen", dimensions: "3.00 × 2.50 m", area: 7.5, confidence: 91, status: "verified", note: "Laser measured" },
    ],
    lister: { name: "Nneka Okoro", kind: "Landlord", trustScore: 90, responseTime: "Usually within 45 minutes", memberSince: "2024-05-01T00:00:00.000Z", verifiedListings: 7, accuracyRate: 95 },
  },
  {
    id: "demo-loft-shortlet-lekki-phase-one",
    photos: [],
    slug: "loft-shortlet-lekki-phase-one",
    title: "Open-plan loft in Lekki Phase 1",
    propertyType: "Loft apartment",
    area: "Lekki",
    address: "Lekki Phase 1, Lekki",
    price: 92_000,
    leaseTerm: "Nightly",
    totalSqm: 56.3,
    bedrooms: 1,
    bathrooms: 1,
    status: "ai-estimated",
    confidence: 88,
    lastUpdated: "2026-09-03T12:15:00.000Z",
    photoCount: 16,
    summary: "An open-plan loft set up for short stays. The mezzanine sleeping level is included in the stated total and itemised in the room measurements.",
    amenities: ["Furnished", "24-hour power", "Wi-Fi", "Cleaning service"],
    rooms: [
      { name: "Living and kitchen", dimensions: "5.80 × 4.80 m", area: 27.8, confidence: 90, status: "ai-estimated", note: "A4 calibration reference" },
      { name: "Mezzanine bedroom", dimensions: "4.20 × 3.60 m", area: 15.1, confidence: 86, status: "ai-estimated", note: "Railing edge manually corrected" },
      { name: "Bathroom", dimensions: "2.50 × 2.00 m", area: 5, confidence: 83, status: "ai-estimated", note: "Door used as scale reference" },
    ],
    lister: { name: "Coastline Shortlets", kind: "Short-let operator", trustScore: 88, responseTime: "Usually within 15 minutes", memberSince: "2024-09-01T00:00:00.000Z", verifiedListings: 11, accuracyRate: 93 },
  },
];

export function getListingBySlug(slug: string) {
  return listings.find((listing) => listing.slug === slug);
}
