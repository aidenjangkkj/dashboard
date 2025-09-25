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

/** 국가별 합계/추정세(KRW) 집계 */
function aggCountriesBaseKRW(companies: Company[], countries: Country[]) {
  const countryMap = new Map(countries.map((c) => [c.code, c]));
  const acc = new Map<
    string,
    { code: string; name: string; total: number; taxRateKRW: number | null }
  >();

  for (const co of companies ?? []) {
    const country = countryMap.get(co.country);
    const code = co.country;
    const name = country?.name ?? code;
    const totalCompany = (co.emissions ?? []).reduce(
      (a, e) => a + (e?.emissions ?? 0),
      0
    );

    const cur = acc.get(code) ?? {
      code,
      name,
      total: 0,
      taxRateKRW: country?.taxRate ?? null, // KRW / tCO2e
    };
    cur.total += totalCompany;
    acc.set(code, cur);
  }

  // taxKRW는 최종 합계 * 세율
  return Array.from(acc.values()).map((r) => ({
    code: r.code,
    name: r.name,
    total: r.total, // tCO2e
    taxKRW:
      typeof r.taxRateKRW === "number" ? r.total * r.taxRateKRW : null,
  }));
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

export default function CountryCards() {
  const router = useRouter();
  const { formatCurrency } = useCurrencyHelpers();

  const { companies, countries } = useDataStore();
  const { currency, unit, sortBy, query, hidden } = useUiStore();

  const { fx } = useConfigStore(); // 리렌더 트리거용
  const _fxVer = fx?.version;

  const { toggleCountryFavorite, isCountryFavorite } = useUiStore();

  const [topN, setTopN] = useState(9);
  const [openModal, setOpenModal] = useState(false);

  // 1) 집계 (KRW 기준 추정세)
  const raw = useMemo(
    () => aggCountriesBaseKRW(companies ?? [], countries ?? []),
    [companies, countries]
  );

  // 2) 검색/숨김 필터
  const filtered = useMemo(() => {
    let rows = raw;
    if (query?.trim()) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q)
      );
    }
    if (hidden?.size) {
      rows = rows.filter((r) => !hidden.has(r.code));
    }
    return rows;
  }, [raw, query, hidden]);

  // 3) 스케일/정렬/표기값 준비
  const prepared = useMemo(() => {
    const rows = filtered.map((r) => {
      const emissionsScaled = scaleUnit(r.total ?? 0, unit);
      const subtitle =
        r.taxKRW != null
          ? `추정세: ${formatCurrency(r.taxKRW, currency, {
              amountCurrency: "KRW",
            })}`
          : undefined;
      return {
        id: r.code,
        title: `${r.name} (${r.code})`,
        emissions: emissionsScaled,
        taxKRW: r.taxKRW ?? null,
        subtitle,
      };
    });

    rows.sort((a, b) =>
      sortBy === "tax"
        ? (b.taxKRW ?? 0) - (a.taxKRW ?? 0)
        : (b.emissions ?? 0) - (a.emissions ?? 0)
    );

    return rows;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filtered), unit, currency, sortBy, _fxVer]);

  if (!prepared.length)
    return (
      <div className="text-sm text-neutral-500">
        표시할 국가가 없습니다.
      </div>
    );

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
          <span className="text-sm text-neutral-500">국가만 표시</span>
        </div>

        <button
          className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm hover:bg-neutral-50"
          onClick={() => setOpenModal(true)}
        >
          전체 국가 보기
        </button>
      </div>

      {/* Top N 카드 */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {topRows.map((r) => {
          const fav = isCountryFavorite(r.id);
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
                    toggleCountryFavorite(r.id);
                  }}
                  aria-label={fav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                  title={fav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                >
                  <Star active={fav} />
                </button>
              }
              interactive
              onClick={() => router.push(`/countries/${r.id}`)}
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
          {
            id: "emissions",
            label: "배출량",
            compare: (a, b) => (b.emissions ?? 0) - (a.emissions ?? 0),
          },
          {
            id: "tax",
            label: "추정세",
            compare: (a, b) => (b.taxKRW ?? 0) - (a.taxKRW ?? 0),
          },
        ]}
        defaultSortId={sortBy === "tax" ? "tax" : "emissions"}
        getId={(x) => x.id}
        getTitle={(x) => x.title}
        getSubtitle={(x) => x.subtitle}
        getPrimary={(x) => ({
          value: x.emissions.toLocaleString(),
          label: unit,
        })}
        getSecondary={(x) =>
          x.taxKRW != null
            ? { value: x.taxKRW.toLocaleString(), label: "KRW" }
            : null
        }
        rightHint={`표시 단위: ${unit} · 통화: ${currency}`}
        onItemClick={(x) => router.push(`/countries/${x.id}`)}
      />
    </div>
  );
}
