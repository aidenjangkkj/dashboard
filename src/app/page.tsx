// src/app/page.tsx  ← 그리드/여백만 살짝 보정
"use client";
import { useEffect } from "react";
import Spinner from "@/components/ui/Spinner";
import { useDataStore } from "@/store/useDataStore";
import { useUiStore } from "@/store/useUiStore";
import { useConfigStore } from "@/store/useConfigStore";
import CountryCards from "@/components/metrics/CountryCards";
import Card from "@/components/ui/Card";

export default function Page() {
  const { loadCompanies, loadCountries, companies, loading, error } = useDataStore();
  const { init } = useUiStore();
  const { loadConfig, loading: fxLoading } = useConfigStore();

  useEffect(() => {
    (async () => {
      await loadConfig();
      await Promise.all([loadCountries(), loadCompanies()]);
      init();
    })();
  }, [loadConfig, loadCountries, loadCompanies, init]);

  if (loading || fxLoading) return <Spinner />;
  if (error) return <div className="p-4">에러: {error}</div>;

  const totalCompanies = companies.length;
  const totalEmissions = companies.flatMap(c => c.emissions).reduce((a, e) => a + e.emissions, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="총 회사 수" value={totalCompanies.toLocaleString()} />
        <Card title="총 배출량(tCO2e)" value={totalEmissions.toLocaleString()} />
      </div>
      <section>
        <h2 className="text-lg font-semibold mb-3">국가별 요약</h2>
        <CountryCards />
      </section>
    </div>
  );
}
