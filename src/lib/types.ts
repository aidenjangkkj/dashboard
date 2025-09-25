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

// src/lib/types.ts (추가)
export type SourceKey = "scope1" | "scope2" | "scope3" | "etc";

// 월별 합산 라인차트용
export interface MonthRow {
  yearMonth: string;
  emissions: number;
}
// 파이차트 소스별 슬라이스용
export interface SourceSlice extends Record<string, number | string> {
  source: string;        // nameKey
  value: number;         // dataKey
}


// 스택드 바(월 x 소스)용
export interface MonthStackRow {
  yearMonth: string;
  // 동적 소스 키들 (scope1, scope2, ...)
  [k: string]: string | number; // yearMonth는 string, 나머지는 number
}

