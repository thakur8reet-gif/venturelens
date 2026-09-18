import type { AnalysisResult } from "../domain";

export function buildDiligencePack(analysis: AnalysisResult) {
  const questions = [...analysis.diligenceQuestions];
  if (!questions.length) {
    questions.push(
      "What evidence most materially supports the current growth trajectory?",
      "What are the principal downside cases over the next 12–24 months?",
      "Which assumptions in the current financing valuation are most sensitive?"
    );
  }
  return {
    priority: analysis.concerns.length ? "targeted" : "standard",
    questions,
    evidenceGaps: analysis.missingEvidence,
  };
}
