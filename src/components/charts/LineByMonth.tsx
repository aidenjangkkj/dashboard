// src/components/charts/LineByMonth.tsx  ← 교체(내용 동일, 래퍼만 교체)
"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { GhgEmission } from "@/lib/types"; // 경로 확인!
import Card from "@/components/ui/Card";

export default function LineByMonth({ data }: { data: GhgEmission[] }) {
  const byMonth = Object.values(
    data.reduce<Record<string, { yearMonth: string; emissions: number }>>((acc, e) => {
      acc[e.yearMonth] = acc[e.yearMonth] || { yearMonth: e.yearMonth, emissions: 0 };
      acc[e.yearMonth].emissions += e.emissions;
      return acc;
    }, {})
  ).sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

  return (
    <Card title="월별 배출량 추이" compact>
      <div className="h-72">
        <ResponsiveContainer>
          <LineChart data={byMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="yearMonth" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="emissions" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
