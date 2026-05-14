import React from 'react'

export default function TabelaAlertas({ alerts = [] }) {
  return (
    <div className="table-wrapper reveal">
      <table className="editorial-table">
        <thead>
          <tr>
            <th>JURISDIÇÃO</th>
            <th>PRODUTO</th>
            <th>PREÇO MÉDIO</th>
            <th>MARGEM EST.</th>
            <th>VARIAÇÃO</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {alerts.length > 0 ? alerts.map((item, i) => (
            <tr key={i}>
              <td className="font-bold">{item.estado}</td>
              <td>{item.produto}</td>
              <td className="text-mono">R$ {item.preco}</td>
              <td className="text-mono">R$ {item.margem}</td>
              <td className={`text-mono ${item.var > 0 ? 'text-up' : 'text-down'}`}>
                {item.var > 0 ? '+' : ''}{item.var}%
              </td>
              <td>
                <span className={`badge ${item.status}`}>
                  {item.status.toUpperCase()}
                </span>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                Nenhuma anomalia detectada na jurisdição selecionada.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <style jsx>{`
        .table-wrapper {
          margin-top: 2rem;
          border-top: 2px solid var(--color-ink);
          background: white;
        }
        .editorial-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .editorial-table th {
          text-align: left;
          padding: 1rem 0.5rem;
          border-bottom: 1px solid var(--color-ink);
          font-weight: 900;
          color: var(--color-ink-muted);
        }
        .editorial-table td {
          padding: 1rem 0.5rem;
          border-bottom: 1px solid var(--color-border-light);
        }
        .font-bold { font-weight: 700; }
        .text-up { color: var(--color-market-up); }
        .text-down { color: var(--color-market-down); }
        .badge {
          font-size: 0.65rem;
          font-weight: 900;
          padding: 0.2rem 0.4rem;
          border-radius: 2px;
        }
        .badge.alerta { background: #fff0f0; color: var(--color-market-down); border: 1px solid var(--color-market-down); }
        .badge.normal { background: #f0fff0; color: var(--color-market-up); border: 1px solid var(--color-market-up); }
      `}</style>
    </div>
  )
}
