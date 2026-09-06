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
  Check,
  ChevronDown,
  MapPin,
  Ruler,
  Search,
  ShieldCheck,
  SlidersHorizontal,
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
  return (
    <Card
      className="group relative gap-0 overflow-hidden rounded-[var(--radius-panel)] border-2 border-ink-black bg-card py-0 shadow-[4px_4px_0px_#0A0A0A] transition-all duration-150 hover:-translate-y-1 hover:-translate-x-0.5 hover:shadow-[6px_6px_0px_var(--eko-gold)]"
    >
      <div className={`relative grid min-h-60 content-end overflow-hidden border-b-2 border-ink-black p-4 text-warm-cream max-[520px]:min-h-52 ${photoTones[listing.photoCount % photoTones.length]}`}>
        <div className="pointer-events-none absolute right-[14%] bottom-0 h-[68%] w-[42%] border-2 border-b-0 border-warm-cream/35" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%] border-t-2 border-ink-black/25 bg-ink-black/40" aria-hidden="true" />
        {listing.photos[0] && (
          <Image
            src={listing.photos[0].url}
            alt={listing.photos[0].altText ?? listing.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        <div className="relative z-10 mb-auto flex items-center justify-between gap-2">
          <span className="rounded-md border-2 border-ink-black bg-ink-black px-2.5 py-1 text-[0.65rem] font-black tracking-wider text-warm-cream uppercase shadow-[2px_2px_0px_#0A0A0A]">
            {listing.photoCount ? `${listing.photoCount} photos` : "No photo yet"}
          </span>
          <SavedListingButton listingId={listing.id} title={listing.title} />
        </div>
        <span className="relative z-10 w-fit font-heading text-xl font-black tracking-tight uppercase drop-shadow-md">
          {listing.propertyType}
        </span>
      </div>

      <CardContent className="p-4.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={listing.status === "verified" ? "verified" : "outline"}
            className="min-h-6 gap-1.5 border-2 border-ink-black px-2.5 text-[0.66rem] font-black uppercase shadow-[2px_2px_0px_#0A0A0A]"
          >
            {listing.status === "verified" ? <ShieldCheck className="size-3.5" aria-hidden="true" /> : <Ruler className="size-3.5" aria-hidden="true" />}
            {verificationLabel(listing.status)}
          </Badge>
          <span className="rounded-md border-2 border-ink-black bg-[var(--gold-wash)] px-2.5 py-1 text-[0.66rem] font-black text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
            {listing.confidence === null ? "Confidence unassessed" : `${listing.confidence}% confidence`}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3.5 max-[520px]:grid-cols-1">
          <div>
            <Link href={`/listings/${listing.slug}`} className="group/title">
              <h2 className="font-heading text-lg leading-tight font-black tracking-tight uppercase decoration-eko-gold underline-offset-4 group-hover/title:underline">
                {listing.title}
              </h2>
            </Link>
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="size-3.5 shrink-0 text-ink-black" aria-hidden="true" /> {listing.address}
            </p>
          </div>
          <div className="rounded-lg border-2 border-ink-black bg-[var(--gold-wash)] px-3 py-1.5 text-center shadow-[2px_2px_0px_#0A0A0A] max-[520px]:row-start-1 max-[520px]:w-fit">
            <strong className="font-heading text-2xl font-black tracking-[-0.05em] text-ink-black">
              {listing.totalSqm ?? "—"}<small className="ml-0.5 font-sans text-xs font-black tracking-normal">m²</small>
            </strong>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-y-2 border-ink-black/20 bg-warm-cream/50 px-3 py-2.5 text-[0.72rem] font-bold text-ink-black [&>span]:inline-flex [&>span]:items-center [&>span]:gap-1.5 [&_svg]:size-3.5">
          <span><BedDouble aria-hidden="true" /> {listing.bedrooms || "Studio"}{listing.bedrooms ? " bed" : ""}</span>
          <span><Bath aria-hidden="true" /> {listing.bathrooms} bath</span>
          <span><Check className="text-success-green stroke-[3]" aria-hidden="true" /> {listing.rooms.length} rooms measured</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 max-[520px]:flex-col max-[520px]:items-stretch">
          <p className="min-w-0">
            <strong className="block overflow-hidden font-heading text-base font-black tracking-tight text-ink-black text-ellipsis whitespace-nowrap">
              {formatNaira(listing.price)}
            </strong>
            <span className="text-[0.68rem] font-bold text-muted-foreground uppercase">/ {listing.leaseTerm.toLowerCase()}</span>
          </p>
          <Button asChild size="sm" className="shrink-0 border-2 border-ink-black bg-eko-gold font-bold text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-eko-gold-bright hover:shadow-[4px_4px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none max-[520px]:min-h-10">
            <Link href={`/listings/${listing.slug}`}>
              View Space
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
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
      setLoading(true); setError("");
      const params = new URLSearchParams({ q: query, sort, page: String(page), verified: String(verifiedOnly) });
      if (area !== "All Lagos") params.set("area", area);
      if (maximumPrice) params.set("maxPrice", maximumPrice);
      if (minimumSqm) params.set("minSqm", minimumSqm);
      if (leaseTerm !== "Any term") params.set("leaseTerm", { Yearly: "YEARLY", Monthly: "MONTHLY", Nightly: "DAILY" }[leaseTerm]);
      try {
        const response = await fetch(`/api/listings?${params}`, { signal: controller.signal, cache: "no-store" });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Could not load listings.");
        if (!controller.signal.aborted) { setListings(payload.data.listings); setTotal(payload.data.total); }
      } catch (err) {
        if (!controller.signal.aborted) { setError(err instanceof Error ? err.message : "Could not load listings."); setListings([]); }
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [area, leaseTerm, maximumPrice, minimumSqm, query, sort, verifiedOnly, page]);
  const filteredListings = listings;

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
    <main className="min-h-screen bg-warm-cream text-ink-black">
      <ListingsHeader />

      <section className="mx-auto grid w-[min(1180px,calc(100%-32px))] grid-cols-[minmax(0,1.4fr)_minmax(280px,0.6fr)] items-end gap-[clamp(32px,8vw,110px)] pt-[clamp(64px,9vw,112px)] pb-9.5 max-md:grid-cols-1 max-md:gap-4.5 max-md:pt-14 max-[520px]:w-[calc(100%-20px)] max-[520px]:pt-12">
        <div>
          <span className="inline-block rounded-md border-2 border-ink-black bg-eko-gold px-3 py-1 text-xs font-black tracking-[0.14em] text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
            Measured homes across Lagos
          </span>
          <h1 className="mt-3.5 max-w-3xl text-balance font-heading text-[var(--text-hero)] leading-[0.92] font-black tracking-[-0.065em] uppercase max-[520px]:text-[clamp(2.25rem,13vw,3.4rem)]">
            Search by the space you actually get.
          </h1>
        </div>
        <p className="pb-1.5 text-[var(--text-body)] font-medium leading-relaxed text-[var(--body-muted)]">
          Every result shows how its size was obtained, when it was checked, and how confident the measurement is.
        </p>
      </section>

      <section className="mx-auto mb-8 flex w-[min(1180px,calc(100%-32px))] items-center gap-3 max-[520px]:w-[calc(100%-20px)]" aria-label="Search listings">
        <label className="flex h-15 w-full items-center gap-3 rounded-[var(--radius-panel)] border-2 border-ink-black bg-card px-4 shadow-[4px_4px_0px_#0A0A0A] transition-all focus-within:shadow-[6px_6px_0px_var(--eko-gold)] max-[520px]:h-13">
          <span className="sr-only">Search by area or property</span>
          <Search className="size-5 shrink-0 text-ink-black stroke-[2.5]" aria-hidden="true" />
          <Input className="h-full border-0 bg-transparent p-0 text-base font-bold text-ink-black shadow-none placeholder:text-muted-foreground/70 focus-visible:border-0 focus-visible:ring-0" value={query} onChange={(event) => { setPage(1); setQuery(event.target.value); }} placeholder="Search by area e.g. Ikate, Yaba, Lekki, or 2-bed flat…" />
        </label>
        <Button type="button" variant="outline" className="hidden min-h-15 shrink-0 border-2 border-ink-black bg-card font-bold shadow-[3px_3px_0px_#0A0A0A] hover:bg-warm-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-none max-md:inline-flex max-[520px]:size-13 max-[520px]:p-0" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen} aria-controls="listing-filters">
          <SlidersHorizontal className="size-4 stroke-[2.5]" aria-hidden="true" /> <span className="max-[520px]:hidden">Filters</span>
        </Button>
      </section>

      <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] grid-cols-[265px_minmax(0,1fr)] items-start gap-7 pb-24 max-lg:grid-cols-[235px_minmax(0,1fr)] max-lg:gap-5 max-md:block max-[520px]:w-[calc(100%-20px)]">
        <aside id="listing-filters" className={`sticky top-24 rounded-[var(--radius-panel)] border-2 border-ink-black bg-card p-5 shadow-[5px_5px_0px_#0A0A0A] max-md:static max-md:mb-6 ${filtersOpen ? "max-md:block" : "max-md:hidden"}`} aria-label="Listing filters">
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink-black/15 pb-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 stroke-[2.5]" aria-hidden="true" />
              <h2 className="font-heading text-base font-black tracking-tight uppercase">Filters</h2>
            </div>
            {hasFilters ? <Button type="button" variant="ghost" size="sm" className="font-bold text-alert-red hover:bg-alert-red/10" onClick={clearFilters}>Clear all</Button> : null}
          </div>

          <label className="mt-5 grid gap-2 text-xs font-black uppercase tracking-wider text-ink-black">
            <span>Area</span>
            <span className="relative flex min-h-10.5 items-center rounded-lg border-2 border-ink-black bg-warm-cream/50 shadow-[2px_2px_0px_#0A0A0A] focus-within:shadow-[3px_3px_0px_var(--eko-gold)]">
              <select className="h-10.5 w-full appearance-none bg-transparent pr-9 pl-3 text-sm font-bold text-ink-black outline-none" value={area} onChange={(event) => { setPage(1); setArea(event.target.value as (typeof lagosAreas)[number]); }}>
                {lagosAreas.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 size-4 stroke-[2.5] text-ink-black" aria-hidden="true" />
            </span>
          </label>

          <fieldset className="mt-5 grid gap-2 text-xs font-black uppercase tracking-wider text-ink-black">
            <legend>Price range <small className="font-normal normal-case text-muted-foreground">(₦)</small></legend>
            <div className="grid grid-cols-2 gap-2">
              <Input aria-label="Minimum price in naira" className="min-h-10.5 border-2 border-ink-black bg-warm-cream/50 px-3 font-bold shadow-[2px_2px_0px_#0A0A0A] focus-visible:shadow-[3px_3px_0px_var(--eko-gold)]" type="number" min="0" inputMode="numeric" value={minimumPrice} onChange={(event) => setMinimumPrice(event.target.value)} placeholder="Min" />
              <Input aria-label="Maximum price in naira" className="min-h-10.5 border-2 border-ink-black bg-warm-cream/50 px-3 font-bold shadow-[2px_2px_0px_#0A0A0A] focus-visible:shadow-[3px_3px_0px_var(--eko-gold)]" type="number" min="0" inputMode="numeric" value={maximumPrice} onChange={(event) => { setPage(1); setMaximumPrice(event.target.value); }} placeholder="Max" />
            </div>
          </fieldset>

          <fieldset className="mt-5 grid gap-2.5 rounded-xl border-2 border-ink-black bg-[var(--gold-wash)] p-4 text-xs font-black uppercase tracking-wider text-ink-black shadow-[3px_3px_0px_#0A0A0A]">
            <legend className="rounded border-2 border-ink-black bg-ink-black px-2 py-0.5 text-[0.62rem] font-black text-warm-cream uppercase shadow-[1px_1px_0px_#0A0A0A]">Real floor area</legend>
            <div className="grid grid-cols-2 gap-2">
              <span className="relative flex items-center">
                <Input aria-label="Minimum real floor area in square metres" className="min-h-10.5 border-2 border-ink-black bg-card pr-9 pl-3 font-bold shadow-[2px_2px_0px_#0A0A0A]" type="number" min="0" inputMode="decimal" value={minimumSqm} onChange={(event) => { setPage(1); setMinimumSqm(event.target.value); }} placeholder="Min" />
                <strong className="absolute right-2.5 text-[0.7rem] font-black text-ink-black">m²</strong>
              </span>
              <span className="relative flex items-center">
                <Input aria-label="Maximum real floor area in square metres" className="min-h-10.5 border-2 border-ink-black bg-card pr-9 pl-3 font-bold shadow-[2px_2px_0px_#0A0A0A]" type="number" min="0" inputMode="decimal" value={maximumSqm} onChange={(event) => setMaximumSqm(event.target.value)} placeholder="Max" />
                <strong className="absolute right-2.5 text-[0.7rem] font-black text-ink-black">m²</strong>
              </span>
            </div>
            <small className="font-medium normal-case leading-snug text-ink-black/80">Based on measured rooms, not listing claims.</small>
          </fieldset>

          <label className="mt-5 grid gap-2 text-xs font-black uppercase tracking-wider text-ink-black">
            <span>Lease term</span>
            <span className="relative flex min-h-10.5 items-center rounded-lg border-2 border-ink-black bg-warm-cream/50 shadow-[2px_2px_0px_#0A0A0A] focus-within:shadow-[3px_3px_0px_var(--eko-gold)]">
              <select className="h-10.5 w-full appearance-none bg-transparent pr-9 pl-3 text-sm font-bold text-ink-black outline-none" value={leaseTerm} onChange={(event) => { setPage(1); setLeaseTerm(event.target.value as (typeof leaseTerms)[number]); }}>
                {leaseTerms.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 size-4 stroke-[2.5] text-ink-black" aria-hidden="true" />
            </span>
          </label>

          <div className="mt-5 rounded-lg border-2 border-ink-black bg-warm-cream/50 p-3 shadow-[2px_2px_0px_#0A0A0A]">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="grid gap-0.5">
                <strong className="flex items-center gap-1.5 text-xs font-black text-ink-black"><ShieldCheck className="size-4 stroke-[2.5] text-ink-black" aria-hidden="true" /> Verified only</strong>
                <small className="text-[0.68rem] font-medium leading-snug text-muted-foreground">Scout-verified properties</small>
              </span>
              <Switch checked={verifiedOnly} onCheckedChange={(value) => { setPage(1); setVerifiedOnly(value); }} aria-label="Show verified listings only" />
            </label>
          </div>

          <Button type="button" className="mt-5 hidden min-h-11 w-full border-2 border-ink-black bg-eko-gold font-bold text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-eko-gold-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none max-md:inline-flex" onClick={() => setFiltersOpen(false)}>
            Show {filteredListings.length} {filteredListings.length === 1 ? "home" : "homes"}
          </Button>
        </aside>

        <section className="min-w-0" aria-live="polite">
          <div className="mb-5 flex min-h-11 items-center justify-between gap-4 max-[520px]:items-start max-[520px]:flex-col">
            <div className="inline-flex items-center gap-2 rounded-md border-2 border-ink-black bg-card px-3 py-1.5 shadow-[2px_2px_0px_#0A0A0A]">
              <span className="size-2 rounded-full bg-success-green animate-pulse" aria-hidden="true" />
              <p className="text-xs font-black tracking-wide text-ink-black uppercase">
                <strong className="font-heading text-sm">{filteredListings.length}</strong> {filteredListings.length === 1 ? "home" : "homes"} measured
              </p>
            </div>
            <label className="flex items-center gap-2 rounded-md border-2 border-ink-black bg-card px-3 py-1.5 text-xs font-bold text-ink-black shadow-[2px_2px_0px_#0A0A0A] max-[520px]:w-full">
              <ArrowDownUp className="size-3.5 stroke-[2.5]" aria-hidden="true" />
              <span className="text-muted-foreground uppercase text-[0.65rem] font-black">Sort:</span>
              <select className="bg-transparent font-black text-ink-black outline-none max-[520px]:flex-1" value={sort} onChange={(event) => { setPage(1); setSort(event.target.value as SortOption); }}>
                <option value="relevance">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="confidence">Highest Confidence</option>
                <option value="recent">Recently Checked</option>
              </select>
            </label>
          </div>

          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center rounded-[var(--radius-panel)] border-2 border-ink-black bg-card p-10 shadow-[4px_4px_0px_#0A0A0A]">
              <div className="text-center">
                <div className="mx-auto size-8 animate-spin rounded-full border-4 border-ink-black border-t-eko-gold" />
                <p className="mt-4 font-heading text-sm font-black uppercase tracking-wider">Loading verified homes…</p>
              </div>
            </div>
          ) : error ? (
            <div role="alert" className="rounded-[var(--radius-panel)] border-2 border-alert-red bg-alert-red/10 p-6 font-bold text-alert-red shadow-[4px_4px_0px_#0A0A0A]">
              {error}
            </div>
          ) : filteredListings.length ? (
            <div className="grid grid-cols-2 gap-5 max-lg:grid-cols-1">
              {filteredListings.map((listing) => <ListingCard listing={listing} key={listing.slug} />)}
            </div>
          ) : (
            <div className="grid min-h-[420px] place-items-center content-center rounded-[var(--radius-panel)] border-2 border-dashed border-ink-black bg-card p-10 text-center shadow-[4px_4px_0px_#0A0A0A]">
              <span className="grid size-16 place-items-center rounded-xl border-2 border-ink-black bg-eko-gold text-ink-black shadow-[3px_3px_0px_#0A0A0A]" aria-hidden="true">
                <Ruler className="size-8 stroke-[2.5]" />
              </span>
              <h2 className="mt-5 font-heading text-2xl font-black uppercase tracking-tight">No measured homes match yet</h2>
              <p className="mt-2 mb-6 max-w-sm text-sm font-medium text-muted-foreground">Try widening your area, price range, or floor-space filters to find more properties.</p>
              <Button type="button" variant="outline" className="border-2 border-ink-black bg-card font-bold shadow-[3px_3px_0px_#0A0A0A] hover:bg-warm-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-none" onClick={clearFilters}>
                <X className="stroke-[2.5]" aria-hidden="true" /> Clear all filters
              </Button>
            </div>
          )}
          {!loading && !error && total > 12 && (
            <nav aria-label="Listing pages" className="mt-8 flex items-center justify-between gap-3 border-t-2 border-ink-black/20 pt-6">
              <Button variant="outline" className="border-2 border-ink-black font-bold shadow-[2px_2px_0px_#0A0A0A]" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
                Previous
              </Button>
              <span className="font-heading text-sm font-black uppercase tracking-wider">Page {page} of {Math.ceil(total / 12)}</span>
              <Button variant="outline" className="border-2 border-ink-black font-bold shadow-[2px_2px_0px_#0A0A0A]" disabled={page * 12 >= total} onClick={() => setPage((value) => value + 1)}>
                Next
              </Button>
            </nav>
          )}
        </section>
      </div>
    </main>
  );
}
