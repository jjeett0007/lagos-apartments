"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Grid,
  Layers,
  Camera,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ListingPhoto {
  id?: string;
  url: string;
  altText?: string | null;
  section?: string | null;
  label?: string | null;
}

interface ListingGalleryProps {
  photos: ListingPhoto[];
  title: string;
}

export function ListingGallery({ photos, title }: ListingGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAllDrawer, setShowAllDrawer] = useState(false);

  const totalPhotos = photos.length;
  const isLightboxOpen = lightboxIndex !== null && totalPhotos > 0;

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return 0;
      return (prev - 1 + totalPhotos) % totalPhotos;
    });
  }, [totalPhotos]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) => {
      if (prev === null) return 0;
      return (prev + 1) % totalPhotos;
    });
  }, [totalPhotos]);

  // Keyboard navigation
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleCloseLightbox();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isLightboxOpen, handleCloseLightbox, handlePrev, handleNext]);

  if (totalPhotos === 0) {
    return (
      <section
        className="mt-8 rounded-xl border-2 border-dashed border-ink-black bg-card p-10 text-center shadow-[4px_4px_0px_#0A0A0A]"
        aria-label="Listing photo gallery"
      >
        <Camera className="mx-auto size-10 text-ink-black/40 stroke-[1.75]" />
        <p className="mt-3 font-heading text-lg font-black uppercase text-ink-black">
          No Photos Registered
        </p>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Scout inspection / photographic evidence pending upload
        </p>
      </section>
    );
  }

  // Active photo in lightbox
  const activePhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <>
      <section
        className="mt-8 w-full"
        aria-label="Listing photo gallery"
      >
        {/* Gallery Header Bar: Total photos counter and View All trigger */}
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-ink-black bg-warm-cream px-2.5 py-0.5 text-xs font-black text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A]">
              <Layers className="size-3.5 stroke-[2.5]" aria-hidden="true" />
              {totalPhotos} {totalPhotos === 1 ? "Photo" : "Photographic Records"}
            </span>
            <span className="hidden text-[0.72rem] font-black tracking-wider text-muted-foreground uppercase sm:inline-block">
              Click any photo to enlarge
            </span>
          </div>

          <button
            type="button"
            onClick={() => handleOpenLightbox(0)}
            className="group inline-flex items-center gap-1.5 rounded-lg border-2 border-ink-black bg-card px-3 py-1.5 text-xs font-black text-ink-black uppercase shadow-[2px_2px_0px_#0A0A0A] transition-all hover:bg-eko-gold hover:shadow-[3px_3px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5"
            aria-label="Open fullscreen photo gallery preview"
          >
            <Maximize2 className="size-3.5 stroke-[2.5] transition-transform group-hover:scale-110" />
            <span>Open Gallery [{totalPhotos}]</span>
          </button>
        </div>

        {/* 1 Photo Layout */}
        {totalPhotos === 1 && (
          <div
            onClick={() => handleOpenLightbox(0)}
            className="group relative aspect-[16/9] md:aspect-[21/9] w-full cursor-pointer overflow-hidden rounded-xl border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A] transition-all hover:shadow-[6px_6px_0px_#0A0A0A]"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleOpenLightbox(0)}
          >
            <Image
              src={photos[0].url}
              alt={photos[0].altText ?? title}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-103"
            />
            {photos[0].section && (
              <Badge className="absolute top-3.5 left-3.5 border-2 border-ink-black bg-eko-gold text-xs font-black uppercase text-ink-black shadow-[2px_2px_0px_#0A0A0A]">
                {photos[0].section.replaceAll("_", " ")}
              </Badge>
            )}
            {photos[0].label && (
              <span className="absolute bottom-3.5 left-3.5 rounded-md border-2 border-ink-black bg-card/95 px-3 py-1 text-xs font-bold text-ink-black shadow-[2px_2px_0px_#0A0A0A] backdrop-blur-sm">
                {photos[0].label}
              </span>
            )}
            <div className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 rounded-md border-2 border-ink-black bg-ink-black/85 px-2.5 py-1 text-[11px] font-black uppercase text-warm-cream shadow-[2px_2px_0px_#0A0A0A] backdrop-blur-sm transition-transform group-hover:scale-105">
              <Maximize2 className="size-3 stroke-[2.5]" />
              <span>Enlarge</span>
            </div>
          </div>
        )}

        {/* 2 Photos Layout */}
        {totalPhotos === 2 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((photo, idx) => (
              <div
                key={photo.id ?? photo.url}
                onClick={() => handleOpenLightbox(idx)}
                className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-xl border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A] transition-all hover:shadow-[6px_6px_0px_#0A0A0A]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleOpenLightbox(idx)}
              >
                <Image
                  src={photo.url}
                  alt={photo.altText ?? title}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-103"
                />
                {photo.section && (
                  <Badge className="absolute top-3 left-3 border-2 border-ink-black bg-eko-gold text-xs font-black uppercase text-ink-black shadow-[2px_2px_0px_#0A0A0A]">
                    {photo.section.replaceAll("_", " ")}
                  </Badge>
                )}
                {photo.label && (
                  <span className="absolute bottom-3 left-3 rounded-md border-2 border-ink-black bg-card/95 px-2.5 py-1 text-xs font-bold text-ink-black shadow-[2px_2px_0px_#0A0A0A] backdrop-blur-sm">
                    {photo.label}
                  </span>
                )}
                <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-md border-2 border-ink-black bg-ink-black/85 px-2 py-0.5 text-[10px] font-black uppercase text-warm-cream shadow-[2px_2px_0px_#0A0A0A] backdrop-blur-sm">
                  <Maximize2 className="size-3 stroke-[2.5]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3 or 4 Photos Layout */}
        {(totalPhotos === 3 || totalPhotos === 4) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Primary featured image spanning 2 columns on desktop */}
            <div
              onClick={() => handleOpenLightbox(0)}
              className="group relative sm:col-span-2 aspect-[4/3] sm:aspect-auto w-full cursor-pointer overflow-hidden rounded-xl border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A] transition-all hover:shadow-[6px_6px_0px_#0A0A0A]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleOpenLightbox(0)}
            >
              <Image
                src={photos[0].url}
                alt={photos[0].altText ?? title}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-103"
              />
              {photos[0].section && (
                <Badge className="absolute top-3.5 left-3.5 border-2 border-ink-black bg-eko-gold text-xs font-black uppercase text-ink-black shadow-[2px_2px_0px_#0A0A0A]">
                  {photos[0].section.replaceAll("_", " ")}
                </Badge>
              )}
              {photos[0].label && (
                <span className="absolute bottom-3.5 left-3.5 rounded-md border-2 border-ink-black bg-card/95 px-3 py-1 text-xs font-bold text-ink-black shadow-[2px_2px_0px_#0A0A0A] backdrop-blur-sm">
                  {photos[0].label}
                </span>
              )}
              <div className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 rounded-md border-2 border-ink-black bg-ink-black/85 px-2.5 py-1 text-[11px] font-black uppercase text-warm-cream shadow-[2px_2px_0px_#0A0A0A] backdrop-blur-sm">
                <Maximize2 className="size-3 stroke-[2.5]" />
                <span>Enlarge</span>
              </div>
            </div>

            {/* Other photos stacked */}
            <div className="flex flex-col gap-3">
              {photos.slice(1, 4).map((photo, sliceIdx) => {
                const idx = sliceIdx + 1;
                return (
                  <div
                    key={photo.id ?? photo.url}
                    onClick={() => handleOpenLightbox(idx)}
                    className="group relative aspect-[16/10] sm:flex-1 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A] transition-all hover:shadow-[6px_6px_0px_#0A0A0A]"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleOpenLightbox(idx)}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.altText ?? title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-103"
                    />
                    {photo.section && (
                      <Badge className="absolute top-2 left-2 border-2 border-ink-black bg-eko-gold text-[10px] font-black uppercase text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
                        {photo.section.replaceAll("_", " ")}
                      </Badge>
                    )}
                    {photo.label && (
                      <span className="absolute bottom-2 left-2 max-w-[80%] truncate rounded border-2 border-ink-black bg-card/95 px-2 py-0.5 text-[10px] font-bold text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A] backdrop-blur-sm">
                        {photo.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5+ Photos: Signature Neo-Brutalist Grid Mosaic */}
        {totalPhotos >= 5 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 h-auto md:h-[480px] lg:h-[530px]">
            {/* Cell 1: Large Featured Main Image (Spans 2 cols, 2 rows) */}
            <div
              onClick={() => handleOpenLightbox(0)}
              className="group relative aspect-[16/10] md:aspect-auto md:col-span-2 md:row-span-2 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A] transition-all hover:shadow-[6px_6px_0px_#0A0A0A]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleOpenLightbox(0)}
            >
              <Image
                src={photos[0].url}
                alt={photos[0].altText ?? title}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-103"
              />
              {photos[0].section && (
                <Badge className="absolute top-3.5 left-3.5 border-2 border-ink-black bg-eko-gold text-xs font-black uppercase text-ink-black shadow-[2px_2px_0px_#0A0A0A]">
                  {photos[0].section.replaceAll("_", " ")}
                </Badge>
              )}
              {photos[0].label && (
                <span className="absolute bottom-3.5 left-3.5 max-w-[70%] truncate rounded-md border-2 border-ink-black bg-card/95 px-3 py-1 text-xs font-bold text-ink-black shadow-[2px_2px_0px_#0A0A0A] backdrop-blur-sm">
                  {photos[0].label}
                </span>
              )}
              <div className="absolute right-3.5 bottom-3.5 flex items-center gap-1.5 rounded-md border-2 border-ink-black bg-ink-black/85 px-2.5 py-1 text-[11px] font-black uppercase text-warm-cream shadow-[2px_2px_0px_#0A0A0A] backdrop-blur-sm">
                <Maximize2 className="size-3 stroke-[2.5]" />
                <span>Primary View</span>
              </div>
            </div>

            {/* Cell 2 */}
            <div
              onClick={() => handleOpenLightbox(1)}
              className="group relative aspect-[4/3] md:aspect-auto md:col-span-1 md:row-span-1 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A] transition-all hover:shadow-[6px_6px_0px_#0A0A0A]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleOpenLightbox(1)}
            >
              <Image
                src={photos[1].url}
                alt={photos[1].altText ?? title}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-103"
              />
              {photos[1].section && (
                <Badge className="absolute top-2.5 left-2.5 border-2 border-ink-black bg-eko-gold text-[10px] font-black uppercase text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
                  {photos[1].section.replaceAll("_", " ")}
                </Badge>
              )}
              {photos[1].label && (
                <span className="absolute bottom-2.5 left-2.5 max-w-[80%] truncate rounded border-2 border-ink-black bg-card/95 px-2 py-0.5 text-[10px] font-bold text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A] backdrop-blur-sm">
                  {photos[1].label}
                </span>
              )}
            </div>

            {/* Cell 3 */}
            <div
              onClick={() => handleOpenLightbox(2)}
              className="group relative aspect-[4/3] md:aspect-auto md:col-span-1 md:row-span-1 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A] transition-all hover:shadow-[6px_6px_0px_#0A0A0A]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleOpenLightbox(2)}
            >
              <Image
                src={photos[2].url}
                alt={photos[2].altText ?? title}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-103"
              />
              {photos[2].section && (
                <Badge className="absolute top-2.5 left-2.5 border-2 border-ink-black bg-eko-gold text-[10px] font-black uppercase text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
                  {photos[2].section.replaceAll("_", " ")}
                </Badge>
              )}
              {photos[2].label && (
                <span className="absolute bottom-2.5 left-2.5 max-w-[80%] truncate rounded border-2 border-ink-black bg-card/95 px-2 py-0.5 text-[10px] font-bold text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A] backdrop-blur-sm">
                  {photos[2].label}
                </span>
              )}
            </div>

            {/* Cell 4 */}
            <div
              onClick={() => handleOpenLightbox(3)}
              className="group relative aspect-[4/3] md:aspect-auto md:col-span-1 md:row-span-1 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A] transition-all hover:shadow-[6px_6px_0px_#0A0A0A]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleOpenLightbox(3)}
            >
              <Image
                src={photos[3].url}
                alt={photos[3].altText ?? title}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-103"
              />
              {photos[3].section && (
                <Badge className="absolute top-2.5 left-2.5 border-2 border-ink-black bg-eko-gold text-[10px] font-black uppercase text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
                  {photos[3].section.replaceAll("_", " ")}
                </Badge>
              )}
              {photos[3].label && (
                <span className="absolute bottom-2.5 left-2.5 max-w-[80%] truncate rounded border-2 border-ink-black bg-card/95 px-2 py-0.5 text-[10px] font-bold text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A] backdrop-blur-sm">
                  {photos[3].label}
                </span>
              )}
            </div>

            {/* Cell 5: 5th Photo with "View All X Photos" Stamped Action */}
            <div
              onClick={() => handleOpenLightbox(4)}
              className="group relative aspect-[4/3] md:aspect-auto md:col-span-1 md:row-span-1 w-full cursor-pointer overflow-hidden rounded-xl border-2 border-ink-black shadow-[4px_4px_0px_#0A0A0A] transition-all hover:shadow-[6px_6px_0px_#0A0A0A]"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleOpenLightbox(4)}
            >
              <Image
                src={photos[4].url}
                alt={photos[4].altText ?? title}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-103"
              />
              {photos[4].section && (
                <Badge className="absolute top-2.5 left-2.5 border-2 border-ink-black bg-eko-gold text-[10px] font-black uppercase text-ink-black shadow-[1.5px_1.5px_0px_#0A0A0A]">
                  {photos[4].section.replaceAll("_", " ")}
                </Badge>
              )}

              {/* Show all photos button overlaid on the 5th tile */}
              <div className="absolute inset-0 flex items-center justify-center bg-ink-black/40 p-2 transition-colors group-hover:bg-ink-black/50">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenLightbox(4);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border-2 border-ink-black bg-warm-cream px-3 py-1.5 text-xs font-black uppercase text-ink-black shadow-[3px_3px_0px_#0A0A0A] transition-all hover:bg-eko-gold hover:shadow-[4px_4px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5"
                >
                  <Grid className="size-3.5 stroke-[2.5]" />
                  <span>
                    {totalPhotos > 5 ? `+${totalPhotos - 4} More Photos` : "View All Photos"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Additional Images Grid Drawer (for 6+ images) */}
        {totalPhotos > 5 && (
          <div className="mt-4 rounded-xl border-2 border-ink-black bg-card p-4 shadow-[4px_4px_0px_#0A0A0A]">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md border-2 border-ink-black bg-eko-gold px-2.5 py-0.5 text-xs font-black uppercase text-ink-black shadow-[2px_2px_0px_#0A0A0A]">
                  Full Photographic Inventory
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  {totalPhotos} verified area angles recorded
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAllDrawer(!showAllDrawer)}
                className="inline-flex items-center gap-1 text-xs font-black uppercase text-ink-black underline decoration-2 underline-offset-4 hover:text-eko-gold transition-colors"
              >
                {showAllDrawer ? "Collapse additional grid" : `Show all ${totalPhotos} in grid`}
              </button>
            </div>

            {showAllDrawer && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-3 border-t-2 border-ink-black/10">
                {photos.map((photo, idx) => (
                  <div
                    key={photo.id ?? `${photo.url}-${idx}`}
                    onClick={() => handleOpenLightbox(idx)}
                    className="group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-lg border-2 border-ink-black shadow-[2px_2px_0px_#0A0A0A] transition-all hover:shadow-[4px_4px_0px_#0A0A0A] hover:scale-102"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleOpenLightbox(idx)}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.altText ?? `${title} photo ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <span className="absolute top-1.5 left-1.5 rounded border border-ink-black bg-ink-black/85 px-1.5 py-0.5 text-[9px] font-black uppercase text-warm-cream">
                      #{idx + 1}
                    </span>
                    {photo.section && (
                      <span className="absolute bottom-1.5 left-1.5 right-1.5 truncate rounded border border-ink-black bg-card/95 px-1.5 py-0.5 text-[9px] font-bold text-ink-black shadow-[1px_1px_0px_#0A0A0A]">
                        {photo.section.replaceAll("_", " ")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && activePhoto && lightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Listing photo lightbox preview"
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink-black/95 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200"
          onClick={handleCloseLightbox}
        >
          {/* Lightbox Top Header Bar */}
          <div
            className="flex items-center justify-between gap-3 border-b-2 border-ink-black/40 pb-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Index badge & Title */}
            <div className="flex items-center gap-2.5">
              <span className="rounded-md border-2 border-ink-black bg-eko-gold px-3 py-1 text-xs font-black uppercase tracking-wider text-ink-black shadow-[2px_2px_0px_#0A0A0A]">
                IMAGE {lightboxIndex + 1} / {totalPhotos}
              </span>
              <span className="hidden font-heading text-xs font-black uppercase text-warm-cream/80 max-w-sm truncate md:inline-block">
                {title}
              </span>
            </div>

            {/* Center: Section Badge & Caption Label */}
            <div className="flex items-center gap-2 max-w-md truncate">
              {activePhoto.section && (
                <span className="rounded-md border-2 border-warm-cream/60 bg-ink-black px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-warm-cream shadow-[2px_2px_0px_#0A0A0A]">
                  {activePhoto.section.replaceAll("_", " ")}
                </span>
              )}
              {activePhoto.label && (
                <span className="text-xs font-bold text-warm-cream/90 truncate hidden sm:inline-block">
                  {activePhoto.label}
                </span>
              )}
            </div>

            {/* Right: Tactile Close Button */}
            <button
              type="button"
              onClick={handleCloseLightbox}
              className="flex items-center gap-1.5 rounded-lg border-2 border-ink-black bg-warm-cream px-3 py-1.5 text-xs font-black uppercase text-ink-black shadow-[3px_3px_0px_#FDFBF7] transition-all hover:bg-eko-gold active:translate-x-0.5 active:translate-y-0.5"
              aria-label="Close photo preview"
            >
              <X className="size-4 stroke-[3]" />
              <span className="hidden sm:inline">Close [ESC]</span>
            </button>
          </div>

          {/* Main Stage: Prev Button, Centered Large Image, Next Button */}
          <div
            className="relative my-2 flex flex-1 items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Prev Button */}
            {totalPhotos > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 sm:left-6 z-20 flex size-12 sm:size-14 items-center justify-center rounded-xl border-[2.5px] border-ink-black bg-eko-gold text-ink-black shadow-[4px_4px_0px_#0A0A0A] transition-all hover:bg-eko-gold-bright hover:scale-105 active:translate-x-0.5 active:translate-y-0.5"
                aria-label="Previous photo (Left arrow)"
              >
                <ChevronLeft className="size-7 sm:size-8 stroke-[3]" />
              </button>
            )}

            {/* Centered Large Image Stage */}
            <div className="relative flex max-h-[70vh] sm:max-h-[74vh] max-w-[85vw] sm:max-w-[78vw] items-center justify-center overflow-hidden rounded-xl border-[2.5px] border-ink-black bg-ink-black shadow-[8px_8px_0px_#FDFBF7]">
              <Image
                key={activePhoto.url}
                src={activePhoto.url}
                alt={activePhoto.altText ?? `${title} - Image ${lightboxIndex + 1}`}
                width={1400}
                height={950}
                unoptimized
                className="max-h-[70vh] sm:max-h-[74vh] w-auto max-w-[85vw] sm:max-w-[78vw] object-contain"
                priority
              />

              {/* Stamped photo info overlay inside the preview */}
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                {activePhoto.label ? (
                  <span className="rounded-md border-2 border-ink-black bg-card/95 px-3 py-1 text-xs font-bold text-ink-black shadow-[2px_2px_0px_#0A0A0A] backdrop-blur-sm pointer-events-auto">
                    {activePhoto.label}
                  </span>
                ) : <span />}

                <span className="rounded-md border-2 border-ink-black bg-ink-black/85 px-2.5 py-1 text-[11px] font-black uppercase text-warm-cream shadow-[2px_2px_0px_#0A0A0A] backdrop-blur-sm pointer-events-auto">
                  {lightboxIndex + 1} / {totalPhotos}
                </span>
              </div>
            </div>

            {/* Right Next Button */}
            {totalPhotos > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 sm:right-6 z-20 flex size-12 sm:size-14 items-center justify-center rounded-xl border-[2.5px] border-ink-black bg-eko-gold text-ink-black shadow-[4px_4px_0px_#0A0A0A] transition-all hover:bg-eko-gold-bright hover:scale-105 active:translate-x-0.5 active:translate-y-0.5"
                aria-label="Next photo (Right arrow)"
              >
                <ChevronRight className="size-7 sm:size-8 stroke-[3]" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Strip Bar */}
          <div
            className="border-t-2 border-ink-black/40 pt-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 sm:gap-3 overflow-x-auto py-1 px-2">
              {photos.map((photo, idx) => {
                const isActive = idx === lightboxIndex;
                return (
                  <button
                    key={photo.id ?? `${photo.url}-thumb-${idx}`}
                    type="button"
                    onClick={() => setLightboxIndex(idx)}
                    className={`group relative size-14 sm:size-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border-2 transition-all ${
                      isActive
                        ? "border-eko-gold ring-2 ring-warm-cream scale-105 shadow-[3px_3px_0px_#FDFBF7]"
                        : "border-ink-black/80 opacity-60 hover:opacity-100 hover:scale-102"
                    }`}
                    aria-label={`Jump to photo ${idx + 1}`}
                  >
                    <Image
                      src={photo.url}
                      alt={photo.altText ?? `Thumbnail ${idx + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <span
                      className={`absolute bottom-0 inset-x-0 text-center text-[9px] font-black uppercase py-0.5 ${
                        isActive
                          ? "bg-eko-gold text-ink-black"
                          : "bg-ink-black/80 text-warm-cream"
                      }`}
                    >
                      #{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
