import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { OnboardingForm } from "@/components/account/onboarding-form";
export const metadata: Metadata = { title: "Get started — Eko Space" };
export default function OnboardingPage() {
  return <MarketingShell><main className="mx-auto w-full max-w-5xl px-5 py-16"><OnboardingForm /></main></MarketingShell>;
}
