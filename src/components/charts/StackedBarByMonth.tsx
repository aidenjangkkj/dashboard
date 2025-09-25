// src/components/charts/StackedBarByMonth.tsx
"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { GhgEmission } from "@/lib/types";
import { useUiStore } from "@/store/useUiStore";
import { scaleUnit } from "@/lib/format";
import type { MonthStackRow } from "@/lib/types";
import { colorsBySource } from "@/lib/colors";

export default function StackedBarByMonth({
  data,
}: {
  data: GhgEmission[] | null | undefined;
}) {
  const unit = useUiStore((s) => s.unit);
  const safe: GhgEmission[] = Array.isArray(data) ? data : [];

  // 월 x 소스 누적 집계
  const map = safe.reduce<Record<string, Record<string, number>>>((acc, e) => {
    const ym = e?.yearMonth ?? "";
    const src = e?.source ?? "etc";
    const val = e?.emissions ?? 0;
    if (!ym) return acc;
    acc[ym] ??= {};
    acc[ym][src] = (acc[ym][src] ?? 0) + val;
    return acc;
  }, {});

  const months = Object.keys(map).sort((a, b) => a.localeCompare(b));
  const sourceKeys = Array.from(
    new Set(months.flatMap((m) => Object.keys(map[m])))
  );

  const rows: MonthStackRow[] = months.map((ym) => {
    const row: MonthStackRow = { yearMonth: ym };
    for (const k of sourceKeys) {
      row[k] = scaleUnit(map[ym][k] ?? 0, unit);
    }
    return row;
  });

  const tooltipFormatter = (value: ValueType, name?: NameType) => {
    const num = Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);
    return [`${num.toLocaleString()} ${unit}`, String(name ?? "")] as [string, string];
  };

  if (!rows.length) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow-sm">
        <h2 className="mb-2 font-medium">소스별 누적 막대 (월)</h2>
        <div className="text-sm text-neutral-500">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm">
      <h2 className="mb-2 font-medium">소스별 누적 막대 (월)</h2>
      <div className="h-80">
        <ResponsiveContainer>
          <BarChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="yearMonth" tickMargin={8} />
            <YAxis tickFormatter={(v: number) => Number(v ?? 0).toLocaleString()} />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            {sourceKeys.map((k) => (
              <Bar key={k} dataKey={k} stackId="a" fill={colorsBySource[k] ?? "#6366f1"} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
