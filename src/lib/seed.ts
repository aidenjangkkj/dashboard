import { Company, Country, Post } from "@/lib/types";

export const countries: Country[] = [
  { code: "US", name: "United States", taxRate: 50 },
  { code: "DE", name: "Germany", taxRate: 45 },
  // 필요 시 더 추가
];

export const companies: Company[] = [
  {
    id: "c1",
    name: "Acme Corp",
    country: "US",
    emissions: [
      { yearMonth: "2024-01", source: "gasoline", emissions: 120 },
      { yearMonth: "2024-02", source: "diesel", emissions: 110 },
      { yearMonth: "2024-03", source: "lpg", emissions: 95 },
    ],
  },
  {
    id: "c2",
    name: "Globex",
    country: "DE",
    emissions: [
      { yearMonth: "2024-01", source: "diesel", emissions: 80 },
      { yearMonth: "2024-02", source: "gasoline", emissions: 105 },
      { yearMonth: "2024-03", source: "lpg", emissions: 120 },
    ],
  },
];

export const posts: Post[] = [
  {
    id: "p1",
    title: "Sustainability Report",
    resourceUid: "c1",
    dateTime: "2024-02",
    content: "Quarterly CO2 update",
  },
];
