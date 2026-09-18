import type { AnalysisResult, Startup } from "../domain";
import type { Evidence } from "./evidence";
import { formatCitation } from "./evidence";

export interface InvestmentMemo {
  title: string;
  summary: string;
  sections: { heading: string; bullets: string[] }[];
  evidence: string[];
}

export function generateInvestmentMemo(startup: Startup, analysis: AnalysisResult, evidence: Evidence[] = []): InvestmentMemo {
  const evidenceLines = evidence.map(formatCitation);
  return {
    title: `${startup.name} — Investment Review`,
    summary: `VentureLens classifies this opportunity as "${analysis.status.replaceAll("_", " ")}" under the configured methodology. This is an analyst-prioritization output, not a prediction of investment returns.`,
    sections: [
      { heading: "Investment case", bullets: analysis.positives.length ? analysis.positives : ["No material positive signal was established from the available evidence."] },
      { heading: "Key concerns", bullets: analysis.concerns.length ? analysis.concerns : ["No material concern was automatically flagged."] },
      { heading: "Evidence gaps", bullets: analysis.missingEvidence.length ? analysis.missingEvidence : ["No material evidence gap was detected by the v1 rules."] },
      { heading: "Diligence questions", bullets: analysis.diligenceQuestions },
    ],
    evidence: evidenceLines,
  };
}
