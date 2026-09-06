"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { apiRequest } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Profile = { name: string; role: string; phone: string | null; companyName: string | null; listerKind: string | null; preferredAreas: string[]; budgetMax: string | null; preferredLeaseTerm: string | null; onboardingCompletedAt: string | null };
export function OnboardingForm({ signIn = false }: { signIn?: boolean }) {
  const router = useRouter();
  const [role, setRole] = useState<"SEEKER" | "LISTER">("SEEKER");
  const [step, setStep] = useState(signIn ? 1 : 0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [kind, setKind] = useState("LANDLORD");
  const [company, setCompany] = useState("");
  const [areas, setAreas] = useState("");
  const [budget, setBudget] = useState("");
  const [term, setTerm] = useState("YEARLY");

  useEffect(() => {
    let active = true;
    fetch("/api/me", { cache: "no-store" }).then(async (response) => {
      const result = await response.json();
      if (!active) return;
      if (response.status === 401) return;
      if (!response.ok) { setError(result.error?.message ?? "Account services are temporarily unavailable."); return; }
      const user = result.data as Profile;
      if (signIn && user.onboardingCompletedAt) { router.replace(user.role === "LISTER" ? "/dashboard" : "/listings"); return; }
      setProfile(user); setName(user.name); setPhone(user.phone ?? "");
      setRole(user.role === "LISTER" ? "LISTER" : "SEEKER"); setKind(user.listerKind ?? "LANDLORD");
      setCompany(user.companyName ?? ""); setAreas(user.preferredAreas.join(", ")); setBudget(user.budgetMax ?? "");
      setTerm(user.preferredLeaseTerm ?? "YEARLY");
      if (signIn) router.replace("/onboarding");
    }).catch(() => { if (active) setError("Could not connect. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router, signIn]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError("");
    try {
      if (step === 1) {
        const result = signIn ? await authClient.signIn.email({ email, password }) : await authClient.signUp.email({ name, email, password });
        if (result.error) throw new Error(result.error.message ?? "Unable to sign in.");
        setPassword("");
        const user = await apiRequest<Profile>("/api/me");
        setProfile(user);
        if (signIn) { router.replace(user.onboardingCompletedAt ? user.role === "LISTER" ? "/dashboard" : "/listings" : "/onboarding"); router.refresh(); }
        else setStep(2);
      } else {
        await apiRequest("/api/onboarding", { method: "POST", body: JSON.stringify({
          role, name, phone, ...(role === "LISTER" ? { listerKind: kind, companyName: company } : {}),
          preferredAreas: areas.split(",").map((area) => area.trim()).filter(Boolean),
          budgetMax: budget ? Number(budget) : null, preferredLeaseTerm: term || null,
        }) });
        router.replace(role === "LISTER" ? "/dashboard" : "/listings"); router.refresh();
      }
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to save. Please try again."); }
    finally { setBusy(false); }
  }

  const field = "grid gap-2";
  const select = "min-h-11 w-full rounded-md border-2 border-ink-black bg-warm-cream/40 px-3 text-sm font-bold text-ink-black shadow-[2px_2px_0px_#0A0A0A]";
  return (
    <section className="mx-auto max-w-2xl">
      <span className="inline-block rounded-md border-2 border-ink-black bg-eko-gold px-2.5 py-0.5 text-xs font-black tracking-widest text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
        {signIn ? "Welcome back" : `Get started · Step ${step + 1} of 3`}
      </span>
      <h1 className="mt-3 font-heading text-[clamp(2.2rem,5vw,3.2rem)] leading-none font-black tracking-[-0.05em] uppercase text-ink-black">
        {signIn ? "Sign in to Eko Space" : step === 0 ? "What brings you here?" : step === 1 ? "Create your account" : "Make yourself at home"}
      </h1>
      <p className="mt-3 font-medium leading-relaxed text-muted-foreground">
        {signIn ? "Continue managing your properties and saved homes." : step === 0 ? "Find a place or share a property. Choose where to start." : step === 1 ? "Keep your listings, measurements, and preferences in one place." : "A few details will help you get started."}
      </p>
      {error && <div role="alert" className="mt-5 rounded-xl border-2 border-alert-red bg-alert-red/10 p-4 font-bold text-alert-red shadow-[3px_3px_0px_#0A0A0A]">{error}</div>}
      {loading ? (
        <div className="mt-8 rounded-xl border-2 border-ink-black bg-card p-8 text-center font-bold shadow-[4px_4px_0px_#0A0A0A]">
          Checking your account…
        </div>
      ) : step === 0 ? (
        <div className="mt-8 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2" role="group" aria-label="Choose your role">
            {([ ["SEEKER", "I’m looking for a place", "Save homes and compare measured space."], ["LISTER", "I’m listing a property", "Add properties and measure each room."] ] as const).map(([value, title, copy]) => (
              <button
                key={value}
                type="button"
                aria-pressed={role === value}
                onClick={() => setRole(value)}
                className={`rounded-xl border-2 p-6 text-left transition-all ${
                  role === value
                    ? "border-ink-black bg-eko-gold/20 shadow-[4px_4px_0px_#0A0A0A]"
                    : "border-ink-black/40 bg-card shadow-[2px_2px_0px_#0A0A0A] hover:border-ink-black"
                }`}
              >
                <strong className="block font-heading text-lg font-black uppercase text-ink-black">{title}</strong>
                <span className="mt-2 block text-xs font-medium leading-relaxed text-muted-foreground">{copy}</span>
              </button>
            ))}
          </div>
          <Button size="lg" className="min-h-12 border-2 border-ink-black bg-eko-gold font-bold text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-eko-gold-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none" onClick={() => { setError(""); setStep(profile ? 2 : 1); }}>
            Continue
          </Button>
          {!profile && <p className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">Already have an account? <Link className="text-ink-black underline decoration-2 underline-offset-2" href="/sign-in">Sign in</Link></p>}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 grid gap-5 rounded-[var(--radius-panel)] border-2 border-ink-black bg-card p-6 shadow-[6px_6px_0px_#0A0A0A] sm:p-8">
          <fieldset disabled={busy} className="grid min-w-0 gap-5">
            {(!signIn || step === 2) && (
              <div className={field}>
                <Label htmlFor="account-name" className="text-xs font-black uppercase tracking-wider">Full name</Label>
                <Input id="account-name" autoComplete="name" required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} className="min-h-11 border-2 border-ink-black bg-warm-cream/40 font-bold shadow-[2px_2px_0px_#0A0A0A] focus-visible:shadow-[3px_3px_0px_var(--eko-gold)]" />
              </div>
            )}
            {step === 1 ? (
              <>
                <div className={field}>
                  <Label htmlFor="email" className="text-xs font-black uppercase tracking-wider">Email address</Label>
                  <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="min-h-11 border-2 border-ink-black bg-warm-cream/40 font-bold shadow-[2px_2px_0px_#0A0A0A] focus-visible:shadow-[3px_3px_0px_var(--eko-gold)]" />
                </div>
                <div className={field}>
                  <Label htmlFor="password" className="text-xs font-black uppercase tracking-wider">Password</Label>
                  <Input id="password" type="password" autoComplete={signIn ? "current-password" : "new-password"} required minLength={signIn ? 1 : 12} maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} className="min-h-11 border-2 border-ink-black bg-warm-cream/40 font-bold shadow-[2px_2px_0px_#0A0A0A] focus-visible:shadow-[3px_3px_0px_var(--eko-gold)]" />
                  {!signIn && <p className="text-[0.68rem] font-bold text-muted-foreground uppercase">Use at least 12 characters.</p>}
                </div>
              </>
            ) : (
              <>
                <div className={field}>
                  <Label htmlFor="phone" className="text-xs font-black uppercase tracking-wider">Phone number (optional)</Label>
                  <Input id="phone" type="tel" autoComplete="tel" maxLength={25} value={phone} onChange={(e) => setPhone(e.target.value)} className="min-h-11 border-2 border-ink-black bg-warm-cream/40 font-bold shadow-[2px_2px_0px_#0A0A0A] focus-visible:shadow-[3px_3px_0px_var(--eko-gold)]" />
                </div>
                {role === "LISTER" ? (
                  <>
                    <div className={field}>
                      <Label htmlFor="kind" className="text-xs font-black uppercase tracking-wider">I am a</Label>
                      <select id="kind" className={select} value={kind} onChange={(e) => setKind(e.target.value)}>
                        <option value="LANDLORD">Landlord</option>
                        <option value="AGENT">Agent</option>
                        <option value="PROPERTY_MANAGER">Property manager</option>
                      </select>
                    </div>
                    <div className={field}>
                      <Label htmlFor="company" className="text-xs font-black uppercase tracking-wider">Business name (optional)</Label>
                      <Input id="company" maxLength={120} value={company} onChange={(e) => setCompany(e.target.value)} className="min-h-11 border-2 border-ink-black bg-warm-cream/40 font-bold shadow-[2px_2px_0px_#0A0A0A] focus-visible:shadow-[3px_3px_0px_var(--eko-gold)]" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={field}>
                      <Label htmlFor="areas" className="text-xs font-black uppercase tracking-wider">Preferred areas (optional)</Label>
                      <Input id="areas" placeholder="Lekki, Yaba, Ikeja" value={areas} onChange={(e) => setAreas(e.target.value)} className="min-h-11 border-2 border-ink-black bg-warm-cream/40 font-bold shadow-[2px_2px_0px_#0A0A0A] focus-visible:shadow-[3px_3px_0px_var(--eko-gold)]" />
                      <p className="text-[0.68rem] font-bold text-muted-foreground uppercase">Separate areas with commas.</p>
                    </div>
                    <div className={field}>
                      <Label htmlFor="budget" className="text-xs font-black uppercase tracking-wider">Maximum rent in naira (optional)</Label>
                      <Input id="budget" type="number" min="1" max="999999999999" value={budget} onChange={(e) => setBudget(e.target.value)} className="min-h-11 border-2 border-ink-black bg-warm-cream/40 font-bold shadow-[2px_2px_0px_#0A0A0A] focus-visible:shadow-[3px_3px_0px_var(--eko-gold)]" />
                    </div>
                    <div className={field}>
                      <Label htmlFor="term" className="text-xs font-black uppercase tracking-wider">Lease term</Label>
                      <select id="term" className={select} value={term} onChange={(e) => setTerm(e.target.value)}>
                        <option value="YEARLY">Yearly</option>
                        <option value="MONTHLY">Monthly</option>
                        <option value="DAILY">Nightly</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="QUARTERLY">Quarterly</option>
                      </select>
                    </div>
                  </>
                )}
              </>
            )}
            <Button type="submit" size="lg" className="min-h-12 border-2 border-ink-black bg-eko-gold font-bold text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-eko-gold-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
              {busy ? "Saving…" : signIn ? "Sign in" : step === 1 ? "Create account" : "Finish setup"}
            </Button>
            {!signIn && (
              <Button variant="outline" type="button" className="border-2 border-ink-black font-bold shadow-[2px_2px_0px_#0A0A0A] hover:bg-warm-cream" onClick={() => setStep(0)}>
                Back to role selection
              </Button>
            )}
          </fieldset>
          {signIn && (
            <p className="text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
              New here? <Link className="text-ink-black underline decoration-2 underline-offset-2" href="/onboarding">Create an account</Link>
            </p>
          )}
        </form>
      )}
    </section>
  );
}
