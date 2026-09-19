import Link from "next/link";
import { notFound } from "next/navigation";
import { demoFund, demoStartups } from "@/lib/demo-data";
import { analyzeStartup } from "@/lib/analysis";

export default async function StartupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const startup = demoStartups.find(s => s.slug === slug);
  if (!startup) notFound();
  const result = analyzeStartup(startup, demoFund);

  const latest = [...startup.financials].sort((a,b) => b.periodEnd.localeCompare(a.periodEnd))[0];
  const latestFeatures = Object.entries(result.features);

  return <main className="shell">
    <div className="topbar"><Link href="/">← Deal flow</Link><span className="eyebrow">Analysis {result.modelVersion}</span></div>

    <section className="hero">
      <div>
        <div className="eyebrow">{startup.sector} · {startup.stage.replace("_"," ")}</div>
        <h1>{startup.name}</h1>
        <p>{startup.description}</p>
      </div>
      <span className="status warn">{result.analysis.status.replaceAll("_"," ")}</span>
    </section>

    <section className="grid">
      <div className="card wide">
        <h2>Financials</h2>
        <div className="provenance"><strong>Data basis:</strong> {startup.sourceNote}</div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Period end</th><th>Revenue</th><th>ARR</th><th>Gross profit</th><th>Capex</th><th>Cash</th><th>Free cash flow</th></tr></thead>
            <tbody>{startup.financials.map(p => <tr key={p.periodEnd}>
              <td>{p.periodEnd}</td>
              <td>{formatCurrency(p.revenue)}</td>
              <td>{formatCurrency(p.arr)}</td>
              <td>{formatCurrency(p.grossProfit)}</td>
              <td>{formatCurrency(p.capex)}</td>
              <td>{formatCurrency(p.cash)}</td>
              <td>{formatCurrency(p.freeCashFlow)}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <p className="source-line">{startup.dataSource === "synthetic_demo" ? "Synthetic demo inputs — no external financial source." : "Reported financial data — see source provenance."}</p>
      </div>

      <div className="card">
        <h2>Latest reported inputs</h2>
        <div className="input-list">
          <div><span>Revenue</span><b>{formatCurrency(latest?.revenue)}</b></div>
          <div><span>Gross profit</span><b>{formatCurrency(latest?.grossProfit)}</b></div>
          <div><span>Capex</span><b>{formatCurrency(latest?.capex)}</b></div>
          <div><span>Cash</span><b>{formatCurrency(latest?.cash)}</b></div>
          <div><span>Free cash flow</span><b>{formatCurrency(latest?.freeCashFlow)}</b></div>
        </div>
      </div>

      <div className="card">
        <h2>How VentureLens derives metrics</h2>
        <div className="feature-list">{latestFeatures.map(([name, feature]) => <div className="feature-row" key={name}>
          <div><strong>{pretty(name)}</strong><div className="muted">{feature.evidence === "calculated" ? `${feature.formula}${feature.inputs?.length ? ` · Inputs: ${feature.inputs.join(", ")}` : ""}` : feature.reason ?? "Reported input"}</div></div>
          <b>{formatFeature(feature.value, feature.unit)}</b>
        </div>)}</div>
      </div>

      <div className="card wide"><h2>Investment profile</h2>{Object.entries(result.analysis.dimensions).map(([name,d])=><div className="dimension" key={name}><span>{name.replace(/([A-Z])/g," $1")}</span><div className="bar"><div className="fill" style={{width:`${d.score ?? 0}%`}}/></div><strong>{d.score ?? "—"}</strong></div>)}</div>
      <div className="card"><h2>Key positives</h2><ul className="list">{result.analysis.positives.map(x=><li key={x}>{x}</li>)}</ul></div>
      <div className="card"><h2>Concerns</h2><ul className="list">{result.analysis.concerns.length ? result.analysis.concerns.map(x=><li key={x}>{x}</li>) : <li>No current flags.</li>}</ul></div>
      <div className="card"><h2>Missing evidence</h2><ul className="list">{result.analysis.missingEvidence.map(x=><li key={x}>{x}</li>)}</ul></div>
      <div className="card wide"><h2>Diligence queue</h2><ul className="list">{result.analysis.diligenceQuestions.map(x=><li key={x}>{x}</li>)}</ul></div>
    </section>
  </main>;
}

function pretty(value: string) {
  return value.replaceAll("_"," ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatCurrency(value?: number) {
  if (value === undefined) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}$${(abs/1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs/1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs/1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatFeature(value: number | null, unit: string) {
  if (value === null) return "—";
  if (unit === "ratio") return `${(value * 100).toFixed(1)}%`;
  if (unit === "multiple") return `${value.toFixed(2)}x`;
  if (unit === "months") return `${value.toFixed(1)} mo`;
  if (unit === "currency") return formatCurrency(value);
  return value.toFixed(2);
}
