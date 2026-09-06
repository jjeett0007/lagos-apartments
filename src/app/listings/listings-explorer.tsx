"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  ArrowDownUp,
  ArrowRight,
  Bath,
  BedDouble,
  ChevronDown,
  Compass,
  MapPin,
  Ruler,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { SavedListingButton } from "@/components/saved-listing-button";
import { useEffect, useState } from "react";
import { formatNaira, lagosAreas, verificationLabel, type Listing } from "./data";
import { ListingsHeader } from "./listings-shell";

const leaseTerms = ["Any term", "Yearly", "Monthly", "Nightly"] as const;
const photoTones = ["bg-[#514a3f]", "bg-[#3c4441]", "bg-[#4d413c]"];

type SortOption = "relevance" | "price-low" | "confidence" | "recent";

function ListingCard({ listing }: { listing: Listing }) {
  const isVerified = listing.status === "verified";

  return (
    <article className="brutal-card group flex flex-col justify-between overflow-hidden rounded-lg bg-card">
      {/* Visual Header / Photo */}
      <div className={`relative aspect-[16/10] w-full overflow-hidden border-b-2 border-ink-black text-warm-cream ${photoTones[listing.photoCount % photoTones.length]}`}>
        {listing.photos[0] ? (
          <Image
            src={listing.photos[0].url}
            alt={listing.photos[0].altText ?? listing.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="grid size-full place-items-center bg-ink-black p-4 text-center">
            <span className="text-xs font-black uppercase tracking-wider text-white/50">
              Calibrated Room Record
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-ink-black/80 via-transparent to-transparent opacity-90" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge
              variant={isVerified ? "verified" : "estimated"}
              className="text-[0.62rem] border-2 border-ink-black shadow-[1.5px_1.5px_0px_#0a0a0a]"
            >
              {isVerified ? <ShieldCheck className="size-3" aria-hidden="true" /> : <Ruler className="size-3" aria-hidden="true" />}
              {verificationLabel(listing.status)}
            </Badge>

            <span className="rounded-sm border-2 border-ink-black bg-ink-black/90 px-2 py-0.5 text-[0.6rem] font-black uppercase tracking-wider text-white shadow-[1.5px_1.5px_0px_var(--eko-gold)]">
              {listing.confidence === null ? "Calibrated" : `${listing.confidence}% confidence`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="rounded-sm border-2 border-ink-black bg-card px-2 py-0.5 text-[0.6rem] font-black uppercase text-ink-black shadow-[1.5px_1.5px_0px_#0a0a0a]">
              {listing.photoCount ? `${listing.photoCount} photos` : "Calibrated"}
            </span>
            <SavedListingButton listingId={listing.id} title={listing.title} />
          </div>
        </div>

        {/* Bottom Overlay Label */}
        <div className="absolute bottom-2.5 left-3">
          <span className="rounded-sm border-2 border-ink-black bg-eko-gold px-2 py-0.5 text-[0.65rem] font-black uppercase tracking-wider text-ink-black shadow-[1.5px_1.5px_0px_#0a0a0a]">
            {listing.propertyType}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <Link href={`/listings/${listing.slug}`} className="group/title block">
            <h3 className="font-heading text-lg font-black uppercase tracking-tight text-ink-black group-hover/title:text-[var(--gold-ink)] group-hover/title:underline group-hover/title:underline-offset-4">
              {listing.title}
            </h3>
          </Link>
          <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5 shrink-0 text-[var(--gold-ink)]" aria-hidden="true" />
            {listing.address}
          </p>

          {/* Specs strip */}
          <div className="mt-4 flex items-center gap-3 border-y-2 border-ink-black/15 bg-warm-cream/40 px-3 py-2 text-xs font-bold text-ink-black">
            <span className="flex items-center gap-1">
              <BedDouble className="size-3.5 text-ink-black" aria-hidden="true" />
              {listing.bedrooms || "Studio"}{listing.bedrooms ? " bed" : ""}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Bath className="size-3.5 text-ink-black" aria-hidden="true" />
              {listing.bathrooms} bath
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Ruler className="size-3.5 text-success-green stroke-[2.5]" aria-hidden="true" />
              {listing.rooms.length} rooms measured
            </span>
          </div>
        </div>

        {/* Rent & Floor Space Data */}
        <div className="mt-5">
          <div className="flex items-end justify-between border-t-2 border-ink-black pt-3.5">
            <div>
              <span className="text-[0.62rem] font-black uppercase tracking-wider text-muted-foreground block">
                Rent
              </span>
              <strong className="block font-heading text-lg font-black text-ink-black leading-tight">
                {formatNaira(listing.price)}
              </strong>
              <span className="text-[0.65rem] font-bold text-muted-foreground uppercase">
                / {listing.leaseTerm.toLowerCase()}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[0.62rem] font-black uppercase tracking-wider text-muted-foreground block">
                True Space
              </span>
              <div className="flex items-baseline justify-end gap-1">
                <strong className="font-heading text-2xl font-black text-[var(--gold-ink)]">
                  {listing.totalSqm ?? "—"}
                </strong>
                <span className="text-xs font-black text-ink-black">m²</span>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Button
              asChild
              className="w-full min-h-10 justify-between border-2 border-ink-black bg-eko-gold px-4 text-xs font-black uppercase tracking-wider text-ink-black shadow-[3px_3px_0px_#0a0a0a] hover:bg-eko-gold-bright hover:shadow-[4px_4px_0px_#0a0a0a] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Link href={`/listings/${listing.slug}`}>
                <span>View Space & Telemetry</span>
                <ArrowRight className="size-3.5 stroke-[2.5]" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ListingsExplorer() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [area, setArea] = useState<(typeof lagosAreas)[number]>("All Lagos");
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [minimumSqm, setMinimumSqm] = useState("");
  const [maximumSqm, setMaximumSqm] = useState("");
  const [leaseTerm, setLeaseTerm] = useState<(typeof leaseTerms)[number]>("Any term");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ q: query, sort, page: String(page), verified: String(verifiedOnly) });
      if (area !== "All Lagos") params.set("area", area);
      if (maximumPrice) params.set("maxPrice", maximumPrice);
      if (minimumSqm) params.set("minSqm", minimumSqm);
      if (leaseTerm !== "Any term") params.set("leaseTerm", { Yearly: "YEARLY", Monthly: "MONTHLY", Nightly: "DAILY" }[leaseTerm]);

      try {
        const response = await fetch(`/api/listings?${params}`, { signal: controller.signal, cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Could not load listings.");
        if (!controller.signal.aborted) {
          setListings(payload.data.listings);
          setTotal(payload.data.total);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : "Could not load listings.");
          setListings([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [area, leaseTerm, maximumPrice, minimumSqm, query, sort, verifiedOnly, page]);

  const clearFilters = () => {
    setPage(1);
    setQuery("");
    setArea("All Lagos");
    setMinimumPrice("");
    setMaximumPrice("");
    setMinimumSqm("");
    setMaximumSqm("");
    setLeaseTerm("Any term");
    setVerifiedOnly(false);
  };

  const hasFilters = query || area !== "All Lagos" || minimumPrice || maximumPrice || minimumSqm || maximumSqm || leaseTerm !== "Any term" || verifiedOnly;

  return (
    <main className="min-h-screen bg-warm-cream text-ink-black selection:bg-eko-gold selection:text-ink-black">
      <ListingsHeader />

      {/* Marquee Ticker Banner */}
      <aside aria-label="Platform highlights" className="mt-4 border-y-2 border-ink-black bg-eko-gold text-ink-black overflow-hidden py-2 font-black uppercase text-xs tracking-widest select-none">
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

      {/* Hero Header Section */}
      <section className="mx-auto w-[min(1180px,calc(100%-2rem))] pt-12 pb-8 max-sm:w-[min(1180px,calc(100%-1.5rem))] max-sm:pt-8">
        <div>
          <div className="inline-flex items-center gap-2 rounded-sm border-2 border-ink-black bg-gold-wash px-3 py-1 text-xs font-black uppercase tracking-wider text-ink-black shadow-[2px_2px_0px_#0a0a0a]">
            <Compass className="size-3.5" aria-hidden="true" />
            Lagos Accommodation Discovery
          </div>
          <h1 className="mt-4 max-w-4xl text-balance font-heading text-[var(--text-hero)] leading-[0.9] font-black tracking-[-0.065em] uppercase">
            Search by the space you actually get.
          </h1>
          <p className="mt-4 max-w-2xl text-[var(--text-body)] leading-relaxed font-medium text-[var(--body-muted)]">
            Every listing shows verified square metres calculated from calibrated photos or inspected in person by an Eko scout. Know your furniture fits before paying inspection fees.
          </p>

          {/* Micro Stats Row */}
          <div className="mt-6 grid grid-cols-3 gap-3 max-sm:grid-cols-1">
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
        </div>
      </section>

      {/* Chunky Search & Quick Area Hubs Bar */}
      <section className="mx-auto mb-8 w-[min(1180px,calc(100%-2rem))] max-sm:w-[min(1180px,calc(100%-1.5rem))]" aria-label="Search and quick filters">
        <div className="flex items-center gap-3">
          <label className="flex h-15 w-full items-center gap-3.5 rounded-lg border-[2.5px] border-ink-black bg-card px-4 shadow-[4px_4px_0px_#0a0a0a] transition-all focus-within:shadow-[6px_6px_0px_var(--eko-gold)] max-[520px]:h-13">
            <span className="sr-only">Search by area or property</span>
            <Search className="size-5 shrink-0 text-ink-black stroke-[2.5]" aria-hidden="true" />
            <Input
              className="h-full border-0 bg-transparent p-0 text-base font-bold text-ink-black shadow-none placeholder:text-muted-foreground/70 focus-visible:border-0 focus-visible:ring-0"
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
              placeholder="Search by area e.g. Ikate, Yaba, Lekki, or 2-bed flat…"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setPage(1);
                  setQuery("");
                }}
                className="grid size-7 shrink-0 place-items-center rounded-sm border-2 border-ink-black bg-warm-cream text-ink-black hover:bg-eko-gold transition-colors"
                aria-label="Clear search query"
              >
                <X className="size-3.5 stroke-[3]" />
              </button>
            )}
          </label>

          <Button
            type="button"
            variant="outline"
            className="hidden min-h-15 shrink-0 border-[2.5px] border-ink-black bg-card font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_#0a0a0a] hover:bg-warm-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-none max-md:inline-flex max-[520px]:size-13 max-[520px]:p-0"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="listing-filters"
          >
            <SlidersHorizontal className="size-4 stroke-[2.5]" aria-hidden="true" />
            <span className="max-[520px]:hidden">Filters</span>
          </Button>
        </div>

        {/* Quick Hub Filter Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[0.68rem] font-black uppercase tracking-wider text-muted-foreground mr-1">
            Quick Hubs:
          </span>
          {lagosAreas.map((areaOption) => {
            const isSelected = area === areaOption;
            return (
              <button
                key={areaOption}
                type="button"
                onClick={() => {
                  setPage(1);
                  setArea(areaOption);
                }}
                className={`inline-flex items-center gap-1.5 rounded-sm border-2 border-ink-black px-3 py-1 text-xs font-black uppercase tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  isSelected
                    ? "bg-eko-gold text-ink-black shadow-[2px_2px_0px_#0a0a0a]"
                    : "bg-card text-ink-black shadow-[2px_2px_0px_#0a0a0a] hover:bg-warm-cream hover:-translate-y-0.5"
                }`}
              >
                {areaOption}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Grid: Filters Sidebar + Listings Grid */}
      <div className="mx-auto grid w-[min(1180px,calc(100%-2rem))] grid-cols-[280px_minmax(0,1fr)] items-start gap-8 pb-24 max-lg:grid-cols-[250px_minmax(0,1fr)] max-lg:gap-6 max-md:block max-sm:w-[min(1180px,calc(100%-1.5rem))]">
        {/* Brutalist Sidebar */}
        <aside
          id="listing-filters"
          className={`sticky top-28 z-20 self-start max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border-[2.5px] border-ink-black bg-card p-5 shadow-[5px_5px_0px_#0a0a0a] max-md:static max-md:max-h-none max-md:overflow-visible max-md:mb-6 ${
            filtersOpen ? "max-md:block" : "max-md:hidden"
          }`}
          aria-label="Listing filters"
        >
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink-black pb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 stroke-[2.5]" aria-hidden="true" />
              <h2 className="font-heading text-base font-black tracking-tight uppercase">Filters</h2>
              {hasFilters && (
                <span className="rounded-sm border-2 border-ink-black bg-eko-gold px-1.5 py-0.2 text-[0.62rem] font-black text-ink-black">
                  Active
                </span>
              )}
            </div>
            {hasFilters && (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider text-alert-red hover:underline underline-offset-2 transition-colors"
                onClick={clearFilters}
              >
                <X className="size-3 stroke-[3]" /> Clear
              </button>
            )}
          </div>

          {/* Area Filter */}
          <label className="mt-5 grid gap-2 text-xs font-black uppercase tracking-wider text-ink-black">
            <span>District / Area</span>
            <span className="relative flex min-h-10.5 items-center rounded-md border-2 border-ink-black bg-warm-cream/60 shadow-[2px_2px_0px_#0a0a0a] focus-within:shadow-[3px_3px_0px_var(--eko-gold)]">
              <select
                className="h-10.5 w-full appearance-none bg-transparent pr-9 pl-3 text-xs font-black uppercase tracking-wider text-ink-black outline-none cursor-pointer"
                value={area}
                onChange={(event) => {
                  setPage(1);
                  setArea(event.target.value as (typeof lagosAreas)[number]);
                }}
              >
                {lagosAreas.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 size-4 stroke-[2.5] text-ink-black" aria-hidden="true" />
            </span>
          </label>

          {/* Price Range */}
          <fieldset className="mt-5 grid gap-2 text-xs font-black uppercase tracking-wider text-ink-black">
            <legend>
              Price Range <small className="font-bold normal-case text-muted-foreground">(₦)</small>
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <Input
                aria-label="Minimum price in naira"
                className="min-h-10.5 rounded-md border-2 border-ink-black bg-warm-cream/60 px-3 font-bold text-xs shadow-[2px_2px_0px_#0a0a0a] focus-visible:shadow-[3px_3px_0px_var(--eko-gold)]"
                type="number"
                min="0"
                inputMode="numeric"
                value={minimumPrice}
                onChange={(event) => setMinimumPrice(event.target.value)}
                placeholder="Min ₦"
              />
              <Input
                aria-label="Maximum price in naira"
                className="min-h-10.5 rounded-md border-2 border-ink-black bg-warm-cream/60 px-3 font-bold text-xs shadow-[2px_2px_0px_#0a0a0a] focus-visible:shadow-[3px_3px_0px_var(--eko-gold)]"
                type="number"
                min="0"
                inputMode="numeric"
                value={maximumPrice}
                onChange={(event) => {
                  setPage(1);
                  setMaximumPrice(event.target.value);
                }}
                placeholder="Max ₦"
              />
            </div>
          </fieldset>

          {/* Real Floor Area Block */}
          <fieldset className="mt-5 grid gap-2.5 rounded-lg border-2 border-ink-black bg-[var(--gold-wash)] p-4 text-xs font-black uppercase tracking-wider text-ink-black shadow-[3px_3px_0px_#0a0a0a]">
            <legend className="rounded-sm border-2 border-ink-black bg-ink-black px-2 py-0.5 text-[0.62rem] font-black text-warm-cream uppercase shadow-[1.5px_1.5px_0px_#0a0a0a]">
              Real Floor Area (m²)
            </legend>
            <div className="grid grid-cols-2 gap-2">
              <span className="relative flex items-center">
                <Input
                  aria-label="Minimum real floor area in square metres"
                  className="min-h-10.5 rounded-sm border-2 border-ink-black bg-card pr-9 pl-3 font-bold shadow-[2px_2px_0px_#0a0a0a]"
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={minimumSqm}
                  onChange={(event) => {
                    setPage(1);
                    setMinimumSqm(event.target.value);
                  }}
                  placeholder="Min"
                />
                <strong className="absolute right-2.5 text-[0.7rem] font-black text-ink-black">m²</strong>
              </span>
              <span className="relative flex items-center">
                <Input
                  aria-label="Maximum real floor area in square metres"
                  className="min-h-10.5 rounded-sm border-2 border-ink-black bg-card pr-9 pl-3 font-bold shadow-[2px_2px_0px_#0a0a0a]"
                  type="number"
                  min="0"
                  inputMode="decimal"
                  value={maximumSqm}
                  onChange={(event) => {
                    setPage(1);
                    setMaximumSqm(event.target.value);
                  }}
                  placeholder="Max"
                />
                <strong className="absolute right-2.5 text-[0.7rem] font-black text-ink-black">m²</strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-ink-black/80 normal-case leading-snug">
              <Sparkles className="size-3 text-ink-black shrink-0" />
              <span>Calibrated true space, not advert claims.</span>
            </div>
          </fieldset>

          {/* Lease Term */}
          <label className="mt-5 grid gap-2 text-xs font-black uppercase tracking-wider text-ink-black">
            <span>Lease Term</span>
            <span className="relative flex min-h-10.5 items-center rounded-md border-2 border-ink-black bg-warm-cream/60 shadow-[2px_2px_0px_#0a0a0a] focus-within:shadow-[3px_3px_0px_var(--eko-gold)]">
              <select
                className="h-10.5 w-full appearance-none bg-transparent pr-9 pl-3 text-xs font-black uppercase tracking-wider text-ink-black outline-none cursor-pointer"
                value={leaseTerm}
                onChange={(event) => {
                  setPage(1);
                  setLeaseTerm(event.target.value as (typeof leaseTerms)[number]);
                }}
              >
                {leaseTerms.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 size-4 stroke-[2.5] text-ink-black" aria-hidden="true" />
            </span>
          </label>

          {/* Verified Only Toggle */}
          <div className="mt-5 rounded-lg border-2 border-ink-black bg-warm-cream p-3.5 shadow-[2px_2px_0px_#0a0a0a]">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="grid gap-0.5">
                <strong className="flex items-center gap-1.5 text-xs font-black uppercase text-ink-black">
                  <ShieldCheck className="size-4 stroke-[2.5] text-success-green" aria-hidden="true" />
                  Scout Verified Only
                </strong>
                <small className="text-[0.68rem] font-bold leading-snug text-muted-foreground">
                  In-person laser audit
                </small>
              </span>
              <Switch
                checked={verifiedOnly}
                onCheckedChange={(value) => {
                  setPage(1);
                  setVerifiedOnly(value);
                }}
                aria-label="Show verified listings only"
              />
            </label>
          </div>

          <Button
            type="button"
            className="mt-5 hidden min-h-11 w-full border-2 border-ink-black bg-eko-gold font-black uppercase tracking-wider text-ink-black shadow-[3px_3px_0px_#0a0a0a] hover:bg-eko-gold-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none max-md:inline-flex"
            onClick={() => setFiltersOpen(false)}
          >
            Show {listings.length} {listings.length === 1 ? "home" : "homes"}
          </Button>
        </aside>

        {/* Results Stream Section */}
        <section className="min-w-0" aria-live="polite">
          {/* Results Toolbar */}
          <div className="mb-6 flex min-h-11 items-center justify-between gap-4 max-[520px]:items-start max-[520px]:flex-col">
            <div className="inline-flex items-center gap-2 rounded-md border-2 border-ink-black bg-card px-3.5 py-1.5 shadow-[2px_2px_0px_#0a0a0a]">
              <span className="size-2 rounded-full bg-success-green animate-pulse" aria-hidden="true" />
              <p className="text-xs font-black tracking-wide text-ink-black uppercase">
                <strong className="font-heading text-sm">{total || listings.length}</strong> {total === 1 ? "home" : "homes"} measured in Lagos
              </p>
            </div>

            <label className="flex items-center gap-2 rounded-md border-2 border-ink-black bg-card px-3 py-1.5 text-xs font-bold text-ink-black shadow-[2px_2px_0px_#0a0a0a] max-[520px]:w-full">
              <ArrowDownUp className="size-3.5 stroke-[2.5]" aria-hidden="true" />
              <span className="text-muted-foreground uppercase text-[0.65rem] font-black">Sort:</span>
              <select
                className="bg-transparent font-black uppercase text-xs text-ink-black outline-none cursor-pointer max-[520px]:flex-1"
                value={sort}
                onChange={(event) => {
                  setPage(1);
                  setSort(event.target.value as SortOption);
                }}
              >
                <option value="relevance">Recommended</option>
                <option value="confidence">Highest Confidence</option>
                <option value="price-low">Price: Low to High</option>
                <option value="recent">Recently Checked</option>
              </select>
            </label>
          </div>

          {/* Cards Grid / State Messages */}
          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center rounded-lg border-2 border-ink-black bg-card p-10 shadow-[4px_4px_0px_#0a0a0a]">
              <div className="text-center">
                <div className="mx-auto size-10 animate-spin rounded-full border-4 border-ink-black border-t-eko-gold" />
                <p className="mt-4 font-heading text-sm font-black uppercase tracking-wider">
                  Loading verified properties…
                </p>
              </div>
            </div>
          ) : error ? (
            <div role="alert" className="rounded-lg border-2 border-alert-red bg-alert-red/10 p-6 font-bold text-alert-red shadow-[4px_4px_0px_#0a0a0a]">
              {error}
            </div>
          ) : listings.length ? (
            <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
              {listings.map((listing) => (
                <ListingCard listing={listing} key={listing.slug} />
              ))}
            </div>
          ) : (
            <div className="grid min-h-[420px] place-items-center content-center rounded-lg border-2 border-dashed border-ink-black bg-card p-10 text-center shadow-[4px_4px_0px_#0a0a0a]">
              <span className="grid size-16 place-items-center rounded-lg border-2 border-ink-black bg-eko-gold text-ink-black shadow-[3px_3px_0px_#0a0a0a]" aria-hidden="true">
                <Ruler className="size-8 stroke-[2.5]" />
              </span>
              <h2 className="mt-5 font-heading text-2xl font-black uppercase tracking-tight">
                No measured homes match yet
              </h2>
              <p className="mt-2 mb-6 max-w-sm text-sm font-medium text-muted-foreground">
                Try widening your district selection, price range, or floor space criteria.
              </p>
              <Button
                type="button"
                variant="outline"
                className="border-2 border-ink-black bg-card font-black uppercase text-xs tracking-wider shadow-[3px_3px_0px_#0a0a0a] hover:bg-warm-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                onClick={clearFilters}
              >
                <X className="stroke-[2.5]" aria-hidden="true" /> Clear all filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {!loading && !error && total > 12 && (
            <nav aria-label="Listing pages" className="mt-10 flex items-center justify-between gap-3 border-t-2 border-ink-black pt-6">
              <Button
                variant="outline"
                className="border-2 border-ink-black font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_#0a0a0a]"
                disabled={page === 1}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>
              <span className="font-heading text-sm font-black uppercase tracking-wider">
                Page {page} of {Math.ceil(total / 12)}
              </span>
              <Button
                variant="outline"
                className="border-2 border-ink-black font-black uppercase text-xs tracking-wider shadow-[2px_2px_0px_#0a0a0a]"
                disabled={page * 12 >= total}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </nav>
          )}
        </section>
      </div>

      {/* Grounded Neo-Brutalist Footer */}
      <footer className="mx-auto mt-20 flex w-[min(1180px,calc(100%-2rem))] items-end justify-between gap-8 border-t-2 border-ink-black py-12 max-md:items-start max-sm:w-[min(1180px,calc(100%-1.5rem))] max-sm:flex-col max-sm:py-8">
        <div>
          <Link
            className="inline-flex w-fit items-center gap-2.5 no-underline"
            href="/"
            aria-label="Eko Space home"
          >
            <span
              className="grid size-10 shrink-0 place-items-center rounded-md border-2 border-ink-black bg-ink-black font-heading text-xl font-black leading-none text-eko-gold-bright shadow-[2px_2px_0px_var(--eko-gold)] max-sm:size-9"
              aria-hidden="true"
            >
              E
            </span>
            <span className="grid leading-[1.05]">
              <strong className="font-heading text-base font-black tracking-tight uppercase">
                Eko Space
              </strong>
              <small className="text-[0.62rem] font-black tracking-[0.14em] text-muted-foreground uppercase max-sm:hidden">
                Lagos, measured clearly
              </small>
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-xs leading-relaxed font-bold text-muted-foreground">
            Clear floor-area facts for better rental decisions. No inflated dimensions, no wide-angle distortions.
          </p>
        </div>

        <nav
          className="flex flex-wrap justify-end gap-x-6 gap-y-2 text-xs font-black tracking-wider uppercase text-ink-black max-sm:justify-start [&_a]:border-b-2 [&_a]:border-transparent hover:[&_a]:border-ink-black"
          aria-label="Footer navigation"
        >
          <Link href="/listings">Browse homes</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/trust">How trust works</Link>
          <Link href="/onboarding">Get started</Link>
          <Link href="/sign-in">Sign in</Link>
        </nav>
      </footer>
    </main>
  );
}
