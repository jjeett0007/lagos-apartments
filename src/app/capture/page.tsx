import { RoomMeasurementStudio } from "@/components/room-measurement-studio";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageUser } from "@/lib/server/session";
import { getDb } from "@/lib/server/db";
import type { DraftRoom } from "@/lib/draft-types";
import { CaptureWorkspace } from "./capture-workspace";
import { ArrowLeft } from "lucide-react";

export default async function CapturePage({ searchParams }: { searchParams: Promise<{ listingId?: string; roomId?: string }> }) {
  const { listingId, roomId } = await searchParams;
  let room: DraftRoom | undefined;
  if (listingId || roomId) {
    const user = await pageUser(true);
    const record = await getDb().room.findFirst({
      where: {
        id: roomId ?? "",
        listingId: listingId ?? "",
        listing: { listerId: user.id, status: { in: ["DRAFT", "REJECTED"] } },
      },
      include: { photos: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
    if (!record) notFound();
    room = JSON.parse(JSON.stringify(record)) as DraftRoom;
  }

  return (
    <main className="min-h-screen bg-warm-cream px-5 py-10 text-ink-black max-sm:px-4 max-sm:py-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex items-center justify-between gap-4 rounded-[var(--radius-panel)] border-2 border-ink-black bg-card p-3 shadow-[4px_4px_0px_#0A0A0A]">
          <Button asChild variant="outline" className="border-2 border-ink-black font-bold shadow-[2px_2px_0px_#0A0A0A] hover:bg-warm-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
            <Link href={listingId ? `/listings/new?edit=${encodeURIComponent(listingId)}` : "/listings"}>
              <ArrowLeft className="stroke-[2.5]" aria-hidden="true" />
              Back to {listingId ? "listing" : "homes"}
            </Link>
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-md border-2 border-ink-black bg-eko-gold font-heading text-base font-black text-ink-black shadow-[2px_2px_0px_#0A0A0A]">
              E
            </span>
            <span className="font-heading text-base font-black tracking-tight uppercase">Eko Space</span>
          </Link>
        </header>

        <div className="mb-8 border-b-2 border-ink-black/20 pb-6">
          <span className="inline-block rounded-md border-2 border-ink-black bg-eko-gold px-2.5 py-0.5 text-xs font-black tracking-wider text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
            Computer Vision Geometry Studio
          </span>
          <h1 className="mt-3 font-heading text-[clamp(2rem,4vw,3.2rem)] leading-none font-black tracking-[-0.05em] uppercase text-ink-black">
            {room?.name ?? "Room measurement workspace"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground">
            Upload a clear image, mark the visible floor polygon, and align the scale handles with a known-size sheet lying flat on the floor for depth homography correction.
          </p>
        </div>

        {room && listingId ? <CaptureWorkspace listingId={listingId} room={room} /> : <RoomMeasurementStudio />}
      </div>
    </main>
  );
}
