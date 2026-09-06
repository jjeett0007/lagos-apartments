"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-xl px-5 py-24"><h1 className="text-3xl font-bold">We couldn’t load this page</h1><p className="my-5 leading-7 text-muted-foreground">The service may be temporarily unavailable. Please try again shortly.</p><div className="flex gap-3"><Button onClick={reset}>Try again</Button><Button asChild variant="outline"><Link href="/onboarding">Account setup</Link></Button></div></main>;
}
