import { describe, expect, test } from "bun:test";
import { onboardingSchema, draftSchema, listingQuerySchema, measurementSchema } from "../src/lib/validation";
import { calculateMeasurement } from "../src/lib/measurement-validation";

const floor = [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 }, { x: 0.9, y: 0.9 }, { x: 0.1, y: 0.9 }];
const reference = { kind: "a4", corners: [{ x: 0.4, y: 0.4 }, { x: 0.5, y: 0.4 }, { x: 0.5, y: 0.5 }, { x: 0.4, y: 0.5 }] };
const draft = { title: "Test home", price: 2500000, areaName: "Yaba", publicAddress: "Yaba, Lagos", privateAddress: "12 Test Street", propertyType: "APARTMENT", leaseTerm: "YEARLY", rooms: [{ name: "Living room" }] };

describe("request validation", () => {
  test("onboarding cannot self-assign privileged roles", () => {
    for (const role of ["ADMIN", "MODERATOR", "SCOUT"]) expect(onboardingSchema.safeParse({ role, name: "Test" }).success).toBe(false);
    expect(onboardingSchema.safeParse({ role: "LISTER", name: "Test" }).success).toBe(false);
    expect(onboardingSchema.safeParse({ role: "LISTER", name: "Test", listerKind: "AGENT" }).success).toBe(true);
  });
  test("rejects status, owner, confidence, and verification injection", () => {
    for (const field of ["status", "listerId", "verificationStatus", "measurementConfidence"]) expect(draftSchema.safeParse({ ...draft, [field]: "PUBLISHED" }).success).toBe(false);
    expect(measurementSchema.safeParse({ boundary: floor, reference, areaSqm: 999, confidence: 1 }).success).toBe(false);
  });
  test("rejects invalid prices, empty rooms, repeated room IDs and unbounded queries", () => {
    expect(draftSchema.safeParse({ ...draft, price: -10 }).success).toBe(false);
    expect(draftSchema.safeParse({ ...draft, rooms: [] }).success).toBe(false);
    expect(draftSchema.safeParse({ ...draft, rooms: [{ id: "same", name: "A" }, { id: "same", name: "B" }] }).success).toBe(false);
    for (const params of [{ limit: "1000" }, { page: "0" }, { page: "1.5" }, { maxPrice: "garbage" }, { status: "DRAFT" }]) expect(listingQuerySchema.safeParse(params).success).toBe(false);
    expect(listingQuerySchema.parse({ maxPrice: "0" }).maxPrice).toBe(0);
  });
});
describe("server-calculated measurements", () => {
  test("uses known reference dimensions and recomputes metric area", () => {
    const result = calculateMeasurement({ boundary: floor, reference });
    expect(result.areaSqm).toBeCloseTo(3.99, 2);
    expect(result.reference.widthMeters).toBe(0.297);
  });
  test("rejects crossed floor edges, duplicate corners, and collapsed markers", () => {
    expect(() => calculateMeasurement({ boundary: [floor[0], floor[2], floor[1], floor[3]], reference })).toThrow();
    expect(() => calculateMeasurement({ boundary: [floor[0], floor[0], floor[1], floor[2]], reference })).toThrow();
    expect(() => calculateMeasurement({ boundary: floor, reference: { ...reference, corners: [floor[0], floor[0], floor[0], floor[0]] } })).toThrow();
  });
});
