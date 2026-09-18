import { NextResponse } from "next/server";
import { demoFund, demoStartups } from "@/lib/demo-data";
import { analyzeStartup } from "@/lib/analysis";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const startup = demoStartups.find(s => s.slug === slug);
  if (!startup) return NextResponse.json({ error: "Startup not found" }, { status: 404 });
  return NextResponse.json(analyzeStartup(startup, demoFund));
}
