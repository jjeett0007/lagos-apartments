import { describe, expect, test } from "bun:test";
import {
  calibratedPolygonArea,
  createPlanarHomography,
  percentageDifference,
  polygonArea,
  transformPoint,
} from "./geometry";

describe("measurement geometry", () => {
  test("calculates a polygon area", () => {
    expect(
      polygonArea([
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
        { x: 0, y: 3 },
      ]),
    ).toBe(12);
  });

  test("maps an image plane to metric coordinates", () => {
    const source = [
      { x: 10, y: 20 },
      { x: 30, y: 20 },
      { x: 30, y: 40 },
      { x: 10, y: 40 },
    ];
    const destination = [
      { x: 0, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 2 },
      { x: 0, y: 2 },
    ];
    const homography = createPlanarHomography(source, destination);

    expect(homography).not.toBeNull();
    const mapped = transformPoint({ x: 20, y: 30 }, homography!);
    expect(mapped?.x).toBeCloseTo(1, 10);
    expect(mapped?.y).toBeCloseTo(1, 10);
  });

  test("calculates area using a four-corner scale reference", () => {
    const area = calibratedPolygonArea(
      [
        { x: 0, y: 0 },
        { x: 400, y: 0 },
        { x: 400, y: 300 },
        { x: 0, y: 300 },
      ],
      [
        { x: 100, y: 100 },
        { x: 200, y: 100 },
        { x: 200, y: 200 },
        { x: 100, y: 200 },
      ],
      { widthMeters: 1, heightMeters: 1 },
    );

    expect(area).toBeCloseTo(12, 6);
  });

  test("compares measured and claimed areas", () => {
    expect(percentageDifference(12.6, 13)).toBeCloseTo(3.0769, 3);
    expect(percentageDifference(12.6, 0)).toBeNull();
  });
});
