import { Button } from "@/components/ui/button";
import { Ruler, Search } from "lucide-react";
import Link from "next/link";
import { AccountNav } from "@/components/account/account-nav";

type ListingsShellProps = {
  active?: "browse" | "measure";
};

export function ListingsHeader({ active = "browse" }: ListingsShellProps) {
  return (
    <header className="sticky top-4 z-40 mx-auto mt-4 flex min-h-16 w-[min(1180px,calc(100%-32px))] items-center justify-between gap-4 rounded-xl border-[2.5px] border-ink-black bg-warm-cream px-4 py-2.5 shadow-[5px_5px_0px_#0A0A0A] max-sm:min-h-14 max-sm:w-[calc(100%-20px)] max-sm:px-3">
      <div className="flex items-center gap-3">
        <Link className="group inline-flex items-center gap-2.5 text-ink-black no-underline transition-transform active:translate-x-0.5 active:translate-y-0.5" href="/" aria-label="Eko Space home">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg border-2 border-ink-black bg-eko-gold font-heading text-xl font-black text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 max-sm:size-9" aria-hidden="true">
            E
          </span>
          <span className="grid leading-none max-sm:hidden">
            <strong className="font-heading text-base font-black tracking-tight uppercase">Eko Space</strong>
            <small className="mt-1 text-[0.62rem] font-black tracking-[0.16em] text-muted-foreground uppercase">Truth in SQM</small>
          </span>
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink-black bg-[var(--gold-wash)] px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-wider text-ink-black shadow-[1px_1px_0px_#0A0A0A] max-lg:hidden">
          <span className="size-2 rounded-full bg-success-green border border-ink-black animate-pulse" />
          Verified Catalog
        </span>
      </div>

      <nav className="flex items-center gap-2.5" aria-label="Primary navigation">
        <Link
          href="/listings"
          className={`inline-flex h-9 items-center gap-1.5 rounded-md border-2 px-3.5 text-xs font-black uppercase tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 ${
            active === "browse"
              ? "border-ink-black bg-ink-black text-warm-cream shadow-[3px_3px_0px_var(--eko-gold)]"
              : "border-transparent text-ink-black hover:border-ink-black hover:bg-card hover:shadow-[2px_2px_0px_#0A0A0A]"
          }`}
        >
          <Search className="size-3.5 stroke-[2.5]" aria-hidden="true" />
          <span className="max-sm:hidden">Browse homes</span>
          <span className="hidden max-sm:inline">Browse</span>
        </Link>
        <Link
          href="/listings/new"
          className={`inline-flex h-9 items-center gap-1.5 rounded-md border-2 px-3.5 text-xs font-black uppercase tracking-wider transition-all active:translate-x-0.5 active:translate-y-0.5 ${
            active === "measure"
              ? "border-ink-black bg-ink-black text-warm-cream shadow-[3px_3px_0px_var(--eko-gold)]"
              : "border-transparent text-ink-black hover:border-ink-black hover:bg-card hover:shadow-[2px_2px_0px_#0A0A0A]"
          }`}
        >
          <Ruler className="size-3.5 stroke-[2.5]" aria-hidden="true" />
          <span className="max-sm:hidden">List a property</span>
          <span className="hidden max-sm:inline">+ List</span>
        </Link>
        <AccountNav />
      </nav>
    </header>
  );
}
