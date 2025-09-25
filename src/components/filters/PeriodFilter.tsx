// src/components/filters/PeriodFilter.tsx
"use client";
import { useUiStore } from "@/store/useUiStore";

export default function PeriodFilter() {
  const { periodFrom, periodTo, setPeriod } = useUiStore();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="text-sm text-neutral-600">기간</label>
      <input
        type="month"
        value={periodFrom ?? ""}
        onChange={(e) => setPeriod(e.target.value || null, periodTo)}
        className="border rounded-md p-1 text-sm"
      />
      <span className="text-neutral-400">~</span>
      <input
        type="month"
        value={periodTo ?? ""}
        onChange={(e) => setPeriod(periodFrom, e.target.value || null)}
        className="border rounded-md p-1 text-sm"
      />
      {(periodFrom || periodTo) && (
        <button
          onClick={() => setPeriod(null, null)}
          className="border rounded-md px-2 py-1 text-sm"
        >
          초기화
        </button>
      )}
    </div>
  );
}
