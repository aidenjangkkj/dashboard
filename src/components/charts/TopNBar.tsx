"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { useMemo, useState } from "react";
import { useDataStore } from "@/store/useDataStore";
import { useUiStore } from "@/store/useUiStore";
import { inYearMonthRange } from "@/lib/date";
import { scaleUnit, fmtNumber } from "@/lib/format";

type Mode = "country" | "company";

export default function TopNBar() {
  const { countries, companies } = useDataStore();
  const { unit, sortBy, topN, periodFrom, periodTo, setTopN } = useUiStore();
  const [mode, setMode] = useState<Mode>("country");

  const countriesSafe = Array.isArray(countries) ? countries : [];
  const companiesSafe = Array.isArray(companies) ? companies : [];

  const rows = useMemo(() => {
    if (mode === "country") {
      const byCode = new Map<string, { name: string; code: string; emissions: number; taxKRW?: number | null }>();
      const cMap = new Map(countriesSafe.map((c) => [c?.code, c]));
      for (const co of companiesSafe) {
        const cn = cMap.get(co?.country);
        const sum = (co?.emissions ?? [])
          .filter((e) => inYearMonthRange(e?.yearMonth ?? "", periodFrom ?? null, periodTo ?? null))
          .reduce((a, e) => a + (e?.emissions ?? 0), 0);
        const prev = byCode.get(co?.country ?? "??") || {
          name: cn?.name ?? (co?.country ?? "Unknown"),
          code: co?.country ?? "??",
          emissions: 0,
          taxKRW: 0,
        };
        prev.emissions += sum;
        // 국가 세율이 있으면 세금 추정 포함 가능(원하면 유지/삭제)
        const taxRateKRW = cn?.taxRate;
        if (taxRateKRW != null) prev.taxKRW = (prev.taxKRW ?? 0) + sum * taxRateKRW;
        byCode.set(co?.country ?? "??", prev);
      }
      const arr = Array.from(byCode.values()).map((r) => ({
        id: r.code,
        label: `${r.name} (${r.code})`,
        emissions: scaleUnit(r?.emissions ?? 0, unit),
        taxKRW: r?.taxKRW ?? null,
      }));
      arr.sort((a, b) => (sortBy === "tax" ? (b.taxKRW ?? 0) - (a.taxKRW ?? 0) : (b.emissions ?? 0) - (a.emissions ?? 0)));
      return arr.slice(0, topN ?? 10);
    } else {
      const arr = companiesSafe.map((c) => {
        const sum = (c?.emissions ?? [])
          .filter((e) => inYearMonthRange(e?.yearMonth ?? "", periodFrom ?? null, periodTo ?? null))
          .reduce((a, e) => a + (e?.emissions ?? 0), 0);
        return {
          id: c?.id ?? Math.random().toString(36).slice(2),
          label: `${c?.name ?? "Unknown"} (${c?.country ?? "??"})`,
          emissions: scaleUnit(sum ?? 0, unit),
        };
      });
      arr.sort((a, b) => (b?.emissions ?? 0) - (a?.emissions ?? 0));
      return arr.slice(0, topN ?? 10);
    }
  }, [countriesSafe, companiesSafe, unit, sortBy, topN, mode, periodFrom, periodTo]);

  const hasRows = (rows?.length ?? 0) > 0;

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-2">
        <h2 className="font-medium">Top {topN ?? 10} {mode === "country" ? "국가" : "회사"}</h2>
        <div className="flex items-center gap-2">
          <select className="border rounded-md p-1 text-sm" value={mode} onChange={(e) => setMode(e.target.value as Mode)}>
            <option value="country">국가</option>
            <option value="company">회사</option>
          </select>
          <select className="border rounded-md p-1 text-sm" value={topN ?? 10} onChange={(e) => setTopN(Number(e.target.value))}>
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {!hasRows ? (
        <div className="text-sm text-neutral-500">표시할 데이터가 없습니다.</div>
      ) : (
        <div className="h-96">
          <ResponsiveContainer>
            <BarChart data={rows} margin={{ top: 8, right: 20, bottom: 32, left: 12 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tickMargin={8} interval={0} height={60} tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v) => fmtNumber(Number(v ?? 0))} />
              <Tooltip
                formatter={(value: any, name: any) => [`${fmtNumber(Number(value ?? 0))} ${unit}`, String(name ?? "")]}
                labelFormatter={(label: any) => String(label ?? "")}
              />
              <Legend />
              <Bar dataKey="emissions" name={`배출량 (${unit})`} fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
