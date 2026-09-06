"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  CircleAlert,
  DoorOpen,
  FileCheck2,
  Image as ImageIcon,
  Info,
  Loader2,
  MapPin,
  Plus,
  Ruler,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api-client";
import { AccountNav } from "@/components/account/account-nav";
import type { ListingDraft } from "@/lib/draft-types";
import { type FormEvent, useMemo, useRef, useState } from "react";

type Details = {
  title: string;
  address: string;
  neighbourhood: string;
  propertyType: string;
  leaseTerm: string;
  price: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
};

type Room = {
  id: string;
  roomType: string;
  name: string;
  area: number | null;
  confidence: number | null;
  status: "measured" | "pending";
};

export type PhotoItem = {
  id: string;
  url: string;
  section: string;
  label?: string | null;
  sortOrder?: number;
};

export const SECTION_OPTIONS = [
  { value: "TOILET", label: "Toilet / Restroom", shortLabel: "Toilet" },
  { value: "BATHROOM", label: "Bathroom (Shower/Tub)", shortLabel: "Bathroom" },
  { value: "LIVING_ROOM", label: "Living Room / Parlour", shortLabel: "Living Room" },
  { value: "BEDROOM", label: "Bedroom", shortLabel: "Bedroom" },
  { value: "MASTER_BEDROOM", label: "Master Bedroom", shortLabel: "Master Bed" },
  { value: "KITCHEN", label: "Kitchen", shortLabel: "Kitchen" },
  { value: "BALCONY", label: "Balcony / Veranda", shortLabel: "Balcony" },
  { value: "COMPOUND", label: "Compound / Exterior", shortLabel: "Compound" },
  { value: "DINING_ROOM", label: "Dining Area", shortLabel: "Dining" },
  { value: "HALLWAY", label: "Corridor / Hallway", shortLabel: "Hallway" },
  { value: "STUDY", label: "Study / Home Office", shortLabel: "Study" },
  { value: "STORAGE", label: "Store / Pantry", shortLabel: "Store" },
  { value: "OTHER", label: "Other / Misc Area", shortLabel: "Other" },
] as const;

const steps = [
  { label: "Basics", description: "Property details" },
  { label: "Photos", description: "Apartment images & sections" },
  { label: "Rooms", description: "Capture sizes" },
  { label: "Review", description: "Check the listing" },
  { label: "Submit", description: "Send for review" },
] as const;

const initialDetails: Details = {
  title: "",
  address: "",
  neighbourhood: "",
  propertyType: "",
  leaseTerm: "",
  price: "",
  bedrooms: "1",
  bathrooms: "1",
  description: "",
};

const initialRooms: Room[] = [
  { id: "local-1", roomType: "LIVING_ROOM", name: "Living room", area: null, confidence: null, status: "pending" },
  { id: "local-2", roomType: "BEDROOM", name: "Bedroom", area: null, confidence: null, status: "pending" },
  { id: "local-3", roomType: "KITCHEN", name: "Kitchen", area: null, confidence: null, status: "pending" },
];

const neighbourhoods = [
  "Ajah",
  "Gbagada",
  "Ikeja",
  "Ikoyi",
  "Lekki Phase 1",
  "Magodo",
  "Maryland",
  "Ogudu",
  "Surulere",
  "Victoria Island",
  "Yaba",
];

function Brand({ mode, title }: { mode?: string; title?: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Link
        className="group inline-flex items-center text-ink-black no-underline transition-transform active:translate-x-0.5 active:translate-y-0.5"
        href="/"
        aria-label="Eko Space home"
      >
        <span
          className="grid size-10 shrink-0 place-items-center rounded-lg border-2 border-ink-black bg-eko-gold font-heading text-xl font-black text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A] transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 max-sm:size-9"
          aria-hidden="true"
        >
          E
        </span>
      </Link>

      {mode && (
        <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink-black bg-[var(--gold-wash)] px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-wider text-ink-black shadow-[2px_2px_0px_#0A0A0A] max-lg:hidden">
          <span className="size-2 rounded-full border border-ink-black bg-success-green animate-pulse" />
          {mode}
        </span>
      )}

      {title && (
        <span
          className="hidden 2xl:inline-flex max-w-[170px] items-center gap-1 rounded-md border-2 border-ink-black bg-card px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A] truncate"
          title={title}
        >
          <span className="text-muted-foreground font-black">#</span>
          <span className="truncate">{title}</span>
        </span>
      )}
    </div>
  );
}

function formatPrice(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "Not added";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

const propertyToApi: Record<string, string> = { Studio: "STUDIO", Flat: "APARTMENT", Duplex: "DUPLEX", Terrace: "HOUSE", "Detached house": "HOUSE" };
const termToApi: Record<string, string> = { Yearly: "YEARLY", Monthly: "MONTHLY", "Short let": "DAILY", Quarterly: "QUARTERLY", Weekly: "WEEKLY", Nightly: "DAILY" };

function mapRooms(draft: ListingDraft): Room[] {
  return draft.rooms.map((room) => ({
    id: room.id,
    roomType: room.roomType,
    name: room.name,
    area: room.areaSqm === null ? null : Number(room.areaSqm),
    confidence: room.confidence === null ? null : Number(room.confidence) * 100,
    status: room.areaSqm === null ? "pending" : "measured",
  }));
}

export function ListingWizard({ initialDraft }: { initialDraft?: ListingDraft }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draftId, setDraftId] = useState(initialDraft?.id);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<Details>(
    initialDraft
      ? {
          title: initialDraft.title,
          address: initialDraft.privateAddress ?? "",
          neighbourhood: initialDraft.areaName,
          propertyType:
            Object.keys(propertyToApi).find((key) => propertyToApi[key] === initialDraft.propertyType) ??
            initialDraft.propertyType,
          leaseTerm:
            Object.keys(termToApi).find((key) => termToApi[key] === initialDraft.leaseTerm) ??
            initialDraft.leaseTerm,
          price: String(initialDraft.price),
          bedrooms: String(initialDraft.bedroomCount ?? 1),
          bathrooms: String(initialDraft.bathroomCount ?? 1),
          description: initialDraft.description ?? "",
        }
      : initialDetails
  );
  const [rooms, setRooms] = useState<Room[]>(initialDraft ? mapRooms(initialDraft) : initialRooms);
  const [photos, setPhotos] = useState<PhotoItem[]>(
    initialDraft?.photos?.map((p) => ({
      id: p.id,
      url: p.url,
      section: p.section || "OTHER",
      label: p.label || "",
      sortOrder: p.sortOrder,
    })) ?? []
  );
  const [uploadSection, setUploadSection] = useState<string>("TOILET");
  const [uploading, setUploading] = useState(false);
  const [photoFilter, setPhotoFilter] = useState<string>("ALL");
  const [isDragging, setIsDragging] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const totalArea = useMemo(
    () => rooms.reduce((total, room) => total + (room.area ?? 0), 0),
    [rooms]
  );
  const measuredRooms = rooms.filter((room) => room.status === "measured");
  const basicsComplete = Boolean(
    details.title.trim() &&
      details.address.trim() &&
      details.neighbourhood &&
      details.propertyType &&
      details.leaseTerm &&
      Number(details.price) > 0
  );

  const filteredPhotos = useMemo(() => {
    if (photoFilter === "ALL") return photos;
    return photos.filter((p) => p.section === photoFilter);
  }, [photos, photoFilter]);

  const photoCountBySection = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of photos) {
      counts[p.section] = (counts[p.section] || 0) + 1;
    }
    return counts;
  }, [photos]);

  function updateDetail<Key extends keyof Details>(key: Key, value: Details[Key]) {
    setDetails((current) => ({ ...current, [key]: value }));
    setDraftSaved(false);
  }

  function continueForward() {
    if (step === 0 && !basicsComplete) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    setStep((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function addRoom() {
    const nextId = `local-${crypto.randomUUID()}`;
    setRooms((current) => [
      ...current,
      {
        id: nextId,
        roomType: "OTHER",
        name: `Room ${rooms.length + 1}`,
        area: null,
        confidence: null,
        status: "pending",
      },
    ]);
    setDraftSaved(false);
  }

  function removeRoom(id: string) {
    setRooms((current) => current.filter((room) => room.id !== id));
    setDraftSaved(false);
  }

  function updateRoomName(id: string, name: string) {
    setRooms((current) =>
      current.map((room) => (room.id === id ? { ...room, name } : room))
    );
    setDraftSaved(false);
  }

  async function persistDraft() {
    if (!basicsComplete) throw new Error("Complete the property basics before saving your draft.");
    const result = await apiRequest<ListingDraft>(draftId ? `/api/listings/${draftId}` : "/api/listings", {
      method: draftId ? "PATCH" : "POST",
      body: JSON.stringify({
        title: details.title,
        description: details.description,
        privateAddress: details.address,
        publicAddress: `${details.neighbourhood}, Lagos`,
        areaName: details.neighbourhood,
        propertyType: propertyToApi[details.propertyType] ?? details.propertyType,
        leaseTerm: termToApi[details.leaseTerm] ?? details.leaseTerm,
        price: Number(details.price),
        bedroomCount: Number(details.bedrooms || 0),
        bathroomCount: Number(details.bathrooms || 1),
        amenities: initialDraft?.amenities ?? [],
        rooms: rooms.map((room) => ({
          ...(room.id.startsWith("local-") ? {} : { id: room.id }),
          name: room.name,
          roomType: room.roomType,
        })),
      }),
    });
    setDraftId(result.id);
    setRooms(mapRooms(result));
    if (result.photos) {
      setPhotos(
        result.photos.map((p) => ({
          id: p.id,
          url: p.url,
          section: p.section || "OTHER",
          label: p.label || "",
          sortOrder: p.sortOrder,
        }))
      );
    }
    setDraftSaved(true);
    window.history.replaceState(null, "", `/listings/${result.id}/edit`);
    return result;
  }

  async function saveDraft() {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await persistDraft();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your draft.");
    } finally {
      setBusy(false);
    }
  }

  async function handleFilesUpload(fileList: FileList | null, chosenSection = uploadSection, customLabel?: string) {
    if (!fileList || fileList.length === 0) return;
    if (!basicsComplete) {
      setShowErrors(true);
      setError("Please complete the basic property details before uploading photos.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      let currentId = draftId;
      if (!currentId) {
        const saved = await persistDraft();
        currentId = saved.id;
      }

      const formData = new FormData();
      for (let i = 0; i < fileList.length; i++) {
        formData.append("photos", fileList[i]);
      }
      formData.append("section", chosenSection);
      if (customLabel) {
        formData.append("label", customLabel);
      }

      const res = await fetch(`/api/listings/${currentId}/photos`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(errData.message || "Failed to upload photos.");
      }

      const data = (await res.json()) as { photos: PhotoItem[] };
      if (data.photos) {
        setPhotos((prev) => [...prev, ...data.photos]);
        setDraftSaved(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error uploading photos.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function updatePhotoSection(photoId: string, newSection: string) {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, section: newSection } : p))
    );
    if (draftId) {
      try {
        await fetch(`/api/listings/${draftId}/photos/${photoId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: newSection }),
        });
        setDraftSaved(true);
      } catch {
        // optimistic update preserved
      }
    }
  }

  async function updatePhotoLabel(photoId: string, newLabel: string) {
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, label: newLabel } : p))
    );
    if (draftId) {
      try {
        await fetch(`/api/listings/${draftId}/photos/${photoId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ label: newLabel }),
        });
        setDraftSaved(true);
      } catch {
        // optimistic update preserved
      }
    }
  }

  async function removePhoto(photoId: string) {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    if (draftId) {
      try {
        await fetch(`/api/listings/${draftId}/photos/${photoId}`, {
          method: "DELETE",
        });
      } catch {
        // ignore
      }
    }
  }

  async function captureRoom(index: number) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const draft = await persistDraft();
      router.push(`/capture?listingId=${draft.id}&roomId=${draft.rooms[index].id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open room capture.");
      setBusy(false);
    }
  }

  async function submitListing(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step !== steps.length - 1 || busy) return;
    setBusy(true);
    setError("");
    try {
      const draft = await persistDraft();
      await apiRequest(`/api/listings/${draft.id}/submit`, { method: "POST" });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your listing.");
    } finally {
      setBusy(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-warm-cream text-ink-black">
        <header className="mx-auto mt-4 flex min-h-16 w-[min(1180px,calc(100%-2rem))] items-center justify-between gap-4 rounded-xl border-[2.5px] border-ink-black bg-warm-cream px-4 py-2.5 shadow-[5px_5px_0px_#0A0A0A] max-sm:mt-2 max-sm:w-[calc(100%-1.25rem)] max-sm:px-3">
          <Brand mode={initialDraft ? "Update Completed" : "Submission Received"} />
          <div className="flex items-center gap-2.5">
            <Button
              asChild
              variant="outline"
              className="min-h-9 border-2 border-ink-black bg-card px-3.5 text-xs font-black uppercase tracking-wider text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A] transition-all hover:bg-warm-cream hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3.5px_3.5px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <AccountNav />
          </div>
        </header>
        <main className="grid min-h-[calc(100vh-100px)] place-items-center px-4 pt-10 pb-20">
          <Card className="w-full max-w-[640px] rounded-2xl border-[2.5px] border-ink-black bg-card text-ink-black shadow-[8px_8px_0px_var(--eko-gold)]">
            <CardContent className="grid justify-items-center p-[clamp(2.5rem,6vw,4.5rem)] text-center">
              <span className="mb-6 grid size-22 place-items-center rounded-2xl border-[2.5px] border-ink-black bg-eko-gold text-ink-black shadow-[4px_4px_0px_#0A0A0A]">
                <Check className="size-10 stroke-[3.5]" aria-hidden="true" />
              </span>
              <span className="mb-3 inline-block rounded-md border-2 border-ink-black bg-[var(--gold-wash)] px-3 py-1 text-xs font-black tracking-[0.14em] text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
                {initialDraft ? "Listing updated" : "Submission received"}
              </span>
              <h1 className="font-heading text-[clamp(2.2rem,4.5vw,3.2rem)] leading-none font-black tracking-[-0.05em] uppercase text-ink-black">
                Awaiting Scout Review
              </h1>
              <p className="mt-4.5 max-w-lg text-sm font-medium leading-relaxed text-muted-foreground">
                Your apartment details, sectional photos ({photos.length}), and room measurements have been saved to the Lagos catalog. You can follow live status on your command dashboard.
              </p>
              <div className="mt-8 flex gap-3.5 max-sm:w-full max-sm:flex-col">
                <Button asChild className="min-h-12 border-2 border-ink-black bg-ink-black px-6 text-xs font-black tracking-wider uppercase text-warm-cream shadow-[4px_4px_0px_var(--eko-gold)] hover:bg-ink-black-soft active:translate-x-0.5 active:translate-y-0.5 active:shadow-none" size="lg">
                  <Link href="/dashboard">
                    View dashboard
                    <ArrowRight className="stroke-[2.5]" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="min-h-12 border-2 border-ink-black bg-card text-xs font-black tracking-wider uppercase text-ink-black shadow-[4px_4px_0px_#0A0A0A] hover:bg-warm-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                  <Link href="/listings/new">Add another property</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-cream text-ink-black">
      {/* Command Bar Header */}
      <header className="sticky top-4 z-40 mx-auto mt-4 flex min-h-16 w-[min(1180px,calc(100%-2rem))] items-center justify-between gap-3 rounded-xl border-[2.5px] border-ink-black bg-warm-cream px-4 py-2.5 shadow-[5px_5px_0px_#0A0A0A] max-sm:min-h-14 max-sm:mt-2 max-sm:w-[calc(100%-1.25rem)] max-sm:px-3">
        <Brand
          mode={initialDraft ? "Edit Mode" : "Lister Studio"}
          title={details.title}
        />

        {/* Central Brutalist Stepper (Large Screens) */}
        <nav
          className="hidden xl:flex items-center gap-1 rounded-lg border-2 border-ink-black bg-card p-1 shadow-[3px_3px_0px_#0A0A0A]"
          aria-label="Wizard step navigation"
        >
          {steps.map((item, index) => {
            const isCurrent = index === step;
            const isCompleted = index < step;
            const canClick = isCompleted || (index > step && basicsComplete);

            return (
              <button
                key={item.label}
                type="button"
                disabled={!canClick && !isCurrent}
                onClick={() => {
                  if (canClick) {
                    setStep(index);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className={`group inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-wider transition-all select-none ${
                  isCurrent
                    ? "border-2 border-ink-black bg-ink-black text-warm-cream shadow-[2px_2px_0px_var(--eko-gold)] -translate-y-0.5"
                    : isCompleted
                      ? "border border-ink-black/40 bg-warm-cream text-ink-black hover:border-ink-black hover:bg-[var(--gold-wash)] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
                      : "border border-transparent text-muted-foreground opacity-50 cursor-not-allowed"
                }`}
              >
                <span
                  className={`grid size-4 place-items-center rounded text-[0.6rem] font-black ${
                    isCurrent
                      ? "bg-eko-gold text-ink-black"
                      : isCompleted
                        ? "bg-ink-black text-warm-cream"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? "✓" : index + 1}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Medium Screen Stepper Telemetry */}
        <div className="hidden md:flex xl:hidden items-center gap-2 rounded-lg border-2 border-ink-black bg-card px-3 py-1.5 text-xs font-black uppercase text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A]">
          <span className="rounded border border-ink-black bg-eko-gold px-1.5 py-0.5 text-[0.62rem] font-black text-ink-black">
            Step {step + 1}/{steps.length}
          </span>
          <span className="tracking-tight">{steps[step].label}</span>
        </div>

        {/* Action Controls & Session */}
        <div className="flex items-center gap-2.5">
          {draftSaved ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink-black bg-success-green/20 px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-wider text-ink-black shadow-[2px_2px_0px_#0A0A0A] max-sm:hidden">
              <span className="size-2 rounded-full border border-ink-black bg-success-green animate-pulse" />
              Saved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink-black bg-eko-gold px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-wider text-ink-black shadow-[2px_2px_0px_#0A0A0A] max-sm:hidden">
              <span className="size-2 rounded-full border border-ink-black bg-ink-black" />
              Unsaved
            </span>
          )}

          <Button
            disabled={busy}
            onClick={saveDraft}
            type="button"
            className="min-h-9 border-2 border-ink-black bg-eko-gold px-3.5 text-xs font-black uppercase tracking-wider text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A] transition-all hover:bg-eko-gold-bright hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3.5px_3.5px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Save className="size-3.5 stroke-[2.5]" aria-hidden="true" />
            <span className="max-sm:sr-only">Save</span>
          </Button>

          <Button
            asChild
            variant="outline"
            className="min-h-9 border-2 border-ink-black bg-card px-3 text-xs font-black uppercase tracking-wider text-ink-black shadow-[2px_2px_0px_#0A0A0A] transition-all hover:bg-warm-cream hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none max-sm:hidden"
          >
            <Link href="/dashboard">Exit</Link>
          </Button>

          <AccountNav />
        </div>
      </header>

      {/* Main Form Layout */}
      <main className="mx-auto grid w-[calc(100%-2rem)] max-w-[1180px] grid-cols-[280px_minmax(0,1fr)] items-start gap-10 pt-10 pb-24 max-lg:grid-cols-1 max-lg:gap-8 max-sm:w-[calc(100%-1.25rem)] max-sm:pt-6">
        
        {/* Left Telemetry Progress Sidebar */}
        <aside className="sticky top-24 max-lg:static" aria-label="Listing progress">
          <div className="rounded-xl border-[2.5px] border-ink-black bg-card p-5 shadow-[5px_5px_0px_#0A0A0A]">
            <span className="inline-block rounded-md border-2 border-ink-black bg-eko-gold px-2.5 py-0.5 text-[0.68rem] font-black tracking-[0.14em] text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
              {initialDraft ? "Edit listing" : "New listing"}
            </span>
            <h1 className="mt-2 font-heading text-2xl font-black uppercase tracking-tight text-ink-black">
              {initialDraft ? "Update property" : "Add your space"}
            </h1>
            <p className="mt-2 text-xs font-medium leading-relaxed text-muted-foreground">
              Truth in SQM: enter authentic details, categorize room photos, and measure floor dimensions.
            </p>

            <div className="mt-5">
              <div className="flex items-center justify-between text-[0.68rem] font-black uppercase tracking-wider text-muted-foreground">
                <span>Overall progress</span>
                <span>{Math.round(((step + 1) / steps.length) * 100)}%</span>
              </div>
              <Progress
                aria-label={`Listing progress: step ${step + 1} of ${steps.length}`}
                className="mt-2 h-3 rounded-none border-2 border-ink-black bg-warm-cream shadow-[2px_2px_0px_#0A0A0A] **:data-[slot=progress-indicator]:bg-ink-black"
                value={((step + 1) / steps.length) * 100}
              />
            </div>

            <ol className="mt-5 grid gap-2 p-0 max-lg:grid-cols-5 max-sm:grid-cols-2">
              {steps.map((item, index) => (
                <li key={item.label}>
                  <button
                    aria-current={index === step ? "step" : undefined}
                    className={`grid w-full grid-cols-[34px_1fr] items-center gap-2.5 rounded-lg border-2 p-2 text-left font-bold transition-all enabled:cursor-pointer max-lg:grid-cols-1 max-lg:justify-items-center max-lg:gap-1 max-lg:text-center ${
                      index === step
                        ? "border-ink-black bg-ink-black text-warm-cream shadow-[3px_3px_0px_var(--eko-gold)] -translate-y-0.5"
                        : index < step
                          ? "border-ink-black/60 bg-warm-cream text-ink-black enabled:hover:border-ink-black"
                          : "border-ink-black/25 bg-warm-cream/40 text-muted-foreground"
                    }`}
                    disabled={index > step}
                    onClick={() => setStep(index)}
                    type="button"
                  >
                    <span
                      className={`grid size-7 place-items-center rounded border-2 text-[0.7rem] font-black ${
                        index === step
                          ? "border-ink-black bg-eko-gold text-ink-black shadow-[1px_1px_0px_#0A0A0A]"
                          : index < step
                            ? "border-ink-black bg-eko-gold text-ink-black shadow-[1px_1px_0px_#0A0A0A]"
                            : "border-ink-black/30 bg-warm-cream text-muted-foreground"
                      }`}
                    >
                      {index < step ? <Check className="size-3.5 stroke-[3.5]" aria-hidden="true" /> : index + 1}
                    </span>
                    <span className="grid gap-0.5">
                      <strong className="text-[0.72rem] font-black uppercase tracking-wider leading-tight">{item.label}</strong>
                      <small className="text-[0.62rem] font-medium opacity-80 max-lg:hidden leading-none">{item.description}</small>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          {/* Tenant Inspection Audit Checklist */}
          <div className="mt-5 rounded-xl border-[2.5px] border-ink-black bg-card p-4 shadow-[4px_4px_0px_#0A0A0A]">
            <span className="text-[0.65rem] font-black uppercase tracking-wider text-muted-foreground">
              Tenant Audit Checklist
            </span>
            <div className="mt-3 space-y-2 text-xs font-bold">
              <div className="flex items-center justify-between border-b border-ink-black/10 pb-1.5">
                <span className="text-ink-black">Toilet / Restroom</span>
                {photoCountBySection["TOILET"] ? (
                  <span className="rounded border border-ink-black bg-success-green/20 px-1.5 py-0.5 text-[0.65rem] font-black uppercase text-ink-black">
                    ✓ Verified ({photoCountBySection["TOILET"]})
                  </span>
                ) : (
                  <span className="rounded border border-alert-red bg-alert-red/10 px-1.5 py-0.5 text-[0.65rem] font-black uppercase text-alert-red">
                    Required
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between border-b border-ink-black/10 pb-1.5">
                <span className="text-ink-black">Bathroom / Tub</span>
                {photoCountBySection["BATHROOM"] ? (
                  <span className="rounded border border-ink-black bg-success-green/20 px-1.5 py-0.5 text-[0.65rem] font-black uppercase text-ink-black">
                    ✓ Verified ({photoCountBySection["BATHROOM"]})
                  </span>
                ) : (
                  <span className="rounded border border-alert-red bg-alert-red/10 px-1.5 py-0.5 text-[0.65rem] font-black uppercase text-alert-red">
                    Required
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between border-b border-ink-black/10 pb-1.5">
                <span className="text-ink-black">Kitchen</span>
                {photoCountBySection["KITCHEN"] ? (
                  <span className="rounded border border-ink-black bg-success-green/20 px-1.5 py-0.5 text-[0.65rem] font-black uppercase text-ink-black">
                    ✓ Added ({photoCountBySection["KITCHEN"]})
                  </span>
                ) : (
                  <span className="rounded border border-ink-black/30 bg-warm-cream px-1.5 py-0.5 text-[0.65rem] font-black uppercase text-muted-foreground">
                    Optional
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-black">Floor Calibrations</span>
                {measuredRooms.length > 0 ? (
                  <span className="rounded border border-ink-black bg-eko-gold px-1.5 py-0.5 text-[0.65rem] font-black uppercase text-ink-black">
                    {measuredRooms.length} Measured
                  </span>
                ) : (
                  <span className="rounded border border-ink-black/30 bg-warm-cream px-1.5 py-0.5 text-[0.65rem] font-black uppercase text-muted-foreground">
                    Pending
                  </span>
                )}
              </div>
            </div>
          </div>

          <Card className="mt-5 rounded-xl border-[2.5px] border-ink-black bg-[var(--gold-wash)] p-0 text-ink-black shadow-[4px_4px_0px_#0A0A0A] max-lg:hidden">
            <CardContent className="flex items-start gap-3 p-4">
              <Sparkles className="size-5 shrink-0 stroke-[2.5] text-ink-black" aria-hidden="true" />
              <div>
                <strong className="text-xs font-black uppercase">Area-tagged trust</strong>
                <p className="mt-1 text-[0.68rem] font-medium leading-relaxed text-ink-black/80">
                  Tagging photos with specific sections (Toilet, Bathroom, Kitchen) prevents disputes and unlocks higher discovery ranking.
                </p>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Wizard Form Workspace */}
        <form className="min-w-0" onSubmit={submitListing}>
          {error && (
            <div role="alert" className="mb-6 rounded-xl border-2 border-alert-red bg-alert-red/10 p-4 font-bold text-alert-red shadow-[4px_4px_0px_#0A0A0A]">
              {error}
            </div>
          )}

          <fieldset disabled={busy} className="min-w-0 space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-ink-black pb-5">
              <div>
                <span className="inline-block rounded border-2 border-ink-black bg-card px-2.5 py-0.5 text-[0.68rem] font-black tracking-widest text-ink-black uppercase shadow-[1.5px_1.5px_0px_#0A0A0A]">
                  Step {step + 1} of {steps.length}
                </span>
                <h2 className="mt-2 font-heading text-3xl font-black uppercase tracking-tight text-ink-black">
                  {steps[step].label}
                </h2>
                <p className="mt-1 text-xs font-medium text-muted-foreground">{steps[step].description}</p>
              </div>
              <Badge className="border-2 border-ink-black bg-eko-gold font-black uppercase text-ink-black shadow-[2px_2px_0px_#0A0A0A]">
                {step === 0 ? "General Details" : step === 1 ? `${photos.length} Photos` : step === 2 ? `${rooms.length} Rooms` : step === 3 ? "Audit" : "Finalize"}
              </Badge>
            </div>

            {/* STEP 0: BASICS */}
            {step === 0 && (
              <Card className="rounded-xl border-[2.5px] border-ink-black bg-card p-6 md:p-8 shadow-[5px_5px_0px_#0A0A0A]" aria-labelledby="basics-title">
                <div className="flex items-center gap-3 border-b-2 border-ink-black/15 pb-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg border-2 border-ink-black bg-eko-gold text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A]">
                    <Building2 className="stroke-[2.5]" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-heading text-lg font-black uppercase tracking-tight text-ink-black" id="basics-title">
                      Core Accommodation Details
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                      Essential information required for seekers on the Lagos housing catalog.
                    </p>
                  </div>
                </div>

                {showErrors && !basicsComplete && (
                  <Alert className="mt-6 border-2 border-alert-red bg-alert-red/10 text-alert-red shadow-[3px_3px_0px_#0A0A0A]" variant="destructive">
                    <CircleAlert className="stroke-[2.5]" aria-hidden="true" />
                    <AlertTitle className="font-black uppercase">Required fields missing</AlertTitle>
                    <AlertDescription className="font-medium">
                      Fill out title, address, neighbourhood, property type, lease term, and price.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-6 max-sm:grid-cols-1">
                  <div className="col-span-2 grid gap-2 max-sm:col-span-1">
                    <Label htmlFor="title" className="text-xs font-black uppercase tracking-wider text-ink-black">
                      Listing Title *
                    </Label>
                    <Input
                      aria-invalid={showErrors && !details.title.trim()}
                      className="min-h-12 border-2 border-ink-black bg-warm-cream font-bold text-sm text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A] focus-visible:shadow-[3.5px_3.5px_0px_var(--eko-gold)]"
                      id="title"
                      onChange={(event) => updateDetail("title", event.target.value)}
                      placeholder="e.g. Spacious 2-Bedroom Flat in Ikate with 24h Power"
                      value={details.title}
                    />
                  </div>

                  <div className="col-span-2 grid gap-2 max-sm:col-span-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="address" className="text-xs font-black uppercase tracking-wider text-ink-black">
                        Property Street Address *
                      </Label>
                      <span className="rounded border border-ink-black bg-[var(--gold-wash)] px-2 py-0.5 text-[0.62rem] font-black uppercase text-ink-black">
                        Confidential Privacy Layer
                      </span>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute top-1/2 left-3.5 z-10 size-4.5 -translate-y-1/2 stroke-[2.5] text-ink-black" aria-hidden="true" />
                      <Input
                        aria-invalid={showErrors && !details.address.trim()}
                        className="min-h-12 border-2 border-ink-black bg-warm-cream pl-10 font-bold text-sm text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A] focus-visible:shadow-[3.5px_3.5px_0px_var(--eko-gold)]"
                        id="address"
                        onChange={(event) => updateDetail("address", event.target.value)}
                        placeholder="House number, street, estate"
                        value={details.address}
                      />
                    </div>
                    <small className="text-[0.68rem] font-bold text-muted-foreground uppercase">
                      Exact building number stays confidential until booked for scout or tenant tour.
                    </small>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="neighbourhood" className="text-xs font-black uppercase tracking-wider text-ink-black">
                      Lagos District / Area *
                    </Label>
                    <Select
                      onValueChange={(value) => updateDetail("neighbourhood", value)}
                      value={details.neighbourhood}
                    >
                      <SelectTrigger
                        aria-invalid={showErrors && !details.neighbourhood}
                        className="min-h-12 w-full border-2 border-ink-black bg-warm-cream font-bold text-sm text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A]"
                        id="neighbourhood"
                      >
                        <SelectValue placeholder="Select Lagos district" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A]">
                        {neighbourhoods.map((area) => (
                          <SelectItem key={area} value={area} className="font-bold">
                            {area}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="property-type" className="text-xs font-black uppercase tracking-wider text-ink-black">
                      Property Type *
                    </Label>
                    <Select
                      onValueChange={(value) => updateDetail("propertyType", value)}
                      value={details.propertyType}
                    >
                      <SelectTrigger
                        aria-invalid={showErrors && !details.propertyType}
                        className="min-h-12 w-full border-2 border-ink-black bg-warm-cream font-bold text-sm text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A]"
                        id="property-type"
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A]">
                        <SelectItem value="Studio" className="font-bold">Studio / Self-Contain</SelectItem>
                        <SelectItem value="Flat" className="font-bold">Apartment / Flat</SelectItem>
                        <SelectItem value="Duplex" className="font-bold">Duplex</SelectItem>
                        <SelectItem value="Terrace" className="font-bold">Terrace</SelectItem>
                        <SelectItem value="Detached house" className="font-bold">Detached House</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="lease-term" className="text-xs font-black uppercase tracking-wider text-ink-black">
                      Lease Term *
                    </Label>
                    <Select
                      onValueChange={(value) => updateDetail("leaseTerm", value)}
                      value={details.leaseTerm}
                    >
                      <SelectTrigger
                        aria-invalid={showErrors && !details.leaseTerm}
                        className="min-h-12 w-full border-2 border-ink-black bg-warm-cream font-bold text-sm text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A]"
                        id="lease-term"
                      >
                        <SelectValue placeholder="Select lease billing" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A]">
                        <SelectItem value="Yearly" className="font-bold">Yearly (Standard)</SelectItem>
                        <SelectItem value="Monthly" className="font-bold">Monthly</SelectItem>
                        <SelectItem value="Short let" className="font-bold">Short Let / Nightly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="price" className="text-xs font-black uppercase tracking-wider text-ink-black">
                      Rent Amount (₦) *
                    </Label>
                    <div className="relative">
                      <span className="absolute top-1/2 left-3.5 z-10 -translate-y-1/2 rounded border border-ink-black bg-card px-1.5 py-0.5 text-[0.65rem] font-black text-ink-black">
                        ₦ NGN
                      </span>
                      <Input
                        aria-invalid={showErrors && Number(details.price) <= 0}
                        className="min-h-12 border-2 border-ink-black bg-warm-cream pl-18 font-bold text-sm text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A] focus-visible:shadow-[3.5px_3.5px_0px_var(--eko-gold)]"
                        id="price"
                        inputMode="numeric"
                        min="0"
                        onChange={(event) => updateDetail("price", event.target.value)}
                        placeholder="e.g. 3500000"
                        type="number"
                        value={details.price}
                      />
                    </div>
                  </div>

                  {/* Bedrooms and Bathrooms count */}
                  <div className="grid grid-cols-2 gap-4 max-sm:col-span-2">
                    <div className="grid gap-2">
                      <Label htmlFor="bedrooms" className="text-xs font-black uppercase tracking-wider text-ink-black">
                        Bedrooms
                      </Label>
                      <Input
                        className="min-h-12 border-2 border-ink-black bg-warm-cream font-bold text-sm text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A] focus-visible:shadow-[3.5px_3.5px_0px_var(--eko-gold)]"
                        id="bedrooms"
                        inputMode="numeric"
                        min="0"
                        onChange={(event) => updateDetail("bedrooms", event.target.value)}
                        placeholder="1"
                        type="number"
                        value={details.bedrooms}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bathrooms" className="text-xs font-black uppercase tracking-wider text-ink-black">
                        Bathrooms
                      </Label>
                      <Input
                        className="min-h-12 border-2 border-ink-black bg-warm-cream font-bold text-sm text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A] focus-visible:shadow-[3.5px_3.5px_0px_var(--eko-gold)]"
                        id="bathrooms"
                        inputMode="numeric"
                        min="1"
                        onChange={(event) => updateDetail("bathrooms", event.target.value)}
                        placeholder="1"
                        type="number"
                        value={details.bathrooms}
                      />
                    </div>
                  </div>

                  <div className="col-span-2 grid gap-2 max-sm:col-span-1">
                    <Label htmlFor="description" className="text-xs font-black uppercase tracking-wider text-ink-black">
                      Property Description
                    </Label>
                    <Textarea
                      className="min-h-32 resize-y border-2 border-ink-black bg-warm-cream font-medium text-sm text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A] focus-visible:shadow-[3.5px_3.5px_0px_var(--eko-gold)]"
                      id="description"
                      maxLength={700}
                      onChange={(event) => updateDetail("description", event.target.value)}
                      placeholder="Detail generator hours, flood drainage history, clean water borehole status, and parking slots."
                      value={details.description}
                    />
                    <small className="text-[0.68rem] font-bold text-muted-foreground uppercase">
                      {details.description.length}/700 characters
                    </small>
                  </div>
                </div>
              </Card>
            )}

            {/* STEP 1: PHOTOS (NEO-BRUTALIST SECTIONAL UPLOADER) */}
            {step === 1 && (
              <div className="space-y-6" aria-labelledby="photos-title">
                {/* Upload Control Card */}
                <Card className="rounded-xl border-[2.5px] border-ink-black bg-card p-6 md:p-8 shadow-[5px_5px_0px_#0A0A0A]">
                  <div className="flex items-center justify-between gap-4 border-b-2 border-ink-black/15 pb-5 max-sm:flex-col max-sm:items-start">
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-lg border-2 border-ink-black bg-eko-gold text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A]">
                        <Camera className="stroke-[2.5]" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-heading text-lg font-black uppercase tracking-tight text-ink-black" id="photos-title">
                          Sectional Photo Uploader
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                          Upload multiple photos and specify the area (Toilet, Bathroom, Kitchen, Living Room, etc.)
                        </p>
                      </div>
                    </div>
                    <Badge className="border-2 border-ink-black bg-[var(--gold-wash)] px-3 py-1 font-black uppercase text-ink-black shadow-[2px_2px_0px_#0A0A0A]">
                      {photos.length} photos added
                    </Badge>
                  </div>

                  <div className="mt-6 grid gap-5">
                    {/* Section Selector */}
                    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border-2 border-ink-black bg-warm-cream p-4 shadow-[3px_3px_0px_#0A0A0A]">
                      <div className="grid gap-1">
                        <Label htmlFor="upload-section-select" className="text-xs font-black uppercase tracking-wider text-ink-black">
                          Target room area for next upload:
                        </Label>
                        <span className="text-[0.72rem] font-bold text-muted-foreground uppercase">
                          Currently set to: <strong className="text-ink-black">{SECTION_OPTIONS.find((s) => s.value === uploadSection)?.label}</strong>
                        </span>
                      </div>
                      <div className="w-full max-w-xs">
                        <Select value={uploadSection} onValueChange={setUploadSection}>
                          <SelectTrigger
                            id="upload-section-select"
                            className="min-h-11 border-2 border-ink-black bg-card font-black text-xs uppercase text-ink-black shadow-[2px_2px_0px_#0A0A0A]"
                          >
                            <SelectValue placeholder="Choose room section" />
                          </SelectTrigger>
                          <SelectContent className="border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A]">
                            {SECTION_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value} className="font-bold text-xs">
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Drag-and-Drop / Browse Drop Zone */}
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        handleFilesUpload(e.dataTransfer.files);
                      }}
                      className={`group relative flex flex-col items-center justify-center rounded-xl border-[2.5px] border-dashed border-ink-black p-10 text-center transition-all cursor-pointer ${
                        isDragging
                          ? "bg-[var(--gold-wash)] scale-[1.01] shadow-[6px_6px_0px_#0A0A0A]"
                          : "bg-warm-cream/60 hover:bg-[var(--gold-wash)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={(e) => handleFilesUpload(e.target.files)}
                      />
                      <span className="mb-4 grid size-16 place-items-center rounded-2xl border-2 border-ink-black bg-eko-gold text-ink-black shadow-[3.5px_3.5px_0px_#0A0A0A] transition-transform group-hover:scale-105">
                        {uploading ? (
                          <Loader2 className="size-8 stroke-[3] animate-spin" />
                        ) : (
                          <Upload className="size-8 stroke-[3]" />
                        )}
                      </span>
                      <strong className="font-heading text-base font-black uppercase text-ink-black">
                        {uploading
                          ? "Saving photos to listing..."
                          : `Click or Drag Photos for [${SECTION_OPTIONS.find((s) => s.value === uploadSection)?.shortLabel}]`}
                      </strong>
                      <p className="mt-1.5 max-w-md text-xs font-medium text-muted-foreground">
                        Select one or multiple images at once. Accepted: JPG, PNG, WebP up to 8 MB per image.
                      </p>
                    </div>

                    {/* Quick Section Shortcuts */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[0.68rem] font-black uppercase tracking-wider text-muted-foreground mr-1">
                        Upload direct:
                      </span>
                      {["TOILET", "BATHROOM", "KITCHEN", "LIVING_ROOM", "BEDROOM", "MASTER_BEDROOM", "COMPOUND"].map((sec) => (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            setUploadSection(sec);
                            fileInputRef.current?.click();
                          }}
                          className={`rounded border-2 border-ink-black px-3 py-1 text-[0.68rem] font-black uppercase tracking-wider transition-all shadow-[1.5px_1.5px_0px_#0A0A0A] hover:bg-eko-gold active:translate-x-0.5 active:translate-y-0.5 ${
                            uploadSection === sec ? "bg-eko-gold text-ink-black font-black" : "bg-card text-ink-black"
                          }`}
                        >
                          + {SECTION_OPTIONS.find((s) => s.value === sec)?.shortLabel}
                        </button>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Filter and Section Summary Pills */}
                {photos.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-ink-black">
                      Filter display:
                    </span>
                    <button
                      type="button"
                      onClick={() => setPhotoFilter("ALL")}
                      className={`rounded-md border-2 border-ink-black px-3 py-1 text-[0.7rem] font-black uppercase shadow-[2px_2px_0px_#0A0A0A] transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                        photoFilter === "ALL" ? "bg-ink-black text-warm-cream" : "bg-card text-ink-black hover:bg-warm-cream"
                      }`}
                    >
                      All photos ({photos.length})
                    </button>
                    {SECTION_OPTIONS.filter((opt) => (photoCountBySection[opt.value] || 0) > 0).map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setPhotoFilter(opt.value)}
                        className={`rounded-md border-2 border-ink-black px-3 py-1 text-[0.7rem] font-black uppercase shadow-[2px_2px_0px_#0A0A0A] transition-all active:translate-x-0.5 active:translate-y-0.5 ${
                          photoFilter === opt.value
                            ? "bg-eko-gold text-ink-black"
                            : "bg-card text-ink-black hover:bg-warm-cream"
                        }`}
                      >
                        {opt.shortLabel} ({photoCountBySection[opt.value]})
                      </button>
                    ))}
                  </div>
                )}

                {/* Photos Grid */}
                {photos.length === 0 ? (
                  <Card className="rounded-xl border-[2.5px] border-dashed border-ink-black bg-warm-cream/50 p-12 text-center shadow-[4px_4px_0px_#0A0A0A]">
                    <div className="mx-auto flex max-w-md flex-col items-center">
                      <span className="grid size-16 place-items-center rounded-2xl border-2 border-ink-black bg-warm-cream text-muted-foreground shadow-[2.5px_2.5px_0px_#0A0A0A]">
                        <ImageIcon className="size-8 stroke-[2]" />
                      </span>
                      <strong className="mt-4 font-heading text-lg font-black uppercase text-ink-black">
                        No apartment photos uploaded
                      </strong>
                      <p className="mt-1.5 text-xs font-medium text-muted-foreground">
                        Use the section selector above to upload photos of the <span className="font-black text-ink-black">Toilet</span>, <span className="font-black text-ink-black">Bathroom</span>, <span className="font-black text-ink-black">Kitchen</span>, and other areas.
                      </p>
                    </div>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredPhotos.map((photo, idx) => {
                      const currentSecOption = SECTION_OPTIONS.find((s) => s.value === photo.section);
                      return (
                        <Card
                          key={photo.id}
                          className="overflow-hidden rounded-xl border-[2.5px] border-ink-black bg-card shadow-[4px_4px_0px_#0A0A0A] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#0A0A0A]"
                        >
                          <div className="relative aspect-[4/3] w-full border-b-2 border-ink-black bg-ink-black/10">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.url}
                              alt={photo.label || `${photo.section} apartment photo`}
                              className="size-full object-cover"
                            />
                            {/* Section Badge */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                              <Badge className="border-2 border-ink-black bg-eko-gold font-black uppercase text-xs text-ink-black shadow-[2px_2px_0px_#0A0A0A]">
                                {currentSecOption?.shortLabel ?? photo.section}
                              </Badge>
                            </div>
                            {/* Number Tag */}
                            <span className="absolute top-2.5 right-2.5 rounded border-2 border-ink-black bg-card px-2 py-0.5 text-[0.68rem] font-black text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
                              #{String(idx + 1).padStart(2, "0")}
                            </span>
                          </div>

                          <CardContent className="space-y-3.5 p-4.5">
                            <div className="grid gap-1.5">
                              <Label
                                htmlFor={`sec-${photo.id}`}
                                className="text-[0.68rem] font-black uppercase tracking-wider text-muted-foreground"
                              >
                                Reassign Area Section (Dropdown)
                              </Label>
                              <Select
                                value={photo.section}
                                onValueChange={(newVal) => updatePhotoSection(photo.id, newVal)}
                              >
                                <SelectTrigger
                                  id={`sec-${photo.id}`}
                                  className="h-10 w-full border-2 border-ink-black bg-warm-cream font-bold text-xs text-ink-black shadow-[2px_2px_0px_#0A0A0A]"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A]">
                                  {SECTION_OPTIONS.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value} className="font-bold text-xs">
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="grid gap-1.5">
                              <Label
                                htmlFor={`lbl-${photo.id}`}
                                className="text-[0.68rem] font-black uppercase tracking-wider text-muted-foreground"
                              >
                                Label / Description (Optional)
                              </Label>
                              <Input
                                id={`lbl-${photo.id}`}
                                value={photo.label || ""}
                                onChange={(e) => updatePhotoLabel(photo.id, e.target.value)}
                                placeholder="e.g. Visitor's toilet, Master tub, Front gate..."
                                className="h-10 border-2 border-ink-black bg-warm-cream font-medium text-xs text-ink-black shadow-[2px_2px_0px_#0A0A0A]"
                              />
                            </div>

                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => removePhoto(photo.id)}
                              className="w-full border-2 border-alert-red bg-alert-red/10 text-xs font-black uppercase text-alert-red shadow-[2px_2px_0px_#0A0A0A] hover:bg-alert-red hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                            >
                              <Trash2 className="size-3.5 stroke-[2.5]" />
                              Delete photo
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: ROOMS (MEASURE SIZES) */}
            {step === 2 && (
              <div className="space-y-6" aria-labelledby="rooms-title">
                <Card className="rounded-xl border-[2.5px] border-ink-black bg-card p-6 md:p-8 shadow-[5px_5px_0px_#0A0A0A]">
                  <div className="flex items-center justify-between gap-5 border-b-2 border-ink-black/15 pb-5 max-sm:flex-col max-sm:items-start">
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 shrink-0 place-items-center rounded-lg border-2 border-ink-black bg-eko-gold text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A]">
                        <Ruler className="stroke-[2.5]" aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-heading text-lg font-black uppercase tracking-tight text-ink-black" id="rooms-title">
                          Floor Area Calibrations
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                          Calibrate floor contours one room at a time using our homography computer vision studio.
                        </p>
                      </div>
                    </div>
                    <Button
                      className="border-2 border-ink-black bg-eko-gold text-xs font-black uppercase text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-eko-gold-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none max-sm:w-full"
                      onClick={addRoom}
                      type="button"
                    >
                      <Plus className="stroke-[3]" aria-hidden="true" />
                      Add room
                    </Button>
                  </div>

                  <Alert className="mt-6 rounded-xl border-2 border-ink-black bg-[var(--gold-wash)] text-ink-black shadow-[3px_3px_0px_#0A0A0A]">
                    <ShieldCheck className="stroke-[2.5] text-ink-black" aria-hidden="true" />
                    <AlertTitle className="font-black uppercase">Tamper-Evident Evidence</AlertTitle>
                    <AlertDescription className="font-medium text-ink-black/80">
                      Each measurement saves its reference marker corners, pixel coordinates, and calculated polygon area.
                    </AlertDescription>
                  </Alert>

                  <div className="mt-6 grid gap-4">
                    {rooms.map((room, roomIndex) => (
                      <Card
                        className={`rounded-xl border-2 border-ink-black bg-card text-ink-black shadow-[4px_4px_0px_#0A0A0A] transition-all hover:shadow-[5px_5px_0px_#0A0A0A] ${
                          room.status === "measured" ? "border-2 border-ink-black bg-white" : ""
                        }`}
                        key={room.id}
                      >
                        <CardContent className="grid grid-cols-[40px_minmax(140px,1fr)_auto_auto_auto] items-center gap-3.5 p-4.5 max-lg:grid-cols-[34px_minmax(120px,1fr)_auto] max-sm:grid-cols-[28px_minmax(0,1fr)_auto]">
                          <span className="grid size-8 place-items-center rounded border-2 border-ink-black bg-warm-cream font-heading text-xs font-black text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
                            {String(roomIndex + 1).padStart(2, "0")}
                          </span>
                          <div className="grid gap-1">
                            <Label className="sr-only" htmlFor={`room-${room.id}`}>
                              Room name
                            </Label>
                            <Input
                              className="h-8 w-full max-w-70 rounded-none border-0 bg-transparent p-0 font-heading text-base font-black uppercase text-ink-black shadow-none focus-visible:ring-0"
                              id={`room-${room.id}`}
                              onChange={(event) => updateRoomName(room.id, event.target.value)}
                              value={room.name}
                            />
                            <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                              {room.status === "measured"
                                ? `${room.area?.toFixed(1)} m² · ${
                                    room.confidence === null ? "Manual estimate" : `${room.confidence}% confidence`
                                  }`
                                : "Pending calibration"}
                            </span>
                          </div>
                          {room.status === "measured" ? (
                            <Badge className="border-2 border-ink-black bg-eko-gold font-black uppercase text-xs text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A] max-sm:col-span-2 max-sm:col-start-2 max-sm:row-start-2 max-sm:justify-self-start">
                              <CheckCircle2 className="size-3.5 stroke-[2.5]" aria-hidden="true" />
                              Calibrated
                            </Badge>
                          ) : (
                            <Badge
                              className="border-2 border-ink-black font-bold uppercase text-xs shadow-[1.5px_1.5px_0px_#0A0A0A] max-sm:col-span-2 max-sm:col-start-2 max-sm:row-start-2 max-sm:justify-self-start"
                              variant="outline"
                            >
                              Pending
                            </Badge>
                          )}
                          <Button
                            type="button"
                            disabled
                            onClick={() => captureRoom(roomIndex)}
                            className="min-w-34 border-2 border-ink-black bg-eko-gold font-black uppercase text-xs text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A] hover:bg-eko-gold-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none max-sm:w-full"
                          >
                            <Ruler className="stroke-[2.5]" aria-hidden="true" />{" "}
                            {room.status === "measured" ? "Review studio" : "Measure room"}
                          </Button>
                          {rooms.length > 1 && (
                            <Button
                              aria-label={`Remove ${room.name}`}
                              className="border-2 border-transparent text-muted-foreground hover:border-alert-red hover:bg-alert-red/10 hover:text-alert-red max-lg:col-start-3 max-lg:row-start-2 max-sm:col-start-3 max-sm:row-start-1"
                              onClick={() => removeRoom(room.id)}
                              size="icon"
                              type="button"
                              variant="ghost"
                            >
                              <Trash2 className="size-4 stroke-[2.5]" aria-hidden="true" />
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </Card>

                <div className="flex items-center justify-between gap-6 rounded-xl border-[2.5px] border-ink-black bg-ink-black p-6 text-warm-cream shadow-[5px_5px_0px_var(--eko-gold)] max-sm:flex-col max-sm:items-start">
                  <div className="flex items-baseline gap-3 max-sm:flex-col max-sm:items-start">
                    <span className="text-xs font-black uppercase tracking-wider text-[#b9b1a6]">Measured Total</span>
                    <strong className="font-heading text-3xl font-black tracking-[-0.05em] text-eko-gold-bright">
                      {totalArea.toFixed(1)} m²
                    </strong>
                  </div>
                  <p className="rounded border-2 border-white/25 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-warm-cream">
                    {measuredRooms.length} of {rooms.length} rooms measured
                  </p>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {step === 3 && (
              <div className="space-y-6" aria-labelledby="review-title">
                <Card className="rounded-xl border-[2.5px] border-ink-black bg-card p-6 md:p-8 shadow-[5px_5px_0px_#0A0A0A]">
                  <div className="flex items-center gap-3 border-b-2 border-ink-black/15 pb-5">
                    <span className="grid size-11 shrink-0 place-items-center rounded-lg border-2 border-ink-black bg-eko-gold text-ink-black shadow-[2.5px_2.5px_0px_#0A0A0A]">
                      <FileCheck2 className="stroke-[2.5]" aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-black uppercase tracking-tight text-ink-black" id="review-title">
                        Audit Before Publication
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                        Review property facts, verified photos by section, and calibrated room dimensions.
                      </p>
                    </div>
                  </div>

                  {/* Overview Grid */}
                  <Card className="mt-6 rounded-xl border-2 border-ink-black bg-card text-ink-black shadow-[4px_4px_0px_#0A0A0A]">
                    <CardHeader className="flex-row items-center justify-between border-b-2 border-ink-black bg-[var(--gold-wash)]/40 p-4">
                      <CardTitle className="font-heading text-sm font-black uppercase">Property Overview</CardTitle>
                      <Button onClick={() => setStep(0)} type="button" variant="outline" className="border-2 border-ink-black text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#0A0A0A]">
                        Edit details
                      </Button>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-5 p-5 max-sm:grid-cols-1">
                      <div className="col-span-2 grid gap-1 max-sm:col-span-1">
                        <span className="text-[0.68rem] font-black uppercase tracking-wider text-muted-foreground">
                          Listing title
                        </span>
                        <strong className="text-sm font-black text-ink-black">{details.title || "Not added"}</strong>
                      </div>
                      <div className="col-span-2 grid gap-1 max-sm:col-span-1">
                        <span className="text-[0.68rem] font-black uppercase tracking-wider text-muted-foreground">
                          Address
                        </span>
                        <strong className="text-sm font-black text-ink-black">
                          {[details.address, details.neighbourhood].filter(Boolean).join(", ") || "Not added"}
                        </strong>
                      </div>
                      <div className="grid gap-1">
                        <span className="text-[0.68rem] font-black uppercase tracking-wider text-muted-foreground">
                          Property type
                        </span>
                        <strong className="text-sm font-black text-ink-black">{details.propertyType || "Not added"}</strong>
                      </div>
                      <div className="grid gap-1">
                        <span className="text-[0.68rem] font-black uppercase tracking-wider text-muted-foreground">
                          Lease term
                        </span>
                        <strong className="text-sm font-black text-ink-black">{details.leaseTerm || "Not added"}</strong>
                      </div>
                      <div className="grid gap-1">
                        <span className="text-[0.68rem] font-black uppercase tracking-wider text-muted-foreground">
                          Rent
                        </span>
                        <strong className="text-sm font-black text-ink-black">{formatPrice(details.price)}</strong>
                      </div>
                      <div className="grid gap-1">
                        <span className="text-[0.68rem] font-black uppercase tracking-wider text-muted-foreground">
                          Bedrooms / Bathrooms
                        </span>
                        <strong className="text-sm font-black text-ink-black">{details.bedrooms || "1"} Beds · {details.bathrooms || "1"} Baths</strong>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Apartment Photos Gallery */}
                  <Card className="mt-6 rounded-xl border-2 border-ink-black bg-card text-ink-black shadow-[4px_4px_0px_#0A0A0A]">
                    <CardHeader className="flex-row items-center justify-between border-b-2 border-ink-black bg-[var(--gold-wash)]/40 p-4">
                      <div className="flex items-center gap-2">
                        <CardTitle className="font-heading text-sm font-black uppercase">
                          Apartment Photos
                        </CardTitle>
                        <Badge className="border-2 border-ink-black bg-eko-gold font-black uppercase text-xs text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
                          {photos.length} total
                        </Badge>
                      </div>
                      <Button onClick={() => setStep(1)} type="button" variant="outline" className="border-2 border-ink-black text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#0A0A0A]">
                        Edit photos
                      </Button>
                    </CardHeader>
                    <CardContent className="p-5">
                      {photos.length === 0 ? (
                        <p className="text-xs font-bold text-muted-foreground uppercase">No photos uploaded yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                          {photos.map((p) => {
                            const sec = SECTION_OPTIONS.find((s) => s.value === p.section);
                            return (
                              <div
                                key={p.id}
                                className="overflow-hidden rounded-lg border-2 border-ink-black bg-card shadow-[3px_3px_0px_#0A0A0A]"
                              >
                                <div className="relative aspect-[4/3] w-full bg-ink-black/10">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={p.url} alt={p.label || p.section} className="size-full object-cover" />
                                  <Badge className="absolute bottom-1.5 left-1.5 border border-ink-black bg-eko-gold text-[0.62rem] font-black uppercase text-ink-black">
                                    {sec?.shortLabel ?? p.section}
                                  </Badge>
                                </div>
                                {p.label && (
                                  <p className="truncate p-2 text-[0.68rem] font-black text-ink-black">{p.label}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Room Measurements Table */}
                  <Card className="mt-6 rounded-xl border-2 border-ink-black bg-card text-ink-black shadow-[4px_4px_0px_#0A0A0A]">
                    <CardHeader className="flex-row items-center justify-between border-b-2 border-ink-black bg-[var(--gold-wash)]/40 p-4">
                      <CardTitle className="font-heading text-sm font-black uppercase">Room measurements</CardTitle>
                      <Button onClick={() => setStep(2)} type="button" variant="outline" className="border-2 border-ink-black text-xs font-black uppercase shadow-[1.5px_1.5px_0px_#0A0A0A]">
                        Edit rooms
                      </Button>
                    </CardHeader>
                    <CardContent className="grid p-5">
                      {rooms.map((room) => (
                        <div
                          className="grid grid-cols-[1fr_auto] items-center gap-2 border-b border-ink-black/15 py-3 last:border-b-0"
                          key={room.id}
                        >
                          <span className="flex items-center gap-2 text-xs font-black uppercase text-ink-black">
                            <DoorOpen className="size-4 stroke-[2.5]" aria-hidden="true" />
                            {room.name}
                          </span>
                          {room.status === "measured" ? (
                            <strong className="font-heading text-sm font-black text-ink-black">
                              {room.area?.toFixed(1)} m²
                            </strong>
                          ) : (
                            <Badge variant="outline" className="border-2 border-ink-black font-bold uppercase text-[0.68rem]">
                              Pending
                            </Badge>
                          )}
                        </div>
                      ))}
                      <div className="mt-5 flex items-center justify-between rounded-lg border-2 border-ink-black bg-[var(--gold-wash)] p-4 shadow-[3px_3px_0px_#0A0A0A]">
                        <span className="text-xs font-black uppercase tracking-wider text-ink-black">
                          Total measured area
                        </span>
                        <strong className="font-heading text-2xl font-black tracking-[-0.05em] text-ink-black">
                          {totalArea.toFixed(1)} m²
                        </strong>
                      </div>
                    </CardContent>
                  </Card>
                </Card>
              </div>
            )}

            {/* STEP 4: SUBMIT */}
            {step === 4 && (
              <section
                className="mx-auto grid max-w-[720px] justify-items-center pt-8 pb-6 text-center"
                aria-labelledby="submit-title"
              >
                <span className="mb-6 grid size-24 place-items-center rounded-2xl border-[2.5px] border-ink-black bg-eko-gold text-ink-black shadow-[6px_6px_0px_#0A0A0A]">
                  <ShieldCheck className="size-12 stroke-[2.5]" aria-hidden="true" />
                </span>
                <span className="mb-2.5 inline-block rounded border-2 border-ink-black bg-[var(--gold-wash)] px-3 py-0.5 text-xs font-black tracking-[0.14em] text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
                  Ready for moderation
                </span>
                <h3
                  className="font-heading text-[clamp(1.85rem,3.5vw,2.75rem)] leading-none font-black tracking-[-0.05em] uppercase text-ink-black"
                  id="submit-title"
                >
                  Submit Listing to Lagos Catalog
                </h3>
                <p className="mx-auto mt-4 max-w-lg text-sm font-medium leading-relaxed text-muted-foreground">
                  Your listing contains calibrated room measurements and {photos.length} sectional photos. Upon submission, it will be indexed in your lister hub and scheduled for verification review.
                </p>

                <div className="mt-8 grid w-full grid-cols-4 rounded-xl border-[2.5px] border-ink-black bg-card shadow-[6px_6px_0px_#0A0A0A] max-sm:grid-cols-2">
                  <span className="grid gap-1 px-4 py-5 text-xs font-black text-muted-foreground uppercase">
                    <strong className="font-heading text-2xl font-black text-ink-black">{rooms.length}</strong>
                    rooms added
                  </span>
                  <span className="grid gap-1 border-l-2 border-ink-black px-4 py-5 text-xs font-black text-muted-foreground uppercase max-sm:border-l-0">
                    <strong className="font-heading text-2xl font-black text-ink-black">{photos.length}</strong>
                    photos uploaded
                  </span>
                  <span className="grid gap-1 border-l-2 border-ink-black px-4 py-5 text-xs font-black text-muted-foreground uppercase max-sm:border-t-2 max-sm:border-l-0">
                    <strong className="font-heading text-2xl font-black text-ink-black">
                      {totalArea.toFixed(1)} m²
                    </strong>
                    measured total
                  </span>
                  <span className="grid gap-1 border-l-2 border-ink-black px-4 py-5 text-xs font-black text-muted-foreground uppercase max-sm:border-t-2 max-sm:border-l-0">
                    <strong className="font-heading text-base font-black text-ink-black">Manual est.</strong>
                    initial status
                  </span>
                </div>

                <Alert className="mt-6 w-full rounded-xl border-2 border-ink-black bg-[var(--gold-wash)] text-left text-ink-black shadow-[4px_4px_0px_#0A0A0A]">
                  <Info className="stroke-[2.5] text-ink-black" aria-hidden="true" />
                  <AlertTitle className="font-black uppercase">Need In-Person Scout Verification?</AlertTitle>
                  <AlertDescription className="font-medium text-ink-black/80">
                    You can request a laser-equipped Eko Space scout from your dashboard anytime after submission.
                  </AlertDescription>
                </Alert>
              </section>
            )}

            {/* FOOTER ACTIONS */}
            <footer className="mt-10 flex items-center justify-between gap-4 border-t-2 border-ink-black pt-6">
              <Button
                disabled={step === 0}
                onClick={goBack}
                type="button"
                variant="outline"
                className="min-h-11 border-2 border-ink-black bg-card px-6 text-xs font-black uppercase tracking-wider text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-warm-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              >
                <ArrowLeft className="stroke-[2.5]" aria-hidden="true" />
                Back
              </Button>

              {step < steps.length - 1 ? (
                <Button
                  className="min-h-12 border-2 border-ink-black bg-ink-black px-8 text-xs font-black uppercase tracking-wider text-warm-cream shadow-[4px_4px_0px_var(--eko-gold)] hover:bg-ink-black-soft active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  onClick={continueForward}
                  type="button"
                >
                  Continue
                  <ArrowRight className="stroke-[2.5]" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  className="min-h-12 border-2 border-ink-black bg-eko-gold px-8 text-xs font-black uppercase tracking-wider text-ink-black shadow-[4px_4px_0px_#0A0A0A] hover:bg-eko-gold-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  type="submit"
                >
                  Submit for review
                  <ArrowRight className="stroke-[2.5]" aria-hidden="true" />
                </Button>
              )}
            </footer>
          </fieldset>
        </form>
      </main>
    </div>
  );
}
