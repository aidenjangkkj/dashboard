// src/lib/types.ts
export type GhgEmission = {
  yearMonth: string; // "2024-01"
  source: string; // "gasoline" | "lpg" | "diesel" ...
  emissions: number; // tCO2e
};

export type Company = {
  id: string;
  name: string;
  country: string; // ISO code
  emissions: GhgEmission[];
};

export type Post = {
  id: string;
  title: string;
  resourceUid: string; // Company.id
  dateTime: string; // "2024-02"
  content: string;
};

export type Country = {
  code: string; // ISO 코드 (예: US, DE)
  name: string; // 풀네임 (예: United States)
  taxRate?: number; // (선택) 탄소세 가정치
};
