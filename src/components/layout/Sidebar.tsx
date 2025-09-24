// src/components/layout/Sidebar.tsx  ← 교체
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { useDataStore } from "@/store/useDataStore";
import { useUiStore } from "@/store/useUiStore";

export default function Sidebar() {
  const { companies, loadCountries, loadCompanies } = useDataStore();
  const { sidebarOpen, closeSidebar } = useUiStore();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadCountries();
    loadCompanies();
  }, [loadCountries, loadCompanies]);

  const filtered = useMemo(() => companies, [companies]);

  // 외부 클릭 닫기 + 바디 스크롤 락
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!sidebarOpen) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) closeSidebar();
    }
    document.addEventListener("mousedown", onClick);
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen, closeSidebar]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity md:hidden
        ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={closeSidebar}
      />

      {/* Drawer (mobile) */}
      <aside
        ref={panelRef}
        className={`fixed top-0 left-0 z-50 w-72 border-r bg-white
        p-4 pt-[max(env(safe-area-inset-top),1rem)] pb-[max(env(safe-area-inset-bottom),1rem)]
        space-y-3 h-dvh overflow-y-auto
        transform transition-transform md:hidden
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!sidebarOpen}
      >
        <button
          onClick={closeSidebar}
          className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-md border border-gray-300"
          aria-label="Close navigation"
        >
          ×
        </button>

        <Link href="/" className="block font-semibold mb-3">Emissions Dashboard</Link>
        <nav className="space-y-1">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/companies/${c.id}`}
              className="block px-2 py-1.5 rounded hover:bg-neutral-100"
              onClick={closeSidebar}
            >
              {c.name} <span className="text-xs text-neutral-500">({c.country})</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Desktop */}
      <aside className="hidden md:flex md:flex-col md:w-72 md:shrink-0 md:border-r md:bg-white md:min-h-dvh md:p-4 md:space-y-3">
        <Link href="/" className="block font-semibold mb-3">Emissions Dashboard</Link>
        <nav className="pt-1 space-y-1 overflow-auto">
          {filtered.map((c) => (
            <Link
              key={c.id}
              href={`/companies/${c.id}`}
              className="block px-2 py-1.5 rounded hover:bg-neutral-100"
            >
              {c.name} <span className="text-xs text-neutral-500">({c.country})</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
