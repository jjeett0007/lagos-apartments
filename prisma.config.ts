import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  // Generation and migration SQL preparation work before credentials are supplied.
  datasource: { url: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://localhost:5432/eko_space" },
});
