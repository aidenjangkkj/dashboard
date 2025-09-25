"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import type { GhgEmission } from "@/lib/types";
import { colorForSource } from "@/lib/colors";
import { useUiStore } from "@/store/useUiStore";
import { scaleUnit } from "@/lib/format";

export default function StackedBarByMonth({
  data,
  variant = "absolute",
}: {
  data: GhgEmission[] | null | undefined;
  variant?: "absolute" | "percent";
}) {
  const unit = useUiStore((s) => s.unit);
  const isPercent = variant === "percent";
  const dataSafe = Array.isArray(data) ? data : [];

  const sourcesSet = new Set<string>();
  const byYM: Record<string, Record<string, number>> = {};

  for (const e of dataSafe) {
    const src = e?.source ?? "unknown";
    const ym = e?.yearMonth ?? "";
    const val = e?.emissions ?? 0;
    if (!ym) continue;
    sourcesSet.add(src);
    byYM[ym] ||= {};
    byYM[ym][src] = (byYM[ym][src] ?? 0) + val;
  }

  const sources = Array.from(sourcesSet);
  const rows = Object.keys(byYM)
    .sort((a, b) => a.localeCompare(b))
    .map((ym) => {
      const row: Record<string, number | string> = { yearMonth: ym };
      let sum = 0;
      for (const s of sources) {
        const raw = byYM[ym][s] ?? 0;
        const scaled = scaleUnit(raw, unit);
        row[s] = scaled;
        sum += scaled;
      }
      if (isPercent && sum > 0) {
        for (const s of sources) {
          row[s] = Number((((row[s] as number) / sum) * 100).toFixed(2));
        }
      }
      return row;
    });

  if (!rows.length) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow-sm">
        <h2 className="font-medium">월별 소스별 {isPercent ? "비중(%)" : `배출량 (${unit})`}</h2>
        <div className="text-sm text-neutral-500 mt-1">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-medium">월별 소스별 {isPercent ? "비중(%)" : `배출량 (${unit})`}</h2>
      </div>
      <div className="h-80">
        <ResponsiveContainer>
          <BarChart data={rows} stackOffset={isPercent ? "expand" : "none"} margin={{ top: 8, right: 20, bottom: 32, left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="yearMonth" tickMargin={8} />
            <YAxis
              tickFormatter={(v) => (isPercent ? `${Number(v ?? 0)}%` : Number(v ?? 0).toLocaleString())}
              domain={isPercent ? [0, 100] : ["auto", "auto"]}
            />
            <Tooltip
              formatter={(value: any, name: any) => {
                const v = typeof value === "number" ? value : Number(value ?? 0);
                return isPercent
                  ? [`${v.toFixed(1)} %`, String(name ?? "")]
                  : [`${v.toLocaleString()} ${unit}`, String(name ?? "")];
              }}
              labelFormatter={(label: any) => `월: ${label ?? ""}`}
            />
            <Legend verticalAlign="bottom" height={36} />
            {sources.map((s, i) => (
              <Bar key={s} dataKey={s} stackId="emissions" fill={colorForSource(s, i)} isAnimationActive={false} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
