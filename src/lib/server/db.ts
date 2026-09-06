import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

export class ConfigurationError extends Error {}
const globalDb = globalThis as unknown as { ekoPrisma?: PrismaClient };

export function getDb() {
  if (globalDb.ekoPrisma) return globalDb.ekoPrisma;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new ConfigurationError("Database is not configured yet.");
  const adapter = new PrismaPg({ connectionString, max: 5, connectionTimeoutMillis: 5000, idleTimeoutMillis: 30000 });
  globalDb.ekoPrisma = new PrismaClient({ adapter });
  return globalDb.ekoPrisma;
}
