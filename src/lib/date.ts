// src/lib/date.ts
export function inYearMonthRange(ym: string, from?: string | null, to?: string | null) {
  if (!ym) return false;
  const v = ym.replace(/-/g, "");
  const f = from ? from.replace(/-/g, "") : null;
  const t = to ? to.replace(/-/g, "") : null;
  if (f && v < f) return false;
  if (t && v > t) return false;
  return true;
}
