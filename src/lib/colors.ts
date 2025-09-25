export const SOURCE_COLORS: Record<string, string> = {
  diesel:       "#2563eb", // indigo-600
  gasoline:     "#16a34a", // green-600
  lpg:          "#f59e0b", // amber-500
  coal:         "#6b7280", // gray-500
  electricity:  "#0ea5e9", // sky-500
  renewables:   "#22c55e", // emerald-500
  other:        "#a78bfa", // violet-400
};

export function colorForSource(source: string, i: number): string {
  return SOURCE_COLORS[source] ?? SOURCE_COLORS.other;
}
