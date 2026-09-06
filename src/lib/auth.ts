import "server-only";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { ConfigurationError, getDb } from "@/lib/server/db";

function createAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  const baseURL = process.env.BETTER_AUTH_URL;
  if (!secret || secret.length < 32 || !baseURL) {
    throw new ConfigurationError("Account services are not configured yet.");
  }
  return betterAuth({
    appName: "Eko Space",
    baseURL,
    secret,
    database: prismaAdapter(getDb(), { provider: "postgresql", transaction: true }),
    emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 60 },
    user: {
      additionalFields: {
        role: { type: "string", defaultValue: "SEEKER", input: false },
        onboardingCompletedAt: { type: "date", required: false, input: false },
      },
    },
  });
}
let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  return instance ??= createAuth();
}
