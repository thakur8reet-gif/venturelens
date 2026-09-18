import { notFound } from "next/navigation";
import { demoFund, demoStartups } from "@/lib/demo-data";
import { analyzeStartup } from "@/lib/analysis";
import { generateInvestmentMemo } from "@/lib/research/memo";
import { buildDiligencePack } from "@/lib/research/diligence";

export default async function MemoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const startup = demoStartups.find(s => s.slug === slug);
  if (!startup) notFound();
  const result = analyzeStartup(startup, demoFund);
  const memo = generateInvestmentMemo(startup, result.analysis);
  const diligence = buildDiligencePack(result.analysis);
  return <main className="shell">
    <div className="topbar"><a href={`/startups/${startup.slug}`}>← Company</a><span className="eyebrow">Memo {result.modelVersion}</span></div>
    <div className="card" style={{maxWidth:900,margin:"auto"}}>
      <div className="eyebrow">Investment committee working memo</div>
      <h1>{memo.title}</h1>
      <p className="muted">{memo.summary}</p>
      {memo.sections.map(section => <section key={section.heading} style={{marginTop:28}}><h2>{section.heading}</h2><ul className="list">{section.bullets.map(b=><li key={b}>{b}</li>)}</ul></section>)}
      <section style={{marginTop:28}}><h2>Diligence priority</h2><p>{diligence.priority}</p></section>
      {memo.evidence.length > 0 && <section style={{marginTop:28}}><h2>Evidence</h2><ul className="list">{memo.evidence.map(e=><li key={e}>{e}</li>)}</ul></section>}
    </div>
  </main>;
}
