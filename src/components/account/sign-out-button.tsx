"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div><Button variant="ghost" disabled={busy} onClick={async () => {
    setBusy(true); setError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Could not sign out. Please try again.");
      router.replace("/sign-in"); router.refresh();
    } catch { setError("Could not sign out. Please try again."); } finally { setBusy(false); }
  }}>{busy ? "Signing out…" : "Sign out"}</Button>{error && <p role="alert" className="text-xs text-destructive">{error}</p>}</div>;
}
