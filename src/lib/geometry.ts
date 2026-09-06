export type Point = {
  x: number;
  y: number;
};

export type ReferenceSize = {
  widthMeters: number;
  heightMeters: number;
};

type Homography = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

const EPSILON = 1e-9;

export function polygonArea(points: readonly Point[]) {
  if (points.length < 3) return 0;

  const doubledArea = points.reduce((sum, point, index) => {
    const next = points[(index + 1) % points.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0);

  return Math.abs(doubledArea) / 2;
}

function solveLinearSystem(matrix: number[][]) {
  const size = matrix.length;

  for (let column = 0; column < size; column += 1) {
    let pivot = column;

    for (let row = column + 1; row < size; row += 1) {
      if (Math.abs(matrix[row][column]) > Math.abs(matrix[pivot][column])) {
        pivot = row;
      }
    }

    if (Math.abs(matrix[pivot][column]) < EPSILON) return null;

    [matrix[column], matrix[pivot]] = [matrix[pivot], matrix[column]];
    const divisor = matrix[column][column];

    for (let entry = column; entry <= size; entry += 1) {
      matrix[column][entry] /= divisor;
    }

    for (let row = 0; row < size; row += 1) {
      if (row === column) continue;
      const factor = matrix[row][column];

      for (let entry = column; entry <= size; entry += 1) {
        matrix[row][entry] -= factor * matrix[column][entry];
      }
    }
  }

  return matrix.map((row) => row[size]);
}

export function createPlanarHomography(
  source: readonly Point[],
  destination: readonly Point[],
): Homography | null {
  if (source.length !== 4 || destination.length !== 4) return null;

  const equations: number[][] = [];

  source.forEach((point, index) => {
    const target = destination[index];
    equations.push([
      point.x,
      point.y,
      1,
      0,
      0,
      0,
      -target.x * point.x,
      -target.x * point.y,
      target.x,
    ]);
    equations.push([
      0,
      0,
      0,
      point.x,
      point.y,
      1,
      -target.y * point.x,
      -target.y * point.y,
      target.y,
    ]);
  });

  const solution = solveLinearSystem(equations);
  if (!solution || solution.length !== 8) return null;

  return [
    solution[0],
    solution[1],
    solution[2],
    solution[3],
    solution[4],
    solution[5],
    solution[6],
    solution[7],
    1,
  ];
}

export function transformPoint(point: Point, matrix: Homography): Point | null {
  const denominator = matrix[6] * point.x + matrix[7] * point.y + matrix[8];
  if (Math.abs(denominator) < EPSILON) return null;

  return {
    x: (matrix[0] * point.x + matrix[1] * point.y + matrix[2]) / denominator,
    y: (matrix[3] * point.x + matrix[4] * point.y + matrix[5]) / denominator,
  };
}

export function calibratedPolygonArea(
  polygon: readonly Point[],
  referenceCorners: readonly Point[],
  reference: ReferenceSize,
) {
  const referencePlane = [
    { x: 0, y: 0 },
    { x: reference.widthMeters, y: 0 },
    { x: reference.widthMeters, y: reference.heightMeters },
    { x: 0, y: reference.heightMeters },
  ];
  const homography = createPlanarHomography(referenceCorners, referencePlane);
  if (!homography) return null;

  const calibrated = polygon.map((point) => transformPoint(point, homography));
  if (calibrated.some((point) => point === null)) return null;

  return polygonArea(calibrated as Point[]);
}

export function percentageDifference(measured: number, claimed: number) {
  if (claimed <= 0) return null;
  return (Math.abs(measured - claimed) / claimed) * 100;
}
