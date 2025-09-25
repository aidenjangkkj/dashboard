// src/lib/errors.ts
export function toMessage(e: unknown, fallback = "Unknown error"): string {
  if (e instanceof Error && e.message) return e.message;
  if (typeof e === "string") return e;
  try { return JSON.stringify(e); } catch { return fallback; }
}
