import { useState } from 'react'
import { useDados } from '../hooks/useDados'

import Header from '../components/Header'
import Ticker from '../components/Ticker'
import AlertBanner from '../components/AlertBanner'
import Filtros from '../components/Filtros'
import ResumoNacional from '../components/ResumoNacional'
import CardBandeira from '../components/CardBandeira'
import GraficoEvolucao from '../components/GraficoEvolucao'
import TabelaAlertas from '../components/TabelaAlertas'

export default function Home() {
  const { dados, loading, isMock } = useDados()

  const estadosDisponiveis = dados?.meta?.estados_monitorados ?? []
  const produtosDisponiveis = dados?.meta?.combustiveis_monitorados ?? []

  const [estadoSel, setEstadoSel] = useState(null)
  const [produtoSel, setProdutoSel] = useState(null)

  const estado = estadoSel ?? estadosDisponiveis[0] ?? 'SP'
  const produto = produtoSel ?? produtosDisponiveis[0] ?? 'GASOLINA COMUM'

  const bandeiras = dados?.por_estado?.[estado]?.[produto]?.por_bandeira ?? []

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '16px',
        background: 'var(--color-surface)', color: 'var(--color-text-muted)',
      }}>
        <div style={{ width: '10px', height: '10px', background: 'var(--color-accent-soft)', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
        <div style={{ fontSize: '13px' }}>Carregando dados da ANP…</div>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    )
  }

  return (
    <>
      <Header />
      <Ticker dados={dados} />
      <AlertBanner alertas={dados?.alertas ?? []} isMock={isMock} />

      <main className="main-content">
        <Filtros
          dados={dados}
          estado={estado}
          produto={produto}
          onEstado={v => setEstadoSel(v)}
          onProduto={v => setProdutoSel(v)}
        />

        <div className="section">
          <div className="section-header"><span className="label">Resumo Nacional</span></div>
          <ResumoNacional dados={dados} produto={produto} />
        </div>

        <div className="section">
          <div className="section-header">
            <span className="label">Por Bandeira — {estado} · {produto.replace('GASOLINA', 'Gas.').replace('HIDRATADO', 'Hidr.').replace('ADITIVADA', 'Adtv.')}</span>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{bandeiras.length} bandeiras monitoradas</span>
          </div>
          <div className="grid-4">
            {bandeiras.map((b, i) => <CardBandeira key={i} bandeira={b} />)}
            {bandeiras.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)', fontSize: '13px' }}>
                Nenhum dado disponível para esta seleção.
              </div>
            )}
          </div>
        </div>

        <div className="section">
          <div className="section-header"><span className="label">Histórico de Preços</span></div>
          <GraficoEvolucao dados={dados} estado={estado} produto={produto} />
        </div>

        <div className="section">
          <div className="section-header"><span className="label">Alertas de Margem</span></div>
          <TabelaAlertas alertas={dados?.alertas ?? []} />
        </div>
      </main>

      <footer className="footer">
        <span><strong>Bomba Aberta</strong> — Dados: ANP (gov.br) · Semana {dados?.meta?.semana_referencia ?? '–'} · Atualizado toda segunda-feira</span>
        <span>{isMock && <span style={{ color: '#3B82F6' }}>Modo demonstração · </span>}Metodologia e fontes disponíveis na aba <strong>Metodologia</strong></span>
      </footer>
    </>
  )
}