import { getAuth } from "@/lib/auth";
import { endpoint } from "@/lib/server/api";
export const runtime = "nodejs";
export function GET(request: Request) { return endpoint(() => getAuth().handler(request)); }
export function POST(request: Request) { return endpoint(() => getAuth().handler(request)); }
