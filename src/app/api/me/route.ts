import { endpoint, json } from "@/lib/server/api";
import { requireUser } from "@/lib/server/session";
export function GET(request: Request) { return endpoint(async () => json(await requireUser(request))); }
