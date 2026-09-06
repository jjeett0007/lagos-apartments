"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
export function SavedListingButton({ listingId, title }: { listingId: string; title: string }) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    apiRequest<{ saved: boolean }>(`/api/listings/${listingId}/saved`, { signal: controller.signal }).then((data) => setSaved(data.saved)).catch(() => {});
    return () => controller.abort();
  }, [listingId]);
  return (
    <div className="absolute top-3 right-3 z-20">
      <Button
        type="button"
        size="icon"
        variant="outline"
        className="size-9 rounded-md border-2 border-ink-black bg-warm-cream text-ink-black shadow-[2px_2px_0px_#0a0a0a] hover:bg-card hover:shadow-[3px_3px_0px_#0a0a0a]"
        disabled={busy}
        aria-pressed={saved}
        aria-label={`${saved ? "Unsave" : "Save"} ${title}`}
        onClick={async () => {
          setBusy(true); setError("");
          try {
            const response = await fetch("/api/me", { cache: "no-store" });
            if (response.status === 401) { router.push("/sign-in"); return; }
            const result = await apiRequest<{ saved: boolean }>(`/api/listings/${listingId}/saved`, { method: saved ? "DELETE" : "PUT" });
            setSaved(result.saved);
          } catch (err) { setError(err instanceof Error ? err.message : "Unable to save."); }
          finally { setBusy(false); }
        }}
      >
        <Heart className="size-4" fill={saved ? "currentColor" : "none"} />
      </Button>
      {error && <p role="alert" className="mt-1 max-w-52 rounded border-2 border-alert-red bg-card p-2 text-xs font-bold text-alert-red shadow-[2px_2px_0px_#0a0a0a]">{error}</p>}
    </div>
  );
}
