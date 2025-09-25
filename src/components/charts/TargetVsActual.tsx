"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { useMemo } from "react";
import { useDataStore } from "@/store/useDataStore";
import { useUiStore } from "@/store/useUiStore";
import { inYearMonthRange } from "@/lib/date";
import { scaleUnit, fmtNumber } from "@/lib/format";

type Row = { yearMonth: string; actual: number; target: number };

export default function TargetVsActual() {
  const { companies } = useDataStore();
  const { unit, periodFrom, periodTo, target } = useUiStore();

  const companiesSafe = Array.isArray(companies) ? companies : [];

  const series: Row[] = useMemo(() => {
    const map = new Map<string, number>(); // ym -> sum raw
    for (const c of companiesSafe) {
      for (const e of c?.emissions ?? []) {
        const ym = e?.yearMonth ?? "";
        if (!ym || !inYearMonthRange(ym, periodFrom ?? null, periodTo ?? null)) continue;
        map.set(ym, (map.get(ym) ?? 0) + (e?.emissions ?? 0));
      }
    }
    const yms = Array.from(map.keys()).sort((a, b) => a.localeCompare(b));
    if (!yms.length) return [];

    const baselineYear = target?.baselineYear ?? new Date().getFullYear();
    const targetYear = target?.targetYear ?? baselineYear + 5;
    const reduction = Math.max(0, Math.min(100, target?.reductionPct ?? 0)) / 100;

    const baselineMonths = yms.filter((ym) => ym.startsWith(String(baselineYear)));
    const baselineAvgRaw =
      baselineMonths.length > 0
        ? baselineMonths.reduce((a, ym) => a + (map.get(ym) ?? 0), 0) / baselineMonths.length
        : (Array.from(map.values()).reduce((a, v) => a + (v ?? 0), 0) / Math.max(1, yms.length)); // fallback: 전체 평균

    const startIndex = yms.findIndex((ym) => ym.startsWith(String(baselineYear)));
    const endIndex = yms.findIndex((ym) => ym.startsWith(String(targetYear)));
    const startIdx = startIndex >= 0 ? startIndex : 0;
    const lastIdx = endIndex >= 0 ? endIndex : yms.length - 1;
    const span = Math.max(1, lastIdx - startIdx);

    return yms.map((ym, idx) => {
      const actualScaled = scaleUnit(map.get(ym) ?? 0, unit);
      const t = Math.min(1, Math.max(0, (idx - startIdx) / span));
      const targetRaw = baselineAvgRaw * (1 - reduction * t);
      const targetScaled = scaleUnit(targetRaw ?? 0, unit);
      return { yearMonth: ym, actual: actualScaled, target: targetScaled };
    });
  }, [companiesSafe, unit, periodFrom, periodTo, target?.baselineYear, target?.targetYear, target?.reductionPct]);

  if (!series.length) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow-sm">
        <h2 className="font-medium">목표 대비 추이</h2>
        <div className="text-sm text-neutral-500 mt-1">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium">목표 대비 추이</h2>
      </div>
      <div className="h-80">
        <ResponsiveContainer>
          <LineChart data={series} margin={{ top: 8, right: 20, bottom: 24, left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="yearMonth" tickMargin={8} />
            <YAxis tickFormatter={(v) => fmtNumber(Number(v ?? 0))} />
            <Tooltip
              formatter={(v: any, n: any) => [`${fmtNumber(Number(v ?? 0))} ${unit}`, String(n ?? "")]}
              labelFormatter={(l) => `월: ${String(l ?? "")}`}
            />
            <Legend />
            <Line type="monotone" dataKey="actual" name={`실측 (${unit})`} stroke="#2563eb" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="target" name={`목표 (${unit})`} stroke="#f97316" strokeDasharray="6 4" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-neutral-500">
        기준연도 평균을 기준으로 목표연도까지 {(useUiStore.getState().target?.reductionPct ?? 0)}% 선형 감축선을 표시합니다.
      </p>
    </div>
  );
}
