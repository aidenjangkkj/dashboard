// src/components/charts/PieBySource.tsx
"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type {
  ValueType,
  NameType,
} from "recharts/types/component/DefaultTooltipContent";
import { GhgEmission } from "@/lib/types";
import { useUiStore } from "@/store/useUiStore";
import type { SourceSlice } from "@/lib/types";
import { colorForSource } from "@/lib/colors"; // 소스별 색상 매핑 유틸이 있다면 사용

export default function PieBySource({
  data,
}: {
  data: GhgEmission[] | null | undefined;
}) {
  const unit = useUiStore((s) => s.unit);
  const safe: GhgEmission[] = Array.isArray(data) ? data : [];

  // 소스 키 추출 (데이터 스키마에 맞게 조정)
  // 예: emission.source 가 "scope1" | "scope2" | ...
  const totals = safe.reduce<Record<string, number>>((acc, e) => {
    const key = e?.source ?? "etc";
    const val = e?.emissions ?? 0;
    acc[key] = (acc[key] ?? 0) + val;
    return acc;
  }, {});

  const slices: SourceSlice[] = Object.entries(totals)
    .map(([source, value]) => ({ source, value }))
    .filter((s) => s.value > 0);

  const tooltipFormatter = (value: ValueType, name?: NameType) => {
    const num = Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);
    return [`${num.toLocaleString()} ${unit}`, String(name ?? "")] as [
      string,
      string
    ];
  };

  if (!slices.length) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow-sm">
        <h2 className="mb-2 font-medium">소스별 비중</h2>
        <div className="text-sm text-neutral-500">
          표시할 데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm">
      <h2 className="mb-2 font-medium">소스별 비중</h2>
      <div className="h-72">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="source"
              innerRadius={60}
              outerRadius={100}
              strokeWidth={1}
            >
              {slices.map((s, i) => (
                <Cell key={s.source} fill={colorForSource(s.source, i)} />
              ))}
            </Pie>
            <Tooltip formatter={tooltipFormatter} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
