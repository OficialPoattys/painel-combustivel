const fmt = n => n?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '–'

const NIVEL_CONFIG = {
  anomalia: { dotCls: 'dot dot-anomalia', label: 'Anomalia', color: '#991B1B' },
  atencao:  { dotCls: 'dot dot-atencao',  label: 'Atenção',  color: '#92400E' },
  normal:   { dotCls: 'dot dot-normal',   label: 'Normal',   color: '#166534' },
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
      <div id="tabela-alertas" style={{
        background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '10px',
        padding: '24px', textAlign: 'center', color: '#166534', fontSize: '14px',
      }}>
        ✅ Nenhuma distorção de margem detectada esta semana. Preços dentro da faixa histórica normal.
      </div>
    )
  }

  return (
    <div id="tabela-alertas" style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Cabeçalho da tabela */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid #F1F5F9',
        display: 'flex',
        alignItems: 'baseline',
        gap: '10px',
      }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
          Alertas da semana
        </div>
        <div style={{ fontSize: '11px', color: '#94A3B8' }}>
          {alertas.filter(a => a.nivel === 'anomalia').length} anomalias ·{' '}
          {alertas.filter(a => a.nivel === 'atencao').length} atenções
        </div>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Estado</th>
              <th>Combustível</th>
              <th>Bandeira</th>
              <th style={{ textAlign: 'right' }}>Preço Atual</th>
              <th style={{ textAlign: 'right' }}>Margem Est.</th>
              <th style={{ textAlign: 'right' }}>Var. Margem</th>
              <th>Nível</th>
              <th>Descrição</th>
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
                  <td style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace', fontWeight: 600 }}>
                    R${fmt(a.preco_atual)}
                  </td>
                  <td style={{ textAlign: 'right', fontFamily: 'IBM Plex Mono, monospace' }}>
                    R${fmt(a.margem_atual)}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: varPos ? '#DC2626' : '#16A34A' }}>
                    {varPos ? '+' : ''}{a.variacao_pct?.toFixed(1)}%
                  </td>
                  <td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', color: cfg.color, fontSize: '12px', fontWeight: 600 }}>
                      <span className={cfg.dotCls} />
                      {cfg.label}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: '#64748B', maxWidth: '260px' }}>
                    {a.descricao}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Rodapé com metodologia */}
      <div style={{
        padding: '10px 20px',
        borderTop: '1px solid #F1F5F9',
        fontSize: '11px',
        color: '#94A3B8',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '6px',
      }}>
        <span>Alerta quando a margem supera {'>'}15% da média histórica de 12 semanas.</span>
        <span>Fonte: ANP – Levantamento de Preços de Combustíveis</span>
      </div>
    </div>
  )
}
