// Disposable local QA only. Never reads or writes the configured production database.
import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import { readFile, readdir } from "node:fs/promises";
const db = await PGlite.create();
const migrations = new URL("../prisma/migrations/", import.meta.url);
  for (const entry of (await readdir(migrations, { withFileTypes: true })).filter((entry) => entry.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    await db.exec(await readFile(new URL(`${entry.name}/migration.sql`, migrations), "utf8"));
  }
const server = new PGLiteSocketServer({ db, port: 55440, host: "127.0.0.1", maxConnections: 5 });
await server.start();
const app = Bun.spawn(["node", "node_modules/next/dist/bin/next", "start", "--port", "3105"], {
  cwd: new URL("..", import.meta.url).pathname,
  env: { ...process.env, DATABASE_URL: "postgresql://postgres:postgres@127.0.0.1:55440/postgres?sslmode=disable", BETTER_AUTH_URL: "http://localhost:3105", BETTER_AUTH_SECRET: "disposable-local-qa-secret-not-used-for-real-accounts-123456", CLOUDINARY_URL: "" },
  stdout: "inherit", stderr: "inherit",
});
async function stop() { app.kill(); await server.stop(); await db.close(); process.exit(0); }
process.on("SIGINT", stop); process.on("SIGTERM", stop);
await app.exited;
await server.stop(); await db.close();
