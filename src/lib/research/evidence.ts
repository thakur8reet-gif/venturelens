export interface Evidence {
  id: string;
  claim: string;
  sourceTitle: string;
  sourceUrl?: string;
  page?: number;
  evidenceType: "reported" | "calculated" | "estimated" | "company_claim";
  confidence: "high" | "medium" | "low";
}

export function formatCitation(evidence: Evidence): string {
  const location = evidence.page ? `, p. ${evidence.page}` : "";
  return `[${evidence.sourceTitle}${location}]`;
}
