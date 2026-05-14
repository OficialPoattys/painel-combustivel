const fmt  = n => n?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '–'
const fmtN = n => n?.toLocaleString('pt-BR') ?? '–'

export default function ResumoNacional({ dados, produto }) {
  if (!dados) return null

  const resumo      = dados.resumo_nacional?.[produto] ?? {}
  const totalPostos = Object.values(dados.por_estado ?? {}).reduce((acc, uf) => {
    const prod = uf[produto]
    if (!prod) return acc
    return acc + prod.por_bandeira.reduce((s, b) => s + (b.qtd_postos ?? 0), 0)
  }, 0)
  const nAlertas = dados.alertas?.length ?? 0
  const semana   = dados.meta?.semana_referencia ?? '–'

  return (
    <div className="grid-4">
      <div className="card resumo-card">
        <div className="resumo-label">Preço Médio Nacional</div>
        <div className="resumo-valor">R${fmt(resumo.preco_medio_nacional)}</div>
        <div className={`resumo-var ${resumo.variacao_vs_semana_anterior > 0 ? 'var-up' : resumo.variacao_vs_semana_anterior < 0 ? 'var-down' : 'var-neutral'}`}>
          {resumo.variacao_vs_semana_anterior > 0 ? '▲' : resumo.variacao_vs_semana_anterior < 0 ? '▼' : '→'} R${fmt(Math.abs(resumo.variacao_vs_semana_anterior))}
        </div>
      </div>

      <div className="card resumo-card">
        <div className="resumo-label">Preço Mínimo Encontrado</div>
        <div className="resumo-valor">R${fmt(resumo.preco_minimo_nacional)}</div>
        <div className="resumo-var" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>entre todos os estados monitorados</div>
      </div>

      <div className="card resumo-card">
        <div className="resumo-label">Postos Monitorados</div>
        <div className="resumo-valor">{fmtN(totalPostos)}</div>
        <div className="resumo-var" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Semana {semana}</div>
      </div>

      <div className="card resumo-card" style={{ borderLeft: `3px solid ${nAlertas > 0 ? 'var(--color-danger)' : 'var(--color-success)'}` }}>
        <div className="resumo-label">Alertas Ativos</div>
        <div className="resumo-valor" style={{ color: nAlertas > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
          {nAlertas}
        </div>
        <div className="resumo-var" style={{ color: nAlertas > 0 ? '#991B1B' : '#166534' }}>
          {nAlertas > 0 ? `${nAlertas} distorções detectadas` : 'Sem anomalias esta semana'}
        </div>
      </div>
    </div>
  );
}