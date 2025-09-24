// src/components/layout/Topbar.tsx  ← 교체
"use client";

import { useEffect, useRef, useState } from "react";
import { useDataStore } from "@/store/useDataStore";
import { useUiStore } from "@/store/useUiStore";
import { useConfigStore } from "@/store/useConfigStore";
import MobileSearchSheet from "./MobileSearchSheet";
import MobileMoreSheet from "./MobileMoreSheet";

export default function Topbar() {
  const { companies, countries, selectedCompanyId } = useDataStore();
  const { loadConfig, fxMode, fxDate, setFxMode, setFxDate } = useConfigStore();
  const {
    query,
    setQuery,
    currency,
    unit,
    sortBy,
    setCurrency,
    setUnit,
    setSortBy,
    hidden,
    toggleHide,
    clearHidden,
    toggleSidebar,
  } = useUiStore();

  const selected = companies.find((c) => c.id === selectedCompanyId);

  // 모바일 시트 상태
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // PC용 숨김 메뉴 (기존 유지)
  const [hideMenuOpen, setHideMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!hideMenuOpen) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setHideMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [hideMenuOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      {/* ===== 모바일 헤더 (md 미만) ===== */}
      <div className="md:hidden h-14 px-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <h1 className="text-base font-semibold truncate">
            Emissions Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* 검색 아이콘 → 검색 시트 */}
          <button
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>

          {/* 더보기 아이콘 → 설정/정렬/환율/숨김 등 */}
          <button
            onClick={() => setMoreOpen(true)}
            aria-label="More"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="5" cy="12" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="19" cy="12" r="1.6" />
            </svg>
          </button>
        </div>
      </div>

      {/* ===== 데스크톱 헤더 (md 이상) — 기존 레이아웃 유지 ===== */}
      <div className="hidden md:flex md:flex-col">
        {/* Row 1: 좌 타이틀 + 중앙 검색 + 우측 핵심 버튼 */}
        <div className="h-14 px-4 flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold">Emissions Dashboard</h1>

          <div className="flex-1 max-w-[720px] w-full px-6">
            <input
              className="w-full h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-400"
              placeholder="국가 검색 (이름/코드)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              className="h-9 rounded-md border border-neutral-200 bg-white px-2 text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              aria-label="Currency"
            >
              <option value="USD">USD</option>
              <option value="KRW">KRW</option>
            </select>

            <select
              className="h-9 rounded-md border border-neutral-200 bg-white px-2 text-sm"
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              aria-label="Unit"
            >
              <option value="tCO2e">tCO2e</option>
              <option value="ktCO2e">ktCO2e</option>
            </select>

            <select
              className="h-9 rounded-md border border-neutral-200 bg-white px-2 text-sm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort by"
            >
              <option value="emissions">배출량</option>
              <option value="tax">추정세</option>
            </select>

            <select
              value={fxMode}
              onChange={(e) => setFxMode(e.target.value as any)}
              className="h-9 rounded-md border border-neutral-200 bg-white px-2 text-sm"
              aria-label="FX mode"
            >
              <option value="historical">과거</option>
              <option value="live">실시간</option>
            </select>

            {fxMode === "historical" && (
              <input
                type="date"
                value={fxDate ?? ""}
                onChange={(e) => setFxDate(e.target.value)}
                className="h-9 rounded-md border border-neutral-200 bg-white px-2 text-sm"
                aria-label="FX date"
              />
            )}

            <button
              onClick={loadConfig}
              className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm hover:bg-neutral-50"
            >
              환율 갱신
            </button>

            {/* 숨김 드롭다운 */}
            <div className="relative" ref={menuRef}>
              <button
                className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm"
                onClick={() => setHideMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={hideMenuOpen}
              >
                숨김
              </button>
              {hideMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 max-h-72 overflow-auto rounded-md border bg-white shadow-lg z-[60] p-2"
                  role="menu"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">국가 숨김 관리</span>
                    {hidden.size > 0 && (
                      <button
                        className="text-xs underline"
                        onClick={clearHidden}
                      >
                        모두 해제
                      </button>
                    )}
                  </div>
                  <ul className="space-y-1">
                    {countries.map((c) => {
                      const checked = hidden.has(c.code);
                      return (
                        <li
                          key={c.code}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            id={`hide-${c.code}`}
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleHide(c.code)}
                            className="h-4 w-4"
                          />
                          <label
                            htmlFor={`hide-${c.code}`}
                            className="cursor-pointer"
                          >
                            {c.name}{" "}
                            <span className="text-neutral-500">({c.code})</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* 현재 선택 회사 */}
            <div className="hidden lg:block text-sm text-neutral-600 ml-1 max-w-[240px] truncate">
              {selected ? (
                <>
                  현재: <span className="font-medium">{selected.name}</span>
                </>
              ) : (
                "회사 미선택"
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 시트들 */}
      <MobileSearchSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        query={query}
        onChangeQuery={setQuery}
      />
      <MobileMoreSheet
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        state={{
          currency,
          unit,
          sortBy,
          fxMode,
          fxDate,
        }}
        actions={{
          setCurrency,
          setUnit,
          setSortBy,
          setFxMode,
          setFxDate,
          loadConfig,
          hidden,
          toggleHide,
          clearHidden,
          countries,
        }}
      />
    </header>
  );
}
