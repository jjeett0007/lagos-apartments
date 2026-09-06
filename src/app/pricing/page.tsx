import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarCheck,
  Check,
  ClipboardCheck,
  Ruler,
  ShieldCheck,
} from "lucide-react";
import { MarketingShell } from "@/components/marketing-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Pricing and verification",
  description:
    "Compare Eko Space’s free AI-estimated listings with in-person scout verification.",
};

const scoutSteps = [
  {
    icon: CalendarCheck,
    number: "01",
    title: "Request a visit",
    copy: "Choose the listing, confirm the address, and select an available time.",
  },
  {
    icon: Ruler,
    number: "02",
    title: "A scout measures",
    copy: "An approved scout visits with a laser measure or supported room scanner.",
  },
  {
    icon: ClipboardCheck,
    number: "03",
    title: "We review the evidence",
    copy: "Room dimensions, capture notes, and the visit record are checked together.",
  },
  {
    icon: ShieldCheck,
    number: "04",
    title: "The badge goes live",
    copy: "The listing shows a Verified badge and the date of the scout visit.",
  },
] as const;

const eyebrowClass =
  "text-[var(--text-caption)] font-black tracking-[0.14em] text-[#735b31] uppercase";
const headingClass =
  "mt-3.5 font-heading text-[var(--text-h1)] font-black leading-none tracking-[-0.05em] uppercase";

export default function PricingPage() {
  return (
    <MarketingShell current="pricing">
      <main>
        <section
          className="mx-auto w-[min(980px,calc(100%-2rem))] py-[clamp(4.875rem,10vw,8.25rem)] pb-13.5 text-center max-sm:w-[min(980px,calc(100%-1.5rem))]"
          aria-labelledby="pricing-title"
        >
          <p className={eyebrowClass}>Two levels of size evidence</p>
          <h1
            className="mt-4.5 font-heading text-[var(--text-h1)] font-black leading-[0.98] tracking-[-0.055em] text-balance uppercase"
            id="pricing-title"
          >
            Start free. Verify when the decision needs more certainty.
          </h1>
          <p className="mx-auto mt-6 max-w-170 text-[var(--text-body)] leading-7 text-[#4c463f]">
            Every listing should say how its size was obtained. An AI estimate
            helps people compare; a scout visit adds independent, in-person
            measurement evidence.
          </p>
        </section>

        <section
          className="mx-auto grid w-[min(1080px,calc(100%-2rem))] grid-cols-2 gap-6 pb-[clamp(5.125rem,10vw,8.125rem)] max-md:grid-cols-1 max-sm:w-[min(1080px,calc(100%-1.5rem))]"
          aria-label="Pricing tiers"
        >
          <Card className="gap-0 rounded-2xl border-[2.5px] border-ink-black bg-card py-0 shadow-[6px_6px_0px_#0A0A0A] transition-transform hover:-translate-y-0.5">
            <CardHeader className="flex grid-cols-none flex-row items-start justify-between gap-6 border-b-2 border-ink-black bg-warm-cream/50 p-7.5 max-sm:flex-col">
              <div>
                <Badge className="border-2 border-ink-black bg-[var(--gold-wash)] font-black uppercase text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
                  AI-estimated
                </Badge>
                <h2 className="mt-4 font-heading text-2xl font-black uppercase tracking-tight text-ink-black">
                  Free listing
                </h2>
              </div>
              <p className="grid max-w-44 text-right max-sm:max-w-none max-sm:text-left">
                <strong className="font-heading text-[clamp(2rem,4vw,2.8rem)] leading-none font-black tracking-[-0.06em] text-ink-black">
                  ₦0
                </strong>
                <span className="mt-2 text-xs font-black uppercase tracking-wider text-muted-foreground">
                  always free to list
                </span>
              </p>
            </CardHeader>
            <CardContent className="flex min-h-102.5 flex-1 flex-col p-7.5">
              <p className="font-medium leading-7 text-muted-foreground">
                Best for adding a property quickly while keeping the measurement
                method transparent and explainable to seekers.
              </p>
              <ul className="my-7.5 grid list-none gap-3.5 p-0 text-sm font-bold text-ink-black [&_li]:flex [&_li]:items-center [&_li]:gap-2.5 [&_svg]:size-4.5 [&_svg]:text-ink-black [&_svg]:stroke-[3]">
                <li><Check aria-hidden="true" /> Room-photo sectional upload</li>
                <li><Check aria-hidden="true" /> Interactive calibration boundary</li>
                <li><Check aria-hidden="true" /> AI-estimated size & confidence</li>
                <li><Check aria-hidden="true" /> Public catalog search listing</li>
              </ul>
              <p className="mt-auto border-t-2 border-ink-black/15 pt-6 text-xs font-bold leading-5 text-muted-foreground uppercase">
                An estimate is clearly stamped to prevent distortion.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 min-h-12 border-2 border-ink-black bg-ink-black text-xs font-black uppercase tracking-wider text-warm-cream shadow-[3px_3px_0px_var(--eko-gold)] hover:bg-ink-black-soft active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Link href="/listings/new">Start a free listing</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="gap-0 rounded-2xl border-[2.5px] border-ink-black bg-ink-black py-0 text-warm-cream shadow-[6px_6px_0px_var(--eko-gold)] transition-transform hover:-translate-y-0.5 [background-image:var(--adire-pattern-dark)] bg-[length:180px] bg-[position:top_right] bg-no-repeat">
            <CardHeader className="flex grid-cols-none flex-row items-start justify-between gap-6 border-b-2 border-white/20 p-7.5 max-sm:flex-col">
              <div>
                <Badge className="border-2 border-ink-black bg-eko-gold font-black uppercase text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
                  Scout verified
                </Badge>
                <h2 className="mt-4 font-heading text-2xl font-black uppercase tracking-tight text-eko-gold-bright">
                  Verified visit
                </h2>
              </div>
              <p className="grid max-w-44 text-right max-sm:max-w-none max-sm:text-left">
                <strong className="font-heading text-[clamp(1.4rem,3vw,2rem)] leading-none font-black tracking-[-0.06em] text-eko-gold-bright">
                  Per visit
                </strong>
                <span className="mt-2 text-xs font-bold uppercase tracking-wider text-[#aaa399]">
                  Pilot fee confirmed upfront
                </span>
              </p>
            </CardHeader>
            <CardContent className="flex min-h-102.5 flex-1 flex-col p-7.5">
              <p className="font-medium leading-7 text-[#d8d0c3]">
                Best when a lister or seeker wants independent, in-person size evidence
                with a laser-calibrated audit trail.
              </p>
              <ul className="my-7.5 grid list-none gap-3.5 p-0 text-sm font-bold text-warm-cream [&_li]:flex [&_li]:items-center [&_li]:gap-2.5 [&_svg]:size-4.5 [&_svg]:text-eko-gold-bright [&_svg]:stroke-[3]">
                <li><Check aria-hidden="true" /> In-person scout laser audit</li>
                <li><Check aria-hidden="true" /> Dated tamper-evident certificate</li>
                <li><Check aria-hidden="true" /> Distinct Verified gold badge</li>
                <li><Check aria-hidden="true" /> Boosted search placement</li>
              </ul>
              <p className="mt-auto border-t-2 border-white/15 pt-6 text-xs font-bold leading-5 text-[#aaa399] uppercase">
                Available in Lekki, Ikeja, Yaba, and VI pilot zones.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 min-h-12 border-2 border-ink-black bg-eko-gold text-xs font-black uppercase tracking-wider text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-eko-gold-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <Link href="/listings/new">Create a listing first</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section
          className="border-y-2 border-ink-black bg-ink-black px-[max(1rem,calc((100vw-1180px)/2))] py-[clamp(4.625rem,9vw,7rem)] text-warm-cream"
          aria-labelledby="visit-title"
        >
          <div className="max-w-180">
            <span className="inline-block rounded-md border-2 border-ink-black bg-eko-gold px-2.5 py-0.5 text-xs font-black tracking-[0.14em] text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
              The scout visit
            </span>
            <h2 className="mt-3.5 font-heading text-[var(--text-h1)] font-black leading-none tracking-[-0.05em] uppercase text-warm-cream" id="visit-title">
              What happens after you request verification
            </h2>
          </div>
          <ol className="mt-11.5 grid list-none grid-cols-4 gap-4 p-0 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {scoutSteps.map((step) => {
              const Icon = step.icon;

              return (
                <li className="flex min-h-70 flex-col rounded-xl border-2 border-ink-black bg-[#161616] p-6 text-warm-cream shadow-[4px_4px_0px_var(--eko-gold)] max-sm:min-h-0" key={step.number}>
                  <div className="flex items-center justify-between">
                    <span
                      className="grid size-11 place-items-center rounded-lg border-2 border-ink-black bg-eko-gold text-ink-black shadow-[2px_2px_0px_#0A0A0A]"
                      aria-hidden="true"
                    >
                      <Icon className="size-5 stroke-[2.5]" />
                    </span>
                    <span className="rounded border-2 border-white/20 px-2 py-0.5 font-heading text-xs font-black text-eko-gold-bright">
                      STEP {step.number}
                    </span>
                  </div>
                  <h3 className="mt-8 font-heading text-base font-black uppercase tracking-tight text-warm-cream">{step.title}</h3>
                  <p className="mt-2.5 text-xs font-medium leading-relaxed text-[#aaa399]">{step.copy}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <section
          className="mx-auto grid w-[min(980px,calc(100%-2rem))] grid-cols-[0.75fr_1fr] gap-[clamp(2.625rem,8vw,6.25rem)] py-[clamp(5rem,10vw,8rem)] max-md:grid-cols-1 max-sm:w-[min(980px,calc(100%-1.5rem))]"
          aria-labelledby="faq-title"
        >
          <div>
            <span className="inline-block rounded-md border-2 border-ink-black bg-eko-gold px-2.5 py-0.5 text-xs font-black tracking-[0.14em] text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
              Good to know
            </span>
            <h2 className={headingClass} id="faq-title">
              Clear answers before you choose
            </h2>
          </div>
          <div className="rounded-xl border-[2.5px] border-ink-black bg-card p-6 shadow-[5px_5px_0px_#0A0A0A]">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="accuracy" className="border-b-2 border-ink-black/20 py-1">
                <AccordionTrigger className="font-heading text-sm font-black uppercase text-ink-black hover:no-underline hover:text-eko-gold">
                  Is AI-estimated the same as Verified?
                </AccordionTrigger>
                <AccordionContent className="font-medium text-xs leading-relaxed text-muted-foreground">
                  No. AI-estimated means the result came from room images,
                  calibration data, and user-corrected boundaries. Verified means
                  an approved scout measured the property in person with laser tools.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="payer" className="border-b-2 border-ink-black/20 py-1">
                <AccordionTrigger className="font-heading text-sm font-black uppercase text-ink-black hover:no-underline hover:text-eko-gold">
                  Who can request a scout visit?
                </AccordionTrigger>
                <AccordionContent className="font-medium text-xs leading-relaxed text-muted-foreground">
                  A lister can upgrade their property, and a seeker can request
                  stronger evidence for a listing they are considering. Access is
                  subject to pilot-area availability in Lagos.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="price" className="border-b-0 py-1">
                <AccordionTrigger className="font-heading text-sm font-black uppercase text-ink-black hover:no-underline hover:text-eko-gold">
                  Why is there no fixed scout price yet?
                </AccordionTrigger>
                <AccordionContent className="font-medium text-xs leading-relaxed text-muted-foreground">
                  The pilot price can vary with travel distance and property size across Lagos districts.
                  You will see and approve the full amount before a visit is confirmed.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>
    </MarketingShell>
  );
}
