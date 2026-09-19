import Link from "next/link";
import { notFound } from "next/navigation";
import { demoFund, demoStartups } from "@/lib/demo-data";
import { analyzeStartup } from "@/lib/analysis";

export default async function StartupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const startup = demoStartups.find(s => s.slug === slug);
  if (!startup) notFound();

  const result = analyzeStartup(startup, demoFund);
  const latest = [...startup.financials].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd))[0];
  const features = result.features;

  const groups = [
    {
      title: "Growth & scale",
      items: ["revenue", "arr", "revenue_growth", "arr_growth", "revenue_cagr_2y", "arr_cagr_2y", "revenue_cagr_3y"],
    },
    {
      title: "Profitability & financial quality",
      items: ["gross_margin", "ebitda_margin", "fcf_margin"],
    },
    {
      title: "Unit economics",
      items: ["ltv_cac", "cac_payback_months", "nrr", "churn"],
    },
    {
      title: "Capital efficiency & liquidity",
      items: ["runway_months", "burn_multiple", "arr_capital_efficiency"],
    },
    {
      title: "Valuation & financing",
      items: ["arr_multiple", "dilution"],
    },
    {
      title: "Customer concentration & risk",
      items: ["top_customer_share"],
    },
  ];

  return <main className="shell">
    <div className="topbar">
      <Link href="/">← Deal flow</Link>
      <span className="eyebrow">Analysis {result.modelVersion}</span>
    </div>

    <section className="hero">
      <div>
        <div className="eyebrow">{startup.sector} · {startup.stage.replace("_", " ")} · {startup.geography}</div>
        <h1>{startup.name}</h1>
        <p>{startup.description}</p>
        <div className="chips">
          {startup.businessModel && <span className="chip">{startup.businessModel}</span>}
          <span className="chip">{startup.dataSource === "synthetic_demo" ? "Synthetic demo" : "SEC / reported data"}</span>
        </div>
      </div>
      <span className={`status ${result.analysis.status === "strong_fit" ? "good" : result.analysis.status === "mandate_mismatch" ? "bad" : "warn"}`}>{result.analysis.status.replaceAll("_", " ")}</span>
    </section>

    <section className="grid">
      <div className="card wide">
        <h2>Company snapshot</h2>
        <div className="snapshot-grid">
          <Stat label="Sector" value={startup.sector}/>
          <Stat label="Business model" value={startup.businessModel ?? "Not available"}/>
          <Stat label="Stage" value={startup.stage.replace("_", " ")}/>
          <Stat label="Geography" value={startup.geography}/>
          <Stat label="Latest period" value={latest?.periodEnd ?? "—"}/>
          <Stat label="Data source" value={startup.dataSource === "synthetic_demo" ? "Synthetic demo inputs" : "SEC EDGAR XBRL"}/>
        </div>
      </div>

      <div className="card">
        <h2>Latest financial snapshot</h2>
        <div className="input-list">
          <Stat label="Revenue" value={formatCurrency(latest?.revenue)}/>
          <Stat label="ARR" value={formatCurrency(latest?.arr)}/>
          <Stat label="Gross profit" value={formatCurrency(latest?.grossProfit)}/>
          <Stat label="Cash" value={formatCurrency(latest?.cash)}/>
          <Stat label="Net burn / month" value={formatCurrency(latest?.netBurn)}/>
          <Stat label="Free cash flow" value={formatCurrency(latest?.freeCashFlow)}/>
        </div>
      </div>

      <div className="card wide">
        <h2>Financial history</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Period</th><th>Revenue</th><th>ARR</th><th>Gross profit</th><th>Capex</th><th>Cash</th><th>Net burn</th><th>FCF</th></tr></thead>
            <tbody>{startup.financials.map(p => <tr key={p.periodEnd}>
              <td>{p.periodEnd}</td>
              <td>{formatCurrency(p.revenue)}</td>
              <td>{formatCurrency(p.arr)}</td>
              <td>{formatCurrency(p.grossProfit)}</td>
              <td>{formatCurrency(p.capex)}</td>
              <td>{formatCurrency(p.cash)}</td>
              <td>{formatCurrency(p.netBurn)}</td>
              <td>{formatCurrency(p.freeCashFlow)}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>

      {groups.map(group => <div className="card" key={group.title}>
        <h2>{group.title}</h2>
        <div className="feature-list">
          {group.items.map(name => {
            const feature = features[name];
            if (!feature) return null;
            return <MetricRow key={name} name={name} feature={feature}/>;
          })}
        </div>
      </div>)}

      <div className="card">
        <h2>Latest financing</h2>
        {startup.latestRound ? <div className="input-list">
          <Stat label="Round" value={startup.latestRound.roundName}/>
          <Stat label="Announced" value={startup.latestRound.announcedAt}/>
          <Stat label="Round size" value={formatCurrency(startup.latestRound.amount)}/>
          <Stat label="Pre-money" value={formatCurrency(startup.latestRound.preMoney)}/>
          <Stat label="Post-money" value={formatCurrency(startup.latestRound.postMoney)}/>
        </div> : <div className="muted">Financing data unavailable.</div>}
      </div>

      <div className="card">
        <h2>Fund mandate fit</h2>
        <div className="input-list">
          <Stat label="Fund" value={demoFund.name}/>
          <Stat label="Sector" value={matchLabel(demoFund.sectors, startup.sector)}/>
          <Stat label="Stage" value={demoFund.stages.includes(startup.stage) ? "Match" : "No match"}/>
          <Stat label="Geography" value={matchLabel(demoFund.geographies, startup.geography)}/>
          <Stat label="Cheque range" value={`${formatCurrency(demoFund.chequeMin)} – ${formatCurrency(demoFund.chequeMax)}`}/>
        </div>
      </div>

      <div className="card wide">
        <h2>Investment profile</h2>
        <p className="muted">These are transparent v1 analytical dimensions, not a substitute for investment committee judgment.</p>
        {Object.entries(result.analysis.dimensions).map(([name, d]) => <div className="dimension" key={name}>
          <span>{title(name)}</span>
          <div className="bar"><div className="fill" style={{ width: `${d.score ?? 0}%` }}/></div>
          <strong>{d.score ?? "—"}</strong>
        </div>)}
      </div>

      <div className="card">
        <h2>Key positives</h2>
        <ul className="list">{result.analysis.positives.length ? result.analysis.positives.map(x => <li key={x}>{x}</li>) : <li>None identified from available evidence.</li>}</ul>
      </div>
      <div className="card">
        <h2>Concerns</h2>
        <ul className="list">{result.analysis.concerns.length ? result.analysis.concerns.map(x => <li key={x}>{x}</li>) : <li>None identified from available evidence.</li>}</ul>
      </div>
      <div className="card">
        <h2>Missing evidence</h2>
        <ul className="list">{result.analysis.missingEvidence.length ? result.analysis.missingEvidence.map(x => <li key={x}>{x}</li>) : <li>No major missing features in the current model.</li>}</ul>
      </div>
      <div className="card wide">
        <h2>Diligence queue</h2>
        <ul className="list">{result.analysis.diligenceQuestions.length ? result.analysis.diligenceQuestions.map(x => <li key={x}>{x}</li>) : <li>No automated diligence question generated.</li>}</ul>
      </div>

      <div className="card wide">
        <h2>Data provenance</h2>
        <div className="provenance"><strong>Basis:</strong> {startup.sourceNote}</div>
        <p className="source-line">
          Reported values are displayed as inputs. Calculated metrics show their formulas and input fields. If an input is unavailable, VentureLens shows that explicitly instead of inventing a value.
        </p>
      </div>
    </section>
  </main>;
}

function MetricRow({ name, feature }: { name: string; feature: { value: number | null; unit: string; evidence: string; formula?: string; reason?: string; inputs?: string[] } }) {
  const value = feature.value === null ? "N/A" : formatFeature(feature.value, feature.unit);
  const basis = feature.evidence === "calculated"
    ? `${feature.formula ?? "Calculated"}${feature.inputs?.length ? ` · Inputs: ${feature.inputs.join(", ")}` : ""}`
    : feature.evidence === "reported"
      ? "Reported input"
      : feature.reason ?? "Unavailable";

  return <div className="feature-row">
    <div>
      <strong>{title(name)}</strong>
      <div className="muted">{basis}</div>
    </div>
    <div className="metric-value"><b>{value}</b><small>{feature.evidence}</small></div>
  </div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="stat"><span>{label}</span><b>{value}</b></div>;
}

function matchLabel(values: string[], value: string) {
  return values.length === 0 ? "No restriction" : values.some(v => v.toLowerCase() === value.toLowerCase()) ? "Match" : "No match";
}

function title(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
}

function formatCurrency(value?: number) {
  if (value === undefined) return "N/A";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatFeature(value: number, unit: string) {
  if (unit === "ratio") return `${(value * 100).toFixed(1)}%`;
  if (unit === "multiple") return `${value.toFixed(2)}x`;
  if (unit === "months") return `${value.toFixed(1)} mo`;
  if (unit === "currency") return formatCurrency(value);
  return value.toFixed(2);
}
