import type { Point } from "./geometry";
export type DraftRoom = {
  id: string; name: string; roomType: string; areaSqm: string | number | null; confidence: string | number | null;
  boundary: Point[] | null; referenceCorners: Point[] | null; referenceKind: string | null;
  photos?: { id: string; url: string }[];
};
export type DraftPhoto = {
  id: string;
  url: string;
  section: string | null;
  label: string | null;
  sortOrder: number;
};
export type ListingDraft = {
  id: string; title: string; description: string | null; privateAddress: string | null; publicAddress: string;
  areaName: string; propertyType: string; leaseTerm: string; price: string | number; bedroomCount: number;
  bathroomCount: number; amenities: string[]; status: string; rooms: DraftRoom[];
  photos?: DraftPhoto[];
};
