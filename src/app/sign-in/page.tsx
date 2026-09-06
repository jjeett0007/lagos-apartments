import type { Metadata } from "next";
import { MarketingShell } from "@/components/marketing-shell";
import { OnboardingForm } from "@/components/account/onboarding-form";
export const metadata: Metadata = { title: "Sign in — Eko Space" };
export default function SignInPage() {
  return <MarketingShell><main className="mx-auto w-full max-w-5xl px-5 py-16"><OnboardingForm signIn /></main></MarketingShell>;
}
