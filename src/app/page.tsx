"use client";

import { useEffect, useMemo, useState } from "react";
import Spinner from "@/components/ui/Spinner";
import { useDataStore } from "@/store/useDataStore";
import { useUiStore } from "@/store/useUiStore";
import { useConfigStore } from "@/store/useConfigStore";
import CountryCards from "@/components/metrics/CountryCards";
import Card from "@/components/ui/Card";
import LineByMonth from "@/components/charts/LineByMonth";
import PieBySource from "@/components/charts/PieBySource";
import StackedBarByMonth from "@/components/charts/StackedBarByMonth";
import PeriodFilter from "@/components/filters/PeriodFilter";
import TargetControls from "@/components/filters/TargetControls";
import TopNBar from "@/components/charts/TopNBar";
import TargetVsActual from "@/components/charts/TargetVsActual";
import { scaleUnit, fmtNumber } from "@/lib/format";
import CompanyCards from "@/components/metrics/CompanyCards";

function useIsDesktop(breakpoint = 768) {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(min-width:${breakpoint}px)`);
    const onChange = () => setIsDesktop(mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, [breakpoint]);
  return isDesktop;
}

export default function Page() {
  const { loadCompanies, loadCountries, companies, loading, error } =
    useDataStore();
  const { init } = useUiStore();
  const { loadConfig, loading: fxLoading } = useConfigStore();
  const unit = useUiStore((s) => s.unit);
  const isDesktop = useIsDesktop();
  // ✅ 훅은 항상 최상단
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [targetOpen, setTargetOpen] = useState(false);

  useEffect(() => {
    (async () => {
      await loadConfig();
      await Promise.all([loadCountries(), loadCompanies()]);
      init();
    })();
  }, [loadConfig, loadCountries, loadCompanies, init]);

  // ✅ useMemo도 return 이전에
  const companiesSafe = Array.isArray(companies) ? companies : [];
  const allSeries = useMemo(
    () => companiesSafe.flatMap((c) => c?.emissions ?? []),
    [companiesSafe]
  );
  // ⛳ 이제 조건부 return
  if (loading || fxLoading) return <Spinner />;
  if (error) return <div className="p-4">에러: {error}</div>;

  const totalCompanies = companiesSafe.length;
  const totalEmissionsRaw = companiesSafe
    .flatMap((c) => c?.emissions ?? [])
    .reduce((a, e) => a + (e?.emissions ?? 0), 0);

  const totalEmissionsScaled = scaleUnit(totalEmissionsRaw ?? 0, unit);
  const avgEmissionsPerCompanyScaled = totalCompanies
    ? Math.round((totalEmissionsScaled ?? 0) / totalCompanies)
    : 0;

  return (
    <div className="space-y-8 md:space-y-10">
      {/* KPI */}
      <section aria-labelledby="kpi-title" className="section">
        <h2 id="kpi-title" className="section-title mb-3">
          요약 지표
        </h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <Card
            title="총 회사 수"
            value={fmtNumber(totalCompanies)}
            tone="brand"
          />
          <Card
            title={`총 배출량 (${unit})`}
            value={fmtNumber(totalEmissionsScaled)}
            tone="accent"
          />
          <Card
            title={`회사당 평균 (${unit})`}
            value={fmtNumber(avgEmissionsPerCompanyScaled)}
            tone="warning"
          />
        </div>
      </section>

      {/* 국가별 카드 */}
      <section>
        <h2 className="section-title mb-3">국가별 요약</h2>
        <CountryCards />
      </section>
      <section aria-labelledby="company-summary-title" className="section">
        <h2 id="company-summary-title" className="section-title mb-3">
          회사별 요약
        </h2>
        <CompanyCards />
      </section>
      {/* 분석 차트 */}
      <section aria-labelledby="analysis-title" className="section">
        <div className="flex flex-col gap-2 md:gap-3">
          <div className="flex items-baseline justify-between">
            <h2 id="analysis-title" className="section-title">
              분석 차트
            </h2>
            <span className="section-subtitle hidden md:inline">
              전체 국가 합산
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="section-subtitle md:hidden">전체 국가 합산</span>

            {/* md+: 인라인 툴바 / md-: 버튼 */}
            <div className="hidden md:flex items-center gap-2">
              <PeriodFilter />
            </div>
            <div className="md:hidden">
              <button
                className="inline-flex items-center gap-2 border rounded-md px-2 py-1 text-sm bg-white/80 dark:bg-white/5"
                onClick={() => setFiltersOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={filtersOpen}
              >
                필터
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 5h18M6 12h12M10 19h4" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 차트들 */}
        <div className="grid gap-6 grid-cols-1 my-5">
          <LineByMonth data={allSeries} />
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 my-5">
          <StackedBarByMonth data={allSeries} />
          <PieBySource data={allSeries} />
        </div>
        <div className="my-5">
          <TopNBar />
        </div>
        <div className="flex items-center">
          {/* 데스크톱: 인라인 컨트롤 (좌측 정렬 유지) */}
          <div className="mb-5 hidden md:flex items-center gap-2">
            {isDesktop && <TargetControls />}
          </div>

          {/* 모바일: 버튼을 오른쪽 끝으로 (ml-auto + pr-4) */}
          <div className="md:hidden ml-auto pr-4">
            <button
              className="inline-flex mb-3 items-center gap-2 border rounded-md px-2 py-1 text-sm bg-white/80 dark:bg-white/5"
              onClick={() => setTargetOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={targetOpen}
            >
              목표 설정
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 5h18M6 12h12M10 19h4" />
              </svg>
            </button>
          </div>
        </div>

        <TargetVsActual />
      </section>

      {/* 모바일 바텀시트: 기간/목표 */}
      {filtersOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white dark:bg-[rgb(17,20,27)] p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">분석 필터</h3>
              <button
                className="h-8 w-8 border rounded-md"
                onClick={() => setFiltersOpen(false)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-neutral-500 mb-1">기간</div>
                <PeriodFilter />
              </div>
            </div>
            {!isDesktop && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-500">목표 설정</span>
                <TargetControls /> {/* ✅ 모바일에서만 렌더 */}
              </div>
            )}
          </div>
        </div>
      )}
      {targetOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setTargetOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white dark:bg-[rgb(17,20,27)] p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">목표 설정</h3>
              <button
                className="h-8 w-8 border rounded-md"
                onClick={() => setTargetOpen(false)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            {!isDesktop && (
              <div className="flex items-center gap-2">
                <TargetControls />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
