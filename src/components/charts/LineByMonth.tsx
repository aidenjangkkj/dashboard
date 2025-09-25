// dashboard/src/components/charts/LineByMonth.tsx

"use client";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { GhgEmission } from "@/lib/types";
import { useUiStore } from "@/store/useUiStore";
import { scaleUnit } from "@/lib/format";

export default function LineByMonth({ data }: { data: GhgEmission[] | undefined | null }) {
  const unit = useUiStore((s) => s.unit);

  const dataSafe = Array.isArray(data) ? data : [];
  
  const byMonth = Object.values(
    dataSafe.reduce<Record<string, { yearMonth: string; emissions: number }>>((acc, e) => {
      const ym = e?.yearMonth ?? "";
      const val = e?.emissions ?? 0;
      if (!ym) return acc;
      acc[ym] ||= { yearMonth: ym, emissions: 0 };
      acc[ym].emissions += val;
      return acc;
    }, {})
  ).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

  const rows = byMonth.map((d) => ({
    yearMonth: d.yearMonth,
    emissions: scaleUnit(d?.emissions ?? 0, unit),
  }));

  if (!rows.length) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow-sm">
        <h2 className="mb-2 font-medium">월별 배출량 추이</h2>
        <div className="text-sm text-neutral-500">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm">
      <h2 className="mb-2 font-medium">월별 배출량 추이</h2>
      <div className="h-72">
        <ResponsiveContainer>
          <LineChart data={rows}>
            <defs>
              <linearGradient id="lineColor" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(79,70,229)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="rgb(79,70,229)" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="yearMonth" tickMargin={8} />
            <YAxis tickFormatter={(v) => Number(v ?? 0).toLocaleString()} />
            <Tooltip formatter={(v: any) => `${Number(v ?? 0).toLocaleString()} ${unit}`} />
            <Line type="monotone" dataKey="emissions" stroke="url(#lineColor)" strokeWidth={2} dot={{ r: 2 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
