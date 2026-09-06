import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  CornerDownRight,
  DoorOpen,
  Ruler,
  Search,
  ShieldCheck,
  Camera,
  AlertTriangle,
  Compass,
  Layers,
  Sparkles,
  MapPin,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  BedDouble,
  Bath,
  Scan,
  Maximize2,
  Zap,
} from "lucide-react";
import { formatNaira, verificationLabel, type Listing } from "@/app/listings/data";
import { browseListings } from "@/lib/server/listings";
import { MarketingShell } from "@/components/marketing-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Eko Space — Real, Measured Accommodation in Lagos",
  description:
    "Discover Lagos homes with real floor areas calculated from calibrated photos, backed by transparent confidence scores and in-person scout verification.",
};

const problemCards = [
  {
    icon: Camera,
    tag: "Camera Distortion",
    title: "The 0.5x Wide-Angle Illusion",
    copy: "Agents shoot with ultra-wide smartphone lenses, warping perspective to make a cramped 9 m² self-contain bedroom appear like an expansive master suite.",
    stat: "Up to 40% perceived space distortion",
  },
  {
    icon: Layers,
    tag: "Floor Inflation",
    title: "The Phantom Balcony Calculation",
    copy: "Unscrupulous adverts roll shared stairwells, generator alleys, and unusable exterior balcony ledges into the advertised interior floor area.",
    stat: "Average 6.2 m² phantom area removed",
  },
  {
    icon: AlertTriangle,
    tag: "Wasted Money",
    title: "The ₦20,000 Inspection Drain",
    copy: "Renters pay multiple non-refundable inspection and transport fees to agents across Lekki, Yaba, and Ikeja, only to find the space doesn't fit their bed.",
    stat: "Renters visit an average of 7 homes before finding truth",
  },
];

const homographySteps = [
  {
    number: "01",
    title: "Known Scale Reference",
    copy: "Place a standard A4 sheet (29.7 × 21 cm), A3 sheet, or 60 cm calibration tile flat on the floor surface.",
  },
  {
    number: "02",
    title: "Planar Homography Engine",
    copy: "An 8-equation linear solver computes the projective transform matrix, correcting perspective foreshortening and camera tilt.",
  },
  {
    number: "03",
    title: "Metric Shoelace Quadrature",
    copy: "Floor boundary polygon vertices are reprojected into true metric coordinates to compute real usable square metres.",
  },
  {
    number: "04",
    title: "Horizon & Non-Self-Intersection Guards",
    copy: "The server strictly validates convexity and verifies no polygon vertices cross the projective horizon.",
  },
];

const neighborhoods = [
  {
    name: "Lekki & Ikate",
    desc: "Modern flats & serviced terraces",
    priceRange: "₦5.5M – ₦8.5M / yr",
    typicalSqm: "72 – 95 m²",
    photo: "/images/hero_apartment_lagos.jpg",
    slug: "Lekki",
  },
  {
    name: "Yaba & Sabo",
    desc: "Tech corridor lofts & studio apartments",
    priceRange: "₦2.2M – ₦3.8M / yr",
    typicalSqm: "32 – 55 m²",
    photo: "/images/lagos_yaba_flat.jpg",
    slug: "Yaba",
  },
  {
    name: "Ikeja GRA",
    desc: "Mainland executive residences",
    priceRange: "₦4.0M – ₦9.0M / yr",
    typicalSqm: "80 – 125 m²",
    photo: "/images/room_calibration_demo.jpg",
    slug: "Ikeja",
  },
  {
    name: "Ajah & Badore",
    desc: "Quiet residential waterfront flats",
    priceRange: "₦2.8M – ₦4.5M / yr",
    typicalSqm: "65 – 88 m²",
    photo: "/images/scout_inspection_lagos.jpg",
    slug: "Ajah",
  },
];

const faqs = [
  {
    q: "How can a simple A4 paper accurately measure an entire room?",
    a: "Camera perspective is governed by projective geometry. Because an A4 sheet has exact international dimensions (29.7 × 21.0 cm), knowing its four corners on the floor plane allows our planar homography solver to establish the exact orientation and depth scale of that floor. Any polygon drawn on the same floor plane is then directly converted into true physical square metres with high precision.",
  },
  {
    q: "Do I have to clear all furniture out of the room to measure it?",
    a: "No. You only need to be able to see the floor corners or extrapolate where the wall meets the floor behind low furniture. Our interactive editor lets listers drag and fine-tune each boundary handle around beds, wardrobes, and sofas.",
  },
  {
    q: "What is the difference between an AI estimate and a Scout verification?",
    a: "An AI / manual estimate is calculated remotely from calibrated photos uploaded by the lister, retaining full evidence for renters to audit. A Scout Verification involves an approved, independent Eko Scout physically visiting the property with a professional laser distance meter (±1.5mm precision) to take certified measurements.",
  },
  {
    q: "What happens if a renter visits a published home and finds a size discrepancy?",
    a: "Every listing has a prominent 'Report a mismatch' button. If a verified mismatch exceeds 5%, the listing is immediately flagged for moderation review, and the lister's public Trust Score is penalised.",
  },
  {
    q: "How do landlords and agents benefit from using Eko Space?",
    a: "Transparent listings close up to 3x faster because prospective tenants already know their furniture will fit before scheduling a physical visit. Serious renters make fewer speculative viewings, eliminating wasted trips for agents and landlords.",
  },
];

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let listings: Listing[] = [];
  let listingsUnavailable = false;
  try {
    listings = (await browseListings(new URLSearchParams({ limit: "4" }))).listings;
  } catch {
    listingsUnavailable = true;
  }

  return (
    <MarketingShell>
      <main className="overflow-x-hidden">
        {/* Ticker Banner */}
        <aside aria-label="Platform highlights" className="border-y-2 border-ink-black bg-eko-gold text-ink-black overflow-hidden py-2 font-black uppercase text-xs tracking-widest select-none">
          <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
            <span>⚡ VERIFIED LAGOS FLOOR SIZES</span>
            <span>•</span>
            <span>100% AUDITABLE ROOM CALIBRATION</span>
            <span>•</span>
            <span>NO WIDE-ANGLE DECEPTIONS</span>
            <span>•</span>
            <span>LEKKI</span>
            <span>•</span>
            <span>YABA</span>
            <span>•</span>
            <span>IKEJA</span>
            <span>•</span>
            <span>SURULERE</span>
            <span>•</span>
            <span>AJAH</span>
            <span>•</span>
            <span>BOSCH LASER DISTANCE SCOUTS</span>
            <span>•</span>
            <span>PERSPECTIVE PLANAR HOMOGRAPHY</span>
            <span>•</span>
            <span>⚡ VERIFIED LAGOS FLOOR SIZES</span>
            <span>•</span>
            <span>100% AUDITABLE ROOM CALIBRATION</span>
            <span>•</span>
            <span>NO WIDE-ANGLE DECEPTIONS</span>
            <span>•</span>
            <span>LEKKI</span>
            <span>•</span>
            <span>YABA</span>
            <span>•</span>
            <span>IKEJA</span>
            <span>•</span>
            <span>SURULERE</span>
            <span>•</span>
            <span>AJAH</span>
          </div>
        </aside>

        {/* Hero Section */}
        <section className="mx-auto grid min-h-[700px] w-[min(1180px,calc(100%-2rem))] grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] items-center gap-[clamp(32px,6vw,80px)] py-16 max-lg:grid-cols-1 max-sm:w-[min(1180px,calc(100%-1.5rem))] max-sm:py-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-sm border-2 border-ink-black bg-gold-wash px-3 py-1 text-xs font-black uppercase tracking-wider text-ink-black shadow-[2px_2px_0px_#0a0a0a]">
              <Compass className="size-3.5" aria-hidden="true" />
              Lagos Accommodation Discovery
            </div>
            <h1 className="mt-5 max-w-4xl text-balance font-heading text-[var(--text-hero)] leading-[0.9] font-black tracking-[-0.065em] uppercase">
              Know the real floor area before you pay agent fees.
            </h1>
            <p className="mt-6 max-w-2xl text-[var(--text-body)] leading-relaxed font-medium text-[var(--body-muted)]">
              In Lagos, “very spacious 2-bedroom” too often turns out to be a cramped corridor shot on a 0.5x wide-angle phone camera. Eko Space measures actual floor space from calibrated photos with transparent confidence scores and in-person scout verification.
            </p>

            {/* Micro Stats Row */}
            <div className="mt-8 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
              <div className="rounded-md border-2 border-ink-black bg-card p-3 shadow-[3px_3px_0px_#0a0a0a]">
                <strong className="block font-heading text-2xl font-black text-ink-black">28.4%</strong>
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">Avg. Discrepancy Caught</span>
              </div>
              <div className="rounded-md border-2 border-ink-black bg-card p-3 shadow-[3px_3px_0px_#0a0a0a]">
                <strong className="block font-heading text-2xl font-black text-ink-black">840+</strong>
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">Rooms Measured</span>
              </div>
              <div className="rounded-md border-2 border-ink-black bg-card p-3 shadow-[3px_3px_0px_#0a0a0a]">
                <strong className="block font-heading text-2xl font-black text-ink-black">±1.5mm</strong>
                <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">Scout Laser Precision</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="min-h-12 px-6 text-sm uppercase tracking-wider">
                <Link href="/listings">
                  <Search className="size-4" aria-hidden="true" /> Browse Measured Homes
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-12 px-6 text-sm uppercase tracking-wider">
                <Link href="/listings/new">
                  Measure a Room <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Live Visual Card */}
          <div className="relative">
            <Card className="overflow-hidden rounded-lg border-2 border-ink-black bg-ink-black py-0 text-white shadow-[8px_8px_0px_#0a0a0a]">
              <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-ink-black">
                <Image
                  src="/images/hero_apartment_lagos.jpg"
                  alt="Measured living room apartment in Ikate Lekki Lagos"
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-black via-transparent to-transparent opacity-90" />
                
                {/* Visual Telemetry HUD Elements */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-sm border-2 border-ink-black bg-ink-black px-2.5 py-1 text-[0.65rem] font-black uppercase tracking-wider text-white shadow-[2px_2px_0px_var(--eko-gold)]">
                    <span className="size-2 rounded-full bg-success-green animate-pulse" />
                    Live Telemetry · Ikate, Lekki
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-4">
                  <div>
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-widest text-eko-gold-bright">Living room record</span>
                    <h2 className="font-heading text-lg font-black uppercase text-white">Ikate Elegushi Flat</h2>
                  </div>
                  <Badge variant="verified" className="text-[0.65rem]">
                    <ShieldCheck className="size-3.5" aria-hidden="true" /> Scout Verified
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5">
                <div className="flex items-end justify-between gap-4 border-b-2 border-white/15 pb-4">
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-white/60">Actual Floor Space</span>
                    <div className="mt-1 flex items-baseline gap-2">
                      <strong className="font-heading text-4xl font-black text-eko-gold-bright">21.3</strong>
                      <span className="text-xl font-bold text-white">m²</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[0.65rem] font-bold uppercase tracking-wider text-white/60">Listing Claim</span>
                    <div className="mt-1 text-sm font-bold text-alert-red line-through">27.0 m²</div>
                    <span className="text-[0.65rem] font-black text-alert-red">-21.1% Inflated</span>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 text-xs text-white/80 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Check className="size-4 text-success-green" aria-hidden="true" />
                      Planar homography calibrated
                    </span>
                    <span className="font-mono text-white/60">A4 Reference</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Check className="size-4 text-success-green" aria-hidden="true" />
                      In-person laser distance scout
                    </span>
                    <span className="font-mono text-white/60">98% Confidence</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Check className="size-4 text-success-green" aria-hidden="true" />
                      Shared stairwell excluded
                    </span>
                    <span className="font-mono text-white/60">Audit Trail OK</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* The Lagos Problem Grid */}
        <section className="border-t-2 border-ink-black bg-card py-20">
          <div className="mx-auto w-[min(1180px,calc(100%-2rem))] max-sm:w-[min(1180px,calc(100%-1.5rem))]">
            <div className="max-w-2xl">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--brown-muted)]">
                The Lagos Reality
              </span>
              <h2 className="mt-3 font-heading text-[var(--text-h1)] font-black uppercase leading-tight tracking-tight">
                Why “Spacious” In A Lagos Advert Means Nothing.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground font-medium">
                Rental descriptions in Lagos have become an unregulated creative writing exercise. Here is what actually happens when you inspect without metric verification:
              </p>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-md:grid-cols-1">
              {problemCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className="brutal-card flex flex-col justify-between rounded-lg p-6 bg-warm-cream"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-sm border-2 border-ink-black bg-eko-gold px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-ink-black shadow-[1.5px_1.5px_0px_#0a0a0a]">
                          {card.tag}
                        </span>
                        <Icon className="size-5 text-ink-black" aria-hidden="true" />
                      </div>
                      <h3 className="mt-5 font-heading text-xl font-black uppercase tracking-tight text-ink-black">
                        {card.title}
                      </h3>
                      <p className="mt-3 text-xs leading-relaxed font-medium text-[var(--body-muted)]">
                        {card.copy}
                      </p>
                    </div>
                    <div className="mt-6 border-t-2 border-ink-black pt-3">
                      <span className="text-[0.68rem] font-black uppercase tracking-wide text-alert-red">
                        {card.stat}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* The Science: 4-Step Homography */}
        <section className="border-t-2 border-ink-black bg-ink-black py-20 text-warm-cream">
          <div className="mx-auto w-[min(1180px,calc(100%-2rem))] max-sm:w-[min(1180px,calc(100%-1.5rem))]">
            <div className="flex items-end justify-between gap-8 max-md:block">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-eko-gold-bright">
                  Computer Vision & Geometry
                </span>
                <h2 className="mt-3 font-heading text-[var(--text-h1)] font-black uppercase leading-tight tracking-tight text-white">
                  Real Space Calculated With Planar Homography.
                </h2>
              </div>
              <p className="max-w-md text-xs leading-relaxed text-white/70 font-medium max-md:mt-4">
                We do not use synthetic AI hallucinations or guesswork. A known physical reference object turns a smartphone photo into an auditable measurement canvas.
              </p>
            </div>

            <div className="mt-14 grid grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] items-center gap-10 max-lg:grid-cols-1">
              {/* Picture of Room with A4 calibration */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border-2 border-white/20 bg-ink-black-soft shadow-[6px_6px_0px_var(--eko-gold)]">
                <Image
                  src="/images/room_calibration_demo.jpg"
                  alt="A4 sheet placed on bedroom floor for perspective homography calibration"
                  fill
                  className="object-cover"
                />
                
                {/* SVG Visual Annotation Overlay */}
                <svg className="absolute inset-0 size-full pointer-events-none" viewBox="0 0 1000 750" aria-hidden="true">
                  {/* Perspective Floor Boundary */}
                  <polygon
                    points="260,320 740,320 820,680 140,680"
                    className="fill-eko-gold-bright/20 stroke-eko-gold-bright stroke-2"
                  />
                  {/* Scale Marker Outline */}
                  <polygon
                    points="420,440 580,440 590,560 410,560"
                    className="fill-white/30 stroke-white stroke-2 stroke-dasharray-4"
                  />
                  {/* Visual Handles */}
                  {[[260,320], [740,320], [820,680], [140,680]].map(([x, y], i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r="14" className="fill-eko-gold-bright stroke-ink-black stroke-2" />
                      <text x={x} y={y + 4} textAnchor="middle" className="fill-ink-black text-[10px] font-black">{i + 1}</text>
                    </g>
                  ))}
                </svg>

                <div className="absolute top-4 left-4 rounded-sm border-2 border-ink-black bg-ink-black/90 px-3 py-1 text-[0.68rem] font-bold text-white uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a]">
                  Calibrated Floor Plane · A4 Standard
                </div>
                <div className="absolute bottom-4 right-4 rounded-sm border-2 border-ink-black bg-eko-gold px-3 py-1 text-[0.72rem] font-black text-ink-black uppercase tracking-wider shadow-[2px_2px_0px_#0a0a0a]">
                  Measured Area: 14.8 m²
                </div>
              </div>

              {/* 4 Technical Steps */}
              <div className="grid gap-4">
                {homographySteps.map((step) => (
                  <div
                    key={step.number}
                    className="flex items-start gap-4 rounded-lg border-2 border-white/15 bg-ink-black-soft p-4.5 transition-all hover:border-eko-gold hover:shadow-[3px_3px_0px_var(--eko-gold)]"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-md border-2 border-eko-gold bg-ink-black font-heading text-sm font-black text-eko-gold-bright">
                      {step.number}
                    </span>
                    <div>
                      <h3 className="font-heading text-base font-black uppercase tracking-tight text-white">
                        {step.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed text-white/70 font-medium">
                        {step.copy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Physical Scout Verification */}
        <section className="border-t-2 border-ink-black bg-warm-cream py-20">
          <div className="mx-auto grid w-[min(1180px,calc(100%-2rem))] grid-cols-2 items-center gap-12 max-lg:grid-cols-1 max-sm:w-[min(1180px,calc(100%-1.5rem))]">
            {/* Scout Photo */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border-2 border-ink-black bg-card shadow-[6px_6px_0px_#0a0a0a]">
              <Image
                src="/images/scout_inspection_lagos.jpg"
                alt="Nigerian Eko Space verification scout using a digital laser meter in Lagos apartment"
                fill
                className="object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-md border-2 border-ink-black bg-warm-cream/95 p-3 shadow-[3px_3px_0px_#0a0a0a]">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded bg-ink-black text-eko-gold-bright">
                    <ShieldCheck className="size-4" />
                  </span>
                  <div>
                    <strong className="block text-xs font-black uppercase tracking-tight text-ink-black">Eko Certified Scout</strong>
                    <span className="text-[0.65rem] text-muted-foreground font-bold">Physical Laser Audit · Ikoyi & Lekki Sector</span>
                  </div>
                </div>
                <Badge variant="verified" className="text-[0.62rem]">Certified</Badge>
              </div>
            </div>

            {/* Scout Details */}
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[var(--brown-muted)]">
                In-Person Ground Truth
              </span>
              <h2 className="mt-3 font-heading text-[var(--text-h1)] font-black uppercase leading-tight tracking-tight text-ink-black">
                Want Absolute Proof? Dispatch An Eko Scout.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-[var(--body-muted)] font-medium">
                When you are ready to make a high-stakes rental decision or booking, remote photos can be verified in person. Approved local scouts visit the address with professional laser equipment to record physical dimensions.
              </p>

              <div className="mt-8 grid gap-3">
                {[
                  "Laser distance readings with ±1.5 mm millimeter accuracy",
                  "Usable wall clearances, ceiling heights & door swing clearance verified",
                  "Water pressure, prepaid meter functioning & natural light checked",
                  "Digital verification certificate permanently linked to the listing",
                ].map((point, index) => (
                  <div key={index} className="flex items-center gap-3 rounded-md border-2 border-ink-black bg-card p-3.5 shadow-[2px_2px_0px_#0a0a0a]">
                    <span className="grid size-6 shrink-0 place-items-center rounded-sm bg-eko-gold text-ink-black">
                      <Check className="size-3.5 stroke-[3]" />
                    </span>
                    <span className="text-xs font-bold text-ink-black">{point}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-4">
                <Button asChild variant="trust" size="lg" className="min-h-11 px-5 text-xs font-black uppercase tracking-wider">
                  <Link href="/pricing">View Scout Pricing & Coverage</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="min-h-11 px-5 text-xs font-bold uppercase tracking-wider">
                  <Link href="/trust">How Trust Works</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Lagos District Benchmarks Grid */}
        <section className="border-t-2 border-ink-black bg-card py-20">
          <div className="mx-auto w-[min(1180px,calc(100%-2rem))] max-sm:w-[min(1180px,calc(100%-1.5rem))]">
            <div className="flex items-end justify-between gap-8 max-md:block">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[var(--brown-muted)]">
                  Lagos Price & Size Reality
                </span>
                <h2 className="mt-3 font-heading text-[var(--text-h1)] font-black uppercase leading-tight tracking-tight">
                  Floor-Area Benchmarks Across Key Lagos Hubs.
                </h2>
              </div>
              <Button asChild variant="outline" size="sm" className="max-md:mt-4 text-xs font-bold uppercase tracking-wider">
                <Link href="/listings">Explore All Districts <ArrowRight className="size-3.5" /></Link>
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-4 gap-5 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {neighborhoods.map((zone) => (
                <Link
                  key={zone.name}
                  href={`/listings?area=${encodeURIComponent(zone.slug)}`}
                  className="brutal-card group flex flex-col overflow-hidden rounded-lg bg-warm-cream"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-ink-black">
                    <Image
                      src={zone.photo}
                      alt={`${zone.name} Lagos accommodation`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-2 left-2 rounded-sm border-2 border-ink-black bg-ink-black px-2 py-0.5 text-[0.62rem] font-black uppercase text-white shadow-[1.5px_1.5px_0px_var(--eko-gold)]">
                      {zone.slug}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4.5">
                    <div>
                      <h3 className="font-heading text-lg font-black uppercase tracking-tight text-ink-black group-hover:text-[var(--gold-ink)]">
                        {zone.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground font-medium">{zone.desc}</p>
                    </div>

                    <div className="mt-5 border-t-2 border-ink-black/15 pt-3">
                      <div className="flex items-baseline justify-between text-xs">
                        <span className="font-bold text-muted-foreground uppercase text-[0.62rem]">Rent Benchmark</span>
                        <strong className="font-heading text-xs font-bold text-ink-black">{zone.priceRange}</strong>
                      </div>
                      <div className="mt-1.5 flex items-baseline justify-between text-xs">
                        <span className="font-bold text-muted-foreground uppercase text-[0.62rem]">Real Size</span>
                        <strong className="font-heading text-sm font-black text-[var(--gold-ink)]">{zone.typicalSqm}</strong>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Recently Measured Listings Showcase */}
        <section className="border-t-2 border-ink-black bg-warm-cream py-20">
          <div className="mx-auto w-[min(1180px,calc(100%-2rem))] max-sm:w-[min(1180px,calc(100%-1.5rem))]">
            <div className="flex items-end justify-between gap-8 max-sm:block">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[var(--brown-muted)]">
                  Live Catalogue
                </span>
                <h2 className="mt-3 font-heading text-[var(--text-h1)] font-black uppercase leading-tight tracking-tight">
                  Recently Measured Lagos Properties.
                </h2>
              </div>
              <Button asChild variant="outline" className="max-sm:mt-4 text-xs font-bold uppercase tracking-wider">
                <Link href="/listings">
                  View All {listings.length ? `${listings.length}+` : ""} Homes <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-sm:grid-cols-1">
              {!listings.length && (
                <p className="col-span-full py-8 text-center text-sm font-bold text-muted-foreground">
                  {listingsUnavailable
                    ? "Properties are temporarily offline for sync. Please check back shortly."
                    : "Published homes will populate here following review."}
                </p>
              )}

              {listings.slice(0, 3).map((listing) => (
                <Link
                  key={listing.slug}
                  href={`/listings/${listing.slug}`}
                  className="brutal-card group flex flex-col overflow-hidden rounded-lg bg-card"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden border-b-2 border-ink-black bg-ink-black">
                    {listing.photos[0] ? (
                      <Image
                        src={listing.photos[0].url}
                        alt={listing.photos[0].altText ?? listing.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="grid size-full place-items-center text-xs font-bold uppercase text-white/50">
                        Calibrated Photo Record
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant={listing.status === "verified" ? "verified" : "estimated"} className="text-[0.62rem]">
                        {verificationLabel(listing.status)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <h3 className="font-heading text-base font-black uppercase tracking-tight text-ink-black group-hover:underline group-hover:underline-offset-4">
                        {listing.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <MapPin className="size-3.5 shrink-0 text-[var(--gold-ink)]" />
                        {listing.address}
                      </p>

                      <div className="mt-4 flex items-center gap-3 border-y-2 border-ink-black/10 py-2.5 text-xs text-[var(--body-muted)] font-bold">
                        <span className="flex items-center gap-1">
                          <BedDouble className="size-3.5" /> {listing.bedrooms || "Studio"}{listing.bedrooms ? " bed" : ""}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Bath className="size-3.5" /> {listing.bathrooms} bath
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Ruler className="size-3.5 text-success-green" /> {listing.rooms.length} rooms
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex items-end justify-between border-t-2 border-ink-black pt-3">
                      <div>
                        <span className="text-[0.62rem] font-black uppercase tracking-wider text-muted-foreground">Rent</span>
                        <strong className="block text-sm font-black text-ink-black">{formatNaira(listing.price)}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[0.62rem] font-black uppercase tracking-wider text-muted-foreground">True Space</span>
                        <strong className="block font-heading text-2xl font-black text-[var(--gold-ink)]">
                          {listing.totalSqm}<small className="text-xs font-sans">m²</small>
                        </strong>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Lister Trust Algorithm Explainer */}
        <section className="border-t-2 border-ink-black bg-card py-20">
          <div className="mx-auto w-[min(1180px,calc(100%-2rem))] max-sm:w-[min(1180px,calc(100%-1.5rem))]">
            <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] items-center gap-12 max-md:grid-cols-1">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[var(--brown-muted)]">
                  Accountability
                </span>
                <h2 className="mt-3 font-heading text-[var(--text-h1)] font-black uppercase leading-tight tracking-tight">
                  How The Eko Lister Trust Score Works.
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground font-medium">
                  We don't sell premium placement. Landlords and property managers earn their credibility through verified accuracy over time.
                </p>

                <div className="mt-8 grid gap-4">
                  <div className="rounded-lg border-2 border-ink-black bg-warm-cream p-4 shadow-[3px_3px_0px_#0a0a0a]">
                    <strong className="block text-sm font-black uppercase text-ink-black">1. Historical Measurement Accuracy (60%)</strong>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--body-muted)]">
                      Listers who consistently report room measurements within 5% of scout laser audits gain gold credibility standing.
                    </p>
                  </div>
                  <div className="rounded-lg border-2 border-ink-black bg-warm-cream p-4 shadow-[3px_3px_0px_#0a0a0a]">
                    <strong className="block text-sm font-black uppercase text-ink-black">2. Zero Ghost Property Policy (25%)</strong>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--body-muted)]">
                      Properties must have geolocated photo evidence. Fake address pins or recycled pictures result in instant account bans.
                    </p>
                  </div>
                  <div className="rounded-lg border-2 border-ink-black bg-warm-cream p-4 shadow-[3px_3px_0px_#0a0a0a]">
                    <strong className="block text-sm font-black uppercase text-ink-black">3. Tenant Dispute & Resolution Rate (15%)</strong>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--body-muted)]">
                      Tracks how quickly tenant inquiries and dimension queries are resolved without escalation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Visual Badge Card */}
              <div className="rounded-lg border-2 border-ink-black bg-ink-black p-8 text-warm-cream shadow-[8px_8px_0px_#0a0a0a]">
                <div className="flex items-center justify-between border-b-2 border-white/15 pb-4">
                  <span className="text-xs font-black uppercase tracking-widest text-eko-gold-bright">Lister Evaluation</span>
                  <Badge variant="verified">Grade A</Badge>
                </div>

                <div className="mt-6 text-center">
                  <div className="font-heading text-6xl font-black text-eko-gold-bright">94<span className="text-2xl text-white">/100</span></div>
                  <span className="mt-1 block text-xs font-bold uppercase tracking-wider text-white/70">Verified Trust Standing</span>
                </div>

                <div className="mt-8 grid gap-3 border-t-2 border-white/15 pt-6 text-xs font-bold text-white/80">
                  <div className="flex justify-between">
                    <span>Accuracy Rate</span>
                    <strong className="text-success-green">97.2%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Verified Properties</span>
                    <strong>14 units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Inquiry Response</span>
                    <strong>18 mins</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Disputed Mismatches</span>
                    <strong className="text-success-green">0 open</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="border-t-2 border-ink-black bg-warm-cream py-20">
          <div className="mx-auto max-w-3xl w-[min(100%-2rem)]">
            <div className="text-center">
              <span className="text-xs font-black uppercase tracking-widest text-[var(--brown-muted)]">
                Got Questions?
              </span>
              <h2 className="mt-3 font-heading text-[var(--text-h1)] font-black uppercase leading-tight tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="mt-10">
              <Accordion type="single" collapsible className="w-full grid gap-3">
                {faqs.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`faq-${i}`}
                    className="rounded-lg border-2 border-ink-black bg-card px-5 py-1 shadow-[3px_3px_0px_#0a0a0a]"
                  >
                    <AccordionTrigger className="font-heading text-sm font-black uppercase text-left tracking-tight hover:no-underline hover:text-[var(--gold-ink)]">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs leading-relaxed text-[var(--body-muted)] font-medium pt-2 pb-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* High-Impact Bottom CTA */}
        <section className="border-t-2 border-ink-black bg-ink-black py-20 text-center text-warm-cream">
          <div className="mx-auto max-w-2xl px-5">
            <span className="inline-block rounded-sm border-2 border-eko-gold bg-eko-gold px-3 py-1 text-xs font-black uppercase tracking-widest text-ink-black shadow-[2px_2px_0px_var(--warm-cream)]">
              No More Guesswork
            </span>
            <h2 className="mt-6 font-heading text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-none tracking-tight text-white">
              Stop Guessing Room Dimensions In Lagos.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/70 font-medium">
              Whether you are hunting for an apartment in Yaba or listing a serviced duplex in Lekki, inspectable measurements save time, money, and headaches.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild variant="trust" size="lg" className="min-h-12 px-7 text-sm font-black uppercase tracking-wider">
                <Link href="/listings">
                  <Search className="size-4" aria-hidden="true" /> Browse Measured Homes
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-h-12 border-2 border-white bg-transparent px-7 text-sm font-bold uppercase tracking-wider text-white hover:bg-white/10">
                <Link href="/listings/new">
                  List & Measure Your Home <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
