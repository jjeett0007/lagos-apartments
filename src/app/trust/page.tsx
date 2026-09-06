import type { Metadata } from "next";
import Link from "next/link";
import {
  Camera,
  Check,
  CircleAlert,
  CopyCheck,
  Flag,
  Scale,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "How Trust Works — Eko Space",
  description:
    "Understand Eko Space measurement confidence, verification, and Lagos listing fraud checks.",
};

const confidenceInputs = [
  {
    icon: Camera,
    title: "Image & Boundary Quality",
    copy: "Clear floor edges and a complete room view give our homography computer vision engine strong evidence.",
    stamp: "INPUT_01",
  },
  {
    icon: Scale,
    title: "Calibration Target Accuracy",
    copy: "A calibrated physical reference sheet (A4 target / ArUco marker) converts camera pixels into verified square metres.",
    stamp: "INPUT_02",
  },
  {
    icon: Check,
    title: "Manual Boundary Correction",
    copy: "Any manual adjustments to suggested room corners adjust confidence scores transparently for tenants to see.",
    stamp: "INPUT_03",
  },
] as const;

const checks = [
  {
    icon: CopyCheck,
    title: "Duplicate & Stolen Photo Detection",
    copy: "Perceptual hashing flags photos reused across disparate Lagos addresses or scraped from unauthorized third-party boards.",
  },
  {
    icon: CircleAlert,
    title: "Rental Pricing Outlier Analysis",
    copy: "Rent prices deviating radically from neighbourhood medians (e.g. ₦1.5M in Banana Island) trigger immediate human scout audit.",
  },
  {
    icon: Flag,
    title: "On-Ground Community Whistleblowing",
    copy: "Seeker tour reports and scout mismatch flags directly degrade a lister's public reliability index.",
  },
] as const;

const eyebrowClass =
  "inline-block rounded-md border-2 border-ink-black bg-eko-gold px-3 py-0.5 text-xs font-black tracking-[0.14em] text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A]";
const headingClass =
  "mt-3.5 font-heading text-[clamp(2.2rem,5vw,3.6rem)] font-black leading-[0.95] tracking-[-0.05em] uppercase text-ink-black";

export default function TrustPage() {
  return (
    <MarketingShell current="trust">
      <main className="bg-warm-cream text-ink-black">
        {/* HERO SECTION */}
        <section
          className="mx-auto grid min-h-162.5 w-[min(1180px,calc(100%-2rem))] grid-cols-[minmax(0,1.1fr)_minmax(340px,0.65fr)] items-center gap-[clamp(2.875rem,8vw,6rem)] py-20 max-lg:min-h-0 max-lg:grid-cols-1 max-sm:w-[min(1180px,calc(100%-1.25rem))] max-sm:py-12"
          aria-labelledby="trust-title"
        >
          <div className="max-w-182.5">
            <span className={eyebrowClass}>Proof over promises</span>
            <h1 className={headingClass} id="trust-title">
              We prove how room sizes are measured. Not just arbitrary claims.
            </h1>
            <p className="mt-6 max-w-162.5 text-base font-medium leading-relaxed text-ink-black/80">
              Lagos apartment hunters should never have to gamble on fish-eye lenses, vague “executive self-contain” descriptions, or undocumented floor plans. Eko Space binds every listing to its photographic evidence trail, pixel-calibrated geometry, and audit timestamp.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="min-h-12 border-2 border-ink-black bg-ink-black px-7 text-xs font-black tracking-wider uppercase text-warm-cream shadow-[4px_4px_0px_var(--eko-gold)] hover:bg-ink-black-soft active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Link href="/listings">
                  Browse measured homes
                  <ArrowRight className="stroke-[2.5]" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="min-h-12 border-2 border-ink-black bg-card px-6 text-xs font-black tracking-wider uppercase text-ink-black shadow-[4px_4px_0px_#0A0A0A] hover:bg-warm-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Link href="/capture">Try calibration studio</Link>
              </Button>
            </div>
          </div>

          {/* TELEMETRY RECORD CARD */}
          <Card className="w-full max-w-120 overflow-hidden rounded-2xl border-[2.5px] border-ink-black bg-card text-ink-black shadow-[8px_8px_0px_#0A0A0A]">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b-2 border-ink-black bg-ink-black px-5 py-4 text-xs font-black uppercase text-warm-cream max-sm:flex-col max-sm:items-start">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full border border-ink-black bg-eko-gold" />
                <span>Survey telemetry record</span>
              </div>
              <Badge className="border-2 border-ink-black bg-eko-gold font-black uppercase text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
                AI-estimated
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              <div
                className="relative mx-auto mb-6 grid size-44 place-items-center rounded-2xl border-2 border-ink-black bg-warm-cream p-4 shadow-[4px_4px_0px_#0A0A0A]"
                aria-label="86 percent confidence"
              >
                <svg
                  className="absolute inset-0 size-full -rotate-90 p-3"
                  viewBox="0 0 120 120"
                  role="img"
                  aria-hidden="true"
                >
                  <circle
                    className="fill-none stroke-ink-black/15 stroke-[10]"
                    cx="60"
                    cy="60"
                    r="48"
                  />
                  <circle
                    className="fill-none stroke-eko-gold stroke-[10] [stroke-dasharray:86_100] [stroke-linecap:round]"
                    cx="60"
                    cy="60"
                    r="48"
                    pathLength="100"
                  />
                </svg>
                <span className="grid text-center">
                  <strong className="font-heading text-4xl font-black leading-none tracking-tight text-ink-black">
                    86%
                  </strong>
                  <small className="mt-1 text-[0.62rem] font-black tracking-widest text-muted-foreground uppercase">
                    Confidence
                  </small>
                </span>
              </div>

              <div className="space-y-2 rounded-xl border-2 border-ink-black bg-warm-cream p-4 text-xs shadow-[3px_3px_0px_#0A0A0A]">
                <div className="flex items-center justify-between border-b border-ink-black/15 pb-2">
                  <span className="font-bold text-muted-foreground uppercase">Floor area</span>
                  <strong className="font-heading text-sm font-black text-ink-black">12.6 m²</strong>
                </div>
                <div className="flex items-center justify-between border-b border-ink-black/15 pb-2">
                  <span className="font-bold text-muted-foreground uppercase">Reference target</span>
                  <strong className="font-bold text-ink-black">A4 Sheet (297×210 mm)</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-muted-foreground uppercase">Audit protocol</span>
                  <strong className="font-bold text-ink-black">Planar Homography CV</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* BRUTALIST TICKER DIVIDER */}
        <div
          className="flex h-9 w-full items-center justify-between border-y-2 border-ink-black bg-eko-gold px-6 text-xs font-black tracking-widest text-ink-black uppercase shadow-[inset_0px_2px_0px_rgba(0,0,0,0.1)]"
          aria-hidden="true"
        >
          <span>EKO SPACE VERIFICATION MATRIX</span>
          <span className="hidden sm:inline">NO DISTORTION LENSES</span>
          <span className="hidden md:inline">AUDITED LAGOS PROPERTIES ONLY</span>
          <span>EST. 2026</span>
        </div>

        {/* SECTION: UNDERSTANDING CONFIDENCE */}
        <section
          className="mx-auto w-[min(1180px,calc(100%-2rem))] py-[clamp(4.5rem,8vw,7rem)] max-sm:w-[min(1180px,calc(100%-1.25rem))]"
          aria-labelledby="confidence-title"
        >
          <div className="grid grid-cols-[0.8fr_1.2fr] items-end gap-x-10.5 max-lg:grid-cols-1 max-lg:gap-y-5">
            <div className="col-span-full">
              <span className={eyebrowClass}>Understanding confidence</span>
              <h2 className={headingClass} id="confidence-title">
                A quantitative signal, not a vague promise.
              </h2>
            </div>
            <p className="col-span-full mt-2 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
              Our confidence metric measures mathematical fit between reference markers, floor perspective geometry, and boundary corners.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-6 max-md:grid-cols-1">
            {confidenceInputs.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  className="rounded-xl border-[2.5px] border-ink-black bg-card p-6 shadow-[5px_5px_0px_#0A0A0A] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0px_#0A0A0A]"
                  key={item.title}
                >
                  <CardHeader className="flex flex-row items-center justify-between p-0">
                    <span className="grid size-11 place-items-center rounded-lg border-2 border-ink-black bg-eko-gold text-ink-black shadow-[2px_2px_0px_#0A0A0A]">
                      <Icon className="size-5.5 stroke-[2.5]" aria-hidden="true" />
                    </span>
                    <span className="rounded border-2 border-ink-black bg-warm-cream px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-ink-black">
                      {item.stamp}
                    </span>
                  </CardHeader>
                  <CardContent className="p-0 pt-6">
                    <h3 className="font-heading text-lg font-black uppercase tracking-tight text-ink-black">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-xs font-medium leading-relaxed text-muted-foreground">
                      {item.copy}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Alert className="mt-8 rounded-xl border-[2.5px] border-ink-black bg-[var(--gold-wash)] p-5 text-ink-black shadow-[4px_4px_0px_#0A0A0A]">
            <ShieldCheck className="size-6 stroke-[2.5] text-ink-black" aria-hidden="true" />
            <AlertTitle className="font-black uppercase tracking-wide">
              Measurement badge hierarchy
            </AlertTitle>
            <AlertDescription className="font-medium text-ink-black/80">
              <strong className="font-black text-ink-black">“AI-estimated”</strong> signifies algorithmic measurement from owner-uploaded sectional photos.{" "}
              <strong className="font-black text-ink-black">“Verified”</strong> guarantees a trained Eko Space field scout performed an on-site laser distance measurement audit and sealed the report.
            </AlertDescription>
          </Alert>
        </section>

        {/* SECTION: LISTING CHECKS */}
        <section
          className="border-y-[2.5px] border-ink-black bg-ink-black px-[max(1rem,calc((100vw-1180px)/2))] py-[clamp(4.5rem,8vw,7rem)] text-warm-cream"
          aria-labelledby="fraud-title"
        >
          <div className="mx-auto grid w-[min(1180px,calc(100%-2rem))] grid-cols-[minmax(280px,0.75fr)_minmax(0,1.25fr)] gap-[clamp(3rem,8vw,6rem)] max-lg:grid-cols-1">
            <div>
              <span className="inline-block rounded border-2 border-white/30 bg-eko-gold px-2.5 py-0.5 text-[0.68rem] font-black uppercase tracking-widest text-ink-black">
                Fraud Countermeasures
              </span>
              <h2 className="mt-3.5 font-heading text-[clamp(2rem,4vw,3.2rem)] font-black leading-[0.98] tracking-[-0.05em] uppercase text-warm-cream" id="fraud-title">
                More than an unverified watermark.
              </h2>
              <p className="mt-5 text-sm font-medium leading-relaxed text-[#aaa399]">
                Lagos real estate faces endemic duplication of listing cards and fake deposits. Our multi-layer fraud architecture checks image hashing, spatial coordinates, and community whistleblowing in real time.
              </p>
            </div>

            <div className="space-y-4">
              {checks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    className="flex items-start gap-4 rounded-xl border-2 border-white/20 bg-ink-black-soft p-5 shadow-[4px_4px_0px_rgba(255,255,255,0.1)] transition-all hover:border-eko-gold"
                    key={item.title}
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded border-2 border-ink-black bg-eko-gold font-mono text-xs font-black text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
                      0{index + 1}
                    </span>
                    <div className="grid gap-1">
                      <h3 className="font-heading text-sm font-black uppercase text-warm-cream">
                        {item.title}
                      </h3>
                      <p className="text-xs font-medium leading-relaxed text-[#aaa399]">
                        {item.copy}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION: MISSION */}
        <section
          className="mx-auto grid w-[min(1040px,calc(100%-2rem))] grid-cols-[minmax(0,0.9fr)_1px_minmax(0,1.1fr)] items-start gap-[clamp(2.375rem,7vw,5rem)] py-[clamp(5rem,10vw,8rem)] max-lg:grid-cols-1 max-sm:w-[min(1040px,calc(100%-1.25rem))]"
          aria-labelledby="mission-title"
        >
          <div>
            <span className={eyebrowClass}>Why we built Eko Space</span>
            <h2 className={headingClass} id="mission-title">
              A transparent way to rent in Lagos.
            </h2>
          </div>
          <Separator className="h-full w-0.5 bg-ink-black/20 max-lg:h-0.5 max-lg:w-full" />
          <div className="space-y-5">
            <p className="text-sm font-medium leading-relaxed text-[#4c463f]">
              Whether you are relocating from the Diaspora, moving across the bridge from Mainland to Island, or comparing short-lets in Ikoyi, you deserve genuine floor dimensions before paying non-refundable inspection fees.
            </p>
            <p className="text-sm font-medium leading-relaxed text-[#4c463f]">
              Eko Space replaces guesswork with verifiable square metres, sectional room photos (toilets, bathrooms, kitchens), and an immutable audit trail.
            </p>
            <div className="pt-3">
              <Button
                asChild
                size="lg"
                className="min-h-12 border-2 border-ink-black bg-ink-black px-7 text-xs font-black uppercase tracking-wider text-warm-cream shadow-[4px_4px_0px_var(--eko-gold)] hover:bg-ink-black-soft active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Link href="/onboarding">Get started now</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
