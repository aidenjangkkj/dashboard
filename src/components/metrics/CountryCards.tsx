// src/components/metrics/CountryCards.tsx
"use client";

import Card from "@/components/ui/Card";
import { fmtNumber, scaleUnit, aggregateByCountryBaseKRW } from "@/lib/format";
import { useCurrencyHelpers } from "@/lib/currency";
import { useDataStore } from "@/store/useDataStore";
import { useUiStore } from "@/store/useUiStore";
import { useConfigStore } from "@/store/useConfigStore";

export default function CountryCards() {
  const { countries, companies } = useDataStore();
  const { currency, unit, sortBy, query, hidden } = useUiStore();
  const { formatCurrency } = useCurrencyHelpers();

  // 환율 바뀔 때 리렌더 강제
  const _fxVer = useConfigStore(s => s.fx?.version);
  const getRatePair = useConfigStore(s => s.getRatePair);

  // ★ KRW 기준으로 집계 (여기서 taxRate에 환율 반영 완료)
  let aggs = aggregateByCountryBaseKRW(countries, companies, getRatePair as any);

  if (query.trim()) {
    const q = query.toLowerCase();
    aggs = aggs.filter(a => a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q));
  }
  if (hidden.size) aggs = aggs.filter(a => !hidden.has(a.code));

  const scaled = aggs.map(a => ({ ...a, totalEmissions: scaleUnit(a.totalEmissions, unit) }));

  // 정렬은 KRW 기준 값으로 일관되게
  scaled.sort((a, b) => (sortBy === "tax" ? (b.estimatedTaxKRW ?? 0) - (a.estimatedTaxKRW ?? 0) : b.totalEmissions - a.totalEmissions));

  if (!scaled.length) return <div className="text-sm text-neutral-500">표시할 국가가 없습니다.</div>;

  return (
    <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {scaled.map(a => (
        <Card
          key={a.code}
          title={`${a.name} (${a.code})`}
          value={`${fmtNumber(a.totalEmissions)} ${unit}`}
          subtitle={
            a.taxRateKRW != null && a.estimatedTaxKRW != null
              ? `세율: ${formatCurrency(a.taxRateKRW,  currency, { amountCurrency: "KRW" })}/${unit} · 추정세: ${formatCurrency(a.estimatedTaxKRW, currency, { amountCurrency: "KRW" })}`
              : undefined
          }
        />
      ))}
    </div>
  );
}
