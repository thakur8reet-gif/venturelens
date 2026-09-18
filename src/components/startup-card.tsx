import Link from "next/link";
import type { Startup } from "@/lib/domain";
import { analyzeStartup } from "@/lib/analysis";
import type { FundMandate } from "@/lib/domain";

export function StartupCard({ startup, fund }: { startup: Startup; fund: FundMandate }) {
  const result = analyzeStartup(startup, fund);
  const growth = result.analysis.dimensions.growth.score;
  return <Link href={`/startups/${startup.slug}`} className="company">
    <div>
      <h3>{startup.name}</h3>
      <div className="muted">{startup.sector} · {startup.geography} · {startup.stage.replace("_"," ")}</div>
    </div>
    <div style={{textAlign:"right"}}>
      <span className={`status ${result.analysis.status === "strong_fit" ? "good" : result.analysis.status === "mandate_mismatch" ? "bad" : "warn"}`}>{result.analysis.status.replaceAll("_"," ")}</span>
      <div className="muted" style={{marginTop:6}}>Growth {growth ?? "—"}</div>
    </div>
  </Link>;
}
