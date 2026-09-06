import { endpoint, json, body, ApiError } from "@/lib/server/api";
import { requireUser, profileSelect } from "@/lib/server/session";
import { getDb } from "@/lib/server/db";
import { onboardingSchema } from "@/lib/validation";
export function POST(request: Request) {
  return endpoint(async () => {
    const user = await requireUser(request);
    const input = await body(request, onboardingSchema);
    if (!["SEEKER", "LISTER"].includes(user.role)) throw new ApiError(403, "This account role is managed by an administrator.");
    const profile = await getDb().$transaction(async (tx) => {
      // Listers retain listing access when updating their seeker preferences.
      const role = user.role === "LISTER" ? "LISTER" : input.role;
      const result = await tx.user.update({ where: { id: user.id }, data: {
        name: input.name, phone: input.phone || null, role,
        ...(input.role === "LISTER" ? { listerKind: input.listerKind, companyName: input.companyName || null } : {}),
        preferredAreas: input.preferredAreas, budgetMax: input.budgetMax, preferredLeaseTerm: input.preferredLeaseTerm,
        onboardingCompletedAt: user.onboardingCompletedAt ?? new Date(),
      }, select: profileSelect });
      if (role === "LISTER") await tx.trustScore.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
      return result;
    });
    return json(profile);
  });
}
