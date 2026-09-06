"use client";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "./sign-out-button";
export function AccountNav() {
  const { data: session, isPending } = authClient.useSession();
  if (!session) {
    return (
      <Button
        asChild
        size="sm"
        variant="outline"
        className="min-h-9 border-2 border-ink-black bg-card px-3.5 text-xs font-black uppercase tracking-wider text-ink-black shadow-[2px_2px_0px_#0A0A0A] hover:bg-warm-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        <Link href="/sign-in" aria-busy={isPending}>
          Sign in
        </Link>
      </Button>
    );
  }

  return (
    <details className="relative group">
      <summary className="cursor-pointer list-none rounded-md border-2 border-ink-black bg-card px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3.5px_3.5px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 select-none">
        Account
      </summary>
      <div className="absolute right-0 z-50 mt-2.5 grid min-w-56 gap-1 rounded-xl border-2 border-ink-black bg-card p-2 text-ink-black shadow-[5px_5px_0px_#0A0A0A]">
        <div className="border-b-2 border-ink-black/20 px-3 py-2">
          <span className="text-[0.62rem] font-black uppercase tracking-widest text-muted-foreground block">
            Signed in as
          </span>
          <strong className="text-xs font-black uppercase text-ink-black block truncate">
            {session.user.name}
          </strong>
        </div>
        <Link
          className="rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide transition-colors hover:bg-ink-black hover:text-warm-cream"
          href="/onboarding"
        >
          Profile & settings
        </Link>
        <Link
          className="rounded-lg px-3 py-2 text-xs font-black uppercase tracking-wide transition-colors hover:bg-ink-black hover:text-warm-cream"
          href="/dashboard"
        >
          Lister dashboard
        </Link>
        <div className="border-t-2 border-ink-black/20 pt-1.5">
          <SignOutButton />
        </div>
      </div>
    </details>
  );
}
