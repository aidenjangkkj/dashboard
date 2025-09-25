"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useDataStore } from "@/store/useDataStore";
import { useUiStore } from "@/store/useUiStore";

export default function Sidebar() {
  const { countries, companies, loadCountries, loadCompanies } = useDataStore();
  const { sidebarOpen, closeSidebar, favoriteCompanyIds, favoriteCountryCodes, setQuery } = useUiStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadCountries(); loadCompanies(); }, [loadCountries, loadCompanies]);

  const favoriteCompanies = useMemo(() => companies.filter(c => favoriteCompanyIds?.has(c.id)), [companies, favoriteCompanyIds]);
  const favoriteCountries = useMemo(() => countries.filter(c => favoriteCountryCodes?.has(c.code)), [countries, favoriteCountryCodes]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!sidebarOpen) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) closeSidebar();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [sidebarOpen, closeSidebar]);

  const CountryLink = ({ code, name }: { code: string; name: string }) => (
    <button
      className="w-full text-left px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5"
      onClick={() => { setQuery(name); closeSidebar(); }}
    >
      {name} <span className="text-xs text-neutral-500">({code})</span>
    </button>
  );

  const CompanyLink = ({ id, name, country }: { id: string; name: string; country: string }) => (
    <Link href={`/companies/${id}`} className="block px-2 py-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5" onClick={closeSidebar}>
      {name} <span className="text-xs text-neutral-500">({country})</span>
    </Link>
  );

  return (
    <>
      {/* Mobile overlay */}
      <div className={`fixed inset-0 z-40 bg-black/30 md:hidden transition-opacity ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} />

      {/* Mobile drawer */}
      <aside
        ref={panelRef}
        className={`fixed top-0 left-0 z-50 h-full w-72 border-r bg-white dark:bg-[rgb(17,20,27)] p-4 space-y-3 transform transition-transform md:hidden ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button onClick={closeSidebar} className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-md border">×</button>
        <div className="pt-2 space-y-6 overflow-y-auto max-h-[calc(100svh-6rem)] thin-scrollbar">
          <div>
            <div className="text-xs text-neutral-500 mb-1">즐겨찾기 국가</div>
            {favoriteCountries.length ? favoriteCountries.map(c => <CountryLink key={c.code} code={c.code} name={c.name} />) : <div className="text-sm text-neutral-500 px-2">없음</div>}
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">즐겨찾기 회사</div>
            {favoriteCompanies.length ? favoriteCompanies.map(c => <CompanyLink key={c.id} id={c.id} name={c.name} country={c.country} />) : <div className="text-sm text-neutral-500 px-2">없음</div>}
          </div>
        </div>
      </aside>

      {/* Desktop sticky */}
      <aside
        className="hidden md:flex md:flex-col md:w-72 md:shrink-0 md:border-r md:min-h-dvh md:p-4 md:space-y-3
                   bg-gradient-to-b from-white/90 to-white/60 dark:from-[rgba(17,20,27,.9)] dark:to-[rgba(17,20,27,.6)]
                   backdrop-blur supports-[backdrop-filter]:bg-white/50 md:sticky md:top-0 md:h-[100svh] md:max-h-[100svh] md:z-30 md:min-h-0"
      >
        <Link href="/" className="block font-semibold text-lg">Emissions Dashboard</Link>
        <div className="flex-1 min-h-0">
          <div className="pt-2 space-y-6 overflow-y-auto h-full thin-scrollbar">
            <div>
              <div className="text-xs text-neutral-500 mb-1">즐겨찾기 국가</div>
              {favoriteCountries.length ? favoriteCountries.map(c => <CountryLink key={c.code} code={c.code} name={c.name} />) : <div className="text-sm text-neutral-500 px-2">없음</div>}
            </div>
            <div>
              <div className="text-xs text-neutral-500 mb-1">즐겨찾기 회사</div>
              {favoriteCompanies.length ? favoriteCompanies.map(c => <CompanyLink key={c.id} id={c.id} name={c.name} country={c.country} />) : <div className="text-sm text-neutral-500 px-2">없음</div>}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
