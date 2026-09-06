"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { RoomMeasurementStudio, type MeasurementSave } from "@/components/room-measurement-studio";
import { apiRequest } from "@/lib/api-client";
import type { DraftRoom } from "@/lib/draft-types";
import { Button } from "@/components/ui/button";
export function CaptureWorkspace({ listingId, room }: { listingId: string; room: DraftRoom }) {
  const uploadedFile = useRef<File | null>(null);
  const sourcePhotoId = useRef(room.photos?.[0]?.id);
  const [saved, setSaved] = useState(false);
  async function save(value: MeasurementSave) {
    const base = `/api/listings/${listingId}/rooms/${room.id}`;
    if (value.photo && value.photo !== uploadedFile.current) {
      const form = new FormData(); form.set("photo", value.photo);
      const stored = await apiRequest<{ id: string }>(`${base}/photo`, { method: "POST", body: form, headers: {} });
      sourcePhotoId.current = stored.id;
      uploadedFile.current = value.photo;
    }
    const measurement = { photoId: sourcePhotoId.current, boundary: value.boundary, reference: value.reference, correctionCount: value.correctionCount };
    await apiRequest(`${base}/measurement`, { method: "PUT", body: JSON.stringify(measurement) });
    setSaved(true);
  }
  return (
    <>
      <RoomMeasurementStudio
        initial={{
          boundary: room.boundary,
          referenceCorners: room.referenceCorners,
          referenceKind: room.referenceKind,
          photoUrl: room.photos?.[0]?.url,
          roomName: room.name,
        }}
        onSave={save}
      />
      {saved && (
        <div className="mt-6 flex justify-end">
          <Button asChild size="lg" className="border-2 border-ink-black bg-eko-gold font-bold text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-eko-gold-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
            <Link href={`/listings/new?edit=${encodeURIComponent(listingId)}`}>
              Back to listing
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
