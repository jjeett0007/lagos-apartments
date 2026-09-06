import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "@/components/marketing-shell";
import { SignOutButton } from "@/components/account/sign-out-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pageUser } from "@/lib/server/session";
import { getDashboard } from "@/lib/server/dashboard";
import { formatNaira } from "@/app/listings/data";
import { ArrowRight, Eye, MessageSquare, Plus, Ruler, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Your dashboard — Eko Space" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await pageUser(true);
  const data = await getDashboard(user.id);

  const statusLabels: Record<string, { label: string; tone: string }> = {
    DRAFT: { label: "Drafts", tone: "bg-warm-cream" },
    IN_REVIEW: { label: "In Review", tone: "bg-eko-gold/30" },
    PUBLISHED: { label: "Published", tone: "bg-success-green/20" },
    FLAGGED: { label: "Flagged", tone: "bg-alert-red/20" },
  };

  return (
    <MarketingShell>
      <main className="mx-auto max-w-6xl px-5 py-14 max-sm:px-4 max-sm:py-8">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="inline-block rounded-md border-2 border-ink-black bg-eko-gold px-3 py-1 text-xs font-black tracking-widest text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
              Lister Command Hub
            </span>
            <h1 className="mt-3 font-heading text-[clamp(2.2rem,4vw,3.2rem)] leading-none font-black tracking-[-0.05em] uppercase">
              Welcome back, {user.name.split(" ")[0]}.
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild size="lg" className="min-h-11 border-2 border-ink-black bg-eko-gold font-bold text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-eko-gold-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
              <Link href="/listings/new">
                <Plus className="stroke-[2.5]" aria-hidden="true" /> Add property
              </Link>
            </Button>
            <SignOutButton />
          </div>
        </div>

        <section aria-label="Listing status breakdown" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(["DRAFT", "IN_REVIEW", "PUBLISHED", "FLAGGED"] as const).map((status) => {
            const count = data.statuses.find((s) => s.status === status)?._count ?? 0;
            return (
              <div
                key={status}
                className="rounded-xl border-2 border-ink-black bg-card p-5 shadow-[4px_4px_0px_#0A0A0A] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_var(--eko-gold)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    {statusLabels[status]?.label ?? status}
                  </span>
                  <span className={`size-3 rounded-full border-2 border-ink-black ${status === "PUBLISHED" ? "bg-success-green" : status === "FLAGGED" ? "bg-alert-red" : status === "IN_REVIEW" ? "bg-eko-gold" : "bg-muted"}`} />
                </div>
                <strong className="mt-3 block font-heading text-4xl font-black tracking-tight text-ink-black">
                  {count}
                </strong>
              </div>
            );
          })}
        </section>

        <section aria-label="Performance metrics" className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border-2 border-ink-black bg-card p-5 shadow-[4px_4px_0px_#0A0A0A]">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
              <Eye className="size-4 stroke-[2.5] text-ink-black" aria-hidden="true" />
              Recorded views
            </div>
            <strong className="mt-2 block font-heading text-3xl font-black text-ink-black">{data.views}</strong>
          </div>
          <div className="rounded-xl border-2 border-ink-black bg-card p-5 shadow-[4px_4px_0px_#0A0A0A]">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
              <MessageSquare className="size-4 stroke-[2.5] text-ink-black" aria-hidden="true" />
              Direct enquiries
            </div>
            <strong className="mt-2 block font-heading text-3xl font-black text-ink-black">{data.enquiries}</strong>
          </div>
          <div className="rounded-xl border-2 border-ink-black bg-[var(--gold-wash)] p-5 shadow-[4px_4px_0px_#0A0A0A]">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-ink-black">
              <ShieldCheck className="size-4 stroke-[2.5] text-ink-black" aria-hidden="true" />
              Trust score
            </div>
            <strong className="mt-2 block font-heading text-3xl font-black text-ink-black">
              {data.trustScore?.score ? `${data.trustScore.score}/100` : "Not assessed"}
            </strong>
          </div>
        </section>

        <section className="mt-14">
          <div className="flex items-center justify-between border-b-2 border-ink-black/20 pb-4">
            <h2 className="font-heading text-2xl font-black uppercase tracking-tight">Your properties</h2>
            <span className="rounded-md border-2 border-ink-black bg-card px-2.5 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
              {data.listings.length} {data.listings.length === 1 ? "Property" : "Properties"}
            </span>
          </div>

          {data.listings.length ? (
            <div className="mt-6 grid gap-4">
              {data.listings.map((listing) => (
                <article
                  key={listing.id}
                  className="flex flex-wrap items-center justify-between gap-5 rounded-xl border-2 border-ink-black bg-card p-6 shadow-[4px_4px_0px_#0A0A0A] transition-all hover:shadow-[6px_6px_0px_var(--eko-gold)] max-md:flex-col max-md:items-start"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-heading text-xl font-black uppercase tracking-tight">{listing.title}</h3>
                      <Badge className="border-2 border-ink-black font-black uppercase text-[0.65rem] shadow-[1px_1px_0px_#0A0A0A]">
                        {listing.status.replaceAll("_", " ")}
                      </Badge>
                    </div>
                    <p className="mt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-muted-foreground">
                      <span>{listing.areaName}</span>
                      <span>·</span>
                      <span className="text-ink-black">{formatNaira(Number(listing.price))}</span>
                      <span>·</span>
                      <span className="uppercase">{listing.leaseTerm.toLowerCase()}</span>
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded border-2 border-ink-black bg-warm-cream/60 px-2.5 py-0.5 text-xs font-black text-ink-black shadow-[1px_1px_0px_#0A0A0A]">
                        {listing._count.rooms} rooms
                      </span>
                      <span className="rounded border-2 border-ink-black bg-[var(--gold-wash)] px-2.5 py-0.5 text-xs font-black text-ink-black shadow-[1px_1px_0px_#0A0A0A]">
                        {listing.totalAreaSqm ? `${listing.totalAreaSqm} m² recorded` : "Measurements pending"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 max-md:w-full max-md:justify-end">
                    {["DRAFT", "REJECTED"].includes(listing.status) ? (
                      <Button asChild className="border-2 border-ink-black bg-eko-gold font-bold text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-eko-gold-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                        <Link href={`/listings/new?edit=${encodeURIComponent(listing.id)}`}>
                          Continue draft <ArrowRight className="stroke-[2.5]" aria-hidden="true" />
                        </Link>
                      </Button>
                    ) : listing.status === "PUBLISHED" ? (
                      <Button asChild variant="outline" className="border-2 border-ink-black font-bold shadow-[3px_3px_0px_#0A0A0A] hover:bg-warm-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                        <Link href={`/listings/${listing.slug}`}>
                          View listing <ArrowRight className="stroke-[2.5]" aria-hidden="true" />
                        </Link>
                      </Button>
                    ) : (
                      <span className="rounded-md border-2 border-ink-black bg-warm-cream px-3 py-1.5 text-xs font-black uppercase text-ink-black shadow-[2px_2px_0px_#0A0A0A]">
                        {listing.status === "IN_REVIEW" ? "Awaiting Review" : listing.status.toLowerCase()}
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[var(--radius-panel)] border-2 border-dashed border-ink-black bg-card p-12 text-center shadow-[4px_4px_0px_#0A0A0A]">
              <span className="mx-auto grid size-16 place-items-center rounded-xl border-2 border-ink-black bg-eko-gold text-ink-black shadow-[3px_3px_0px_#0A0A0A]">
                <Ruler className="size-8 stroke-[2.5]" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-heading text-2xl font-black uppercase">Your first property starts here</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-muted-foreground">
                Add its details, save a draft, and measure each room with photographic evidence.
              </p>
              <Button asChild size="lg" className="mt-6 border-2 border-ink-black bg-eko-gold font-bold text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-eko-gold-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                <Link href="/listings/new">
                  <Plus className="stroke-[2.5]" aria-hidden="true" /> Create a listing
                </Link>
              </Button>
            </div>
          )}
        </section>
      </main>
    </MarketingShell>
  );
}
