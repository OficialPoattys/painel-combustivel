const fmt = n => n?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '–'

const NIVEL_CONFIG = {
  anomalia:  { cor: '#DC2626', bg: '#FEE2E2', label: 'Anomalia', badgeCls: 'badge badge-anomalia', dotCls: 'dot dot-anomalia' },
  atencao:   { cor: '#F59E0B', bg: '#FFFBEB', label: 'Atenção',  badgeCls: 'badge badge-atencao',  dotCls: 'dot dot-atencao'  },
  normal:    { cor: '#22C55E', bg: '#F0FDF4', label: 'Normal',   badgeCls: 'badge badge-normal',   dotCls: 'dot dot-normal'   },
  favoravel: { cor: '#22C55E', bg: '#F0FDF4', label: 'Favorável',badgeCls: 'badge badge-normal',   dotCls: 'dot dot-normal'   },
  sem_dados: { cor: '#94A3B8', bg: '#F8FAFC', label: 'Sem dados',badgeCls: 'badge badge-sem_dados',dotCls: 'dot'              },
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
    <div className={`card bandeira-card`}>
      <div className="bandeira-card__bandeira">
        {NOMES_BANDEIRA[bandeira.bandeira] ?? bandeira.bandeira}
      </div>
      <div className="bandeira-card__preco">R${fmt(bandeira.preco_medio)}</div>
      {varW != null && (
        <div className={`bandeira-card__var ${varW > 0 ? 'var-up' : varW < 0 ? 'var-down' : 'var-neutral'}`}>
          {varW > 0 ? '▲' : varW < 0 ? '▼' : '→'} R${fmt(Math.abs(varW))} na semana
        </div>
      )}
      <div className="bandeira-card__badge">
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
      <div className="bandeira-card__meta">
        <span>Margem estimada: <span className="mono">R${fmt(bandeira.margem_bruta)}</span></span>
        <span>{bandeira.qtd_postos?.toLocaleString('pt-BR')} postos</span>
      </div>
      {bandeira.alerta?.descricao && nivel !== 'normal' && nivel !== 'sem_dados' && (
        <div className="bandeira-card__tooltip" style={{ backgroundColor: config.bg, color: config.cor }}>
          {bandeira.alerta.descricao}
        </div>
      )}
    </div>
  );
}