import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { readFile, readdir } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";

// The marker is enforced by Next at build time, not by this isolated route test.
mock.module("server-only", () => ({}));
const origin = "http://localhost:3199";
let database: PGlite;
let server: PGLiteSocketServer;
let db: ReturnType<typeof import("../src/lib/server/db").getDb>;
let auth: typeof import("../src/app/api/auth/[...all]/route");
let onboarding: typeof import("../src/app/api/onboarding/route");
let listings: typeof import("../src/app/api/listings/route");
let detail: typeof import("../src/app/api/listings/[id]/route");
let measurement: typeof import("../src/app/api/listings/[id]/rooms/[roomId]/measurement/route");
let submit: typeof import("../src/app/api/listings/[id]/submit/route");
let cookies = "";
let ownerId = "";
let listingId = "";
let roomId = "";
let otherCookie = "";
function request(path: string, data?: unknown, cookie = cookies, requestOrigin = origin, method = "POST") {
  return new Request(`${origin}${path}`, { method, headers: { "Content-Type": "application/json", Origin: requestOrigin, ...(cookie ? { Cookie: cookie } : {}) }, ...(data !== undefined ? { body: JSON.stringify(data) } : {}) });
}
const draft = { title: "Integration home", description: "A test draft", price: 2400000, areaName: "Yaba", publicAddress: "Yaba, Lagos", privateAddress: "PRIVATE ADDRESS MUST NOT LEAK", propertyType: "APARTMENT", leaseTerm: "YEARLY", rooms: [{ name: "Living room", roomType: "LIVING_ROOM" }] };
const ctx = () => ({ params: Promise.resolve({ id: listingId }) });

beforeAll(async () => {
  database = await PGlite.create();
  const migrations = new URL("../prisma/migrations/", import.meta.url);
  for (const entry of (await readdir(migrations, { withFileTypes: true })).filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    await database.exec(await readFile(new URL(`${entry.name}/migration.sql`, migrations), "utf8"));
  }
  server = new PGLiteSocketServer({ db: database, port: 55439, host: "127.0.0.1" });
  await server.start();
  process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:55439/postgres?sslmode=disable";
  process.env.BETTER_AUTH_URL = origin;
  process.env.BETTER_AUTH_SECRET = "isolated-test-secret-that-is-never-used-in-production-123456789";
  const { getDb } = await import("../src/lib/server/db"); db = getDb();
  auth = await import("../src/app/api/auth/[...all]/route");
  onboarding = await import("../src/app/api/onboarding/route");
  listings = await import("../src/app/api/listings/route");
  detail = await import("../src/app/api/listings/[id]/route");
  measurement = await import("../src/app/api/listings/[id]/rooms/[roomId]/measurement/route");
  submit = await import("../src/app/api/listings/[id]/submit/route");
}, 30000);
afterAll(async () => { if (db) await db.$disconnect(); if (server) await server.stop(); if (database) await database.close(); });

describe.serial("accounts, onboarding, and listing lifecycle", () => {
  test("creates a password account with a session but cannot inject ADMIN", async () => {
    const response = await auth.POST(request("/api/auth/sign-up/email", { email: "owner@example.test", password: "Test-password-2026!", name: "Test Owner", role: "ADMIN" }, ""));
    expect(response.status).toBe(200);
    cookies = response.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ");
    expect(cookies).toContain("session_token");
    expect(response.headers.getSetCookie().join(" ").toLowerCase()).toContain("httponly");
    const user = await db.user.findUniqueOrThrow({ where: { email: "owner@example.test" } }); ownerId = user.id;
    expect(user.role).toBe("SEEKER");
    const account = await db.account.findFirstOrThrow({ where: { userId: user.id } });
    expect(account.password).not.toBe("Test-password-2026!");
    expect(account.password?.length).toBeGreaterThan(50);
  });
  test("requires authentication and lister onboarding before writing", async () => {
    expect((await listings.POST(request("/api/listings", draft, ""))).status).toBe(401);
    expect((await listings.POST(request("/api/listings", draft))).status).toBe(403);
    expect((await onboarding.POST(request("/api/onboarding", { role: "ADMIN", name: "Test" }))).status).toBe(400);
    expect((await onboarding.POST(request("/api/onboarding", { role: "LISTER", name: "Test", listerKind: "AGENT" }, cookies, "https://evil.example"))).status).toBe(403);
  });
  test("persists onboarding and leaves new trust scores unassessed", async () => {
    const data = { role: "LISTER", name: "Test Owner", listerKind: "LANDLORD", preferredAreas: ["Yaba"] };
    const first = await onboarding.POST(request("/api/onboarding", data)); expect(first.status).toBe(200);
    expect((await onboarding.POST(request("/api/onboarding", data))).status).toBe(200);
    const user = await db.user.findUniqueOrThrow({ where: { id: ownerId }, include: { trustScore: true } });
    expect(user.onboardingCompletedAt).not.toBeNull(); expect(user.preferredAreas).toEqual(["Yaba"]);
    expect(user.trustScore?.score).toBeNull(); expect(user.role).toBe("LISTER");
  });
  test("creates and reloads a private draft; it is absent from public search", async () => {
    const response = await listings.POST(request("/api/listings", draft)); expect(response.status).toBe(201);
    const result = (await response.json()).data; listingId = result.id; roomId = result.rooms[0].id;
    expect(result.status).toBe("DRAFT"); expect(result.listerId).toBe(ownerId);
    const loaded = await detail.GET(request(`/api/listings/${listingId}`, undefined, cookies, origin, "GET"), ctx());
    expect(loaded.status).toBe(200); expect((await loaded.json()).data.rooms[0].id).toBe(roomId);
    const publicResponse = await listings.GET(request("/api/listings", undefined, "", origin, "GET"));
    expect((await publicResponse.json()).data.total).toBe(0);
  });
  test("a second lister cannot read, edit, archive, or measure another user's draft", async () => {
    const signup = await auth.POST(request("/api/auth/sign-up/email", { email: "other@example.test", password: "Another-test-password!", name: "Other" }, ""));
    expect(signup.status).toBe(200); otherCookie = signup.headers.getSetCookie().map((cookie) => cookie.split(";")[0]).join("; ");
    expect((await onboarding.POST(request("/api/onboarding", { role: "LISTER", name: "Other", listerKind: "AGENT" }, otherCookie))).status).toBe(200);
    expect((await detail.GET(request(`/api/listings/${listingId}`, undefined, otherCookie, origin, "GET"), ctx())).status).toBe(404);
    expect((await detail.PATCH(request(`/api/listings/${listingId}`, draft, otherCookie, origin, "PATCH"), ctx())).status).toBe(409);
    expect((await detail.DELETE(request(`/api/listings/${listingId}`, undefined, otherCookie, origin, "DELETE"), ctx())).status).toBe(404);
  });
  test("rejects room hijacking and cross-origin updates", async () => {
    const otherDraftResponse = await listings.POST(request("/api/listings", draft, otherCookie));
    expect(otherDraftResponse.status).toBe(201);
    const otherDraft = (await otherDraftResponse.json()).data;
    const forged = { ...draft, rooms: [{ id: otherDraft.rooms[0].id, name: "Hijacked room" }] };
    expect((await detail.PATCH(request(`/api/listings/${listingId}`, forged, cookies, origin, "PATCH"), ctx())).status).toBe(400);
    expect((await detail.PATCH(request(`/api/listings/${listingId}`, draft, cookies, "https://other.example", "PATCH"), ctx())).status).toBe(403);
    expect(await db.room.count({ where: { listingId } })).toBe(1);
    expect(await db.room.count({ where: { listingId: otherDraft.id } })).toBe(1);
  });
  test("requires photo evidence and complete measurements before submission", async () => {
    expect((await submit.POST(request(`/api/listings/${listingId}/submit`), ctx())).status).toBe(422);
    const evidence = { photoId: "not-uploaded", boundary: [{ x: 0.1, y: 0.1 }, { x: 0.9, y: 0.1 }, { x: 0.9, y: 0.9 }, { x: 0.1, y: 0.9 }], reference: { kind: "a4", corners: [{ x: 0.4, y: 0.4 }, { x: 0.5, y: 0.4 }, { x: 0.5, y: 0.5 }, { x: 0.4, y: 0.5 }] } };
    const context = { params: Promise.resolve({ id: listingId, roomId }) };
    expect((await measurement.PUT(request("/measurement", evidence, cookies, origin, "PUT"), context)).status).toBe(422);
    // External storage is outside this test; insert its server-owned photo record.
    const photo = await db.photo.create({ data: { listingId, roomId, url: "https://res.cloudinary.com/test/image/upload/test.jpg", storageKey: "integration-photo" } });
    expect((await measurement.PUT(request("/measurement", evidence, cookies, origin, "PUT"), context)).status).toBe(409);
    evidence.photoId = photo.id;
    expect((await measurement.PUT(request("/measurement", evidence, otherCookie, origin, "PUT"), context)).status).toBe(409);
    const response = await measurement.PUT(request("/measurement", evidence, cookies, origin, "PUT"), context);
    expect(response.status).toBe(200);
    const room = (await response.json()).data; expect(Number(room.areaSqm)).toBeCloseTo(3.99, 2);
    expect(room.confidence).toBeNull(); expect(room.verificationStatus).toBe("MANUAL_ESTIMATED");
    expect(await db.roomMeasurement.count({ where: { roomId } })).toBe(1);
    const submitted = await submit.POST(request(`/api/listings/${listingId}/submit`), ctx());
    expect(submitted.status).toBe(200); expect((await submitted.json()).data.status).toBe("IN_REVIEW");
    expect((await detail.PATCH(request(`/api/listings/${listingId}`, draft, cookies, origin, "PATCH"), ctx())).status).toBe(409);
  });
  test("public responses contain only published safe fields and preserve unknown confidence", async () => {
    await db.listing.update({ where: { id: listingId }, data: { status: "PUBLISHED", publishedAt: new Date() } });
    const response = await listings.GET(request("/api/listings?minSqm=3", undefined, "", origin, "GET"));
    expect(response.status).toBe(200);
    const result = (await response.json()).data; expect(result.total).toBe(1);
    const item = result.listings[0]; expect(item.confidence).toBeNull(); expect(item.totalSqm).toBe(3.99);
    expect(JSON.stringify(item)).not.toContain("PRIVATE ADDRESS"); expect(JSON.stringify(item)).not.toContain("owner@example.test");
    expect(item).not.toHaveProperty("privateAddress"); expect(item.lister.trustScore).toBeNull();
  });
  test("saved listings persist and archiving removes public visibility", async () => {
    const saved = await import("../src/app/api/listings/[id]/saved/route");
    expect((await saved.PUT(request(`/api/listings/${listingId}/saved`, undefined, cookies, origin, "PUT"), ctx())).status).toBe(200);
    const response = await saved.GET(request(`/api/listings/${listingId}/saved`, undefined, cookies, origin, "GET"), ctx());
    expect((await response.json()).data.saved).toBe(true);
    expect((await saved.DELETE(request(`/api/listings/${listingId}/saved`, undefined, cookies, origin, "DELETE"), ctx())).status).toBe(200);
    expect(await db.savedListing.count({ where: { userId: ownerId, listingId } })).toBe(0);
    expect((await detail.DELETE(request(`/api/listings/${listingId}`, undefined, cookies, origin, "DELETE"), ctx())).status).toBe(200);
    const hidden = await listings.GET(request("/api/listings", undefined, "", origin, "GET"));
    expect((await hidden.json()).data.total).toBe(0);
  });
  test("sign-out revokes access; password sign-in restores it", async () => {
    expect((await auth.POST(request("/api/auth/sign-out", {}))).status).toBe(200);
    expect((await detail.GET(request(`/api/listings/${listingId}`, undefined, cookies, origin, "GET"), ctx())).status).toBe(401);
    const wrong = await auth.POST(request("/api/auth/sign-in/email", { email: "owner@example.test", password: "Wrong-password-2026!" }, ""));
    expect(wrong.status).toBe(401);
    const signedIn = await auth.POST(request("/api/auth/sign-in/email", { email: "owner@example.test", password: "Test-password-2026!" }, ""));
    expect(signedIn.status).toBe(200);
  });
});
