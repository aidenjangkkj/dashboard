// src/components/charts/TargetVsActual.tsx
"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { useMemo } from "react";
import { useUiStore } from "@/store/useUiStore";
import { scaleUnit } from "@/lib/format";
import { GhgEmission } from "@/lib/types";

// 내부 계산용 타입
type Row = { yearMonth: string; actual: number; target: number };

// yyyy-mm 포맷인지 대충 체크
const isYm = (s: string) => /^\d{4}-\d{2}$/.test(s);

// yyyy-mm 순 정렬
const ymCompare = (a: string, b: string) => a.localeCompare(b);

// 다음 달 (yyyy-mm)
const nextYm = (ym: string) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  d.setMonth(d.getMonth() + 1);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yy}-${mm}`;
};

// 선형 보간: t∈[0,1] 에서 a→b
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 기본 월별 목표 자동 생성 로직
function buildAutoTargetsByMonth(options: {
  actualMap: Record<string, number>;
  baselineYear?: number;
  targetYear?: number;
  reductionPct?: number;
}): Record<string, number> | undefined {
  const { actualMap, baselineYear, targetYear, reductionPct } = options;

  if (!baselineYear || !targetYear || reductionPct == null) return undefined;
  if (targetYear <= baselineYear) return undefined;

  // baselineYear의 월 목록/합계
  const baseMonths = Object.keys(actualMap)
    .filter((ym) => isYm(ym) && ym.startsWith(String(baselineYear)))
    .sort(ymCompare);

  // 기준이 되는 월별 baseline 값: 데이터가 있으면 그걸, 없으면 전체 평균
  const allVals = Object.values(actualMap);
  const overallAvg = allVals.length ? allVals.reduce((a, b) => a + b, 0) / allVals.length : 0;

  const baselineByMonth: Record<string, number> = {};
  if (baseMonths.length) {
    for (const ym of baseMonths) baselineByMonth[ym.slice(5)] = actualMap[ym] ?? overallAvg;
  } else {
    // 기준연도 데이터가 하나도 없으면 12개월 모두 overallAvg로
    for (let m = 1; m <= 12; m++) {
      const mm = String(m).padStart(2, "0");
      baselineByMonth[mm] = overallAvg;
    }
  }

  // 선형 감축: baselineYear 1월 → targetYear 12월까지 감축률를 0→reductionPct로 선형 증가
  const startYm = `${baselineYear}-01`;
  const endYm = `${targetYear}-12`;

  // 전체 months 만들기
  const months: string[] = [];
  for (let ym = startYm; ym <= endYm; ym = nextYm(ym)) months.push(ym);

  const totalSteps = months.length > 1 ? months.length - 1 : 1;

  const result: Record<string, number> = {};
  months.forEach((ym, idx) => {
    const mm = ym.slice(5); // "MM"
    const base = baselineByMonth[mm] ?? overallAvg;
    const t = idx / totalSteps;
    const pct = reductionPct / 100; // 0~1
    const factor = 1 - lerp(0, pct, t); // 1 → 1-pct
    result[ym] = Math.max(0, base * factor);
  });

  return result;
}

export default function TargetVsActual({
  data,
  targetByMonth, // 선택: 외부에서 직접 넘기면 최우선 사용
}: {
  data: GhgEmission[] | null | undefined;
  targetByMonth?: Record<string, number>;
}) {
  const unit = useUiStore((s) => s.unit);

  // 스토어에서 월별타겟/설정 읽기
  const targetsFromStore = useUiStore((s) => s.targetsByMonth);
  const baselineYear = useUiStore((s) => s.target.baselineYear);
  const targetYear = useUiStore((s) => s.target.targetYear);
  const reductionPct = useUiStore((s) => s.target.reductionPct);

  const safe: GhgEmission[] = Array.isArray(data) ? data : [];

  // 월별 실제 합산
  const actualMap = useMemo(() => {
    return safe.reduce<Record<string, number>>((acc, e) => {
      const ym = e?.yearMonth ?? "";
      if (!isYm(ym)) return acc;
      acc[ym] = (acc[ym] ?? 0) + (e?.emissions ?? 0);
      return acc;
    }, {});
  }, [safe]);

  // 사용할 타겟 결정: props > store > 자동생성 > undefined
  const targetMap = useMemo(() => {
    if (targetByMonth && Object.keys(targetByMonth).length) return targetByMonth;
    if (targetsFromStore && Object.keys(targetsFromStore).length) return targetsFromStore;
    const auto = buildAutoTargetsByMonth({
      actualMap,
      baselineYear,
      targetYear,
      reductionPct,
    });
    return auto ?? {};
  }, [targetByMonth, targetsFromStore, actualMap, baselineYear, targetYear, reductionPct]);

  // 월 목록 합치기(실제/타겟 모두 포함)
  const allMonths = useMemo(() => {
    return Array.from(
      new Set([...Object.keys(actualMap), ...Object.keys(targetMap)])
    ).sort(ymCompare);
  }, [actualMap, targetMap]);

  // 렌더용 rows
  const rows: Row[] = useMemo(() => {
    return allMonths.map((ym) => ({
      yearMonth: ym,
      actual: scaleUnit(actualMap[ym] ?? 0, unit),
      target: scaleUnit(targetMap[ym] ?? 0, unit),
    }));
  }, [allMonths, actualMap, targetMap, unit]);

  const tooltipFormatter = (value: ValueType, name?: NameType) => {
    const num = Array.isArray(value) ? Number(value[0]) : Number(value ?? 0);
    return [`${num.toLocaleString()} ${unit}`, String(name ?? "")] as [string, string];
    // ([value, name] 튜플)
  };

  if (!rows.length) {
    return (
      <div className="p-4 bg-white rounded-2xl shadow-sm">
        <h2 className="mb-2 font-medium">목표 대비 추이</h2>
        <div className="text-sm text-neutral-500">표시할 데이터가 없습니다.</div>
      </div>
    );
  }

  const hasAnyTarget = Object.values(targetMap).some((v) => v > 0);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-sm">
      <h2 className="mb-2 font-medium">목표 대비 추이</h2>
      <div className="h-72">
        <ResponsiveContainer>
          <LineChart data={rows}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="yearMonth" tickMargin={8} />
            <YAxis tickFormatter={(v: number) => Number(v ?? 0).toLocaleString()} />
            <Tooltip formatter={tooltipFormatter} />
            <Legend />
            <Line
              type="monotone"
              dataKey="actual"
              name="실제"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ r: 2 }}
              isAnimationActive={false}
            />
            {hasAnyTarget && (
              <Line
                type="monotone"
                dataKey="target"
                name="목표"
                stroke="#ef4444"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={{ r: 0 }}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
