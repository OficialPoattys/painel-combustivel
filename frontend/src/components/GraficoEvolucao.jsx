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

// Formata "2025-20" → "Sem 20"
const fmtSemana = s => {
  if (!s) return ''
  const partes = s.split('-')
  return `Sem ${partes[1] ?? s}`
}

const fmtBRL = n => `R$${n?.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '–'}`

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px',
      padding: '10px 14px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <div style={{ fontWeight: 600, marginBottom: '6px', color: '#0F172A' }}>{label}</div>
      {payload.map(p => (
        <div key={p.name} style={{ color: p.color, marginBottom: '3px' }}>
          {p.name}: <strong>{fmtBRL(p.value)}</strong>
        </div>
      ))}
    </div>
  )
}

export default function GraficoEvolucao({ dados, estado, produto }) {
  const serie = dados?.series_historicas?.[estado]?.[produto] ?? []
  const produtorRef = PRECO_PRODUTOR[produto] ?? 0

  if (serie.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8', fontSize: '13px' }}>
        Histórico ainda não disponível para este estado e combustível.
      </div>
    )
  }

  // Adiciona o preço do produtor como campo fixo para visualização
  const data = serie.map(d => ({
    semana: fmtSemana(d.semana_ref),
    'Preço na Bomba': d.preco_medio,
    'Preço do Produtor': produtorRef,
    'Margem Estimada': d.margem_bruta,
  }))

  // Calcula domain do eixo Y com uma margem de 30 centavos
  const precos = data.map(d => d['Preço na Bomba'])
  const refPreco = produtorRef > 0 ? produtorRef : Math.min(...precos)
  const yMin = Math.max(0, Math.min(...precos, refPreco) - 0.30).toFixed(2)
  const yMax = (Math.max(...precos, refPreco) + 0.30).toFixed(2)

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: '10px',
      padding: '20px 20px 10px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '24px',
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
          Evolução do preço médio — {NOMES_PRODUTOS[produto] ?? produto} · {estado}
        </div>
        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '3px' }}>
          Últimas {serie.length} semanas · Linha tracejada = preço de referência do produtor
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="semana"
            tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'IBM Plex Mono, monospace' }}
            tickLine={false}
            axisLine={{ stroke: '#E2E8F0' }}
          />
          <YAxis
            domain={[parseFloat(yMin), parseFloat(yMax)]}
            tickFormatter={v => `R$${v.toFixed(2)}`}
            tick={{ fontSize: 11, fill: '#94A3B8', fontFamily: 'IBM Plex Mono, monospace' }}
            tickLine={false}
            axisLine={false}
            width={68}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          />
          <Line
            type="monotone"
            dataKey="Preço na Bomba"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ r: 3, fill: '#3B82F6' }}
            activeDot={{ r: 5 }}
          />
          {produtorRef > 0 && (
            <Line
              type="monotone"
              dataKey="Preço do Produtor"
              stroke="#94A3B8"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}