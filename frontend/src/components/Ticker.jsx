import React from 'react'

export default function Ticker({ dados }) {
  // Dados de exemplo para o ticker
  const items = [
    { label: 'GASOLINA SP', value: '5.62', change: -0.12 },
    { label: 'DIESEL RJ', value: '6.15', change: 0.05 },
    { label: 'ETANOL MG', value: '3.89', change: -1.20 },
    { label: 'BRENT OIL', value: '82.45', change: 0.45 }
  ]

  return (
    <div className="ticker">
      <div className="ticker-track">
        {items.concat(items).map((item, i) => (
          <div key={i} className="ticker-item">
            <span className="ticker-label">{item.label}</span>
            <span className="ticker-value text-mono">{item.value}</span>
            <span className={`ticker-change ${item.change >= 0 ? 'up' : 'down'}`}>
              {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change)}%
            </span>
          </div>
        ))}
      </div>
      <style jsx>{`
        .ticker {
          background: var(--color-ink);
          color: white;
          padding: 0.5rem 0;
          overflow: hidden;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .ticker-track {
          display: flex;
          animation: scroll 40s linear infinite;
          white-space: nowrap;
        }
        .ticker-item {
          display: flex;
          gap: 0.75rem;
          padding: 0 2rem;
          border-right: 1px solid #333;
        }
        .ticker-label { color: #888; }
        .ticker-change.up { color: var(--color-market-up); }
        .ticker-change.down { color: var(--color-market-down); }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  )
}
