import React from 'react'

export default function Ticker({ items = [] }) {
  const tickerItems = items.length > 0 ? items : [
    { label: 'GASOLINA SP', value: '5.62', change: -0.12 },
    { label: 'DIESEL RJ', value: '6.15', change: 0.05 },
    { label: 'ETANOL MG', value: '3.89', change: -1.20 }
  ]

  return (
    <div style={{
      background: 'var(--color-ink)',
      color: 'white',
      padding: '0.5rem 0',
      overflow: 'hidden',
      fontSize: '0.75rem',
      fontWeight: '700'
    }}>
      <div style={{
        display: 'flex',
        white-space: 'nowrap',
        animation: 'scroll 40s linear infinite'
      }}>
        {tickerItems.concat(tickerItems).map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            gap: '0.75rem',
            padding: '0 2rem',
            borderRight: '1px solid #333'
          }}>
            <span style={{ color: '#888' }}>{item.label}</span>
            <span className="text-mono">{item.value}</span>
            <span style={{ color: item.change >= 0 ? 'var(--color-market-up)' : 'var(--color-market-down)' }}>
              {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
