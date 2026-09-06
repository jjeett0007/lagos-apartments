import "server-only";
import { ZodError, type ZodType } from "zod";
import { ConfigurationError } from "./db";

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export function json(data: unknown, status = 200) {
  return Response.json({ data }, { status, headers: { "Cache-Control": "no-store" } });
}
export function apiError(error: unknown): Response {
  let status = 500;
  let message = "We could not complete that request. Please try again.";
  if (error instanceof ApiError) { status = error.status; message = error.message; }
  else if (error instanceof ZodError) { status = 400; message = error.issues.map((i) => `${i.path.join(".") || "Request"}: ${i.message}`).join("; "); }
  else if (error instanceof ConfigurationError) { status = 503; message = error.message; }
  else if (error && typeof error === "object" && "code" in error) {
    if (error.code === "P2002") { status = 409; message = "This record already exists."; }
    else if (error.code === "P2025") { status = 404; message = "Record not found."; }
    else if (["P1001", "P1002", "P2021", "P2022", "ECONNREFUSED"].includes(String(error.code))) {
      status = 503; message = "The database is unavailable or has not been initialized.";
    }
  }
  // Never return provider messages, connection strings, queries, or credentials.
  return Response.json({ error: { message } }, { status, headers: { "Cache-Control": "no-store" } });
}
export async function endpoint(action: () => Promise<Response>) {
  try { return await action(); } catch (error) { return apiError(error); }
}
export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const configured = process.env.BETTER_AUTH_URL;
  if (!configured) throw new ConfigurationError("Account services are not configured yet.");
  if (origin !== new URL(configured).origin) throw new ApiError(403, "Request origin is not allowed.");
}
export async function body<T>(request: Request, schema: ZodType<T>): Promise<T> {
  assertSameOrigin(request);
  if (!request.headers.get("content-type")?.includes("application/json")) throw new ApiError(415, "Send a JSON request.");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Request body is required.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > 256 * 1024) { await reader.cancel(); throw new ApiError(413, "Request is too large."); }
    chunks.push(value);
  }
  let parsed: unknown;
  try { parsed = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { throw new ApiError(400, "Request contains invalid JSON."); }
  return schema.parse(parsed);
}
