"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SecCompany } from "@/lib/ingestion/sec";

const recentTickers = new Set([
  "SPCX", "BTGO", "CRWV", "CRCL", "FIG", "RBRK", "HNGE", "OMDA", "KRMN", "SAIL", "FIGR",
]);

export function SecCompanyList({ companies }: { companies: SecCompany[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return companies.filter(company => {
      if (!normalized) return true;
      return company.ticker.toLowerCase().includes(normalized) ||
        company.name.toLowerCase().includes(normalized);
    });
  }, [companies, query]);

  return (
    <div>
      <div className="sec-toolbar">
        <input
          className="sec-search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search ticker or company name…"
          aria-label="Search SEC companies"
        />
        <span className="muted">{filtered.length} of {companies.length}</span>
      </div>

      <div className="sec-list">
        {filtered.map(company => {
          const latest = company.financials.at(-1);
          const recent = recentTickers.has(company.ticker);
          return (
            <Link href={`/sec/${company.ticker}`} className="sec-row sec-row-link" key={company.cik}>
              <div className="sec-company-head">
                <div>
                  <div className="sec-title-line">
                    <strong>{company.ticker}</strong>
                    {recent && <span className="chip chip-accent">Recent listing</span>}
                  </div>
                  <div className="muted">{company.name}</div>
                </div>
                <span className="view-link">Open intelligence →</span>
              </div>
              <div className="sec-metrics">
                <span>Revenue <b>{formatCurrency(latest?.revenue)}</b></span>
                <span>Gross profit <b>{formatCurrency(latest?.grossProfit)}</b></span>
                <span>Capex <b>{formatCurrency(latest?.capex)}</b></span>
                <span>Cash <b>{formatCurrency(latest?.cash)}</b></span>
                <span>FCF <b>{formatCurrency(latest?.freeCashFlow)}</b></span>
                <span>FY end <b>{latest?.periodEnd ?? "—"}</b></span>
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && <div className="notice">No SEC company matches “{query}”.</div>}
      </div>
    </div>
  );
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
