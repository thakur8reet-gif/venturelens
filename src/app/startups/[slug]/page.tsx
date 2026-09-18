import { notFound } from "next/navigation";
import { demoFund, demoStartups } from "@/lib/demo-data";
import { analyzeStartup } from "@/lib/analysis";

export default async function StartupPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const startup = demoStartups.find(s => s.slug === slug);
  if (!startup) notFound();
  const result = analyzeStartup(startup, demoFund);
  return <main className="shell">
    <div className="topbar"><a href="/">← Deal flow</a><span className="eyebrow">Analysis {result.modelVersion}</span></div>
    <section className="hero"><div><div className="eyebrow">{startup.sector} · {startup.stage.replace("_"," ")}</div><h1>{startup.name}</h1><p>{startup.description}</p></div><span className="status warn">{result.analysis.status.replaceAll("_"," ")}</span></section>
    <section className="grid">
      <div className="card wide"><h2>Investment profile</h2>{Object.entries(result.analysis.dimensions).map(([name,d])=><div className="dimension" key={name}><span>{name.replace(/([A-Z])/g," $1")}</span><div className="bar"><div className="fill" style={{width:`${d.score ?? 0}%`}}/></div><strong>{d.score ?? "—"}</strong></div>)}</div>
      <div className="card"><h2>Key positives</h2><ul className="list">{result.analysis.positives.map(x=><li key={x}>{x}</li>)}</ul></div>
      <div className="card"><h2>Concerns</h2><ul className="list">{result.analysis.concerns.length ? result.analysis.concerns.map(x=><li key={x}>{x}</li>) : <li>No current flags.</li>}</ul></div>
      <div className="card"><h2>Missing evidence</h2><ul className="list">{result.analysis.missingEvidence.map(x=><li key={x}>{x}</li>)}</ul></div>
      <div className="card wide"><h2>Diligence queue</h2><ul className="list">{result.analysis.diligenceQuestions.map(x=><li key={x}>{x}</li>)}</ul></div>
    </section>
  </main>;
}
