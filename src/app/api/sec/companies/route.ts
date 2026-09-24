import { NextResponse } from "next/server";
import { discoverSecCompanies } from "@/lib/ingestion/sec";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const tickers = (process.env.SEC_TICKERS ?? "AAPL,MSFT,NVDA,GOOGL,AMZN,META,TSLA,AVGO,ORCL,NFLX,COST")
    .split(",")
    .map(value => value.trim().toUpperCase())
    .filter(Boolean);

  try {
    const companies = await discoverSecCompanies(tickers);
    return NextResponse.json(
      {
        provider: "SEC EDGAR",
        dataType: "public_company_financials",
        tickers,
        companies,
        retrievedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "SEC data is temporarily unavailable." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
