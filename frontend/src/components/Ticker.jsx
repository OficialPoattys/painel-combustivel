const fmt = (n) => n?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '–'

function varStr(v) {
  if (v == null) return null
  const sinal = v > 0 ? '▲' : v < 0 ? '▼' : '→'
  const cls = v > 0 ? 'var-up' : v < 0 ? 'var-down' : 'var-neutral'
  return <span className={`ticker-var ${cls}`}>{sinal} R${fmt(Math.abs(v))}</span>
}

const ROTULOS_PRODUTOS = {
  'GASOLINA COMUM':     'GAS C',
  'ETANOL HIDRATADO':   'ETANOL',
  'GASOLINA ADITIVADA': 'GAS ADTV',
  'DIESEL':             'DIESEL',
  'DIESEL S10':         'DIESEL S10',
}

const ORDEM_PRODUTOS = [
  'GASOLINA COMUM',
  'ETANOL HIDRATADO',
  'GASOLINA ADITIVADA',
  'DIESEL',
  'DIESEL S10',
]

export default function Ticker({ dados }) {
  if (!dados) return null

  const itens = []
  const estados = Object.keys(dados.por_estado ?? {}).sort()

  estados.forEach(uf => {
    ORDEM_PRODUTOS.forEach(prodKey => {
      const d = dados.por_estado[uf]?.[prodKey]
      if (!d) return
      const prodLabel = ROTULOS_PRODUTOS[prodKey] ?? prodKey
      // Garante que preco e var existam
      const preco = d.preco_medio ?? 0
      const variacao = d.variacao_vs_semana_anterior ?? 0
      itens.push({ uf, prodLabel, preco, var: variacao })
    })
  })

  const todos = [...itens, ...itens]

  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {todos.map((item, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-label">{item.prodLabel} · {item.uf}</span>
            <span className="ticker-price">R${fmt(item.preco)}</span>
            {varStr(item.var)}
            <span className="ticker-sep">|</span>
          </span>
        ))}
      </div>
    </div>
  )
}