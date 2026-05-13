const fmt  = n => n?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '–'
const fmtN = n => n?.toLocaleString('pt-BR') ?? '–'

const S = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' },
  card: {
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '16px 18px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardLabel:  { fontSize: '11px', color: '#64748B', marginBottom: '6px', fontWeight: 500 },
  cardValor:  { fontFamily: "'IBM Plex Mono', monospace", fontSize: '22px', fontWeight: 700, color: '#0F172A', lineHeight: 1 },
  cardVar:    { fontSize: '12px', marginTop: '5px' },
  cardSub:    { fontSize: '11px', color: '#94A3B8', marginTop: '5px' },
}

function VarTag({ v }) {
  if (v == null) return null
  const sinal = v > 0 ? '▲' : v < 0 ? '▼' : '→'
  const cls   = v > 0 ? 'var-up' : v < 0 ? 'var-down' : 'var-neutral'
  return <div style={S.cardVar} className={cls}>{sinal} R${fmt(Math.abs(v))} vs semana anterior</div>
}

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
    <div style={S.grid}>

      <div style={S.card}>
        <div style={S.cardLabel}>Preço Médio Nacional</div>
        <div style={S.cardValor}>R${fmt(resumo.preco_medio_nacional)}</div>
        <VarTag v={resumo.variacao_vs_semana_anterior} />
      </div>

      <div style={S.card}>
        <div style={S.cardLabel}>Preço Mínimo Encontrado</div>
        <div style={S.cardValor}>R${fmt(resumo.preco_minimo_nacional)}</div>
        <div style={S.cardSub}>entre todos os estados monitorados</div>
      </div>

      <div style={S.card}>
        <div style={S.cardLabel}>Postos Monitorados</div>
        <div style={S.cardValor}>{fmtN(totalPostos)}</div>
        <div style={S.cardSub}>Semana {semana}</div>
      </div>

      <div style={{ ...S.card, borderLeft: nAlertas > 0 ? '3px solid #DC2626' : '3px solid #22C55E' }}>
        <div style={S.cardLabel}>Alertas Ativos</div>
        <div style={{ ...S.cardValor, color: nAlertas > 0 ? '#DC2626' : '#16A34A' }}>
          {nAlertas}
        </div>
        <div style={{ ...S.cardSub, color: nAlertas > 0 ? '#991B1B' : '#166534' }}>
          {nAlertas > 0 ? `${nAlertas} distorções detectadas` : 'Sem anomalias esta semana'}
        </div>
      </div>

    </div>
  )
}
