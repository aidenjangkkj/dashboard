// src/lib/colors.ts  ← 교체
const PALETTE = [
  "#2563eb", // indigo-600
  "#16a34a", // green-600
  "#f59e0b", // amber-500
  "#6b7280", // gray-500
  "#0ea5e9", // sky-500
  "#22c55e", // emerald-500
  "#a78bfa", // violet-400
] as const;

// 1) 소스 → 색상 매핑 (객체 인덱싱용)
export const colorsBySource: Record<string, string> = {
  diesel: PALETTE[0],
  gasoline: PALETTE[1],
  lpg: PALETTE[2],
  coal: PALETTE[3],
  electricity: PALETTE[4],
  renewables: PALETTE[5],
  other: PALETTE[6],
};

// 2) 함수 사용을 원하는 곳을 위한 헬퍼 (순환 팔레트 포함)
export function colorForSource(source: string, i = 0): string {
  return colorsBySource[source] ?? PALETTE[i % PALETTE.length];
}
