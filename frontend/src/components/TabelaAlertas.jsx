const fmt = n => n?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '–'

const NIVEL_CONFIG = {
  anomalia: { dotCls: 'dot dot-anomalia', label: 'Anomalia', color: '#B91C1C' },
  atencao:  { dotCls: 'dot dot-atencao',  label: 'Atenção',  color: '#D97706' },
  normal:   { dotCls: 'dot dot-normal',   label: 'Normal',   color: '#2B6E3F' },
}

const NOMES_PRODUTOS = {
  'GASOLINA COMUM':     'Gasolina Comum',
  'ETANOL HIDRATADO':  'Etanol Hidratado',
  'GASOLINA ADITIVADA': 'Gasolina Aditivada',
}

const NOMES_BANDEIRA = {
  VIBRA: 'Vibra / BR', IPIRANGA: 'Ipiranga',
  RAIZEN: 'Raízen / Shell', BRANCA: 'Bandeira Branca', OUTRAS: 'Outras',
}

export default function TabelaAlertas({ alertas = [] }) {
  if (alertas.length === 0) {
    return (
      <div className="empty-alerts">
        ✅ Nenhuma distorção de margem detectada esta semana. Preços dentro da faixa histórica normal.
      </div>
    )
  }

  return (
    <div id="tabela-alertas" className="card alertas-table">   {/* ← ID adicionado */}
      <div className="alertas-header">
        <span>Alertas da semana</span>
        <span className="alertas-count">
          {alertas.filter(a => a.nivel === 'anomalia').length} anomalias ·{' '}
          {alertas.filter(a => a.nivel === 'atencao').length} atenções
        </span>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Estado</th><th>Combustível</th><th>Bandeira</th>
              <th style={{ textAlign: 'right' }}>Preço Atual</th>
              <th style={{ textAlign: 'right' }}>Margem Est.</th>
              <th style={{ textAlign: 'right' }}>Var. Margem</th>
              <th>Nível</th><th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {alertas.map((a, i) => {
              const cfg = NIVEL_CONFIG[a.nivel] ?? NIVEL_CONFIG.normal
              const varPos = a.variacao_pct > 0
              return (
                <tr key={i}>
                  <td><strong>{a.estado}</strong></td>
                  <td>{NOMES_PRODUTOS[a.produto] ?? a.produto}</td>
                  <td>{NOMES_BANDEIRA[a.bandeira] ?? a.bandeira}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>R${fmt(a.preco_atual)}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)' }}>R${fmt(a.margem_atual)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: varPos ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {varPos ? '+' : ''}{a.variacao_pct?.toFixed(1)}%
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', color: cfg.color, fontSize: '12px', fontWeight: 600 }}>
                      <span className={cfg.dotCls} />
                      {cfg.label}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)', maxWidth: '260px' }}>
                    {a.descricao}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="alertas-footer">
        <span>Alerta quando a margem supera {'>'}15% da média histórica de 12 semanas.</span>
        <span>Fonte: ANP – Levantamento de Preços de Combustíveis</span>
      </div>
    </div>
  )
}