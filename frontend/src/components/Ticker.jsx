const fmt = (n) => n?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '–'

function varStr(v) {
  if (v == null) return null
  const sinal = v > 0 ? '▲' : v < 0 ? '▼' : '→'
  const cls   = v > 0 ? 'var-up' : v < 0 ? 'var-down' : 'var-neutral'
  return <span className={cls} style={{ marginLeft: '5px' }}>{sinal} R${fmt(Math.abs(v))}</span>
}

const S = {
  wrap: {
    background: '#F1F5F9',
    borderBottom: '1px solid #E2E8F0',
    padding: '7px 0',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '12px',
    cursor: 'default',
    userSelect: 'none',
  },
  sep: { color: '#CBD5E1', margin: '0 18px' },
  label: { color: '#64748B', marginRight: '7px' },
  price: { fontWeight: 600, color: '#0F172A' },
}

// Mapeamento de rótulos curtos para cada combustível
const ROTULOS_PRODUTOS = {
  'GASOLINA COMUM':     'GAS C',
  'ETANOL HIDRATADO':   'ETANOL',
  'GASOLINA ADITIVADA': 'GAS ADTV',
  'DIESEL':             'DIESEL',
  'DIESEL S10':         'DIESEL S10',
}

// Ordem de exibição no ticker
const ORDEM_PRODUTOS = [
  'GASOLINA COMUM',
  'ETANOL HIDRATADO',
  'GASOLINA ADITIVADA',
  'DIESEL',
  'DIESEL S10',
]

export default function Ticker({ dados }) {
  if (!dados) return null

  // Monta os itens do ticker: um por estado × produto
  const itens = []
  const estados = Object.keys(dados.por_estado ?? {}).sort()

  estados.forEach(uf => {
    ORDEM_PRODUTOS.forEach(prodKey => {
      const d = dados.por_estado[uf]?.[prodKey]
      if (!d) return
      const prodLabel = ROTULOS_PRODUTOS[prodKey] ?? prodKey
      itens.push({ uf, prodLabel, preco: d.preco_medio, var: d.variacao_vs_semana_anterior })
    })
  })

  // Duplica para o loop infinito funcionar sem pular
  const todos = [...itens, ...itens]

  return (
    <div style={S.wrap} title="Passe o mouse para pausar">
      <div className="ticker-track">
        {todos.map((item, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center' }}>
            <span style={S.label}>{item.prodLabel} · {item.uf}</span>
            <span style={S.price}>R${fmt(item.preco)}</span>
            {varStr(item.var)}
            <span style={S.sep}>|</span>
          </span>
        ))}
      </div>
    </div>
  )
}