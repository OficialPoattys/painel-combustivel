import React from 'react'

export default function DataCard({ label, value, subValue, status }) {
  return (
    <div className="data-card reveal">
      <div className="card-label">{label}</div>
      <div className="card-main">
        <span className="card-value text-mono">{value}</span>
        <span className="card-sub text-mono">{subValue}</span>
      </div>
      <div className={`card-status ${status}`}>
        {status === 'alert' ? 'ANOMALIA DETECTADA' : 'MARGEM NORMAL'}
      </div>
      <style jsx>{`
        .data-card {
          border: 1px solid var(--color-border-light);
          padding: 1.5rem;
          background: white;
          margin-bottom: 1rem;
        }
        .card-label {
          font-size: 0.7rem;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--color-ink-muted);
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--color-border-light);
          padding-bottom: 0.5rem;
        }
        .card-main {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .card-value {
          font-size: 3rem;
          font-weight: 700;
          letter-spacing: -0.05em;
        }
        .card-sub {
          font-size: 1.2rem;
          color: var(--color-ink-muted);
        }
        .card-status {
          font-size: 0.65rem;
          font-weight: 900;
          padding: 0.25rem 0.5rem;
          display: inline-block;
        }
        .card-status.alert { background: var(--color-market-down); color: white; }
        .card-status.normal { border: 1px solid var(--color-market-up); color: var(--color-market-up); }
      `}</style>
    </div>
  )
}
