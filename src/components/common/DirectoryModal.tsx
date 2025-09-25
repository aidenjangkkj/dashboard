"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Card from "@/components/ui/Card";

type Sorter<T> = { id: string; label: string; compare: (a: T, b: T) => number };

export default function DirectoryModal<T>({
  open, onClose,
  items,
  searchText,                   // 각 항목의 검색대상 문자열 생성
  sorters, defaultSortId,       // 정렬 옵션
  getId, getTitle, getSubtitle, // 좌측 텍스트
  getPrimary,                   // 우측 1차 값 (라벨/값)
  getSecondary,                 // 우측 2차 값 (선택)
  pageSize = 30,
  onItemClick,                  // 항목 클릭 핸들러(예: 상세 페이지 이동)
  headerTitle = "전체 목록",
  rightHint,                    // 우측 상단 힌트(예: 표시 단위)
}: {
  open: boolean;
  onClose: () => void;
  items: T[];
  searchText: (x: T) => string;
  sorters: Sorter<T>[];
  defaultSortId: string;
  getId: (x: T) => string;
  getTitle: (x: T) => string;
  getSubtitle?: (x: T) => string | undefined;
  getPrimary: (x: T) => { label?: string; value: string | number };
  getSecondary?: (x: T) => { label?: string; value: string | number } | null;
  pageSize?: number;
  onItemClick?: (x: T) => void;
  headerTitle?: string;
  rightHint?: string;
}) {
  const [q, setQ] = useState("");
  const [sortId, setSortId] = useState(defaultSortId);
  const [page, setPage] = useState(1);
  const panelRef = useRef<HTMLDivElement>(null);

  // 외부 클릭/ESC + 바디 스크롤 락
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!open) return;
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) onClose();
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape" && open) onClose();
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const sorter = useMemo(
    () => sorters.find(s => s.id === sortId) ?? sorters[0],
    [sorters, sortId]
  );

  const filteredSorted = useMemo(() => {
    const term = q.trim().toLowerCase();
    let arr = items;
    if (term) {
      arr = items.filter(x => searchText(x).toLowerCase().includes(term));
    }
    return [...arr].sort(sorter.compare);
  }, [items, q, searchText, sorter]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const pageRows = filteredSorted.slice((page - 1) * pageSize, page * pageSize);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[999] bg-black/40" />
      <div
        ref={panelRef}
        className="fixed inset-x-0 bottom-0 z-[1000] rounded-t-2xl bg-white border-t
                   p-4 md:p-6 max-h-[90svh] overflow-auto
                   md:inset-y-10 md:mx-auto md:max-w-3xl md:rounded-2xl md:border"
        role="dialog" aria-modal="true"
      >
        <div className="flex items-center justify-between gap-3 mb-3">
          <h3 className="text-base md:text-lg font-semibold">{headerTitle}</h3>
          <div className="flex items-center gap-2">
            {rightHint && <div className="hidden md:block text-xs text-neutral-500">{rightHint}</div>}
            <button
              onClick={onClose}
              aria-label="Close"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border"
            >
              ×
            </button>
          </div>
        </div>

        <div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-center mb-3">
          <input
            className="h-10 w-full rounded-md border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
            placeholder="검색…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
          />
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-600">정렬</label>
            <select
              className="h-10 rounded-md border border-neutral-200 bg-white px-2 text-sm"
              value={sortId}
              onChange={(e) => { setSortId(e.target.value); setPage(1); }}
            >
              {sorters.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <Card>
          <div className="divide-y">
            {pageRows.map((x) => {
              const id = getId(x);
              const title = getTitle(x);
              const subtitle = getSubtitle?.(x);
              const p = getPrimary(x);
              const s = getSecondary?.(x);

              const Right = (
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {p.value}{typeof p.value === "number" ? "" : ""}
                    {p.label ? <span className="text-xs text-neutral-500 ml-1">{p.label}</span> : null}
                  </div>
                  {s && (
                    <div className="text-xs text-neutral-500">
                      {s.value}{typeof s.value === "number" ? "" : ""} {s.label ?? ""}
                    </div>
                  )}
                </div>
              );

              const Row = (
                <div className="px-3 py-2 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{title}</div>
                    {subtitle && <div className="text-xs text-neutral-500 truncate">{subtitle}</div>}
                  </div>
                  {Right}
                </div>
              );

              return onItemClick ? (
                <button
                  key={id}
                  onClick={() => onItemClick(x)}
                  className="w-full text-left hover:bg-neutral-50"
                >
                  {Row}
                </button>
              ) : (
                <div key={id}>{Row}</div>
              );
            })}

            {!pageRows.length && (
              <div className="px-3 py-6 text-sm text-neutral-500 text-center">검색 결과가 없습니다.</div>
            )}
          </div>
        </Card>

        {totalPages > 1 && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <button
              className="h-9 px-3 rounded-md border text-sm disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              이전
            </button>
            <div className="text-sm">{page} / {totalPages}</div>
            <button
              className="h-9 px-3 rounded-md border text-sm disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </>
  );
}
