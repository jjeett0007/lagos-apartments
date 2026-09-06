import { endpoint, json } from "@/lib/server/api";
import { requireUser } from "@/lib/server/session";
import { getDashboard } from "@/lib/server/dashboard";
export function GET(request: Request) { return endpoint(async () => json(await getDashboard((await requireUser(request, true)).id))); }
