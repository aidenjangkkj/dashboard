"use client";
import {
  PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend, type PieLabelRenderProps,
} from "recharts";
import { GhgEmission } from "@/lib/types";
import { colorForSource } from "@/lib/colors";
import { useUiStore } from "@/store/useUiStore";
import { scaleUnit } from "@/lib/format";

type Slice = { name: string; value: number };

export default function PieBySource({ data }: { data: GhgEmission[] | null | undefined }) {
  const unit = useUiStore((s) => s.unit);
  const dataSafe = Array.isArray(data) ? data : [];

  const bySourceRaw: Slice[] = Object.values(
    dataSafe.reduce<Record<string, Slice>>((acc, e) => {
      const src = e?.source ?? "unknown";
      const val = e?.emissions ?? 0;
      acc[src] ||= { name: src, value: 0 };
      acc[src].value += val;
      return acc;
    }, {})
  ).sort((a, b) => (b?.value ?? 0) - (a?.value ?? 0));

  const bySource: Slice[] = bySourceRaw.map((s) => ({
    name: s?.name ?? "unknown",
    value: scaleUnit(s?.value ?? 0, unit),
  }));

  const total = bySource.reduce((a, b) => a + (b?.value ?? 0), 0) || 1;

  const renderLabel = (props: PieLabelRenderProps) => {
    const raw = props?.value as number | string | undefined;
    const v = typeof raw === "number" ? raw : Number(raw ?? 0);
    const name = (props?.payload as any)?.name ?? "";
    const pct = Math.round((v / total) * 100);
    return `${name} ${pct}%`;
  };

  if (!bySource.length) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow-sm">
        <h2 className="mb-2 font-medium">소스별 비중</h2>
        <div className="text-sm text-neutral-500">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm">
      <h2 className="mb-2 font-medium">소스별 비중</h2>
      <div className="h-72">
        <ResponsiveContainer>
          <PieChart margin={{ top: 8, right: 20, bottom: 48, left: 12 }}>
            <Pie
              data={bySource}
              dataKey="value"
              nameKey="name"
              innerRadius="45%"
              outerRadius="70%"
              labelLine={false}
              label={renderLabel}
            >
              {bySource.map((s, i) => (
                <Cell key={s?.name ?? i} fill={colorForSource(s?.name ?? "unknown", i)} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any) => {
                const v = typeof value === "number" ? value : Number(value ?? 0);
                return [`${v.toLocaleString()} ${unit}`, String(name ?? "")];
              }}
            />
            <Legend verticalAlign="bottom" align="center" iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
