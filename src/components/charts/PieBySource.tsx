// src/components/charts/PieBySource.tsx  ← 교체(래퍼만 Card)
"use client";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts";
import { GhgEmission } from "@/lib/types";
import Card from "@/components/ui/Card";

export default function PieBySource({ data }: { data: GhgEmission[] }) {
  const bySource = Object.values(
    data.reduce<Record<string, { name: string; value: number }>>((acc, e) => {
      acc[e.source] = acc[e.source] || { name: e.source, value: 0 };
      acc[e.source].value += e.emissions;
      return acc;
    }, {})
  );

  return (
    <Card title="소스별 비중" compact>
      <div className="h-72">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={bySource} dataKey="value" nameKey="name" outerRadius={100} />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
