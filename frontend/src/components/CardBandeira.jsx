const fmt = n => n?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '–'

const NIVEL_CONFIG = {
  anomalia:  { cor: '#DC2626', bg: '#FEE2E2', label: 'Anomalia', badgeCls: 'badge badge-anomalia', dotCls: 'dot dot-anomalia' },
  atencao:   { cor: '#F59E0B', bg: '#FFFBEB', label: 'Atenção',  badgeCls: 'badge badge-atencao',  dotCls: 'dot dot-atencao'  },
  normal:    { cor: '#22C55E', bg: '#F0FDF4', label: 'Normal',   badgeCls: 'badge badge-normal',   dotCls: 'dot dot-normal'   },
  favoravel: { cor: '#22C55E', bg: '#F0FDF4', label: 'Favorável',badgeCls: 'badge badge-normal',   dotCls: 'dot dot-normal'   },
  sem_dados: { cor: '#94A3B8', bg: '#F8FAFC', label: 'Sem dados',badgeCls: 'badge badge-cinza',    dotCls: 'dot'              },
}

const NOMES_BANDEIRA = {
  VIBRA:    'Vibra / BR',
  IPIRANGA: 'Ipiranga',
  RAIZEN:   'Raízen / Shell',
  BRANCA:   'Bandeira Branca',
  OUTRAS:   'Outras',
}

export default function CardBandeira({ bandeira }) {
  const nivel  = bandeira.alerta?.nivel ?? 'sem_dados'
  const config = NIVEL_CONFIG[nivel] ?? NIVEL_CONFIG.sem_dados
  const varPct = bandeira.alerta?.variacao_pct
  const varW   = bandeira.variacao_vs_semana_anterior ?? null

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderLeft: `4px solid ${config.cor}`,
      borderRadius: '10px',
      padding: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      {/* Bandeira */}
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', color: '#64748B', textTransform: 'uppercase' }}>
        {NOMES_BANDEIRA[bandeira.bandeira] ?? bandeira.bandeira}
      </div>

      {/* Preço */}
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '26px', fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>
        R${fmt(bandeira.preco_medio)}
      </div>

      {/* Variação semanal */}
      {varW != null && (
        <div style={{ fontSize: '12px' }} className={varW > 0 ? 'var-up' : varW < 0 ? 'var-down' : 'var-neutral'}>
          {varW > 0 ? '▲' : varW < 0 ? '▼' : '→'} R${fmt(Math.abs(varW))} na semana
        </div>
      )}

      {/* Badge de alerta */}
      <div style={{ marginTop: '4px' }}>
        <span className={config.badgeCls}>
          <span className={config.dotCls} />
          {config.label}
          {varPct != null && varPct !== 0 && (
            <span style={{ marginLeft: '3px', opacity: 0.85 }}>
              {varPct > 0 ? '+' : ''}{varPct.toFixed(1)}%
            </span>
          )}
        </span>
      </div>

      {/* Margem + postos */}
      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
        <span>Margem estimada: <span style={{ fontFamily: 'monospace', color: '#64748B' }}>R${fmt(bandeira.margem_bruta)}</span></span>
        <span>{bandeira.qtd_postos?.toLocaleString('pt-BR')} postos</span>
      </div>

      {/* Tooltip da descrição do alerta */}
      {bandeira.alerta?.descricao && nivel !== 'normal' && (
        <div style={{
          fontSize: '11px',
          color: config.cor,
          background: config.bg,
          borderRadius: '6px',
          padding: '6px 8px',
          lineHeight: 1.4,
        }}>
          {bandeira.alerta.descricao}
        </div>
      )}
    </div>
  )
}
