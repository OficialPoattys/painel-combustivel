import { useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const PRECO_PRODUTOR = {
  'GASOLINA COMUM':     3.09,
  'ETANOL HIDRATADO':   2.85,
  'GASOLINA ADITIVADA': 3.09,
  'DIESEL':             3.45,
  'DIESEL S10':         3.52,
}

const NOMES_PRODUTOS = {
  'GASOLINA COMUM':     'Gasolina Comum',
  'ETANOL HIDRATADO':   'Etanol Hidratado',
  'GASOLINA ADITIVADA': 'Gasolina Aditivada',
  'DIESEL':             'Diesel',
  'DIESEL S10':         'Diesel S10',
}

const fmtSemana = s => {
  if (!s || typeof s !== 'string') return 'Sem —'
  const partes = s.split('-')
  return `Sem ${partes[1] ?? s}`
}

const fmtBRL = n => `R$${n?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '–'}`

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip__label">{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color }}>
          {p.name}: <strong>{fmtBRL(p.value)}</strong>
        </div>
      ))}
    </div>
  )
}

export default function GraficoEvolucao({ dados, estado, produto }) {
  const serie = dados?.series_historicas?.[estado]?.[produto] ?? []
  const produtorRef = PRECO_PRODUTOR[produto] ?? 0

  // Memoização dos dados transformados
  const { data, yMin, yMax } = useMemo(() => {
    if (serie.length === 0) return { data: [], yMin: 0, yMax: 0 }

    const mappedData = serie.map(d => ({
      semana: fmtSemana(d.semana_ref),
      'Preço na Bomba': d.preco_medio ?? 0,
      'Preço do Produtor': produtorRef,
      'Margem Estimada': d.margem_bruta ?? 0,
    }))

    const precos = mappedData.map(d => d['Preço na Bomba']).filter(v => v > 0)
    const refPreco = produtorRef > 0 ? produtorRef : (precos.length ? Math.min(...precos) : 5)
    const minVal = Math.min(...precos, refPreco)
    const maxVal = Math.max(...precos, refPreco)
    const yMinCalc = Math.max(0, minVal - 0.30).toFixed(2)
    const yMaxCalc = (maxVal + 0.30).toFixed(2)

    return { data: mappedData, yMin: parseFloat(yMinCalc), yMax: parseFloat(yMaxCalc) }
  }, [serie, produtorRef])

  if (serie.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
        Histórico ainda não disponível para este estado e combustível.
      </div>
    )
  }

  return (
    <div className="card grafico-card">
      <div className="grafico-header">
        <div className="grafico-title">Evolução do preço médio — {NOMES_PRODUTOS[produto] ?? produto} · {estado}</div>
        <div className="grafico-sub">Últimas {serie.length} semanas · Linha tracejada = preço de referência do produtor</div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9ECEF" />
          <XAxis dataKey="semana" tick={{ fontSize: 10, fill: '#495057', fontFamily: 'var(--font-mono)' }} tickLine={false} axisLine={{ stroke: '#DEE2E6' }} />
          <YAxis domain={[yMin, yMax]} tickFormatter={v => `R$${v.toFixed(2)}`} tick={{ fontSize: 10, fill: '#495057', fontFamily: 'var(--font-mono)' }} width={65} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Line type="monotone" dataKey="Preço na Bomba" stroke="var(--color-accent-soft)" strokeWidth={2} dot={{ r: 3, fill: 'var(--color-accent-soft)' }} activeDot={{ r: 5 }} />
          {produtorRef > 0 && (
            <Line type="monotone" dataKey="Preço do Produtor" stroke="#ADB5BD" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}