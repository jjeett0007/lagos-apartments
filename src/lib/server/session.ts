import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getDb } from "./db";
import { ApiError } from "./api";

export const profileSelect = {
  id: true, email: true, name: true, phone: true, role: true,
  onboardingCompletedAt: true, listerKind: true, companyName: true,
  preferredAreas: true, budgetMax: true, preferredLeaseTerm: true,
} as const;

export async function currentUser(requestHeaders: Headers) {
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) return null;
  return getDb().user.findUnique({ where: { id: session.user.id }, select: profileSelect });
}
export async function requireUser(request: Request, lister = false) {
  const user = await currentUser(request.headers);
  if (!user) throw new ApiError(401, "Sign in to continue.");
  if (lister && (!user.onboardingCompletedAt || user.role !== "LISTER")) {
    throw new ApiError(403, "Complete lister onboarding to manage properties.");
  }
  return user;
}
export async function pageUser(lister = false) {
  const user = await currentUser(await headers());
  if (!user) redirect("/sign-in");
  if (!user.onboardingCompletedAt || (lister && user.role !== "LISTER")) redirect("/onboarding");
  return user;
}
