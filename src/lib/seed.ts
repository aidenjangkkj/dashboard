// seed.ts
import { Company, Country, Post, GhgEmission } from "@/lib/types";

export const countries: Country[] = [
  { code: "US", name: "United States", taxRate: 50 },
  { code: "DE", name: "Germany", taxRate: 45 },
  { code: "KR", name: "Korea", taxRate: 40 },
  { code: "JP", name: "Japan", taxRate: 42 },
  { code: "CN", name: "China", taxRate: 60 },
  { code: "IN", name: "India", taxRate: 35 },
  { code: "BR", name: "Brazil", taxRate: 30 },
  { code: "FR", name: "France", taxRate: 48 },
  { code: "GB", name: "United Kingdom", taxRate: 47 },
  { code: "CA", name: "Canada", taxRate: 38 },
];

// 월별 다중 소스 생성기
function makeMonthlyMix(base: number, mix: Record<string, number>, year = 2024, months = 12): GhgEmission[] {
  // mix 합 1.0 기준 (합이 1이 아니면 normalize)
  const sum = Object.values(mix).reduce((a, b) => a + b, 0) || 1;
  const norm = Object.fromEntries(Object.entries(mix).map(([k, v]) => [k, v / sum]));

  const rows: GhgEmission[] = [];
  for (let i = 1; i <= months; i++) {
    const ym = `${year}-${String(i).padStart(2, "0")}`;
    const seasonal = 0.9 + Math.random() * 0.2; // ±10% 계절 변동
    const monthTotal = base * seasonal;

    for (const [source, ratio] of Object.entries(norm)) {
      const value = Math.max(0, Math.round(monthTotal * ratio));
      if (value === 0) continue;
      rows.push({ yearMonth: ym, source, emissions: value });
    }
  }
  return rows;
}

// 회사별 믹스 프리셋
const mixes = {
  refinery:  { diesel: 0.45, gasoline: 0.35, lpg: 0.10, coal: 0.10 },
  auto:      { diesel: 0.30, gasoline: 0.40, lpg: 0.15, electricity: 0.15 },
  elec:      { coal: 0.55, lpg: 0.15, gasoline: 0.05, diesel: 0.10, renewables: 0.15 },
  it:        { electricity: 0.70, lpg: 0.10, diesel: 0.10, gasoline: 0.10 },
  mining:    { diesel: 0.50, gasoline: 0.20, lpg: 0.10, coal: 0.20 },
};

export const companies: Company[] = [
  { id: "c1",  name: "Acme Corp",            country: "US", emissions: makeMonthlyMix(140, mixes.auto) },
  { id: "c2",  name: "Globex",               country: "DE", emissions: makeMonthlyMix(120, mixes.auto) },
  { id: "c3",  name: "Samsung Electronics",  country: "KR", emissions: makeMonthlyMix(520, mixes.it) },
  { id: "c4",  name: "Toyota",               country: "JP", emissions: makeMonthlyMix(320, mixes.auto) },
  { id: "c5",  name: "PetroChina",           country: "CN", emissions: makeMonthlyMix(1050, mixes.refinery) },
  { id: "c6",  name: "Infosys",              country: "IN", emissions: makeMonthlyMix(210, mixes.it) },
  { id: "c7",  name: "Vale",                 country: "BR", emissions: makeMonthlyMix(260, mixes.mining) },
  { id: "c8",  name: "EDF",                  country: "FR", emissions: makeMonthlyMix(420, mixes.elec) },
  { id: "c9",  name: "BP",                   country: "GB", emissions: makeMonthlyMix(820, mixes.refinery) },
  { id: "c10", name: "Suncor",               country: "CA", emissions: makeMonthlyMix(610, mixes.refinery) },
  { id: "c11", name: "Microsoft",            country: "US", emissions: makeMonthlyMix(160, mixes.it) },
  { id: "c12", name: "Siemens",              country: "DE", emissions: makeMonthlyMix(190, mixes.it) },
  { id: "c13", name: "Hyundai Motors",       country: "KR", emissions: makeMonthlyMix(360, mixes.auto) },
  { id: "c14", name: "Sony",                 country: "JP", emissions: makeMonthlyMix(280, mixes.it) },
  { id: "c15", name: "Alibaba",              country: "CN", emissions: makeMonthlyMix(920, mixes.it) },
  { id: "c16", name: "TCS",                  country: "IN", emissions: makeMonthlyMix(230, mixes.it) },
  { id: "c17", name: "Embraer",              country: "BR", emissions: makeMonthlyMix(190, mixes.auto) },
  { id: "c18", name: "TotalEnergies",        country: "FR", emissions: makeMonthlyMix(710, mixes.refinery) },
  { id: "c19", name: "Shell",                country: "GB", emissions: makeMonthlyMix(960, mixes.refinery) },
  { id: "c20", name: "Bombardier",           country: "CA", emissions: makeMonthlyMix(330, mixes.auto) },
];

export const posts: Post[] = [
  { id: "p1",  title: "Sustainability Report",   resourceUid: "c1",  dateTime: "2024-02", content: "Quarterly CO2 update" },
  { id: "p2",  title: "Emission Reduction Plan", resourceUid: "c3",  dateTime: "2024-03", content: "Cut 15% in 5 years." },
  { id: "p3",  title: "Energy Mix Update",       resourceUid: "c5",  dateTime: "2024-01", content: "Coal → Gas shift." },
  { id: "p4",  title: "Green Manufacturing",     resourceUid: "c13", dateTime: "2024-02", content: "EV-first lines." },
  { id: "p5",  title: "Carbon Credit",           resourceUid: "c19", dateTime: "2024-03", content: "EU ETS opportunities." },
  { id: "p6",  title: "Hydrogen Project",        resourceUid: "c14", dateTime: "2024-01", content: "Fuel cell pilot." },
  { id: "p7",  title: "Wind Energy",             resourceUid: "c18", dateTime: "2024-03", content: "Offshore wind." },
  { id: "p8",  title: "Solar Efficiency",        resourceUid: "c8",  dateTime: "2024-02", content: "25% higher eff." },
  { id: "p9",  title: "Logistics Optimization",  resourceUid: "c6",  dateTime: "2024-03", content: "AI routing." },
  { id: "p10", title: "Biofuel Research",        resourceUid: "c7",  dateTime: "2024-01", content: "Aviation biofuels." },
];
