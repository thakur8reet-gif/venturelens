import { NextResponse } from "next/server";
import { discoverSecCompanies } from "@/lib/ingestion/sec";
import { persistSecCompanies } from "@/lib/ingestion/sec-persistence";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickers = (process.env.SEC_TICKERS ?? "AAPL,MSFT,NVDA")
    .split(",")
    .map(value => value.trim().toUpperCase())
    .filter(Boolean);

  const job = await prisma.ingestionJob.create({
    data: {
      provider: "SEC",
      status: "RUNNING",
      metadata: { tickers },
    },
  });

  try {
    const companies = await discoverSecCompanies(tickers);
    const result = await persistSecCompanies(companies);

    await prisma.ingestionJob.update({
      where: { id: job.id },
      data: {
        status: "SUCCEEDED",
        finishedAt: new Date(),
        recordsRead: companies.length,
        recordsWritten: result.startups + result.periods + result.facts,
      },
    });

    return NextResponse.json({ ok: true, provider: "SEC", tickers, companiesFound: companies.length, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ingestion error";
    await prisma.ingestionJob.update({
      where: { id: job.id },
      data: { status: "FAILED", finishedAt: new Date(), error: message },
    });
    return NextResponse.json({ ok: false, provider: "SEC", error: message }, { status: 500 });
  }
}
