import { calibratedPolygonArea, createPlanarHomography, polygonArea, type Point } from "./geometry";
import { measurementSchema } from "./validation";

function cross(a: Point, b: Point, c: Point) {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}
function validPolygon(points: Point[]) {
  if (polygonArea(points) < 1e-6) return false;
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length];
    if (Math.hypot(a.x - b.x, a.y - b.y) < 1e-6) return false;
    for (let j = i + 2; j < points.length; j++) {
      if (i === 0 && j === points.length - 1) continue;
      const c = points[j], d = points[(j + 1) % points.length];
      if (cross(a, b, c) * cross(a, b, d) <= 0 && cross(c, d, a) * cross(c, d, b) <= 0) return false;
    }
  }
  return true;
}
export function calculateMeasurement(raw: unknown) {
  const input = measurementSchema.parse(raw);
  const sizes = { a4: { widthMeters: 0.297, heightMeters: 0.21 }, a3: { widthMeters: 0.42, heightMeters: 0.297 }, "calibration-marker": { widthMeters: 0.6, heightMeters: 0.6 } };
  const reference = { ...input.reference, ...sizes[input.reference.kind] };
  const fail = () => { throw new Error("Adjust the room and reference corners to form valid floor outlines."); };
  if (!validPolygon(input.boundary) || !validPolygon(reference.corners)) return fail();
  const turns = reference.corners.map((p, i, all) => cross(p, all[(i + 1) % 4], all[(i + 2) % 4]));
  if (!turns.every((v) => v > 1e-9) && !turns.every((v) => v < -1e-9)) return fail();
  const h = createPlanarHomography(reference.corners, [{ x: 0, y: 0 }, { x: reference.widthMeters, y: 0 }, { x: reference.widthMeters, y: reference.heightMeters }, { x: 0, y: reference.heightMeters }]);
  if (!h) return fail();
  // A floor crossing the projective horizon has no finite physical area.
  const denominators = [...input.boundary, ...reference.corners].map((p) => h[6] * p.x + h[7] * p.y + h[8]);
  if (!denominators.every((v) => v > 1e-8) && !denominators.every((v) => v < -1e-8)) return fail();
  const area = calibratedPolygonArea(input.boundary, reference.corners, reference);
  if (area === null || !Number.isFinite(area) || area < 0.1 || area > 10000) return fail();
  return { ...input, reference, areaSqm: Math.round(area * 100) / 100 };
}
