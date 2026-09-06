"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  calibratedPolygonArea,
  percentageDifference,
  type Point,
} from "@/lib/geometry";
import {
  Check,
  Frame,
  ImagePlus,
  Info,
  Move,
  RotateCcw,
  ScanLine,
} from "lucide-react";
import {
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const styles = {
  studio:
    "mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1.65fr)_minmax(320px,0.65fr)] gap-6 max-[920px]:grid-cols-1",
  workspaceCard:
    "rounded-[var(--radius-panel)] border-2 border-ink-black bg-card text-ink-black shadow-[6px_6px_0px_#0A0A0A]",
  resultCard:
    "self-start rounded-[var(--radius-panel)] border-2 border-ink-black bg-card text-ink-black shadow-[6px_6px_0px_#0A0A0A] max-[920px]:w-full",
  workspaceHeader:
    "min-h-[78px] flex-row items-center justify-between gap-4 border-b-2 border-ink-black bg-warm-cream/50 p-5 max-[620px]:flex-col max-[620px]:items-start",
  workspaceActions:
    "flex items-center justify-end gap-2.5 max-[620px]:w-full max-[620px]:justify-between [&_[data-slot=badge]]:max-w-[52%] [&_[data-slot=badge]]:overflow-hidden [&_[data-slot=badge]]:text-ellipsis",
  visuallyHidden: "sr-only",
  canvasShell: "p-0",
  canvasToolbar:
    "flex min-h-[68px] items-center justify-between gap-3 border-b-2 border-ink-black bg-warm-cream/30 px-5 py-3 max-[620px]:items-end",
  toolTabs: "h-9 border-2 border-ink-black bg-card font-bold text-ink-black shadow-[2px_2px_0px_#0A0A0A]",
  toolHelp:
    "flex items-center gap-1.5 text-xs font-bold text-muted-foreground [&_svg]:size-3.5 max-[620px]:max-w-60",
  canvas:
    "aspect-[4/3] w-full touch-none select-none overflow-hidden bg-ink-black",
  boundaryFill: "fill-eko-gold-bright/25",
  boundaryLine:
    "fill-none stroke-eko-gold-bright [stroke-linejoin:round] [stroke-width:4] [vector-effect:non-scaling-stroke]",
  referenceFill: "fill-white/25",
  referenceLine:
    "fill-none stroke-white [stroke-dasharray:7_6] [stroke-width:3] [vector-effect:non-scaling-stroke]",
  referenceLabel:
    "fill-white text-[17px] font-black tracking-[0.08em] stroke-ink-black [paint-order:stroke] [stroke-width:5px]",
  handle:
    "cursor-grab opacity-70 outline-none data-[active-tool=true]:opacity-100 focus-visible:opacity-100 active:cursor-grabbing [&:focus-visible_.handle-dot]:stroke-eko-gold-bright [&:focus-visible_.handle-dot]:[stroke-width:7px]",
  handleTarget: "fill-transparent",
  handleDot:
    "handle-dot stroke-ink-black [stroke-width:4px] [vector-effect:non-scaling-stroke]",
  handleLabel:
    "pointer-events-none fill-ink-black text-[11px] font-black [text-anchor:middle]",
  canvasNote:
    "flex items-start gap-2.5 border-t-2 border-ink-black bg-warm-cream/60 px-5 pt-3.5 pb-3.5 text-xs font-bold leading-relaxed text-ink-black [&_svg]:mt-0.5 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:stroke-[2.5] [&_svg]:text-ink-black",
  errorText: "px-5 pb-3.5 text-xs font-bold text-alert-red",
  resultHeading: "flex items-start justify-between gap-3",
  areaResult:
    "grid pt-5 pb-7 [&_strong]:font-heading [&_strong]:text-[clamp(3.8rem,7vw,5.5rem)] [&_strong]:leading-[0.86] [&_strong]:font-black [&_strong]:tracking-[-0.08em] [&_strong]:text-ink-black [&_span]:mt-2 [&_span]:text-xs [&_span]:font-black [&_span]:tracking-[0.1em] [&_span]:text-muted-foreground [&_span]:uppercase",
  referenceControl:
    "grid gap-2.5 [&_label]:text-xs [&_label]:font-black [&_label]:uppercase [&_label]:text-ink-black",
  selectTrigger:
    "min-h-11 w-full border-2 border-ink-black bg-warm-cream/50 font-bold text-ink-black shadow-[2px_2px_0px_#0A0A0A]",
  resultSeparator: "my-6 h-[2px] bg-ink-black/20",
  claimControl:
    "grid grid-cols-[1fr_110px] items-end gap-3 [&_label]:text-xs [&_label]:font-black [&_label]:uppercase [&_label]:text-ink-black [&_p]:mt-1 [&_p]:text-[0.68rem] [&_p]:font-medium [&_p]:text-muted-foreground",
  areaInputWrap:
    "relative [&_input]:h-11 [&_input]:border-2 [&_input]:border-ink-black [&_input]:bg-warm-cream/50 [&_input]:font-bold [&_input]:shadow-[2px_2px_0px_#0A0A0A] [&_input]:pr-9 [&_input]:text-ink-black [&_span]:absolute [&_span]:top-1/2 [&_span]:right-2.5 [&_span]:-translate-y-1/2 [&_span]:text-xs [&_span]:font-black [&_span]:text-ink-black",
  comparison:
    "mt-6 flex items-start gap-3 rounded-lg border-2 border-ink-black bg-warm-cream/60 p-4 shadow-[3px_3px_0px_#0A0A0A] data-[tone=good]:border-success-green data-[tone=good]:bg-success-green/10 data-[tone=caution]:border-eko-gold data-[tone=caution]:bg-eko-gold/15 data-[tone=danger]:border-alert-red data-[tone=danger]:bg-alert-red/10 [&_strong]:text-xs [&_strong]:font-black [&_strong]:uppercase [&_p]:mt-1 [&_p]:text-xs [&_p]:font-medium [&_p]:text-ink-black",
  comparisonIcon:
    "grid size-7 shrink-0 place-items-center rounded-md border-2 border-ink-black bg-eko-gold text-ink-black shadow-[1px_1px_0px_#0A0A0A] [&_svg]:size-4 [&_svg]:stroke-[2.5]",
  resultFooter:
    "grid gap-3 border-t-2 border-ink-black bg-warm-cream/50 p-5 [&_p]:text-xs [&_p]:font-bold [&_p]:text-muted-foreground",
  reviewButton:
    "w-full min-h-11 border-2 border-ink-black bg-eko-gold font-bold text-ink-black shadow-[3px_3px_0px_#0A0A0A] hover:bg-eko-gold-bright hover:shadow-[4px_4px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
} as const;

type Tool = "boundary" | "reference";
type ActiveHandle = { tool: Tool; index: number } | null;

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 750;

const DEFAULT_BOUNDARY: Point[] = [
  { x: 290.6386, y: 320.8273 },
  { x: 726.0522, y: 320.8273 },
  { x: 780, y: 650 },
  { x: 180, y: 650 },
];

const DEFAULT_REFERENCE: Point[] = [
  { x: 456.3356, y: 477.3973 },
  { x: 494.4777, y: 477.3973 },
  { x: 496.3543, y: 455.699 },
  { x: 459.0178, y: 455.699 },
];

const referencePresets = {
  a4: {
    label: "A4 sheet — 29.7 × 21 cm",
    widthMeters: 0.297,
    heightMeters: 0.21,
  },
  a3: {
    label: "A3 sheet — 42 × 29.7 cm",
    widthMeters: 0.42,
    heightMeters: 0.297,
  },
  marker: {
    label: "60 cm calibration square",
    widthMeters: 0.6,
    heightMeters: 0.6,
  },
} as const;

type ReferencePreset = keyof typeof referencePresets;

function toSvgPoints(points: readonly Point[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export type MeasurementSave = {
  boundary: Point[];
  reference: { kind: "a4" | "a3" | "calibration-marker"; corners: Point[] };
  correctionCount: number;
  photo: File | null;
};
export type MeasurementInitial = { boundary?: Point[] | null; referenceCorners?: Point[] | null; referenceKind?: string | null; photoUrl?: string; roomName?: string };
export function RoomMeasurementStudio({ initial, onSave }: { initial?: MeasurementInitial; onSave?: (value: MeasurementSave) => Promise<void> } = {}) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [correctionCount, setCorrectionCount] = useState(0);
  const expand = (points: Point[]) => points.map((point) => ({ x: point.x * VIEWBOX_WIDTH, y: point.y * VIEWBOX_HEIGHT }));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [boundary, setBoundary] = useState<Point[]>(initial?.boundary ? expand(initial.boundary) : DEFAULT_BOUNDARY);
  const [reference, setReference] = useState<Point[]>(initial?.referenceCorners ? expand(initial.referenceCorners) : DEFAULT_REFERENCE);
  const [activeHandle, setActiveHandle] = useState<ActiveHandle>(null);
  const [tool, setTool] = useState<Tool>("boundary");
  const [preset, setPreset] = useState<ReferencePreset>(initial?.referenceKind === "calibration-marker" ? "marker" : initial?.referenceKind === "a3" ? "a3" : "a4");
  const [claimedArea, setClaimedArea] = useState(onSave ? "" : "13");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.photoUrl ?? null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [reviewed, setReviewed] = useState(false);

  useEffect(() => {
    return () => {
      if (imageUrl?.startsWith("blob:")) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  const selectedReference = referencePresets[preset];
  const area = useMemo(
    () => calibratedPolygonArea(boundary, reference, selectedReference),
    [boundary, reference, selectedReference],
  );
  const safeArea = area && Number.isFinite(area) && area < 10000 ? area : null;
  const claim = Number.parseFloat(claimedArea);
  const difference = safeArea
    ? percentageDifference(safeArea, Number.isFinite(claim) ? claim : 0)
    : null;

  const comparison = useMemo(() => {
    if (difference === null) {
      return { label: "Add the advertised area", tone: "neutral" as const };
    }
    if (difference <= 5) {
      return { label: "Close to the advertised size", tone: "good" as const };
    }
    if (difference <= 12) {
      return { label: "Worth a second capture", tone: "caution" as const };
    }
    return { label: "Advertised size needs review", tone: "danger" as const };
  }, [difference]);

  function resetGeometry() {
    setBoundary(DEFAULT_BOUNDARY);
    setReference(DEFAULT_REFERENCE);
    setPreset("a4");
    setReviewed(false);
  }

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Choose a JPG, PNG, or WebP room image.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setUploadError("The photo must be smaller than 4 MB.");
      return;
    }

    setPhoto(file);
    setCorrectionCount(0);
    setImageUrl(URL.createObjectURL(file));
    setFileName(file.name);
    setUploadError(null);
    setReviewed(false);
    setTool("boundary");
    setBoundary(DEFAULT_BOUNDARY);
    setReference(DEFAULT_REFERENCE);
    event.target.value = "";
  }

  function updateHandle(handle: NonNullable<ActiveHandle>, point: Point) {
    const setter = handle.tool === "boundary" ? setBoundary : setReference;
    setter((current) =>
      current.map((existing, index) => (index === handle.index ? point : existing)),
    );
    setReviewed(false);
    setCorrectionCount((count) => count + 1);
  }

  function handlePointerMove(event: PointerEvent<SVGSVGElement>) {
    if (!activeHandle || saving) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    updateHandle(activeHandle, {
      x: clamp(
        ((event.clientX - bounds.left) / bounds.width) * VIEWBOX_WIDTH,
        0,
        VIEWBOX_WIDTH,
      ),
      y: clamp(
        ((event.clientY - bounds.top) / bounds.height) * VIEWBOX_HEIGHT,
        0,
        VIEWBOX_HEIGHT,
      ),
    });
  }

  function handleKeyboardMove(
    event: KeyboardEvent<SVGGElement>,
    handle: NonNullable<ActiveHandle>,
  ) {
    if (saving) return;
    const current =
      handle.tool === "boundary" ? boundary[handle.index] : reference[handle.index];
    const step = event.shiftKey ? 10 : 3;
    const movement: Record<string, Point> = {
      ArrowLeft: { x: -step, y: 0 },
      ArrowRight: { x: step, y: 0 },
      ArrowUp: { x: 0, y: -step },
      ArrowDown: { x: 0, y: step },
    };
    const delta = movement[event.key];
    if (!delta) return;

    event.preventDefault();
    updateHandle(handle, {
      x: clamp(current.x + delta.x, 0, VIEWBOX_WIDTH),
      y: clamp(current.y + delta.y, 0, VIEWBOX_HEIGHT),
    });
  }

  function renderHandle(point: Point, index: number, handleTool: Tool) {
    const isBoundary = handleTool === "boundary";
    const isActiveTool = tool === handleTool;
    const handle = { tool: handleTool, index } as const;

    return (
      <g
        className={styles.handle}
        data-active-tool={isActiveTool}
        data-kind={handleTool}
        key={`${handleTool}-${index}`}
        onKeyDown={(event) => handleKeyboardMove(event, handle)}
        onPointerDown={(event) => {
          if (saving) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          setActiveHandle(handle);
          setTool(handleTool);
        }}
        role="button"
        tabIndex={0}
        aria-label={`${isBoundary ? "Floor corner" : "Reference corner"} ${index + 1}. Drag or use arrow keys to adjust.`}
      >
        <circle className={styles.handleTarget} cx={point.x} cy={point.y} r="28" />
        <circle
          className={`${styles.handleDot} ${isBoundary ? "fill-eko-gold-bright" : "fill-white"}`}
          cx={point.x}
          cy={point.y}
          r={isBoundary ? 12 : 8}
        />
        {isBoundary ? (
          <text className={styles.handleLabel} x={point.x} y={point.y + 4}>
            {index + 1}
          </text>
        ) : null}
      </g>
    );
  }

  return (
    <div className={styles.studio}>
      <fieldset disabled={saving} className="contents">
      <Card className={styles.workspaceCard}>
        <CardHeader className={styles.workspaceHeader}>
          <div>
            <CardTitle className="font-heading text-lg font-black uppercase tracking-tight text-ink-black">
              Room boundary editor
            </CardTitle>
            <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {fileName ?? "Interactive demo room"}
            </CardDescription>
          </div>
          <div className={styles.workspaceActions}>
            <Badge variant={imageUrl ? "outline" : "estimated"} className="border-2 border-ink-black font-black uppercase shadow-[1px_1px_0px_#0A0A0A]">
              {imageUrl ? "Manual starter boundary" : "Calibrated demo"}
            </Badge>
            <input
              ref={fileInputRef}
              className={styles.visuallyHidden}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              capture="environment"
              onChange={handleUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-2 border-ink-black bg-card font-bold text-ink-black shadow-[2px_2px_0px_#0A0A0A] hover:bg-warm-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImagePlus className="stroke-[2.5]" data-icon="inline-start" />
              Add photo
            </Button>
          </div>
        </CardHeader>

        <CardContent className={styles.canvasShell}>
          <div className={styles.canvasToolbar}>
            <Tabs value={tool} onValueChange={(value) => setTool(value as Tool)}>
              <TabsList className={styles.toolTabs}>
                <TabsTrigger
                  value="boundary"
                  className="min-w-[120px] text-[var(--text-on-dark-dim)] data-active:bg-eko-gold data-active:text-ink-black max-[620px]:min-w-0 max-[620px]:[&_svg]:hidden"
                >
                  <Frame />
                  Room edges
                </TabsTrigger>
                <TabsTrigger
                  value="reference"
                  className="min-w-[120px] text-[var(--text-on-dark-dim)] data-active:bg-eko-gold data-active:text-ink-black max-[620px]:min-w-0 max-[620px]:[&_svg]:hidden"
                >
                  <ScanLine />
                  Scale marker
                </TabsTrigger>
              </TabsList>
              <TabsContent value="boundary" className={styles.toolHelp}>
                <Move aria-hidden="true" /> Drag the gold handles onto each visible
                floor corner.
              </TabsContent>
              <TabsContent value="reference" className={styles.toolHelp}>
                <Move aria-hidden="true" /> Match the four white handles to the
                reference sheet.
              </TabsContent>
            </Tabs>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[var(--text-on-dark-muted)] hover:bg-white/10 hover:text-white"
              onClick={resetGeometry}
            >
              <RotateCcw data-icon="inline-start" />
              Reset
            </Button>
          </div>

          <svg
            className={styles.canvas}
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            onPointerMove={handlePointerMove}
            onPointerUp={() => setActiveHandle(null)}
            onPointerCancel={() => setActiveHandle(null)}
            aria-label="Editable room photograph with floor and reference outlines"
          >
            {imageUrl ? (
              <image
                href={imageUrl}
                width={VIEWBOX_WIDTH}
                height={VIEWBOX_HEIGHT}
                preserveAspectRatio="none"
              />
            ) : (
              <g aria-label="Illustrated demo room">
                <rect width="1000" height="750" fill="#151515" />
                <polygon points="80,92 920,92 726,321 291,321" fill="#302d29" />
                <polygon points="80,92 291,321 180,650 80,650" fill="#25231f" />
                <polygon points="920,92 920,650 780,650 726,321" fill="#1f1e1b" />
                <polygon points="291,92 726,92 726,321 291,321" fill="#4b463e" />
                <rect x="578" y="146" width="105" height="175" fill="#191919" />
                <rect x="348" y="144" width="142" height="96" fill="#80745f" />
                <line x1="419" y1="144" x2="419" y2="240" stroke="#4b463e" />
                <line x1="348" y1="192" x2="490" y2="192" stroke="#4b463e" />
                <polygon points={toSvgPoints(DEFAULT_BOUNDARY)} fill="#67553d" />
                <path d="M206 613h538" stroke="#806b4c" strokeWidth="3" />
                <path d="M276 551h440" stroke="#806b4c" strokeWidth="2" />
                <path d="M338 481h344" stroke="#806b4c" strokeWidth="2" />
                <path d="M385 410h258" stroke="#806b4c" strokeWidth="2" />
                <path d="M180 650l111-329M780 650l-54-329" stroke="#806b4c" strokeWidth="2" />
                <polygon points={toSvgPoints(DEFAULT_REFERENCE)} fill="#f2eee5" />
              </g>
            )}

            <polygon className={styles.boundaryFill} points={toSvgPoints(boundary)} />
            <polyline
              className={styles.boundaryLine}
              points={`${toSvgPoints(boundary)} ${boundary[0].x},${boundary[0].y}`}
            />

            <polygon className={styles.referenceFill} points={toSvgPoints(reference)} />
            <polyline
              className={styles.referenceLine}
              points={`${toSvgPoints(reference)} ${reference[0].x},${reference[0].y}`}
            />
            <text
              className={styles.referenceLabel}
              x={reference[0].x - 10}
              y={reference[0].y + 38}
            >
              SCALE
            </text>

            {boundary.map((point, index) => renderHandle(point, index, "boundary"))}
            {reference.map((point, index) => renderHandle(point, index, "reference"))}
          </svg>

          <div className={styles.canvasNote}>
            <Info aria-hidden="true" />
            <span>
              Perspective-corrected using four points on one floor reference. An
              ordinary two-point line would not correct depth distortion.
            </span>
          </div>
          {uploadError ? <p className={styles.errorText}>{uploadError}</p> : null}
        </CardContent>
      </Card>

      <Card className={styles.resultCard}>
        <CardHeader className="border-b-2 border-ink-black bg-warm-cream/50 p-5">
          <div className={styles.resultHeading}>
            <div>
              <CardDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Current result
              </CardDescription>
              <CardTitle className="font-heading text-xl font-black uppercase tracking-tight text-ink-black">
                {initial?.roomName ?? "Living room"}
              </CardTitle>
            </div>
            <Badge variant="estimated" className="border-2 border-ink-black font-black uppercase shadow-[1px_1px_0px_#0A0A0A]">
              Manual estimate
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className={styles.areaResult} aria-live="polite">
            <strong>{safeArea ? safeArea.toFixed(1) : "—"}</strong>
            <span>square metres</span>
          </div>

          <div className={styles.referenceControl}>
            <Label htmlFor="reference-preset">Reference on the floor</Label>
            <Select
              value={preset}
              onValueChange={(value) => {
                setPreset(value as ReferencePreset);
                setReviewed(false);
              }}
            >
              <SelectTrigger id="reference-preset" className={styles.selectTrigger}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(referencePresets).map(([value, option]) => (
                  <SelectItem key={value} value={value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator className={styles.resultSeparator} />

          <div className={styles.claimControl}>
            <div>
              <Label htmlFor="claimed-area">Advertised area</Label>
              <p>Enter the size shown on the listing.</p>
            </div>
            <div className={styles.areaInputWrap}>
              <Input
                id="claimed-area"
                type="number"
                min="1"
                step="0.1"
                value={claimedArea}
                onChange={(event) => {
                  setClaimedArea(event.target.value);
                  setReviewed(false);
                }}
                aria-describedby="claimed-area-unit"
              />
              <span id="claimed-area-unit">m²</span>
            </div>
          </div>

          <div className={styles.comparison} data-tone={comparison.tone}>
            <span
              className={`${styles.comparisonIcon} ${
                comparison.tone === "good"
                  ? "bg-success-green"
                  : comparison.tone === "danger"
                    ? "bg-alert-red text-white"
                    : ""
              }`}
              aria-hidden="true"
            >
              {comparison.tone === "good" ? <Check /> : <Info />}
            </span>
            <div>
              <strong>{comparison.label}</strong>
              <p>
                {difference === null
                  ? "A comparison appears when both values are available."
                  : `${difference.toFixed(1)}% difference from the listing claim.`}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className={styles.resultFooter}>
          <Button
            type="button"
            variant="trust"
            size="lg"
            className={styles.reviewButton}
            disabled={!safeArea || saving || Boolean(onSave && !imageUrl)}
            onClick={async () => {
              if (!onSave) { setReviewed(true); return; }
              setSaving(true); setSaveError("");
              const normalize = (points: Point[]) => points.map((point) => ({ x: point.x / VIEWBOX_WIDTH, y: point.y / VIEWBOX_HEIGHT }));
              try {
                await onSave({ boundary: normalize(boundary), reference: { kind: preset === "marker" ? "calibration-marker" : preset, corners: normalize(reference) }, correctionCount, photo });
                setPhoto(null); setReviewed(true);
              } catch (err) { setSaveError(err instanceof Error ? err.message : "Could not save the measurement."); }
              finally { setSaving(false); }
            }}
          >
            {saving ? "Saving measurement…" : onSave ? "Save measurement" : "Review comparison"}
          </Button>
          {saveError && <p role="alert" className="text-destructive">{saveError}</p>}
          <p>
            {reviewed
              ? onSave ? "Room measurement saved to your listing." : "Comparison reviewed in this session."
              : "This demo result is an estimate, not a scout-verified measurement."}
          </p>
        </CardFooter>
      </Card>
      </fieldset>
    </div>
  );
}
