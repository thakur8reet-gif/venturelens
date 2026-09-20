import Link from "next/link";
import { notFound } from "next/navigation";
import { discoverSecCompanies, companyToStartup } from "@/lib/ingestion/sec";
import { demoFund } from "@/lib/demo-data";
import { analyzeStartup } from "@/lib/analysis";

export const dynamic = "force-dynamic";

export default async function SecCompanyPage({ params }: { params: Promise<{ ticker: string }> }) {
  const { ticker } = await params;
  const normalizedTicker = ticker.trim().toUpperCase();

  let companies;
  try {
    companies = await discoverSecCompanies([normalizedTicker]);
  } catch {
    notFound();
  }

  const company = companies[0];
  if (!company) notFound();

  const startup = companyToStartup(company);
  const result = analyzeStartup(startup, demoFund);
  const financials = [...startup.financials].sort((a, b) => b.periodEnd.localeCompare(a.periodEnd));
  const latest = financials[0];

  return (
    <main className="shell">
      <div className="topbar">
        <Link href="/">← SEC universe</Link>
        <span className="eyebrow">SEC EDGAR · reported financial data</span>
      </div>

      <section className="hero">
        <div>
          <div className="eyebrow">{company.ticker} · Public company · United States</div>
          <h1>{company.name}</h1>
          <p>Expanded VentureLens intelligence view built from SEC EDGAR XBRL company facts. Reported accounting values are separated from VentureLens-derived metrics.</p>
          <div className="chips">
            <span className="chip">SEC XBRL</span>
            <span className="chip">CIK {company.cik}</span>
            <span className="chip">Reported inputs</span>
          </div>
        </div>
      </section>

      <section className="grid">
        <div className="card wide">
          <h2>Company snapshot</h2>
          <div className="snapshot-grid">
            <Stat label="Ticker" value={company.ticker}/>
            <Stat label="CIK" value={company.cik}/>
            <Stat label="Latest period" value={latest?.periodEnd ?? "—"}/>
            <Stat label="Periods available" value={String(financials.length)}/>
            <Stat label="Data source" value="SEC EDGAR XBRL"/>
            <Stat label="Evidence basis" value="Reported filings"/>
          </div>
        </div>

        <div className="card">
          <h2>Latest financial snapshot</h2>
          <div className="input-list">
            <Stat label="Revenue" value={formatCurrency(latest?.revenue)}/>
            <Stat label="Gross profit" value={formatCurrency(latest?.grossProfit)}/>
            <Stat label="Capex" value={formatCurrency(latest?.capex)}/>
            <Stat label="Cash" value={formatCurrency(latest?.cash)}/>
            <Stat label="Free cash flow" value={formatCurrency(latest?.freeCashFlow)}/>
          </div>
        </div>

        <div className="card wide">
          <h2>Financial history</h2>
          <p className="muted">Only figures present in the SEC XBRL facts are shown. Missing facts remain unavailable rather than being estimated.</p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Period</th><th>Revenue</th><th>Gross profit</th><th>Capex</th><th>Cash</th><th>FCF</th></tr></thead>
              <tbody>{financials.map(period => (
                <tr key={period.periodEnd}>
                  <td>{period.periodEnd}</td>
                  <td>{formatCurrency(period.revenue)}</td>
                  <td>{formatCurrency(period.grossProfit)}</td>
                  <td>{formatCurrency(period.capex)}</td>
                  <td>{formatCurrency(period.cash)}</td>
                  <td>{formatCurrency(period.freeCashFlow)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>

        <div className="card wide">
          <h2>Derived intelligence</h2>
          <p className="muted">These are calculated by VentureLens from reported SEC inputs; they are not figures reported by the company.</p>
          <div className="feature-list">
            {[
              "revenue_growth",
              "revenue_cagr_2y",
              "revenue_cagr_3y",
              "gross_margin",
              "fcf_margin",
              "burn_multiple",
              "runway_months",
              "arr_capital_efficiency",
            ].map(name => {
              const feature = result.features[name];
              if (!feature) return null;
              return <MetricRow key={name} name={name} feature={feature}/>;
            })}
          </div>
        </div>

        <div className="card">
          <h2>Data provenance</h2>
          <div className="provenance">
            <strong>SEC source:</strong> {company.facts[0]?.sourceUrl ?? "SEC EDGAR Company Facts"}
          </div>
          <p className="source-line">The underlying company-facts payload is retained as source evidence. VentureLens does not fabricate unavailable ARR, CAC, LTV, NRR, valuation, or private-market financing data.</p>
        </div>

        <div className="card">
          <h2>Analytical status</h2>
          <div className={`status ${result.analysis.status === "strong_fit" ? "good" : result.analysis.status === "mandate_mismatch" ? "bad" : "warn"}`}>
            {result.analysis.status.replaceAll("_", " ")}
          </div>
          <p className="muted" style={{marginTop:12}}>This status uses the current demo fund mandate and is intended to expose the analysis pipeline, not to represent an investment recommendation.</p>
        </div>
      </section>
    </main>
  );
}

function MetricRow({ name, feature }: { name: string; feature: { value: number | null; unit: string; evidence: string; formula?: string; reason?: string; inputs?: string[] } }) {
  const value = feature.value === null ? "N/A" : formatFeature(feature.value, feature.unit);
  const basis = feature.evidence === "calculated"
    ? `${feature.formula ?? "Calculated"}${feature.inputs?.length ? ` · Inputs: ${feature.inputs.join(", ")}` : ""}`
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
