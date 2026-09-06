import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const TARGET_EMAIL = "dosumuolayinka150@gmail.com";

// Area definitions with neighborhoods and street names
interface NeighborhoodSpec {
  area: string;
  streets: string[];
  privatePrefixes: string[];
  priceMultiplier: number;
}

const LAGOS_AREAS: NeighborhoodSpec[] = [
  {
    area: "Lekki",
    streets: [
      "Admiralty Way, Lekki Phase 1",
      "Freedom Way, Lekki Phase 1",
      "Fola Osibo Street, Lekki Phase 1",
      "Emma Abimbola Cole, Lekki Phase 1",
      "Elegushi Beach Road, Ikate",
      "Kushehinwa Street, Ikate Elegushi",
      "Agungi Road, Lekki",
      "Circle Mall Access Road, Osapa London",
      "Bakare Estate Road, Osapa London",
      "Orchid Road, Chevron",
      "Atlantic View Estate, Alpha Beach Road",
      "Chevy View Estate, Chevron Drive",
      "Megamound Estate, Ikota",
      "Villa Park Estate, Ikota",
      "Igbo Efon Express Junction, Lekki",
    ],
    privatePrefixes: ["Flat 3B, Admiralty Court", "Unit 2, The Glasshouse", "Villa 4, Palm Terraces", "Penthouse C, Blue Water Tower", "Apt 10A, Elegushi Heights"],
    priceMultiplier: 1.4,
  },
  {
    area: "Ikoyi",
    streets: [
      "Bourdillon Road, Old Ikoyi",
      "Glover Road, Old Ikoyi",
      "Alexander Avenue, Old Ikoyi",
      "Lugard Avenue, Old Ikoyi",
      "Cooper Road, Ikoyi",
      "Parkview Estate, Ikoyi",
      "Banana Island Road, Ikoyi",
      "Osborne Foreshore Phase 2, Ikoyi",
      "Turnbull Road, Old Ikoyi",
      "Queen's Drive, Waterfront Ikoyi",
    ],
    privatePrefixes: ["Tower 2, Apt 8B, Bourdillon Heights", "Villa 12, Banana Island Close", "Penthouse 6, Parkview Enclave", "Unit 4, Osborne Waterfront", "Suite 301, Alexander Court"],
    priceMultiplier: 3.2,
  },
  {
    area: "Victoria Island",
    streets: [
      "Adeola Odeku Street, Victoria Island",
      "Ahmadu Bello Way, Victoria Island",
      "Bishop Aboyade Cole, Victoria Island",
      "Karimu Kotun Street, Victoria Island",
      "Idejo Street, Victoria Island",
      "Kofo Abayomi Street, Victoria Island",
      "Palace Road, Oniru, Victoria Island",
      "Water Corporation Drive, Landmark Axis",
      "Muri Okunola Street, Victoria Island",
      "Saka Tinubu Street, Victoria Island",
    ],
    privatePrefixes: ["Unit 6A, Landmark Residences", "Suite 14B, Atlantic Vista", "Apt 4, Idejo Courtyard", "Flat 7, Oniru Marina", "Tower 1, Apt 11C, Eko Atlantic Drive"],
    priceMultiplier: 2.2,
  },
  {
    area: "Ikeja",
    streets: [
      "Isaac John Street, Ikeja GRA",
      "Joel Ogunnaike Street, Ikeja GRA",
      "Oduduwa Crescent, Ikeja GRA",
      "Ladipo Bateye Street, Ikeja GRA",
      "Sobo Arobiodu Street, Ikeja GRA",
      "Allen Avenue, Ikeja",
      "Toyin Street, Ikeja",
      "Opebi Road, Opebi Ikeja",
      "Adeniyi Jones Avenue, Ikeja",
      "Alausa Secretariat Axis, CBD Ikeja",
      "Maryland Crescent, Maryland",
      "Mende Villa Road, Maryland",
      "Anthony Village Expressway, Anthony",
    ],
    privatePrefixes: ["Flat 2, Oduduwa Terraces", "Unit 5, Isaac John Residences", "Villa B, Sobo Court", "Apt 3A, Opebi Heights", "Block 4, Flat 12, Maryland Manor"],
    priceMultiplier: 1.35,
  },
  {
    area: "Yaba",
    streets: [
      "Commercial Avenue, Sabo Yaba",
      "Herbert Macaulay Way, Alagomeji Yaba",
      "University Road, Akoka Yaba",
      "Montgomery Road, Yaba",
      "Tejuosho Street, Yaba",
      "St. Finbarr's College Road, Akoka",
      "Abule Ijesha Road, Yaba",
      "Harvey Road, Sabo Tech Cluster",
      "Jibowu Crescent, Yaba",
      "Commercial Roundabout, Sabo",
    ],
    privatePrefixes: ["Flat 4, Tech Innovation Hub Lofts", "Unit 2B, Macaulay Court", "Apt 6, Akoka Campus Edge", "Flat 8, Sabo Metro Flats", "Unit 1A, Montgomery Court"],
    priceMultiplier: 0.85,
  },
  {
    area: "Surulere",
    streets: [
      "Adeniran Ogunsanya Street, Surulere",
      "Bode Thomas Street, Surulere",
      "Ogunlana Drive, Surulere",
      "Masha Road, Kilo Surulere",
      "Adelabu Street, Surulere",
      "Eric Moore Road, Surulere",
      "Akerele Extension, Surulere",
      "Teslim Balogun Stadium Axis, Surulere",
      "Western Avenue Corridor, Surulere",
    ],
    privatePrefixes: ["Flat 5, Adeniran Court", "Unit 3, Bode Thomas Terraces", "Flat 2A, Ogunlana Mews", "Apt 4B, Eric Moore Towers", "Block C, Flat 1, Masha Enclave"],
    priceMultiplier: 0.8,
  },
  {
    area: "Magodo",
    streets: [
      "Bashiru Shittu Avenue, Magodo Phase 2",
      "Emmanuel Keshi Street, Magodo Phase 2",
      "CMD Road, Magodo Shangisha",
      "Otunba Jobi Fele Way, CBD Alausa",
      "Omole Phase 1 Main Entrance, Ojodu",
      "Lateef Jakande Road, Omole Phase 2",
      "Addis Ababa Crescent, Omole Phase 1",
    ],
    privatePrefixes: ["Villa 7, Magodo Brooks", "Unit 3, Shangisha Valley Court", "Flat 2, Omole Manor", "Apt 5A, Keshi View", "Duplex 14, Phase 2 Boulevard"],
    priceMultiplier: 1.25,
  },
  {
    area: "Ajah",
    streets: [
      "Badore Waterfront Road, Ajah",
      "Abraham Adesanya Estate, Ajah",
      "Monastery Road, Sangotedo",
      "Crown Estate Entrance, Sangotedo",
      "Victoria Garden City (VGC) Park 3",
      "Lekki-Epe Expressway, Ilaje Ajah",
      "Awoyaya New Town Road",
      "Abijo GRA Axis, Ibeju-Lekki",
    ],
    privatePrefixes: ["Flat 2, Badore Marina Court", "Unit 8, Adesanya Haven", "Villa 21, Crown Court", "Apt 4C, Monastery Heights", "Flat 1, VGC Lagoon Way"],
    priceMultiplier: 0.75,
  },
  {
    area: "Gbagada",
    streets: [
      "Yetunde Brown Street, Gbagada Phase 1",
      "Atunrase Estate Road, Gbagada",
      "Medina Estate Road, Gbagada",
      "Deeper Life Church Axis, Gbagada Phase 2",
      "Diya Street, Ifako Gbagada",
      "Ogudu GRA Main Road, Ogudu",
      "Ramsay Street, Gbagada Phase 2",
    ],
    privatePrefixes: ["Flat 3, Atunrase Court", "Unit 2, Medina Green Mews", "Apt 1B, Yetunde Brown Villa", "Flat 4, Ogudu Vista", "Unit 6, Phase 2 Parkside"],
    priceMultiplier: 0.95,
  },
];

const PROPERTY_CONFIGS = [
  {
    type: "SELF_CONTAIN" as const,
    term: "YEARLY" as const,
    bedrooms: 0,
    bathrooms: 1,
    basePrice: 1200000,
    areaSqm: 32,
    titles: [
      "Compact Self-Contain with Verified Laser Floor Area",
      "Modern Serviced Self-Contain near Transit Corridor",
      "Clean Private Studio Self-Contain with Ensuite Kitchenette",
    ],
  },
  {
    type: "STUDIO" as const,
    term: "YEARLY" as const,
    bedrooms: 1,
    bathrooms: 1,
    basePrice: 1800000,
    areaSqm: 42,
    titles: [
      "Executive Open-Plan Studio with Laser Boundary Audit",
      "Designer Studio Apartment in Secure Gated Compound",
      "Sunlit Urban Studio with Floor-to-Ceiling Windows",
      "Calm Minimalist Studio with Built-in Wardrobes",
    ],
  },
  {
    type: "STUDIO" as const,
    term: "MONTHLY" as const,
    bedrooms: 1,
    bathrooms: 1,
    basePrice: 280000,
    areaSqm: 44,
    titles: [
      "Serviced Monthly Studio Suite with In-Unit Laundry",
      "Flexible Monthly Executive Studio near Tech Hub",
    ],
  },
  {
    type: "APARTMENT" as const,
    term: "YEARLY" as const,
    bedrooms: 1,
    bathrooms: 1,
    basePrice: 2400000,
    areaSqm: 54,
    titles: [
      "1-Bedroom Serviced Flat with Balcony and Private Meter",
      "Contemporary 1-Bedroom Apartment with Fitted Kitchen",
      "Measured 1-Bedroom Flat in Quiet Residential Enclave",
    ],
  },
  {
    type: "APARTMENT" as const,
    term: "YEARLY" as const,
    bedrooms: 2,
    bathrooms: 2,
    basePrice: 3800000,
    areaSqm: 86,
    titles: [
      "Spacious 2-Bedroom Apartment with Ensuite Primary Room",
      "Sunlit 2-Bedroom Flat with Dual Balconies and Borehole Water",
      "Scout-Verified 2-Bedroom Flat with Cross-Ventilation",
      "Modern 2-Bedroom Serviced Apartment with 24/7 Power",
      "Refurbished 2-Bedroom Home with High Ceilings and Modern Bathrooms",
    ],
  },
  {
    type: "APARTMENT" as const,
    term: "YEARLY" as const,
    bedrooms: 3,
    bathrooms: 3,
    basePrice: 6200000,
    areaSqm: 142,
    titles: [
      "Executive 3-Bedroom Apartment with Dedicated Maid's Room",
      "Luxury 3-Bedroom Flat with Gourmet Quartz Island Kitchen",
      "Waterfront View 3-Bedroom Apartment with Scout Laser Audit",
      "Family 3-Bedroom Flat in High-Security Access-Controlled Estate",
      "Prestigious 3-Bedroom Penthouse Flat with Terrace",
    ],
  },
  {
    type: "DUPLEX" as const,
    term: "YEARLY" as const,
    bedrooms: 4,
    bathrooms: 4,
    basePrice: 9500000,
    areaSqm: 228,
    titles: [
      "Contemporary 4-Bedroom Semi-Detached Duplex with BQ",
      "Fully Serviced 4-Bedroom Terrace Duplex in Private Court",
      "Laser-Verified 4-Bedroom Duplex with 3 Designated Parking Bays",
      "Magnificent 4-Bedroom Duplex with Family Lounge and Ante-Room",
    ],
  },
  {
    type: "HOUSE" as const,
    term: "YEARLY" as const,
    bedrooms: 5,
    bathrooms: 5,
    basePrice: 15000000,
    areaSqm: 330,
    titles: [
      "Stately 5-Bedroom Fully Detached House with Private Garden",
      "Luxury 5-Bedroom Mansion with Pool Access and Double Garage",
      "Executive 5-Bedroom Home with Automated Gate and Solar Hybrid",
    ],
  },
  {
    type: "SHORT_LET" as const,
    term: "DAILY" as const,
    bedrooms: 1,
    bathrooms: 1,
    basePrice: 65000,
    areaSqm: 52,
    titles: [
      "Boutique Short-Let Suite with High-Speed Wi-Fi & Smart Lock",
      "Modern Business Traveler Short-Let with 24/7 Inverter Power",
      "Chic Urban Short-Let Loft with City Skyline Balcony",
    ],
  },
  {
    type: "SHORT_LET" as const,
    term: "DAILY" as const,
    bedrooms: 2,
    bathrooms: 2,
    basePrice: 110000,
    areaSqm: 94,
    titles: [
      "Luxury 2-Bedroom Vacation Short-Let with Daily Housekeeping",
      "Prime Waterfront Short-Let Apartment with Chef Kitchen",
      "Designer 2-Bedroom Short-Let Loft with Dedicated Workstation",
    ],
  },
];

const PHOTO_CATALOG = [
  {
    url: "/images/hero_apartment_lagos.jpg",
    section: "LIVING_ROOM" as const,
    label: "Open concept living & dining lounge",
    altText: "Bright living room with floor-to-ceiling windows and marble floor finish",
  },
  {
    url: "/images/loft_modern_kitchen.jpg",
    section: "KITCHEN" as const,
    label: "Quartz island kitchen with fitted appliances",
    altText: "Contemporary kitchen with quartz countertops and custom wooden cabinetry",
  },
  {
    url: "/images/loft_luxury_bathroom.jpg",
    section: "BATHROOM" as const,
    label: "Ensuite bathroom with rainfall walk-in shower",
    altText: "Marble tile ensuite bathroom with floating wood vanity and walk-in shower",
  },
  {
    url: "/images/room_calibration_demo.jpg",
    section: "BEDROOM" as const,
    label: "Primary bedroom retreat with wooden flooring",
    altText: "Spacious primary bedroom with hardwood floor calibration and garden outlook",
  },
  {
    url: "/images/scout_inspection_lagos.jpg",
    section: "COMPOUND" as const,
    label: "Gated compound frontage and parking access",
    altText: "Clean paved premises with uniformed security booth and designated vehicle bays",
  },
  {
    url: "/images/lagos_yaba_flat.jpg",
    section: "STUDY" as const,
    label: "Private study and workspace nook",
    altText: "Ergonomic work desk setup with high-speed router connection and task lighting",
  },
];

const AMENITY_POOL = [
  "24/7 Uninterrupted power",
  "Dedicated prepaid meter",
  "Borehole industrial water treatment",
  "Uniformed security & CCTV coverage",
  "Designated paved parking bays",
  "Private balcony with skyline view",
  "Fitted quartz kitchen & extractor",
  "High-speed fibre optic Wi-Fi",
  "Access-controlled estate entrance",
  "Swimming pool & residents gym",
  "In-unit washing machine hookup",
  "Solar inverter hybrid backup",
  "Water heater in all ensuite baths",
  "Fire safety detector & extinguisher",
  "Pop ceiling with recessed LED lighting",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not configured.");
    process.exit(1);
  }

  const adapter = new PrismaPg({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
  });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("Checking target lister account:", TARGET_EMAIL);
    let user = await prisma.user.findUnique({
      where: { email: TARGET_EMAIL },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: TARGET_EMAIL,
          name: "Olayinka Dosumu",
          role: "LISTER",
          listerKind: "PROPERTY_MANAGER",
          companyName: "Dosumu & Co. Properties Lagos",
          phone: "+234 803 555 0192",
          emailVerified: true,
          preferredAreas: ["Lekki", "Ikoyi", "Victoria Island", "Ikeja", "Yaba", "Surulere"],
          onboardingCompletedAt: new Date(),
        },
      });
      console.log(`Created lister: ${user.name} (${user.id})`);
    }

    // Optional partner agencies to give rich variety in lister names
    const partnerAgencies = [
      {
        email: "ekoprime.properties@gmail.com",
        name: "Eko Prime Realty",
        companyName: "Eko Prime Verified Estates",
        listerKind: "PROPERTY_MANAGER",
        phone: "+234 802 119 4432",
      },
      {
        email: "mainland.realty@gmail.com",
        name: "Mainland Haven Verifications",
        companyName: "Mainland Haven Realty",
        listerKind: "ESTATE_AGENT",
        phone: "+234 814 887 2390",
      },
      {
        email: "atlantic.lagos@gmail.com",
        name: "Atlantic Shoreline Living",
        companyName: "Atlantic Shoreline Partners",
        listerKind: "INDIVIDUAL_LANDLORD",
        phone: "+234 809 334 1109",
      },
    ];

    const allListers = [user];
    for (const agency of partnerAgencies) {
      let partner = await prisma.user.findUnique({ where: { email: agency.email } });
      if (!partner) {
        partner = await prisma.user.create({
          data: {
            email: agency.email,
            name: agency.name,
            role: "LISTER",
            listerKind: agency.listerKind,
            companyName: agency.companyName,
            phone: agency.phone,
            emailVerified: true,
            onboardingCompletedAt: new Date(),
          },
        });
      }
      allListers.push(partner);
    }

    console.log(`Using ${allListers.length} lister accounts to distribute 100 properties.`);

    const TARGET_COUNT = 100;
    console.log(`Starting generation of ${TARGET_COUNT} properties across Lagos...`);

    let createdCount = 0;
    let skippedCount = 0;

    for (let i = 1; i <= TARGET_COUNT; i++) {
      // Pick area round-robin with index offset
      const areaSpec = LAGOS_AREAS[(i - 1) % LAGOS_AREAS.length];
      const street = areaSpec.streets[(i * 3 + 2) % areaSpec.streets.length];
      const privateAddress = `${areaSpec.privatePrefixes[(i * 2) % areaSpec.privatePrefixes.length]}, ${street}`;

      // Pick property config
      const propConfig = PROPERTY_CONFIGS[(i * 7 + 1) % PROPERTY_CONFIGS.length];
      const titleTemplate = propConfig.titles[(i * 5) % propConfig.titles.length];
      const title = `${titleTemplate} in ${areaSpec.area}`;

      // Calculate price based on area multiplier with slight random-like variation
      const areaPriceVar = 1 + (((i * 13) % 15) - 7) / 100; // ±7%
      const calculatedPrice = Math.round((propConfig.basePrice * areaSpec.priceMultiplier * areaPriceVar) / 5000) * 5000;

      // Calculate floor area with slight variation
      const areaVariation = 1 + (((i * 17) % 21) - 10) / 100; // ±10%
      const totalAreaSqm = Number((propConfig.areaSqm * areaVariation).toFixed(1));

      // Verification status distribution: ~65% SCOUT_VERIFIED, 25% AI_ESTIMATED, 10% MANUAL_ESTIMATED
      const mod10 = i % 10;
      let verificationStatus: "SCOUT_VERIFIED" | "AI_ESTIMATED" | "MANUAL_ESTIMATED" = "SCOUT_VERIFIED";
      let captureMethod: "LASER_SCOUT" | "PHOTO_REFERENCE" | "PHOTO_AI" = "LASER_SCOUT";
      let measurementConfidence = 0.94 + ((i % 6) / 100);

      if (mod10 === 0) {
        verificationStatus = "MANUAL_ESTIMATED";
        captureMethod = "PHOTO_REFERENCE";
        measurementConfidence = 0.78 + ((i % 8) / 100);
      } else if (mod10 === 3 || mod10 === 7) {
        verificationStatus = "AI_ESTIMATED";
        captureMethod = "PHOTO_AI";
        measurementConfidence = 0.86 + ((i % 6) / 100);
      }

      // Generate unique slug
      const slug = slugify(`${areaSpec.area}-${propConfig.type}-${propConfig.term}-${i}-${titleTemplate.slice(0, 20)}`);

      // Check if listing already exists
      const existing = await prisma.listing.findUnique({ where: { slug } });
      if (existing) {
        skippedCount++;
        continue;
      }

      // Assign lister (70% to primary user dosumuolayinka150, 30% to partners)
      const assignedLister = i % 3 === 0 ? allListers[(i % (allListers.length - 1)) + 1] : user;

      // Select 4 to 6 amenities
      const amenityCount = 4 + (i % 3);
      const amenities = Array.from(
        new Set(
          Array.from({ length: amenityCount }, (_, aIdx) => AMENITY_POOL[(i * 3 + aIdx) % AMENITY_POOL.length])
        )
      );

      // Select 4 to 6 photos from the 6 available ones
      const photoCount = 4 + (i % 3); // 4, 5, or 6 photos
      const photoIndices = [(i) % 6, (i + 1) % 6, (i + 2) % 6, (i + 3) % 6, (i + 4) % 6, (i + 5) % 6].slice(0, photoCount);
      const photosData = photoIndices.map((pIdx, sortOrder) => {
        const item = PHOTO_CATALOG[pIdx];
        return {
          url: item.url,
          storageKey: `${slug}-photo-${sortOrder + 1}`,
          section: item.section,
          label: item.label,
          altText: `${title} - ${item.altText}`,
          sortOrder,
        };
      });

      // Construct rooms
      const livingArea = Number((totalAreaSqm * 0.38).toFixed(1));
      const livingW = Number((Math.sqrt(livingArea) * 1.15).toFixed(2));
      const livingL = Number((livingArea / livingW).toFixed(2));

      const roomsData = [
        {
          name: "Living & dining lounge",
          roomType: "LIVING_ROOM" as const,
          sortOrder: 0,
          areaSqm: livingArea,
          widthMeters: livingW,
          lengthMeters: livingL,
          confidence: Number(measurementConfidence.toFixed(2)),
          captureMethod,
          verificationStatus,
        },
      ];

      if (propConfig.bedrooms >= 1) {
        const bedArea = Number((totalAreaSqm * (propConfig.bedrooms === 1 ? 0.34 : 0.26)).toFixed(1));
        const bedW = Number((Math.sqrt(bedArea) * 1.08).toFixed(2));
        const bedL = Number((bedArea / bedW).toFixed(2));
        roomsData.push({
          name: "Master bedroom",
          roomType: "LIVING_ROOM" as const,
          sortOrder: 1,
          areaSqm: bedArea,
          widthMeters: bedW,
          lengthMeters: bedL,
          confidence: Number(measurementConfidence.toFixed(2)),
          captureMethod,
          verificationStatus,
        });
      }

      if (propConfig.bedrooms >= 2) {
        const bed2Area = Number((totalAreaSqm * 0.18).toFixed(1));
        const bed2W = Number((Math.sqrt(bed2Area) * 1.05).toFixed(2));
        const bed2L = Number((bed2Area / bed2W).toFixed(2));
        roomsData.push({
          name: "Second bedroom",
          roomType: "LIVING_ROOM" as const,
          sortOrder: 2,
          areaSqm: bed2Area,
          widthMeters: bed2W,
          lengthMeters: bed2L,
          confidence: Number(measurementConfidence.toFixed(2)),
          captureMethod,
          verificationStatus,
        });
      }

      const kitchenArea = Number((totalAreaSqm * 0.12).toFixed(1));
      roomsData.push({
        name: "Chef kitchen",
        roomType: "LIVING_ROOM" as const,
        sortOrder: roomsData.length,
        areaSqm: kitchenArea,
        widthMeters: Number((Math.sqrt(kitchenArea) * 1.2).toFixed(2)),
        lengthMeters: Number((kitchenArea / (Math.sqrt(kitchenArea) * 1.2)).toFixed(2)),
        confidence: Number((measurementConfidence - 0.02).toFixed(2)),
        captureMethod,
        verificationStatus,
      });

      const bathArea = Number((totalAreaSqm * 0.08).toFixed(1));
      roomsData.push({
        name: "Primary ensuite bathroom",
        roomType: "LIVING_ROOM" as const,
        sortOrder: roomsData.length,
        areaSqm: bathArea,
        widthMeters: 2.4,
        lengthMeters: Number((bathArea / 2.4).toFixed(2)),
        confidence: Number((measurementConfidence - 0.01).toFixed(2)),
        captureMethod,
        verificationStatus,
      });

      const description = `A verified ${totalAreaSqm} sqm ${propConfig.type.replaceAll("_", " ").toLowerCase()} located in ${areaSpec.area} on ${street}. Features ${propConfig.bedrooms} bedroom(s), ${propConfig.bathrooms} bathroom(s), and fully measured interior boundaries. Equipped with ${amenities.slice(0, 3).join(", ").toLowerCase()}, dedicated borehole water treatment, and 24/7 security.`;

      // Create listing with rooms and photos in database
      await prisma.listing.create({
        data: {
          slug,
          title,
          description,
          propertyType: propConfig.type,
          leaseTerm: propConfig.term,
          price: calculatedPrice,
          currency: "NGN",
          city: "Lagos",
          areaName: areaSpec.area,
          publicAddress: `${street}, Lagos`,
          privateAddress,
          bedroomCount: propConfig.bedrooms,
          bathroomCount: propConfig.bathrooms,
          totalAreaSqm,
          measurementConfidence: Number(measurementConfidence.toFixed(4)),
          status: "PUBLISHED",
          verificationStatus,
          verifiedAt: verificationStatus === "SCOUT_VERIFIED" ? new Date(Date.now() - (i * 86400000 * 0.7)) : null,
          publishedAt: new Date(Date.now() - (i * 86400000 * 0.5)),
          listerId: assignedLister.id,
          amenities,
          rooms: {
            create: roomsData,
          },
          photos: {
            create: photosData,
          },
        },
      });

      createdCount++;
      if (createdCount % 10 === 0 || createdCount === TARGET_COUNT) {
        console.log(`Progress: [${createdCount}/${TARGET_COUNT}] properties seeded across Lagos...`);
      }
    }

    console.log(`\n🎉 SEEDING COMPLETE!`);
    console.log(`Newly created: ${createdCount} properties`);
    console.log(`Skipped existing: ${skippedCount} properties`);

    const totalNow = await prisma.listing.count();
    console.log(`Total properties currently in database: ${totalNow}`);
  } catch (error) {
    console.error("Error seeding 100 properties:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
