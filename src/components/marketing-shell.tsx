import Link from "next/link";
import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";

type MarketingShellProps = {
  children: React.ReactNode;
  current?: "pricing" | "trust";
};

const navItems = [
  { href: "/listings", label: "Browse homes", id: undefined },
  { href: "/pricing", label: "Pricing", id: "pricing" },
  { href: "/trust", label: "How trust works", id: "trust" },
] as const;

export function MarketingShell({ children, current }: MarketingShellProps) {
  return (
    <div className="min-h-screen bg-warm-cream text-ink-black selection:bg-eko-gold selection:text-ink-black">
      <header className="relative z-30 mx-auto mt-4 grid min-h-16 w-[min(1180px,calc(100%-2rem))] grid-cols-[auto_1fr_auto] items-center gap-4 rounded-xl border-[2.5px] border-ink-black bg-warm-cream px-4 py-2 shadow-[5px_5px_0px_#0A0A0A] max-md:grid-cols-[1fr_auto] max-sm:w-[min(1180px,calc(100%-1.25rem))] max-sm:px-3">
        <div className="flex items-center gap-3">
          <Link
            className="group inline-flex w-fit items-center gap-2.5 no-underline transition-transform active:translate-x-0.5 active:translate-y-0.5"
            href="/"
            aria-label="Eko Space home"
          >
            <span
              className="grid size-10 shrink-0 place-items-center rounded-lg border-2 border-ink-black bg-eko-gold font-heading text-xl font-black leading-none text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 max-sm:size-9"
              aria-hidden="true"
            >
              E
            </span>
            <span className="grid leading-[1.05]">
              <strong className="font-heading text-base font-black tracking-tight uppercase text-ink-black">
                Eko Space
              </strong>
              <small className="text-[0.62rem] font-black tracking-[0.16em] text-muted-foreground uppercase max-sm:hidden">
                Truth in SQM
              </small>
            </span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink-black bg-[var(--gold-wash)] px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-ink-black shadow-[1px_1px_0px_#0A0A0A] max-lg:hidden">
            <span className="size-2 rounded-full bg-success-green border border-ink-black animate-pulse" />
            Lagos Live
          </span>
        </div>

        <nav className="flex items-center justify-center gap-2 max-md:hidden" aria-label="Primary navigation">
          {navItems.map((item) => {
            const isActive = item.id !== undefined && item.id === current;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`inline-flex h-9 items-center justify-center rounded-md border-2 px-3.5 text-xs font-black uppercase tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                  isActive
                    ? "border-ink-black bg-ink-black text-warm-cream shadow-[3px_3px_0px_var(--eko-gold)]"
                    : "border-transparent text-ink-black hover:border-ink-black hover:bg-card hover:shadow-[2px_2px_0px_#0A0A0A]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center justify-self-end gap-2.5">
          <AccountNav />
          <Button
            asChild
            size="sm"
            className="min-h-9 border-2 border-ink-black bg-eko-gold px-4 text-xs font-black uppercase tracking-wider text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-eko-gold-bright hover:shadow-[4px_4px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Link href="/listings/new">
              <span className="max-sm:hidden">List a property</span>
              <span className="hidden max-sm:inline">+ List</span>
            </Link>
          </Button>
        </div>
      </header>

      {children}

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
              <strong className="font-heading text-base font-black tracking-tight uppercase">Eko Space</strong>
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
    </div>
  );
}
