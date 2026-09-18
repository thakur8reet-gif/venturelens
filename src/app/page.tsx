import { demoFund, demoStartups } from "@/lib/demo-data";
import { analyzeStartup } from "@/lib/analysis";
import { StartupCard } from "@/components/startup-card";

export default function Home() {
  const analyses = demoStartups.map(s => analyzeStartup(s, demoFund));
  const review = analyses.filter(x => x.analysis.status !== "mandate_mismatch").length;
  return <main className="shell">
    <header className="topbar"><div className="brand">VentureLens</div><div className="eyebrow">VC investment intelligence</div></header>
    <section className="hero">
      <div><div className="eyebrow">Deal flow / analyst workspace</div><h1>From deal discovery to investment diligence.</h1><p>VentureLens combines deterministic financial feature engineering, configurable fund mandates, evidence provenance and analyst-oriented research workflows.</p></div>
    </section>
    <section className="grid">
      <div className="card"><h2>Companies in demo universe</h2><div className="metric">{demoStartups.length}</div><div className="muted">Synthetic data only</div></div>
      <div className="card"><h2>Mandate-compatible candidates</h2><div className="metric">{review}</div><div className="muted">{demoFund.name}</div></div>
      <div className="card"><h2>Methodology</h2><div className="metric">v1.0</div><div className="muted">Explainable scoring</div></div>
      <div className="card wide"><h2>Deal flow</h2>{demoStartups.map(s => <StartupCard key={s.id} startup={s} fund={demoFund}/>)}</div>
      <div className="card"><h2>Mandate</h2><div className="chips">{demoFund.sectors.map(x=><span className="chip" key={x}>{x}</span>)}{demoFund.stages.map(x=><span className="chip" key={x}>{x.replace("_"," ")}</span>)}</div><p className="muted">Cheque range: {(demoFund.chequeMin/1e6).toFixed(1)}–{(demoFund.chequeMax/1e6).toFixed(1)}M</p></div>
    </section>
  </main>;
}
