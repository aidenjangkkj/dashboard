// src/app/countries/[code]/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useDataStore } from "@/store/useDataStore";
import { useUiStore } from "@/store/useUiStore";
import LineByMonth from "@/components/charts/LineByMonth";
import PieBySource from "@/components/charts/PieBySource";
import StackedBarByMonth from "@/components/charts/StackedBarByMonth";
import type { GhgEmission } from "@/lib/types";
import { CountryDetailSkeleton } from "@/components/skeletons/SkeletonDetail";

function Star({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

export default function CountryPage() {
  // ✅ 훅은 항상 최상단에서, 동일한 순서로 호출
  const { code } = useParams<{ code: string }>();
  const codeUpper = (code ?? "").toString().toUpperCase();

  const {
    countries, companies, posts,
    loadCountries, loadCompanies,
    loading, error,
  } = useDataStore();

  const isCountryFavorite = useUiStore((s) => s.isCountryFavorite);
  const toggleCountryFavorite = useUiStore((s) => s.toggleCountryFavorite);

  // 데이터 로딩 보장 (훅)
  useEffect(() => {
    if (!countries.length) loadCountries();
    if (!companies.length) loadCompanies();
  }, [countries.length, companies.length, loadCountries, loadCompanies]);

  // ✅ 아래 4개의 useMemo도 조건부 리턴보다 "항상" 먼저 호출되게
  const country = useMemo(
    () => countries.find((c) => c.code.toUpperCase() === codeUpper),
    [countries, codeUpper]
  );

  const countryCompanies = useMemo(
    () => companies.filter((c) => c.country.toUpperCase() === codeUpper),
    [companies, codeUpper]
  );

  const series: GhgEmission[] = useMemo(
    () => countryCompanies.flatMap((c) => c.emissions),
    [countryCompanies]
  );

  const relatedPosts = useMemo(() => {
    const ids = new Set(countryCompanies.map((c) => c.id));
    return posts.filter((p) => ids.has(p.resourceUid));
  }, [posts, countryCompanies]);

  // ✅ 모든 훅 호출 후에 조건부 리턴
  if (loading) return <CountryDetailSkeleton />;
  if (error) return <div className="p-4">에러: {error}</div>;
  if (!country) return <div className="p-4">국가를 찾을 수 없어요. (요청 코드: {codeUpper})</div>;

  const fav = isCountryFavorite(codeUpper);

  return (
    <div className="grid gap-6">
      {/* 타이틀 + 즐겨찾기 */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl md:text-2xl font-semibold">
          {country.name} <span className="text-neutral-500 text-base">({country.code})</span>
        </h1>
        <button
          className={`inline-flex items-center justify-center h-8 w-8 rounded-md border ${
            fav ? "text-yellow-500 border-yellow-500" : "text-neutral-500 border-neutral-300"
          }`}
          onClick={() => toggleCountryFavorite(codeUpper)}
          aria-label={fav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
          title={fav ? "즐겨찾기 해제" : "즐겨찾기 추가"}
        >
          <Star active={fav} />
        </button>
      </div>


      <div className="grid gap-6 grid-cols-1">
        <LineByMonth data={series} />
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <PieBySource data={series} />
        <StackedBarByMonth data={series} />
      </div>


      {/* 관련 메모 */}
      <div className="grid gap-4">
        <h2 className="text-lg font-semibold">관련 메모</h2>
        {relatedPosts.length ? (
          <div className="grid gap-3">
            {relatedPosts
              .slice()
              .sort((a, b) => b.dateTime.localeCompare(a.dateTime))
              .map((p) => (
                <div key={p.id} className="p-3 rounded-xl border bg-neutral-50">
                  <div className="text-sm text-neutral-500">{p.dateTime} · {p.resourceUid}</div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm">{p.content}</div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-sm text-neutral-500">아직 이 국가와 관련된 메모가 없어요.</div>
        )}
      </div>
    </div>
  );
}
