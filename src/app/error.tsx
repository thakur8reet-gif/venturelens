
"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="error-page">
      <div className="error-glow" aria-hidden="true" />
      <header className="error-topbar">
        <Link href="/" className="error-brand"><span />VentureLens</Link>
        <span className="error-status">SYSTEM ERROR</span>
      </header>
      <section className="error-hero">
        <div className="error-code">500</div>
        <p className="error-eyebrow">Something broke the evidence trail</p>
        <h1>We hit an unexpected error.</h1>
        <p className="error-copy">The page could not complete the request. Your workspace is safe; try the request again or return to the investment dashboard.</p>
        <div className="error-actions">
          <button type="button" onClick={() => reset()} className="error-primary">Try again</button>
          <Link href="/" className="error-secondary">Back to dashboard</Link>
        </div>
      </section>
      <footer className="error-footer">
        <div><span className="error-dot" />VentureLens</div>
        <span>Investment intelligence · Evidence first</span>
      </footer>
    </main>
  );
}
