import { demoFund, demoStartups } from "@/lib/demo-data";
import { analyzeStartup } from "@/lib/analysis";
import { StartupCard } from "@/components/startup-card";
import { discoverSecCompanies } from "@/lib/ingestion/sec";
import { SecCompanyList } from "@/components/sec-company-list";

export const dynamic = "force-dynamic";

export default async function Home() {
  const analyses = demoStartups.map(s => analyzeStartup(s, demoFund));
  const review = analyses.filter(x => x.analysis.status !== "mandate_mismatch").length;

  let secCompanies: Awaited<ReturnType<typeof discoverSecCompanies>> = [];
  let secError: string | null = null;
  try {
    const configuredTickers = (process.env.SEC_TICKERS ?? "")
      .split(",")
      .map(value => value.trim().toUpperCase())
      .filter(Boolean);
    const recentPublicCompanies = ["SPCX", "BTGO", "CRWV", "CRCL", "FIG", "RBRK", "HNGE", "OMDA", "KRMN", "SAIL", "FIGR"];
    const baseTickers = [...new Set([...configuredTickers, "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "AVGO", "ORCL", "NFLX", "COST"])];
    const tickers = [...new Set([...baseTickers, ...recentPublicCompanies])].slice(0, 18);
    secCompanies = await discoverSecCompanies(tickers);
  } catch (error) {
    secError = error instanceof Error ? error.message : "SEC data unavailable";
  }

  return <main className="shell">
    <header className="topbar">
      <div className="brand-lockup"><div className="brand">VentureLens</div><span className="brand-dot" aria-hidden="true" /></div>
      <div className="topbar-meta"><span className="eyebrow">Investment intelligence</span><span className="live-pill"><span /> Live SEC</span></div>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow">Deal flow / analyst workspace</div>
        <h1>See the evidence behind the deal.</h1>
        <p>VentureLens turns company filings and financial inputs into a focused diligence workspace — with reported facts, derived metrics and missing evidence kept visibly separate.</p>
        <div className="hero-actions"><a href="#live-sec" className="primary-action">Explore live companies <span>↓</span></a><a href="#demo" className="secondary-action">Review demo flow</a></div>
      </div>
      <div className="hero-signal"><span className="signal-label">Evidence first</span><strong>Reported → Derived → Decision</strong><small>Every analytical output traces back to an available input.</small></div>
    </section>

    <section className="grid">
      <div className="card kpi-card"><div className="kpi-top"><span className="kpi-index">01</span><span className="kpi-label">Demo universe</span></div><div className="card"><h2>Demo companies</h2><div className="metric">{demoStartups.length}</div><div className="muted">Synthetic data — clearly labelled</div></div>
      <div className="card"><h2>Mandate-compatible candidates</h2><div className="metric">{review}</div><div className="muted">{demoFund.name}</div></div>
      <div className="card"><h2>Live SEC universe</h2><div className="metric">{secCompanies.length}</div><div className="muted">Public-company XBRL facts</div></div>

      <div className="card wide section-card" id="demo">
        <div className="section-heading"><div><span className="section-kicker">Workspace</span><h2>Demo deal flow</h2></div><span className="section-count">{demoStartups.length} companies</span></div>
        <p className="muted">Acme AI and Northstar Systems are synthetic fixtures used to demonstrate the analytical workflow. Their values are inputs to the demo, not claims about real companies.</p>
        {demoStartups.map(s => <StartupCard key={s.id} startup={s} fund={demoFund}/>)}
      </div>

      <div className="card mandate-card">
        <div className="section-heading"><div><span className="section-kicker">Configuration</span><h2>Mandate</h2></div></div>
        <div className="chips">{demoFund.sectors.map(x=><span className="chip" key={x}>{x}</span>)}{demoFund.stages.map(x=><span className="chip" key={x}>{x.replace("_"," ")}</span>)}</div>
        <p className="muted">Cheque range: {(demoFund.chequeMin/1e6).toFixed(1)}–{(demoFund.chequeMax/1e6).toFixed(1)}M</p>
      </div>

      <div className="card wide section-card" id="live-sec">
        <div className="section-heading"><div><span className="section-kicker">Live evidence</span><h2>SEC financials</h2></div><span className="source-badge">SEC EDGAR / XBRL</span></div>
        <p className="muted">Search the SEC universe by ticker or company name. Recent public-company additions are included alongside the core large-cap set. Click any company for its expanded financial intelligence view.</p>
        {secError ? <div className="notice">{secError}</div> : <SecCompanyList companies={secCompanies}/>}
      </div>
    </section>
  </main>;
}

function formatCurrency(value?: number) {
  if (value === undefined) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}
