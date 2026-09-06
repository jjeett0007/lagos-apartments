import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock3,
  Flag,
  MapPin,
  MessageCircle,
  Ruler,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatNaira, getListingBySlug, verificationLabel } from "../data";
import { findPublicListing } from "@/lib/server/listings";
import Image from "next/image";
import { ListingsHeader } from "../listings-shell";

export const dynamic = "force-dynamic";

type ListingDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function ConfidenceRing({ value, label }: { value: number | null; label: string }) {
  if (value === null) return <span className="text-xs text-[var(--text-on-dark-muted)]">Confidence not assessed</span>;
  return (
    <div className="grid place-items-center gap-2 text-center" aria-label={`${value}% confidence, ${label}`}>
      <div className="relative size-24">
        <svg className="size-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="42" pathLength="100" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="7" />
          <circle cx="50" cy="50" r="42" pathLength="100" fill="none" stroke="var(--eko-gold-bright)" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${value} ${100 - value}`} />
        </svg>
        <strong className="absolute inset-0 grid place-items-center font-heading text-2xl tracking-tight text-eko-gold-bright">{value}%</strong>
      </div>
      <span className="text-[0.65rem] font-bold tracking-[0.08em] text-[var(--text-on-dark-muted)] uppercase">{label}</span>
    </div>
  );
}

export async function generateMetadata({ params }: ListingDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = (await findPublicListing(slug)) ?? getListingBySlug(slug);

  return {
    title: listing ? `${listing.title} | Eko Space` : "Listing not found | Eko Space",
    description: listing?.summary,
  };
}

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { slug } = await params;
  const listing = (await findPublicListing(slug)) ?? getListingBySlug(slug);

  if (!listing) notFound();

  const isVerified = listing.status === "verified";
  const initials = listing.lister.name.split(" ").map((part) => part[0]).slice(0, 2).join("");

  return (
    <main className="min-h-screen bg-warm-cream text-ink-black">
      <ListingsHeader />

      <div className="mx-auto w-[min(1180px,calc(100%-32px))] pt-10 pb-24 max-sm:w-[calc(100%-20px)] max-sm:pt-7">
        <nav className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider" aria-label="Breadcrumb">
          <Link className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink-black bg-card px-2.5 py-1 text-ink-black shadow-[2px_2px_0px_#0A0A0A] hover:bg-warm-cream" href="/listings">
            <ArrowLeft className="size-3.5 stroke-[2.5]" aria-hidden="true" /> Listings
          </Link>
          <ChevronRight className="size-3 stroke-[2.5] text-ink-black" aria-hidden="true" />
          <span className="truncate text-ink-black" aria-current="page">{listing.area}</span>
        </nav>

        <section className="mt-7 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-8 max-md:grid-cols-1 max-md:gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant={isVerified ? "verified" : "estimated"} className="min-h-6.5 gap-1.5 border-2 border-ink-black px-3 text-xs font-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
                {isVerified ? <ShieldCheck className="size-3.5 stroke-[2.5]" aria-hidden="true" /> : <Ruler className="size-3.5 stroke-[2.5]" aria-hidden="true" />}
                {verificationLabel(listing.status)}
              </Badge>
              <span className="rounded-md border-2 border-ink-black/20 bg-warm-cream/70 px-2.5 py-1 text-[0.68rem] font-bold text-ink-black uppercase tracking-wider">
                Updated {new Date(listing.lastUpdated).toLocaleDateString("en-GB")}
              </span>
            </div>
            <h1 className="mt-4 max-w-4xl text-balance font-heading text-[var(--text-h1)] leading-[0.96] font-black tracking-[-0.055em] uppercase">
              {listing.title}
            </h1>
            <p className="mt-3 flex items-center gap-1.5 text-sm font-bold text-[var(--body-muted)]">
              <MapPin className="size-4 shrink-0 text-ink-black stroke-[2.5]" aria-hidden="true" /> {listing.address}
            </p>
          </div>
          <div className="rounded-xl border-2 border-ink-black bg-card p-5 text-right shadow-[4px_4px_0px_#0A0A0A] max-md:text-left max-md:w-fit">
            <span className="text-[0.68rem] font-black tracking-wider text-muted-foreground uppercase block">Price</span>
            <strong className="block font-heading text-[clamp(1.8rem,4vw,2.8rem)] leading-none font-black tracking-[-0.05em] text-ink-black">
              {formatNaira(listing.price)}
            </strong>
            <span className="mt-1 block text-xs font-bold text-muted-foreground uppercase">per {listing.leaseTerm.toLowerCase().replace("ly", "")}</span>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Listing photo gallery">
          {listing.photos.length ? (
            listing.photos.map((photo) => (
              <div key={photo.url} className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A]">
                <Image
                  src={photo.url}
                  alt={photo.altText ?? listing.title}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-300 hover:scale-102"
                />
                {Boolean((photo as { section?: unknown }).section) && (
                  <Badge className="absolute top-3 left-3 border-2 border-ink-black bg-eko-gold font-black uppercase text-ink-black text-xs shadow-[2px_2px_0px_#0A0A0A]">
                    {String((photo as { section?: string }).section).replaceAll("_", " ")}
                  </Badge>
                )}
                {Boolean((photo as { label?: unknown }).label) && (
                  <span className="absolute bottom-3 left-3 rounded border-2 border-ink-black bg-card/95 px-2.5 py-1 text-xs font-bold text-ink-black shadow-[1px_1px_0px_#0A0A0A]">
                    {String((photo as { label?: string }).label)}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="rounded-xl border-2 border-dashed border-ink-black bg-card p-8 text-center font-bold">
              No photos available.
            </div>
          )}
        </section>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_350px] items-start gap-7 max-lg:grid-cols-[minmax(0,1fr)_310px] max-md:grid-cols-1">
          <div className="grid gap-7">
            <section className="rounded-[var(--radius-panel)] border-2 border-ink-black bg-card p-[clamp(24px,4vw,36px)] shadow-[5px_5px_0px_#0A0A0A]">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <span className="inline-block rounded-md border-2 border-ink-black bg-eko-gold px-2.5 py-0.5 text-xs font-black tracking-wider text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
                    The measured space
                  </span>
                  <p className="mt-3 font-heading text-[clamp(3.4rem,8vw,6.4rem)] leading-[0.84] font-black tracking-[-0.08em] text-ink-black">
                    {listing.totalSqm ?? "—"}<small className="ml-2 font-sans text-2xl font-black tracking-normal">m²</small>
                  </p>
                  <p className="mt-4 max-w-lg text-sm font-medium leading-relaxed text-muted-foreground">
                    Private interior floor area. Shared corridors, stairwells, and external spaces are excluded.
                  </p>
                </div>
                <div className="flex gap-5 rounded-xl border-2 border-ink-black bg-[var(--gold-wash)] px-5 py-4 text-sm font-black text-ink-black shadow-[3px_3px_0px_#0A0A0A]">
                  <span className="grid place-items-center gap-1">
                    <BedDouble className="size-5 stroke-[2.5]" aria-hidden="true" />
                    <strong className="text-base">{listing.bedrooms || "Studio"}</strong>
                    <small className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">bedrooms</small>
                  </span>
                  <Separator orientation="vertical" className="w-[2px] bg-ink-black/20" />
                  <span className="grid place-items-center gap-1">
                    <Bath className="size-5 stroke-[2.5]" aria-hidden="true" />
                    <strong className="text-base">{listing.bathrooms}</strong>
                    <small className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">bathrooms</small>
                  </span>
                </div>
              </div>
            </section>

            <section id="measurements" className="scroll-mt-28">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-black tracking-wider text-[var(--brown-muted)] uppercase">Room by room</span>
                  <h2 className="mt-1 font-heading text-[var(--text-h2)] font-black tracking-[-0.04em] uppercase">Measurement record</h2>
                </div>
                <span className="rounded-md border-2 border-ink-black bg-card px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
                  {listing.rooms.length} rooms shown
                </span>
              </div>

              <div className="grid gap-3">
                {listing.rooms.map((room) => (
                  <Card key={room.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 rounded-xl border-2 border-ink-black bg-card py-0 shadow-[4px_4px_0px_#0A0A0A] transition-all hover:shadow-[5px_5px_0px_var(--eko-gold)] max-sm:grid-cols-1 max-sm:gap-3">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading text-lg font-black tracking-tight uppercase">{room.name}</h3>
                        <Badge variant={room.status === "verified" ? "verified" : "outline"} className="border-2 border-ink-black text-[0.62rem] font-black uppercase shadow-[1px_1px_0px_#0A0A0A]">
                          {verificationLabel(room.status)}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-baseline gap-x-5 gap-y-2">
                        <strong className="font-heading text-3xl font-black tracking-[-0.05em] text-ink-black">
                          {room.area ?? "—"}<small className="ml-1 font-sans text-xs font-black tracking-normal">m²</small>
                        </strong>
                        <span className="text-xs font-bold text-muted-foreground">{room.dimensions}</span>
                      </div>
                      <p className="mt-2 text-xs font-medium text-muted-foreground">{room.note}</p>
                    </CardContent>
                    <div className="m-4 grid size-[78px] place-items-center rounded-xl border-2 border-ink-black bg-[var(--gold-wash)] p-2 text-center shadow-[2px_2px_0px_#0A0A0A] max-sm:mt-0 max-sm:size-auto max-sm:flex max-sm:items-center max-sm:gap-2 max-sm:px-3.5 max-sm:py-2">
                      <strong className="font-heading text-lg font-black text-ink-black">{room.confidence === null ? "—" : `${room.confidence}%`}</strong>
                      <small className="text-[0.6rem] font-bold uppercase tracking-wider text-ink-black/80 max-sm:ml-1">confidence</small>
                    </div>
                  </Card>
                ))}
              </div>
              <p className="mt-3 text-xs font-medium leading-relaxed text-muted-foreground">The total is calculated from the saved room measurements shown above.</p>
            </section>

            <section className="grid grid-cols-1 gap-5">
              <Card className="rounded-[var(--radius-panel)] border-2 border-ink-black bg-card py-0 shadow-[4px_4px_0px_#0A0A0A]">
                <CardHeader className="border-b-2 border-ink-black bg-warm-cream/50 p-5">
                  <CardTitle className="font-heading text-lg font-black tracking-tight uppercase">What is included</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3 p-5 max-sm:grid-cols-1">
                  {listing.amenities.map((amenity) => (
                    <span className="flex items-center gap-2.5 text-xs font-bold text-ink-black" key={amenity}>
                      <Check className="size-4 stroke-[3] text-success-green" aria-hidden="true" /> {amenity}
                    </span>
                  ))}
                </CardContent>
              </Card>
            </section>

            <section className="rounded-[var(--radius-panel)] border-2 border-ink-black bg-card p-[clamp(24px,4vw,36px)] shadow-[5px_5px_0px_#0A0A0A]">
              <span className="text-xs font-black tracking-wider text-[var(--brown-muted)] uppercase">About this home</span>
              <h2 className="mt-2 font-heading text-[var(--text-h2)] font-black tracking-[-0.04em] uppercase">Clear details, no “spacious” claims</h2>
              <p className="mt-4 max-w-3xl text-[var(--text-body)] font-medium leading-relaxed text-[var(--body-muted)]">{listing.summary}</p>
            </section>
          </div>

          <aside className="sticky top-24 grid gap-5 max-md:static">
            <Card className="gap-0 overflow-hidden rounded-[var(--radius-panel)] border-2 border-ink-black bg-ink-black py-0 text-warm-cream shadow-[5px_5px_0px_var(--eko-gold)]">
              <CardHeader className="flex flex-row items-center justify-between gap-4 border-b-2 border-white/20 p-5">
                <div>
                  <Badge variant={isVerified ? "verified" : "estimated"} className="mb-3 border-2 border-ink-black font-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
                    {isVerified ? "Verified record" : "Estimate record"}
                  </Badge>
                  <CardTitle className="font-heading text-lg font-black tracking-tight uppercase text-warm-cream">
                    {isVerified ? "Checked in person" : "Calibrated from photos"}
                  </CardTitle>
                </div>
                <ConfidenceRing value={listing.confidence} label="confidence" />
              </CardHeader>
              <CardContent className="grid gap-3 p-5 text-xs font-medium text-[var(--text-on-dark-muted)]">
                <span className="flex items-center gap-2.5">
                  <CalendarCheck className="size-4 shrink-0 text-eko-gold-bright stroke-[2.5]" aria-hidden="true" />
                  {isVerified ? `Scout visit · ${listing.verifiedDate}` : `Photo set updated · ${new Date(listing.lastUpdated).toLocaleDateString("en-GB")}`}
                </span>
                <span className="flex items-center gap-2.5">
                  <Ruler className="size-4 shrink-0 text-eko-gold-bright stroke-[2.5]" aria-hidden="true" />
                  {listing.rooms.length} room records available
                </span>
                <span className="flex items-center gap-2.5">
                  <Sparkles className="size-4 shrink-0 text-eko-gold-bright stroke-[2.5]" aria-hidden="true" />
                  {isVerified ? "Laser and corrected photo measurements" : "Known-object photo calibration"}
                </span>
              </CardContent>
            </Card>

            <Card className="rounded-[var(--radius-panel)] border-2 border-ink-black bg-card py-0 shadow-[4px_4px_0px_#0A0A0A]">
              <CardHeader className="p-5">
                <div className="flex items-center gap-3.5">
                  <Avatar className="size-12 border-2 border-ink-black shadow-[2px_2px_0px_#0A0A0A]">
                    <AvatarFallback className="bg-ink-black font-heading text-sm font-black text-eko-gold-bright uppercase">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="font-heading text-base font-black uppercase">{listing.lister.name}</CardTitle>
                    <p className="mt-0.5 text-xs font-bold text-muted-foreground uppercase">{listing.lister.kind}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 border-t-2 border-ink-black/15 p-5 text-xs font-medium">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Trust score</span>
                  <strong className="rounded border-2 border-ink-black bg-[var(--gold-wash)] px-2 py-0.5 font-heading text-xs font-black text-ink-black shadow-[1px_1px_0px_#0A0A0A]">
                    {listing.lister.trustScore === null ? "Not assessed" : `${listing.lister.trustScore}/100`}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Listing accuracy</span>
                  <strong className="font-bold text-ink-black">{listing.lister.accuracyRate === null ? "Not assessed" : `${listing.lister.accuracyRate}%`}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Verified listings</span>
                  <strong className="font-bold text-ink-black">{listing.lister.verifiedListings}</strong>
                </div>
                <div className="flex items-center gap-2 border-t border-ink-black/10 pt-3 text-muted-foreground">
                  <Clock3 className="size-4 stroke-[2.5]" aria-hidden="true" /> {listing.lister.responseTime}
                </div>
                <p className="text-[0.68rem] text-muted-foreground">Member since {new Date(listing.lister.memberSince).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}</p>
              </CardContent>
            </Card>

            <Card className="rounded-[var(--radius-panel)] border-2 border-ink-black bg-card py-0 shadow-[4px_4px_0px_#0A0A0A]">
              <CardContent className="grid gap-3 p-4.5">
                <Button asChild size="lg" className="min-h-12 justify-between border-2 border-ink-black bg-eko-gold px-4 font-bold text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-eko-gold-bright hover:shadow-[4px_4px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                  <a href={`mailto:hello@ekospace.ng?subject=${encodeURIComponent(`Inquiry about ${listing.title}`)}`}>
                    Message lister <MessageCircle className="stroke-[2.5]" aria-hidden="true" />
                  </a>
                </Button>
                {!isVerified ? (
                  <Button asChild size="lg" className="min-h-12 justify-between border-2 border-ink-black bg-card px-4 font-bold text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-warm-cream hover:shadow-[4px_4px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                    <a href={`mailto:verify@ekospace.ng?subject=${encodeURIComponent(`Verification request: ${listing.title}`)}`}>
                      Request verification <ShieldCheck className="stroke-[2.5]" aria-hidden="true" />
                    </a>
                  </Button>
                ) : null}
                <Button asChild variant="ghost" size="sm" className="mt-1 font-bold text-muted-foreground hover:bg-alert-red/10 hover:text-alert-red">
                  <a href={`mailto:trust@ekospace.ng?subject=${encodeURIComponent(`Listing report: ${listing.title}`)}`}>
                    <Flag className="size-3.5 stroke-[2.5]" aria-hidden="true" /> Report a mismatch
                  </a>
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
