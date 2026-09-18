import { NextResponse } from "next/server";
import { demoFund, demoStartups } from "@/lib/demo-data";
import { analyzeStartup } from "@/lib/analysis";

export async function GET() {
  const data = demoStartups.map(startup => {
    const result = analyzeStartup(startup, demoFund);
    return { startup, status: result.analysis.status, dimensions: result.analysis.dimensions, modelVersion: result.modelVersion };
  });
  return NextResponse.json({ data, fund: demoFund, generatedAt: new Date().toISOString() });
}
