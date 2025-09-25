// src/components/layout/Topbar.tsx  ← 교체
"use client";

import { useState } from "react";
import { useDataStore } from "@/store/useDataStore";
import { useUiStore } from "@/store/useUiStore";
import { useConfigStore } from "@/store/useConfigStore";

type Currency = "USD" | "KRW";
type Unit = "tCO2e" | "ktCO2e";
type SortBy = "emissions" | "tax";
type FxMode = "historical" | "live";

export default function Topbar() {
  const { companies, countries } = useDataStore();

  // 전역 UI 상태
  const {
    currency,
    unit,
    sortBy,
    query,
    setCurrency,
    setUnit,
    setSortBy,
    setQuery,
    toggleSidebar,
    hidden,
    toggleHide,
    clearHidden,
  } = useUiStore();

  const { fxMode, fxDate, setFxMode, setFxDate, loadConfig } = useConfigStore();

  // 로컬 상태 (모바일 바텀시트)
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  // 데스크탑 전용: 숨김 관리 드롭다운
  const [hideMenuOpen, setHideMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 h-14 px-3 md:px-4 flex items-center justify-between border-b glass">
        {/* 좌: 햄버거 + 타이틀 */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white/70 dark:bg-white/5"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
          <h1 className="text-base md:text-lg font-semibold">
            Emissions Dashboard
          </h1>
        </div>

        {/* 중앙: 검색 인풋(데스크탑 전용) */}
        <div className="hidden md:block flex-1 px-6">
          <input
            className="w-full max-w-xl rounded-xl px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border border-white/30 dark:border-white/10 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            placeholder="국가/회사 검색"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.currentTarget.value)
            }
          />
        </div>

        {/* 우측: 컨트롤 (데스크탑) */}
        <div className="hidden md:flex items-center gap-2">
          <select
            className="rounded-lg border px-2 py-1 text-sm bg-white/70 dark:bg-white/5"
            value={currency}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setCurrency(e.currentTarget.value as Currency)
            }
          >
            <option value="USD">USD</option>
            <option value="KRW">KRW</option>
          </select>

          <select
            className="rounded-lg border px-2 py-1 text-sm bg-white/70 dark:bg-white/5"
            value={unit}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setUnit(e.currentTarget.value as Unit)
            }
          >
            <option value="tCO2e">tCO2e</option>
            <option value="ktCO2e">ktCO2e</option>
          </select>

          <select
            className="rounded-lg border px-2 py-1 text-sm bg-white/70 dark:bg-white/5"
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSortBy(e.currentTarget.value as SortBy)
            }
          >
            <option value="emissions">배출량</option>
            <option value="tax">추정세</option>
          </select>

          <select
            className="rounded-lg border px-2 py-1 text-sm bg-white/70 dark:bg-white/5"
            value={fxMode}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setFxMode(e.currentTarget.value as FxMode)
            }
          >
            <option value="historical">과거</option>
            <option value="live">실시간</option>
          </select>

          {fxMode === "historical" && (
            <input
              type="date"
              value={fxDate ?? ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFxDate(e.currentTarget.value)
              }
              className="rounded-lg border px-2 py-1 text-sm bg-white/70 dark:bg-white/5"
            />
          )}

          <button
            onClick={() => void loadConfig()}
            className="rounded-lg border px-2 py-1 text-sm bg-white/70 dark:bg-white/5"
          >
            환율 갱신
          </button>

          {/* 숨김 관리 (데스크탑 드롭다운) */}
          <div className="relative">
            <button
              className="rounded-lg border px-2 py-1 text-sm bg-white/70 dark:bg-white/5"
              onClick={() => setHideMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={hideMenuOpen}
            >
              숨김
            </button>
            {hideMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 max-h-72 overflow-auto rounded-md border bg-white dark:bg-[rgb(17,20,27)] shadow-lg z-50 p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium">국가 숨김 관리</div>
                  {hidden.size > 0 && (
                    <button
                      className="text-xs underline"
                      onClick={() => clearHidden()}
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
        </div>

        {/* 우측: 모바일 아이콘들 */}
        <div className="md:hidden flex items-center gap-1">
          {/* 검색 아이콘 → 바텀시트 */}
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white/70 dark:bg-white/5"
            onClick={() => setSearchOpen(true)}
            aria-label="검색 열기"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </button>

          {/* 더보기 아이콘 → 설정 바텀시트 */}
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border bg-white/70 dark:bg-white/5"
            onClick={() => setMoreOpen(true)}
            aria-label="더보기 열기"
            title="더보기"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
        </div>
      </header>

      {/* 모바일: 검색 바텀시트 */}
      {searchOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setSearchOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white dark:bg-[rgb(17,20,27)] p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">검색</h3>
              <button
                className="h-8 w-8 border rounded-md"
                onClick={() => setSearchOpen(false)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <input
                autoFocus
                className="w-full rounded-xl px-3 py-2 text-sm bg-white/70 dark:bg-white/5 border border-neutral-200 dark:border-white/10 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="국가/회사 이름을 입력하세요"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.currentTarget.value)
                }
              />

              {/* 빠른 제안 (옵션) */}
              <div>
                <div className="text-xs text-neutral-500 mb-1">빠른 선택</div>
                <div className="flex gap-2 overflow-x-auto thin-scrollbar">
                  {companies.slice(0, 8).map((c) => (
                    <button
                      key={c.id}
                      className="px-2 py-1 rounded-md border text-xs bg-white/70 dark:bg-white/5"
                      onClick={() => {
                        setQuery(c.name);
                        setSearchOpen(false);
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 모바일: 더보기(설정) 바텀시트 */}
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white dark:bg-[rgb(17,20,27)] p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">설정</h3>
              <button
                className="h-8 w-8 border rounded-md"
                onClick={() => setMoreOpen(false)}
                aria-label="닫기"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {/* 통화/단위/정렬 */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-neutral-500">통화</label>
                  <select
                    className="border rounded-md p-1 text-sm"
                    value={currency}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setCurrency(e.currentTarget.value as Currency)
                    }
                  >
                    <option value="USD">USD</option>
                    <option value="KRW">KRW</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-neutral-500">단위</label>
                  <select
                    className="border rounded-md p-1 text-sm"
                    value={unit}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setUnit(e.currentTarget.value as Unit)
                    }
                  >
                    <option value="tCO2e">tCO2e</option>
                    <option value="ktCO2e">ktCO2e</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-neutral-500">정렬</label>
                  <select
                    className="border rounded-md p-1 text-sm"
                    value={sortBy}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setSortBy(e.currentTarget.value as SortBy)
                    }
                  >
                    <option value="emissions">배출량</option>
                    <option value="tax">추정세</option>
                  </select>
                </div>
              </div>

              {/* 환율 모드 / 날짜 */}
              <div className="grid gap-2">
                {/* 환율 선택 + 갱신 버튼 */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-neutral-500">환율</label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 border rounded-md p-1 text-sm"
                      value={fxMode}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setFxMode(e.currentTarget.value as FxMode)
                      }
                    >
                      <option value="historical">과거</option>
                      <option value="live">실시간</option>
                    </select>
                    <button
                      onClick={() => void loadConfig()}
                      className="flex-1 rounded-md border px-3 py-2 text-sm bg-white hover:bg-neutral-50"
                    >
                      환율 갱신
                    </button>
                  </div>
                </div>

                {/* 날짜 선택 */}
                {fxMode === "historical" && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-neutral-500">날짜</label>
                    <input
                      type="date"
                      className="border rounded-md p-1 text-sm"
                      value={fxDate ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFxDate(e.currentTarget.value)
                      }
                    />
                  </div>
                )}
              </div>

              {/* 국가 숨김 (모바일 간단판) */}
              <details className="rounded-md border p-2">
                <summary className="text-sm cursor-pointer">숨김 관리</summary>
                <div className="max-h-48 overflow-auto mt-2 space-y-1">
                  {countries.map((c) => {
                    const checked = hidden.has(c.code);
                    return (
                      <label
                        key={c.code}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4"
                          checked={checked}
                          onChange={() => toggleHide(c.code)}
                        />
                        {c.name}{" "}
                        <span className="text-neutral-500">({c.code})</span>
                      </label>
                    );
                  })}
                  {hidden.size > 0 && (
                    <div className="pt-2">
                      <button
                        className="text-xs underline"
                        onClick={() => clearHidden()}
                      >
                        모두 해제
                      </button>
                    </div>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
