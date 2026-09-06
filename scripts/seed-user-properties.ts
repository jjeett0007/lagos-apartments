import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const TARGET_EMAIL = "dosumuolayinka150@gmail.com";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not configured.");
    process.exit(1);
  }

  const adapter = new PrismaPg({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log(`Checking user account for: ${TARGET_EMAIL}...`);

    // 1. Find or create the user
    let user = await prisma.user.findUnique({
      where: { email: TARGET_EMAIL },
    });

    if (!user) {
      console.log(`User does not exist yet. Creating user ${TARGET_EMAIL}...`);
      user = await prisma.user.create({
        data: {
          email: TARGET_EMAIL,
          name: "Olayinka Dosumu",
          role: "LISTER",
          listerKind: "PROPERTY_MANAGER",
          companyName: "Dosumu & Co. Properties Lagos",
          phone: "+234 803 555 0192",
          emailVerified: true,
          preferredAreas: ["Lekki", "Yaba", "Ikeja", "Ajah", "Surulere"],
          onboardingCompletedAt: new Date(),
        },
      });
      console.log(`Created user with ID: ${user.id}`);
    } else {
      console.log(`Found existing user with ID: ${user.id}`);
      // Ensure the user has the LISTER role and details
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          role: "LISTER",
          listerKind: user.listerKind || "PROPERTY_MANAGER",
          companyName: user.companyName || "Dosumu & Co. Properties Lagos",
          phone: user.phone || "+234 803 555 0192",
          onboardingCompletedAt: user.onboardingCompletedAt || new Date(),
        },
      });
      console.log(`Updated user ${TARGET_EMAIL} profile as LISTER.`);
    }

    // 2. Ensure TrustScore exists for user
    await prisma.trustScore.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        score: 95.0,
        accuracyScore: 97.5,
        responseScore: 94.0,
        reliabilityScore: 96.0,
        completedListings: 6,
        confirmedMismatchCount: 0,
      },
      update: {
        score: 95.0,
        accuracyScore: 97.5,
        responseScore: 94.0,
        reliabilityScore: 96.0,
        completedListings: 6,
        confirmedMismatchCount: 0,
      },
    });
    console.log("TrustScore updated.");

    // 3. Properties to seed for this user
    const properties = [
      {
        slug: "sunlit-two-bedroom-ikate-elegushi",
        title: "Sunlit Two-Bedroom in Ikate Elegushi",
        description:
          "An expansive, verified second-floor flat in Ikate, Lekki. Every room has been physically measured by an approved Eko Scout using Bosch laser distance meters. Circulation corridors, generator alleys, and balconies are strictly excluded from interior square metres.",
        propertyType: "APARTMENT" as const,
        leaseTerm: "YEARLY" as const,
        price: 6200000,
        areaName: "Lekki",
        publicAddress: "Block 4, Elegushi Road, Ikate, Lekki, Lagos",
        privateAddress: "Plot 12, Flat 2B, Elegushi Royal Court, Ikate Lekki",
        bedroomCount: 2,
        bathroomCount: 2,
        totalAreaSqm: 78.4,
        measurementConfidence: 0.96,
        status: "PUBLISHED" as const,
        verificationStatus: "SCOUT_VERIFIED" as const,
        verifiedAt: new Date("2026-08-28T10:00:00Z"),
        publishedAt: new Date("2026-08-28T12:00:00Z"),
        amenities: [
          "Dedicated parking",
          "Prepaid meter",
          "Borehole water treatment",
          "24/7 Security",
          "Private balcony",
          "Fitted kitchen cabinets",
        ],
        photos: [
          {
            url: "/images/hero_apartment_lagos.jpg",
            storageKey: "ikate-living-hero-001",
            section: "LIVING_ROOM" as const,
            label: "Living room record",
            altText: "Sunlit living room in Ikate Elegushi with laser calibration",
            sortOrder: 0,
          },
        ],
        rooms: [
          {
            name: "Living room",
            roomType: "LIVING_ROOM" as const,
            sortOrder: 0,
            areaSqm: 21.3,
            widthMeters: 5.2,
            lengthMeters: 4.1,
            confidence: 0.98,
            captureMethod: "LASER_SCOUT" as const,
            verificationStatus: "SCOUT_VERIFIED" as const,
          },
          {
            name: "Primary bedroom",
            roomType: "MASTER_BEDROOM" as const,
            sortOrder: 1,
            areaSqm: 15.2,
            widthMeters: 4.1,
            lengthMeters: 3.7,
            confidence: 0.97,
            captureMethod: "LASER_SCOUT" as const,
            verificationStatus: "SCOUT_VERIFIED" as const,
          },
          {
            name: "Bedroom two",
            roomType: "BEDROOM" as const,
            sortOrder: 2,
            areaSqm: 11.5,
            widthMeters: 3.6,
            lengthMeters: 3.2,
            confidence: 0.96,
            captureMethod: "LASER_SCOUT" as const,
            verificationStatus: "SCOUT_VERIFIED" as const,
          },
          {
            name: "Kitchen",
            roomType: "KITCHEN" as const,
            sortOrder: 3,
            areaSqm: 7.4,
            widthMeters: 3.1,
            lengthMeters: 2.4,
            confidence: 0.94,
            captureMethod: "LASER_SCOUT" as const,
            verificationStatus: "SCOUT_VERIFIED" as const,
          },
        ],
      },
      {
        slug: "compact-one-bedroom-loft-sabo-yaba",
        title: "Compact One-Bedroom Loft near Sabo Tech Hub",
        description:
          "A bright, practical loft flat within 5 minutes of Sabo, Yaba. Perspective homography calibrated against standard A4 floor targets. Zero wide-angle warping or distortion.",
        propertyType: "STUDIO" as const,
        leaseTerm: "YEARLY" as const,
        price: 2600000,
        areaName: "Yaba",
        publicAddress: "18 Commercial Avenue, Sabo, Yaba, Lagos",
        privateAddress: "18 Commercial Avenue, 3rd Floor Unit 302, Sabo Yaba",
        bedroomCount: 1,
        bathroomCount: 1,
        totalAreaSqm: 42.7,
        measurementConfidence: 0.88,
        status: "PUBLISHED" as const,
        verificationStatus: "AI_ESTIMATED" as const,
        publishedAt: new Date("2026-09-01T11:00:00Z"),
        amenities: [
          "Prepaid meter",
          "Gated compound",
          "Fiber internet ready",
          "Dedicated transformer",
          "Water storage",
        ],
        photos: [
          {
            url: "/images/lagos_yaba_flat.jpg",
            storageKey: "yaba-loft-photo-001",
            section: "LIVING_ROOM" as const,
            label: "Main room calibrated record",
            altText: "Modern loft in Sabo Yaba with A4 homography markers",
            sortOrder: 0,
          },
        ],
        rooms: [
          {
            name: "Studio living & dining",
            roomType: "LIVING_ROOM" as const,
            sortOrder: 0,
            areaSqm: 26.9,
            widthMeters: 5.5,
            lengthMeters: 4.9,
            confidence: 0.89,
            captureMethod: "PHOTO_REFERENCE" as const,
            verificationStatus: "AI_ESTIMATED" as const,
          },
          {
            name: "Kitchenette",
            roomType: "KITCHEN" as const,
            sortOrder: 1,
            areaSqm: 5.3,
            widthMeters: 2.5,
            lengthMeters: 2.1,
            confidence: 0.85,
            captureMethod: "PHOTO_REFERENCE" as const,
            verificationStatus: "AI_ESTIMATED" as const,
          },
          {
            name: "En-suite bathroom",
            roomType: "BATHROOM" as const,
            sortOrder: 2,
            areaSqm: 4.2,
            widthMeters: 2.1,
            lengthMeters: 2.0,
            confidence: 0.88,
            captureMethod: "PHOTO_REFERENCE" as const,
            verificationStatus: "AI_ESTIMATED" as const,
          },
        ],
      },
      {
        slug: "executive-three-bedroom-duplex-ikeja-gra",
        title: "Executive 3-Bedroom Serviced Duplex in Ikeja GRA",
        description:
          "A premium mainland executive residence on a quiet cul-de-sac in Ikeja GRA. Inspected in person with certified millimeter laser distance meters. Verified ground-floor living space, private compound parking, and ensuite quarters.",
        propertyType: "DUPLEX" as const,
        leaseTerm: "YEARLY" as const,
        price: 8800000,
        areaName: "Ikeja",
        publicAddress: "Off Isaac John Street, Ikeja GRA, Lagos",
        privateAddress: "Plot 7B, Crescent Court, Ikeja GRA",
        bedroomCount: 3,
        bathroomCount: 3,
        totalAreaSqm: 124.8,
        measurementConfidence: 0.98,
        status: "PUBLISHED" as const,
        verificationStatus: "SCOUT_VERIFIED" as const,
        verifiedAt: new Date("2026-08-30T14:00:00Z"),
        publishedAt: new Date("2026-08-30T16:00:00Z"),
        amenities: [
          "24-hour backup generator",
          "Swimming pool",
          "Dedicated transformer",
          "CCTV coverage",
          "Fitted kitchen",
          "2 Car spaces",
          "Borehole water",
        ],
        photos: [
          {
            url: "/images/room_calibration_demo.jpg",
            storageKey: "ikeja-duplex-photo-001",
            section: "LIVING_ROOM" as const,
            label: "Grand living room calibration",
            altText: "Executive living room in Ikeja GRA with laser verification points",
            sortOrder: 0,
          },
        ],
        rooms: [
          {
            name: "Grand living & dining",
            roomType: "LIVING_ROOM" as const,
            sortOrder: 0,
            areaSqm: 36.5,
            widthMeters: 6.8,
            lengthMeters: 5.37,
            confidence: 0.99,
            captureMethod: "LASER_SCOUT" as const,
            verificationStatus: "SCOUT_VERIFIED" as const,
          },
          {
            name: "Master suite",
            roomType: "MASTER_BEDROOM" as const,
            sortOrder: 1,
            areaSqm: 24.2,
            widthMeters: 5.5,
            lengthMeters: 4.4,
            confidence: 0.98,
            captureMethod: "LASER_SCOUT" as const,
            verificationStatus: "SCOUT_VERIFIED" as const,
          },
          {
            name: "Bedroom two",
            roomType: "BEDROOM" as const,
            sortOrder: 2,
            areaSqm: 16.5,
            widthMeters: 4.4,
            lengthMeters: 3.75,
            confidence: 0.97,
            captureMethod: "LASER_SCOUT" as const,
            verificationStatus: "SCOUT_VERIFIED" as const,
          },
          {
            name: "Bedroom three",
            roomType: "BEDROOM" as const,
            sortOrder: 3,
            areaSqm: 14.8,
            widthMeters: 4.0,
            lengthMeters: 3.7,
            confidence: 0.96,
            captureMethod: "LASER_SCOUT" as const,
            verificationStatus: "SCOUT_VERIFIED" as const,
          },
          {
            name: "Gourmet kitchen",
            roomType: "KITCHEN" as const,
            sortOrder: 4,
            areaSqm: 12.4,
            widthMeters: 3.9,
            lengthMeters: 3.18,
            confidence: 0.97,
            captureMethod: "LASER_SCOUT" as const,
            verificationStatus: "SCOUT_VERIFIED" as const,
          },
        ],
      },
      {
        slug: "calm-two-bedroom-flat-badore-ajah",
        title: "Calm Two-Bedroom Flat off Badore Waterfront",
        description:
          "Spacious, peaceful living away from expressway noise. Real interior floor boundary verified by an Eko scout; shared stairwell corridor strictly excluded.",
        propertyType: "APARTMENT" as const,
        leaseTerm: "YEARLY" as const,
        price: 3400000,
        areaName: "Ajah",
        publicAddress: "Badore Road, Ajah, Lagos",
        privateAddress: "Flat 5, Waterside View Estate, Badore, Ajah",
        bedroomCount: 2,
        bathroomCount: 2,
        totalAreaSqm: 69.6,
        measurementConfidence: 0.95,
        status: "PUBLISHED" as const,
        verificationStatus: "SCOUT_VERIFIED" as const,
        verifiedAt: new Date("2026-08-20T11:00:00Z"),
        publishedAt: new Date("2026-08-20T14:00:00Z"),
        amenities: [
          "24-hour security",
          "Dedicated parking",
          "Water treatment plant",
          "Service balcony",
          "Prepaid meter",
        ],
        photos: [
          {
            url: "/images/scout_inspection_lagos.jpg",
            storageKey: "ajah-waterfront-photo-001",
            section: "LIVING_ROOM" as const,
            label: "Scout laser inspection record",
            altText: "Scout inspection in Badore Ajah apartment",
            sortOrder: 0,
          },
        ],
        rooms: [
          {
            name: "Living room",
            roomType: "LIVING_ROOM" as const,
            sortOrder: 0,
            areaSqm: 19.5,
            widthMeters: 5.0,
            lengthMeters: 3.9,
            confidence: 0.96,
            captureMethod: "LASER_SCOUT" as const,
            verificationStatus: "SCOUT_VERIFIED" as const,
          },
          {
            name: "Master bedroom",
            roomType: "MASTER_BEDROOM" as const,
            sortOrder: 1,
            areaSqm: 14.4,
            widthMeters: 4.0,
            lengthMeters: 3.6,
            confidence: 0.95,
            captureMethod: "LASER_SCOUT" as const,
            verificationStatus: "SCOUT_VERIFIED" as const,
          },
          {
            name: "Bedroom two",
            roomType: "BEDROOM" as const,
            sortOrder: 2,
            areaSqm: 12.0,
            widthMeters: 3.7,
            lengthMeters: 3.25,
            confidence: 0.94,
            captureMethod: "LASER_SCOUT" as const,
            verificationStatus: "SCOUT_VERIFIED" as const,
          },
          {
            name: "Kitchen",
            roomType: "KITCHEN" as const,
            sortOrder: 3,
            areaSqm: 7.5,
            widthMeters: 3.0,
            lengthMeters: 2.5,
            confidence: 0.93,
            captureMethod: "LASER_SCOUT" as const,
            verificationStatus: "SCOUT_VERIFIED" as const,
          },
        ],
      },
      {
        slug: "designer-shortlet-loft-lekki-phase-1",
        title: "Designer Short-Let Loft on Admiralty Way",
        description:
          "An open-plan loft designed for discerning business travelers and weekend stays. Includes custom mezzanine bedroom and full kitchen with verified dimensions.",
        propertyType: "SHORT_LET" as const,
        leaseTerm: "DAILY" as const,
        price: 95000,
        areaName: "Lekki",
        publicAddress: "Admiralty Way, Lekki Phase 1, Lagos",
        privateAddress: "Unit 4A, The Admiralty Lofts, Lekki Phase 1",
        bedroomCount: 1,
        bathroomCount: 1,
        totalAreaSqm: 56.3,
        measurementConfidence: 0.91,
        status: "PUBLISHED" as const,
        verificationStatus: "AI_ESTIMATED" as const,
        publishedAt: new Date("2026-09-03T10:00:00Z"),
        amenities: [
          "Furnished luxury finish",
          "24/7 Uninterrupted power",
          "Superfast Wi-Fi",
          "Daily housekeeping",
          "Smart TV",
          "Dedicated parking",
        ],
        photos: [
          {
            url: "/images/hero_apartment_lagos.jpg",
            storageKey: "admiralty-shortlet-photo-001",
            section: "LIVING_ROOM" as const,
            label: "Open concept lounge & dining",
            altText: "Designer shortlet loft living room in Lekki Phase 1",
            sortOrder: 0,
          },
          {
            url: "/images/loft_modern_kitchen.jpg",
            storageKey: "admiralty-shortlet-photo-002",
            section: "KITCHEN" as const,
            label: "Chef quartz island kitchen",
            altText: "Modern open kitchen with quartz countertops and stainless appliances",
            sortOrder: 1,
          },
          {
            url: "/images/loft_luxury_bathroom.jpg",
            storageKey: "admiralty-shortlet-photo-003",
            section: "BATHROOM" as const,
            label: "Designer ensuite bathroom",
            altText: "Luxury bathroom with walk-in rainfall shower and vessel vanity",
            sortOrder: 2,
          },
          {
            url: "/images/room_calibration_demo.jpg",
            storageKey: "admiralty-shortlet-photo-004",
            section: "BEDROOM" as const,
            label: "Mezzanine master bedroom",
            altText: "Custom mezzanine loft bedroom suite with floor calibration",
            sortOrder: 3,
          },
          {
            url: "/images/scout_inspection_lagos.jpg",
            storageKey: "admiralty-shortlet-photo-005",
            section: "BALCONY" as const,
            label: "Building frontage & compound",
            altText: "Admiralty Lofts secure compound, front entrance and parking",
            sortOrder: 4,
          },
          {
            url: "/images/lagos_yaba_flat.jpg",
            storageKey: "admiralty-shortlet-photo-006",
            section: "STUDY" as const,
            label: "Lounge workspace nook",
            altText: "Loft workspace corner with high-speed desk setup",
            sortOrder: 5,
          },
        ],
        rooms: [
          {
            name: "Living & dining lounge",
            roomType: "LIVING_ROOM" as const,
            sortOrder: 0,
            areaSqm: 27.8,
            widthMeters: 5.8,
            lengthMeters: 4.8,
            confidence: 0.92,
            captureMethod: "PHOTO_REFERENCE" as const,
            verificationStatus: "AI_ESTIMATED" as const,
          },
          {
            name: "Mezzanine bedroom",
            roomType: "BEDROOM" as const,
            sortOrder: 1,
            areaSqm: 15.1,
            widthMeters: 4.2,
            lengthMeters: 3.6,
            confidence: 0.9,
            captureMethod: "PHOTO_REFERENCE" as const,
            verificationStatus: "AI_ESTIMATED" as const,
          },
          {
            name: "Designer bathroom",
            roomType: "BATHROOM" as const,
            sortOrder: 2,
            areaSqm: 5.0,
            widthMeters: 2.5,
            lengthMeters: 2.0,
            confidence: 0.89,
            captureMethod: "PHOTO_REFERENCE" as const,
            verificationStatus: "AI_ESTIMATED" as const,
          },
        ],
      },
      {
        slug: "renovated-three-bedroom-surulere-adeniran",
        title: "Renovated 3-Bedroom Flat near Adeniran Ogunsanya",
        description:
          "A bright, recently refurbished family flat in central Surulere with generous living space and cross ventilation. Perspective floor calibration with door scale reference.",
        propertyType: "APARTMENT" as const,
        leaseTerm: "YEARLY" as const,
        price: 4500000,
        areaName: "Surulere",
        publicAddress: "Adeniran Ogunsanya Street, Surulere, Lagos",
        privateAddress: "Block 3, Flat 6, Ogunlana Close, Off Adeniran Ogunsanya",
        bedroomCount: 3,
        bathroomCount: 3,
        totalAreaSqm: 104.8,
        measurementConfidence: 0.82,
        status: "PUBLISHED" as const,
        verificationStatus: "AI_ESTIMATED" as const,
        publishedAt: new Date("2026-08-25T09:00:00Z"),
        amenities: [
          "All rooms en-suite",
          "Visitor parking",
          "Gated street security",
          "Store room",
          "Prepaid meter",
        ],
        photos: [
          {
            url: "/images/room_calibration_demo.jpg",
            storageKey: "surulere-flat-photo-001",
            section: "LIVING_ROOM" as const,
            label: "Living room record",
            altText: "Renovated flat in Surulere with floor boundary calibration",
            sortOrder: 0,
          },
        ],
        rooms: [
          {
            name: "Living room",
            roomType: "LIVING_ROOM" as const,
            sortOrder: 0,
            areaSqm: 27.5,
            widthMeters: 6.1,
            lengthMeters: 4.5,
            confidence: 0.84,
            captureMethod: "PHOTO_REFERENCE" as const,
            verificationStatus: "AI_ESTIMATED" as const,
          },
          {
            name: "Master bedroom",
            roomType: "MASTER_BEDROOM" as const,
            sortOrder: 1,
            areaSqm: 18.9,
            widthMeters: 4.6,
            lengthMeters: 4.1,
            confidence: 0.82,
            captureMethod: "PHOTO_REFERENCE" as const,
            verificationStatus: "AI_ESTIMATED" as const,
          },
          {
            name: "Bedroom two",
            roomType: "BEDROOM" as const,
            sortOrder: 2,
            areaSqm: 14.0,
            widthMeters: 4.0,
            lengthMeters: 3.5,
            confidence: 0.8,
            captureMethod: "PHOTO_REFERENCE" as const,
            verificationStatus: "AI_ESTIMATED" as const,
          },
          {
            name: "Bedroom three",
            roomType: "BEDROOM" as const,
            sortOrder: 3,
            areaSqm: 12.6,
            widthMeters: 3.7,
            lengthMeters: 3.4,
            confidence: 0.78,
            captureMethod: "PHOTO_REFERENCE" as const,
            verificationStatus: "AI_ESTIMATED" as const,
          },
        ],
      },
    ];

    console.log(`Seeding ${properties.length} properties for user ${user.email}...`);

    for (const prop of properties) {
      const { rooms, photos, ...listingData } = prop;

      // Check if listing already exists
      const existingListing = await prisma.listing.findUnique({
        where: { slug: listingData.slug },
        include: { rooms: true, photos: true },
      });

      if (existingListing) {
        console.log(`Listing ${listingData.slug} exists, updating...`);
        await prisma.listing.update({
          where: { id: existingListing.id },
          data: {
            ...listingData,
            listerId: user.id,
          },
        });
        if (photos && photos.length > 0) {
          for (const p of photos) {
            await prisma.photo.upsert({
              where: { storageKey: p.storageKey },
              create: {
                listingId: existingListing.id,
                url: p.url,
                storageKey: p.storageKey,
                section: p.section,
                label: p.label,
                altText: p.altText,
                sortOrder: p.sortOrder,
              },
              update: {
                listingId: existingListing.id,
                url: p.url,
                section: p.section,
                label: p.label,
                altText: p.altText,
                sortOrder: p.sortOrder,
              },
            });
          }
        }
        console.log(`Updated listing: ${listingData.title}`);
      } else {
        console.log(`Creating listing ${listingData.slug}...`);
        const created = await prisma.listing.create({
          data: {
            ...listingData,
            listerId: user.id,
            rooms: {
              create: rooms.map((r) => ({
                name: r.name,
                roomType: r.roomType,
                sortOrder: r.sortOrder,
                areaSqm: r.areaSqm,
                widthMeters: r.widthMeters,
                lengthMeters: r.lengthMeters,
                confidence: r.confidence,
                captureMethod: r.captureMethod,
                verificationStatus: r.verificationStatus,
              })),
            },
            photos: {
              create: photos.map((p) => ({
                url: p.url,
                storageKey: p.storageKey,
                section: p.section,
                label: p.label,
                altText: p.altText,
                sortOrder: p.sortOrder,
              })),
            },
          },
        });
        console.log(`Created listing: "${created.title}" (ID: ${created.id})`);
      }
    }

    console.log("\n✅ All properties successfully seeded for dosumuolayinka150@gmail.com!");

    // Verify count
    const count = await prisma.listing.count({ where: { listerId: user.id } });
    console.log(`Total properties owned by ${TARGET_EMAIL}: ${count}`);
  } catch (error) {
    console.error("Error seeding properties:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
