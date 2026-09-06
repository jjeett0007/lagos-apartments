import type { Point } from "@/lib/geometry";

export type NormalizedPoint = Point & {
  /** Coordinates are stored from 0 to 1 relative to the source image. */
  x: number;
  y: number;
};

export type BoundarySource = "sam" | "manual" | "roomplan" | "scout";

export type RoomBoundary = {
  source: BoundarySource;
  points: NormalizedPoint[];
  modelConfidence: number | null;
  correctionCount: number;
};

export type ScaleReference = {
  kind: "a4" | "a3" | "calibration-marker" | "custom";
  widthMeters: number;
  heightMeters: number;
  corners: NormalizedPoint[];
};

export type RoomMeasurementResult = {
  roomId: string;
  areaSqm: number;
  boundary: RoomBoundary;
  reference: ScaleReference | null;
  captureMethod: "photo-reference" | "photo-ai" | "ar" | "lidar" | "scout";
  confidence: {
    value: number | null;
    basis: string[];
  };
  measuredAt: string;
};

export type SegmentationJobResult = {
  jobId: string;
  status: "queued" | "running" | "succeeded" | "failed";
  boundary?: RoomBoundary;
  maskUrl?: string;
  failureReason?: string;
};
