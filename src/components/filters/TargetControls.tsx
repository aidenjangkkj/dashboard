// src/components/filters/TargetControls.tsx
"use client";
import { memo, useEffect, useState, useCallback } from "react";
import { useUiStore } from "@/store/useUiStore";

function TargetControlsInner() {
  // 전역값은 읽기만 (필드 단위 셀렉션으로 리렌더 최소화)
  const baselineYear = useUiStore((s) => s.target.baselineYear);
  const targetYear = useUiStore((s) => s.target.targetYear);
  const reductionPct = useUiStore((s) => s.target.reductionPct);
  const setTarget = useUiStore((s) => s.setTarget);

  // ⬇ 로컬 문자열 상태 (입력 중 전역 반영 안 함)
  const [baseline, setBaseline] = useState("");
  const [goal, setGoal] = useState("");
  const [reduction, setReduction] = useState("");

  // 전역 → 로컬 동기화 (마운트/전역 변경 시 1회)
  useEffect(() => {
    setBaseline(baselineYear != null ? String(baselineYear) : "");
  }, [baselineYear]);
  useEffect(() => {
    setGoal(targetYear != null ? String(targetYear) : "");
  }, [targetYear]);
  useEffect(() => {
    setReduction(reductionPct != null ? String(reductionPct) : "");
  }, [reductionPct]);

  const commit = useCallback(() => {
    const b = baseline.trim() === "" ? undefined : Number(baseline);
    const g = goal.trim() === "" ? undefined : Number(goal);
    const r = reduction.trim() === "" ? undefined : Number(reduction);

    setTarget({
      baselineYear: Number.isFinite(b!) ? b : baselineYear,
      targetYear: Number.isFinite(g!) ? g : targetYear,
      reductionPct: Number.isFinite(r!) ? Math.max(0, Math.min(100, r!)) : reductionPct,
    });
  }, [baseline, goal, reduction, setTarget, baselineYear, targetYear, reductionPct]);

  // Enter 키로도 커밋
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur(); // onBlur → commit
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-1 text-sm text-neutral-600">
        기준
        <input
          type="number"
          inputMode="numeric"
          className="w-20 border rounded-md p-1 text-sm"
          value={baseline}
          onChange={(e) => setBaseline(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
        />
      </label>
      <label className="flex items-center gap-1 text-sm text-neutral-600">
        목표
        <input
          type="number"
          inputMode="numeric"
          className="w-20 border rounded-md p-1 text-sm"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
        />
      </label>
      <label className="flex items-center gap-1 text-sm text-neutral-600">
        감축(%)
        <input
          type="number"
          inputMode="numeric"
          className="w-20 border rounded-md p-1 text-sm"
          value={reduction}
          onChange={(e) => setReduction(e.target.value)}
          onBlur={commit}
          onKeyDown={onKeyDown}
        />
      </label>
    </div>
  );
}

const TargetControls = memo(TargetControlsInner);
export default TargetControls;
