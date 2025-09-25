// src/lib/errors.ts
export function toMessage(e: unknown, fallback = "Unknown error") {
  return e instanceof Error ? e.message : typeof e === "string" ? e : fallback;
}
