// src/app/api/rates/route.ts
import { NextResponse } from "next/server";
import { toMessage } from "@/lib/error";
const LIVE_REVALIDATE_SEC = 60 * 60;       // 1h
const DAILY_REVALIDATE_SEC = 60 * 60 * 24; // 24h

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const mode = (searchParams.get("mode") || "live") as "live" | "historical";
  const source = (searchParams.get("source") || "USD").toUpperCase();       // 예: USD
  const symbols = (searchParams.get("symbols") || "USD,KRW").toUpperCase(); // 예: USD,KRW
  const date = searchParams.get("date") || undefined;                       // YYYY-MM-DD

  const baseUrl =
    mode === "historical"
      ? "https://api.exchangerate.host/historical"
      : "https://api.exchangerate.host/live";

  const params = new URLSearchParams({
    access_key: process.env.EXCHANGE_API_KEY || "",
    source,
    currencies: symbols,
    format: "1",
  });
  if (mode === "historical" && date) params.set("date", date);

  const url = `${baseUrl}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: mode === "historical" ? DAILY_REVALIDATE_SEC : LIVE_REVALIDATE_SEC },
    });
    const data = await res.json();

    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    if (data?.success === false || data?.error) {
      const msg = data?.error?.info || data?.error?.type || "FX API error";
      throw new Error(msg);
    }

    // 1) 요청한 심볼들을 배열로
    const reqSymbols = symbols
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // 2) 정방향( source→sym ) + 역방향( sym→source ) 모두 구성
    //    예: source=USD, sym=KRW 이면 "USDKRW" 값으로 "KRWUSD=1/USDKRW" 도 추가
    const pairRates: Record<string, number> = {};
    for (const sym of reqSymbols) {
      if (sym === source) {
        pairRates[`${source}${sym}`] = 1; // USDUSD = 1, KRWKRW = 1
        continue;
      }
      const forwardKey = `${source}${sym}`; // ex) USDKRW
      const forwardVal = data?.quotes?.[forwardKey];

      if (typeof forwardVal !== "number") {
        throw new Error(`Missing quote for ${forwardKey}`);
      }
      pairRates[forwardKey] = forwardVal;         // USDKRW
      pairRates[`${sym}${source}`] = 1 / forwardVal; // KRWUSD
    }

    return NextResponse.json({
      mode,
      date: mode === "historical" ? date : undefined,
      baseSource: source,            // 원본 요청 기준 통화
      pairRates,                     // "USDKRW", "KRWUSD", "USDUSD", "KRWKRW" 등
      timestamp: data.timestamp,
      success: true,
    });
  } catch (e: unknown) {
  // 안전 기본치: USDKRW=1350, KRWUSD=1/1350
  return NextResponse.json(
    {
      mode,
      date: mode === "historical" ? date : undefined,
      baseSource: "USD",
      pairRates: { USDKRW: 1350, KRWUSD: 1 / 1350, USDUSD: 1, KRWKRW: 1 },
      fallback: true,
      message: toMessage(e, "FX fallback"), // ✅ 유틸 사용
    },
    { status: 200 }
  );
}
}
