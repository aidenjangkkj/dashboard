// src/components/layout/MobileMoreSheet.tsx  ← 교체
"use client";

import { useEffect, useRef, useState } from "react";
import Portal from "@/components/common/Portal";
import type { Country } from "@/lib/types";

export default function MobileMoreSheet({
  open, onClose,
  state,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  state: {
    currency: "USD" | "KRW";
    unit: "tCO2e" | "ktCO2e";
    sortBy: "emissions" | "tax";
    fxMode: "historical" | "live";
    fxDate: string | null | undefined;
  };
  actions: {
    setCurrency: (v: any) => void;
    setUnit: (v: any) => void;
    setSortBy: (v: any) => void;
    setFxMode: (v: any) => void;
    setFxDate: (v: string) => void;
    loadConfig: () => void;
    hidden: Set<string>;
    toggleHide: (code: string) => void;
    clearHidden: () => void;
    countries: Country[];
  };
}) {
  const { currency, unit, sortBy, fxMode, fxDate } = state;
  const { setCurrency, setUnit, setSortBy, setFxMode, setFxDate, loadConfig, hidden, toggleHide, clearHidden, countries } = actions;

  const panelRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(open);

  useEffect(() => {
    if (open) {
      setShow(true);
      document.body.style.overflow = "hidden";
    } else {
      const t = setTimeout(() => setShow(false), 180);
      document.body.style.overflow = "";
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!show) return null;

  return (
    <Portal>
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-150
                    ${open ? "opacity-100" : "opacity-0"}
                    z-[999]`}
        aria-hidden
      />
      <div
        ref={panelRef}
        className={`fixed inset-x-0 bottom-0 z-[1000] rounded-t-2xl bg-white border-t
                    p-4 pb-[max(env(safe-area-inset-bottom),1rem)]
                    transition-transform duration-180
                    ${open ? "translate-y-0" : "translate-y-full"}`}
        role="dialog" aria-modal="true"
      >
        <div className="mx-auto max-w-lg space-y-4">
          <div className="h-1.5 w-10 rounded-full bg-neutral-200 mx-auto" />
          <h3 className="text-base font-semibold">설정 & 관리</h3>

          <div className="grid grid-cols-2 gap-3">
            <Field label="통화">
              <select
                className="h-10 w-full rounded-md border border-neutral-200 px-2 text-sm"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="KRW">KRW</option>
              </select>
            </Field>

            <Field label="단위">
              <select
                className="h-10 w-full rounded-md border border-neutral-200 px-2 text-sm"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              >
                <option value="tCO2e">tCO2e</option>
                <option value="ktCO2e">ktCO2e</option>
              </select>
            </Field>

            <Field label="정렬">
              <select
                className="h-10 w-full rounded-md border border-neutral-200 px-2 text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="emissions">배출량</option>
                <option value="tax">추정세</option>
              </select>
            </Field>

            <Field label="환율 모드">
              <select
                className="h-10 w-full rounded-md border border-neutral-200 px-2 text-sm"
                value={fxMode}
                onChange={(e) => setFxMode(e.target.value)}
              >
                <option value="historical">과거</option>
                <option value="live">실시간</option>
              </select>
            </Field>

            {fxMode === "historical" && (
              <Field label="날짜" full>
                <input
                  type="date"
                  className="h-10 w-full rounded-md border border-neutral-200 px-2 text-sm"
                  value={fxDate ?? ""}
                  onChange={(e) => setFxDate(e.target.value)}
                />
              </Field>
            )}
          </div>

          <div className="flex justify-between">
            <button
              className="h-10 rounded-md border border-neutral-200 px-3 text-sm"
              onClick={loadConfig}
            >
              환율 갱신
            </button>
            <button
              className="h-10 rounded-md bg-black text-white px-4 text-sm"
              onClick={onClose}
            >
              적용
            </button>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">국가 숨김 관리</h4>
              {hidden.size > 0 && (
                <button className="text-xs underline" onClick={clearHidden}>모두 해제</button>
              )}
            </div>
            <ul className="max-h-56 overflow-auto space-y-1">
              {countries.map((c) => {
                const checked = hidden.has(c.code);
                return (
                  <li key={c.code} className="flex items-center gap-2 text-sm">
                    <input
                      id={`mhide-${c.code}`}
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleHide(c.code)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`mhide-${c.code}`} className="cursor-pointer">
                      {c.name} <span className="text-neutral-500">({c.code})</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </Portal>
  );
}

function Field({ label, full, children }: { label: string; full?: boolean; children: React.ReactNode }) {
  return (
    <label className={`text-sm space-y-1 ${full ? "col-span-2" : ""}`}>
      <span className="text-neutral-600">{label}</span>
      {children}
    </label>
  );
}
