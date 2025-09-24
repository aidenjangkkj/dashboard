// src/components/layout/MobileSearchSheet.tsx  ← 교체
"use client";

import { useEffect, useRef, useState } from "react";
import Portal from "@/components/common/Portal";

export default function MobileSearchSheet({
  open, onClose, query, onChangeQuery,
}: {
  open: boolean;
  onClose: () => void;
  query: string;
  onChangeQuery: (v: string) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(open);

  // 마운트 유지한 채로 트랜지션
  useEffect(() => {
    if (open) {
      setShow(true);
      document.body.style.overflow = "hidden";
    } else {
      // 트랜지션 끝난 뒤 언마운트
      const t = setTimeout(() => setShow(false), 180);
      document.body.style.overflow = "";
      return () => clearTimeout(t);
    }
  }, [open]);

  // 바깥 클릭/ESC 닫기
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
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity duration-150
                    ${open ? "opacity-100" : "opacity-0"}
                    z-[999]`}
        aria-hidden
      />
      {/* Bottom sheet */}
      <div
        ref={panelRef}
        className={`fixed inset-x-0 bottom-0 z-[1000] rounded-t-2xl bg-white border-t
                    p-4 pb-[max(env(safe-area-inset-bottom),1rem)]
                    transition-transform duration-180
                    ${open ? "translate-y-0" : "translate-y-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="mx-auto max-w-lg space-y-3">
          <div className="h-1.5 w-10 rounded-full bg-neutral-200 mx-auto" />
          <h3 className="text-base font-semibold">검색</h3>
          <input
            autoFocus
            className="w-full h-11 rounded-lg border border-neutral-200 px-3 text-sm outline-none focus:border-neutral-400"
            placeholder="국가 검색 (이름/코드)"
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="h-10 rounded-md bg-black text-white px-4 text-sm"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
