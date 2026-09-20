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
    const recentPublicCompanies = ["CRWV", "CRCL", "FIG", "RBRK", "HNGE", "OMDA", "KRMN", "SAIL", "FIGR"];
    const baseTickers = configuredTickers.length ? configuredTickers : ["AAPL", "MSFT", "NVDA"];
    const tickers = [...new Set([...baseTickers, ...recentPublicCompanies])].slice(0, 18);
    secCompanies = await discoverSecCompanies(tickers);
  } catch (error) {
    secError = error instanceof Error ? error.message : "SEC data unavailable";
  }

  return <main className="shell">
    <header className="topbar"><div className="brand">VentureLens</div><div className="eyebrow">VC investment intelligence</div></header>

    <section className="hero">
      <div>
        <div className="eyebrow">Deal flow / analyst workspace</div>
        <h1>From deal discovery to investment diligence.</h1>
        <p>VentureLens combines deterministic financial feature engineering, configurable fund mandates, evidence provenance and analyst-oriented research workflows.</p>
      </div>
    </section>

    <section className="grid">
      <div className="card"><h2>Demo companies</h2><div className="metric">{demoStartups.length}</div><div className="muted">Synthetic data — clearly labelled</div></div>
      <div className="card"><h2>Mandate-compatible candidates</h2><div className="metric">{review}</div><div className="muted">{demoFund.name}</div></div>
      <div className="card"><h2>Live SEC universe</h2><div className="metric">{secCompanies.length}</div><div className="muted">Public-company XBRL facts</div></div>

      <div className="card wide">
        <h2>Demo deal flow</h2>
        <p className="muted">Acme AI and Northstar Systems are synthetic fixtures used to demonstrate the analytical workflow. Their values are inputs to the demo, not claims about real companies.</p>
        {demoStartups.map(s => <StartupCard key={s.id} startup={s} fund={demoFund}/>)}
      </div>

      <div className="card">
        <h2>Mandate</h2>
        <div className="chips">{demoFund.sectors.map(x=><span className="chip" key={x}>{x}</span>)}{demoFund.stages.map(x=><span className="chip" key={x}>{x.replace("_"," ")}</span>)}</div>
        <p className="muted">Cheque range: {(demoFund.chequeMin/1e6).toFixed(1)}–{(demoFund.chequeMax/1e6).toFixed(1)}M</p>
      </div>

      <div className="card wide">
        <h2>Live SEC financials</h2>
        <p className="muted">Search the SEC universe by ticker or company name. Recent public-company additions are included alongside the core large-cap set. Click any company for its expanded financial intelligence view.</p>
        {secError ? <div className="notice">{secError}</div> : <SecCompanyList companies={secCompanies}/>}
      </div>
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
