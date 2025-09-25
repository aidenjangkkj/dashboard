// src/components/metrics/CompanyCards.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import DirectoryModal from "@/components/common/DirectoryModal";
import { scaleUnit, fmtNumber } from "@/lib/format";
import { useCurrencyHelpers } from "@/lib/currency";
import { useDataStore } from "@/store/useDataStore";
import { useUiStore } from "@/store/useUiStore";
import { useConfigStore } from "@/store/useConfigStore";
import type { Company, Country } from "@/lib/types";

function aggCompaniesBaseKRW(companies: Company[], countries: Country[]) {
  const byCode = new Map(countries.map((c) => [c.code, c]));
  return companies.map((c) => {
    const total = c.emissions.reduce((a, e) => a + e.emissions, 0); // tCO2e
    const taxRateKRW = byCode.get(c.country)?.taxRate ?? null; // KRW / tCO2e 가정
    const taxKRW = typeof taxRateKRW === "number" ? total * taxRateKRW : null;
    return { id: c.id, name: c.name, country: c.country, total, taxKRW };
  });
}

function Star({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

export default function CompanyCards() {
  const { companies, countries } = useDataStore();
  const { currency, unit, sortBy, query } = useUiStore();
  const { formatCurrency } = useCurrencyHelpers();
  const _fxVer = useConfigStore((s) => s.fx?.version);
  const { toggleCompanyFavorite, isCompanyFavorite } = useUiStore();
  const [topN, setTopN] = useState(9);
  const [openModal, setOpenModal] = useState(false);
  const router = useRouter();

  const raw = useMemo(
    () => aggCompaniesBaseKRW(companies, countries),
    [companies, countries]
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return raw;
    const q = query.toLowerCase();
    return raw.filter(
      (a) => a.name.toLowerCase().includes(q) || a.country.toLowerCase().includes(q)
    );
  }, [raw, query]);

  const prepared = useMemo(() => {
    const rows = filtered.map((a) => {
      const eScaled = scaleUnit(a.total, unit);
      const subtitle =
        typeof a.taxKRW === "number"
          ? `추정세: ${formatCurrency(a.taxKRW, currency, { amountCurrency: "KRW" })}`
          : undefined;
      return {
        id: a.id,
        title: `${a.name} (${a.country})`,
        subtitle,
        emissions: eScaled,
        taxKRW: a.taxKRW ?? null,
      };
    });
    rows.sort((x, y) =>
      sortBy === "tax"
        ? (y.taxKRW ?? 0) - (x.taxKRW ?? 0)
        : y.emissions - x.emissions
    );
    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filtered), unit, currency, sortBy, _fxVer]);

  if (!prepared.length)
    return <div className="text-sm text-neutral-500">표시할 회사가 없습니다.</div>;
  const topRows = prepared.slice(0, topN);

  return (
    <div className="space-y-3">
      {/* 헤더 컨트롤 */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-neutral-600">Top</label>
          <select
            className="h-9 rounded-md border border-neutral-200 bg-white px-2 text-sm"
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
          >
            {[6, 9, 12, 18, 24].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <span className="text-sm text-neutral-500">회사만 표시</span>
        </div>

        <button
          className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm hover:bg-neutral-50"
          onClick={() => setOpenModal(true)}
        >
          전체 회사 보기
        </button>
      </div>

      {/* Top N 카드 */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {topRows.map((r) => {
          const fav = isCompanyFavorite(r.id);
          return (
            <Card
              key={r.id}
              title={r.title}
              value={`${fmtNumber(r.emissions)} ${unit}`}
              subtitle={r.subtitle}
              headerRight={
                <button
                  className={`inline-flex items-center justify-center h-8 w-8 rounded-md border ${
                    fav
                      ? "text-yellow-500 border-yellow-500"
                      : "text-neutral-500 border-neutral-300"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCompanyFavorite(r.id);
                  }}
                  aria-label={fav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                  title={fav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                >
                  <Star active={fav} />
                </button>
              }
              interactive
              onClick={() => router.push(`/companies/${r.id}`)}
            />
          );
        })}
      </div>

      {/* 전체 목록 모달 */}
      <DirectoryModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        items={prepared}
        searchText={(x) => x.title}
        sorters={[
          { id: "emissions", label: "배출량", compare: (a, b) => b.emissions - a.emissions },
          { id: "tax", label: "추정세", compare: (a, b) => (b.taxKRW ?? 0) - (a.taxKRW ?? 0) },
        ]}
        defaultSortId={sortBy === "tax" ? "tax" : "emissions"}
        getId={(x) => x.id}
        getTitle={(x) => x.title}
        getSubtitle={(x) => x.subtitle}
        getPrimary={(x) => ({ value: x.emissions.toLocaleString(), label: unit })}
        getSecondary={(x) =>
          x.taxKRW != null ? { value: x.taxKRW.toLocaleString(), label: "KRW" } : null
        }
        rightHint={`표시 단위: ${unit} · 통화: ${currency}`}
        onItemClick={(x) => router.push(`/companies/${x.id}`)}
      />
    </div>
  );
}
