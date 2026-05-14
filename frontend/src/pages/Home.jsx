import React, { useState } from 'react'
import { Header, Ticker, DataCard } from '../components/EditorialComponents'
import { AlertTable } from '../components/DataViz'

export default function Home() {
  const [estado, setEstado] = useState('SP')
  
  return (
    <div className="editorial-page">
      <Ticker items={[
        { label: 'GASOLINA SP', value: '5.62', change: -0.12 },
        { label: 'DIESEL RJ', value: '6.15', change: 0.05 },
        { label: 'ETANOL MG', value: '3.89', change: -1.20 }
      ]} />
      
      <div className="editorial-container">
        <Header />
        
        <main className="main-content">
          <section className="hero-grid">
            <div className="headline-area">
              <h1 className="reveal">Monitor de Distorções: <br/>O Mercado de Combustíveis em {estado}</h1>
              <p className="lead reveal">
                Análise técnica das margens brutas de revenda. Identificamos anomalias 
                através do cruzamento de dados oficiais da ANP com preços de refinaria e carga tributária.
              </p>
            </div>
            
            <div className="quick-stats">
              <DataCard 
                label="Preço Médio (Estado)" 
                value="R$ 5,84" 
                subValue="▲ 0.2%" 
                status="normal" 
              />
              <DataCard 
                label="Margem Estimada" 
                value="R$ 0,48" 
                subValue="Normal" 
                status="normal" 
              />
            </div>
          </section>

          <div className="content-divider"></div>

          <section className="data-section">
            <div className="section-header">
              <h2>Alertas de Mercado</h2>
              <p>Postos com margens acima de 15% da média histórica de 12 semanas.</p>
            </div>
            
            <AlertTable alerts={[
              { estado: 'SÃO PAULO', produto: 'GASOLINA COMUM', preco: '5.62', margem: '0.45', var: -1.2, status: 'normal' },
              { estado: 'SÃO PAULO', produto: 'DIESEL S10', preco: '6.12', margem: '0.89', var: 15.4, status: 'alerta' }
            ]} />
          </section>
        </main>

        <footer className="editorial-footer">
          <div className="footer-content">
            <div className="footer-brand">BOMBA ABERTA</div>
            <div className="footer-info">
              Dados atualizados semanalmente via ANP (Agência Nacional do Petróleo). 
              Este é um projeto open-source de transparência pública.
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .editorial-page { min-height: 100vh; }
        .main-content { padding: 2rem 0; }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 4rem;
          margin-bottom: 4rem;
        }
        .headline-area h1 { font-size: 4.5rem; margin-bottom: 1.5rem; }
        .lead {
          font-family: var(--font-headline);
          font-size: 1.4rem;
          color: var(--color-ink-muted);
          max-width: 600px;
        }
        .quick-stats {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .content-divider {
          height: 2px;
          background: var(--color-ink);
          margin: 4rem 0;
        }
        .section-header { margin-bottom: 2rem; }
        .section-header h2 { font-size: 2.5rem; }
        .section-header p { color: var(--color-ink-muted); font-weight: 700; text-transform: uppercase; font-size: 0.75rem; }
        
        .editorial-footer {
          margin-top: 6rem;
          border-top: 1px solid var(--color-border-light);
          padding: 4rem 0;
        }
        .footer-brand { font-family: var(--font-headline); font-weight: 900; font-size: 1.5rem; margin-bottom: 1rem; }
        .footer-info { font-size: 0.8rem; color: var(--color-ink-muted); max-width: 400px; }

        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr; gap: 2rem; }
          .headline-area h1 { font-size: 3rem; }
        }
      `}</style>
    </div>
  )
}
