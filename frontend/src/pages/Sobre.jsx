import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Sobre() {
  return (
    <>
      <Header />
      <div className="main-content" style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div className="section">
          <div className="section-header">
            <span className="label">Sobre o Bomba Aberta</span>
          </div>
          <div className="card" style={{ padding: '32px', lineHeight: 1.6 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '24px' }}>Transparência no preço dos combustíveis</h1>
            
            <p style={{ marginBottom: '24px', fontSize: '1.1rem', color: 'var(--color-text-secondary)' }}>
              O Bomba Aberta é um projeto independente e open-source que monitora, analisa e expõe distorções nos preços dos combustíveis no Brasil, usando dados públicos da ANP.
            </p>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginTop: '32px', marginBottom: '16px' }}>🎯 Objetivo</h2>
            <p>Capacitar o consumidor com informações claras sobre a formação de preços, margens das distribuidoras e alertas de possíveis abusos. Acreditamos que dados abertos salvam dinheiro e promovem concorrência justa.</p>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginTop: '32px', marginBottom: '16px' }}>📊 Fontes de Dados</h2>
            <ul style={{ marginLeft: '24px', marginBottom: '24px' }}>
              <li><strong>ANP</strong> – Levantamento Semanal de Preços de Combustíveis (LPC). Dados públicos do governo federal.</li>
              <li><strong>Preço do produtor</strong> – Referência Petrobras + importadores (fonte: ANP e SIMP).</li>
              <li><strong>Tributos estaduais</strong> – ICMS por estado (valores atualizados mensalmente conforme legislação).</li>
            </ul>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginTop: '32px', marginBottom: '16px' }}>⚙️ Como funciona</h2>
            <p>Todo domingo à noite, um robô (GitHub Actions) coleta os últimos CSVs da ANP, calcula a margem bruta de cada bandeira e compara com a média das últimas 12 semanas. Se a margem sobe mais de 15% acima da média, geramos um alerta de <strong>anomalia</strong> (🔴). Entre 7% e 15%, <strong>atenção</strong> (🟡).</p>
            <p style={{ marginTop: '12px' }}>Os dados são totalmente públicos, e o código está disponível no <a href="https://github.com/OficialPoattys/painel-combustivel" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>

            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginTop: '32px', marginBottom: '16px' }}>🧑‍💻 Mantenedor</h2>
            <p>Projeto mantido por <strong>Poattys</strong> – entusiasta de dados, transparência e energia. Contribuições são bem-vindas via pull requests e issues.</p>

            <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--color-border)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <span>📅 Última atualização dos dados: {new Date().toLocaleDateString('pt-BR')}</span><br />
              <span>📄 Licença: MIT – livre para uso e adaptação.</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '32px' }}>
          <Link to="/" className="select-pill" style={{ textDecoration: 'none', display: 'inline-block' }}>
            ← Voltar ao painel
          </Link>
        </div>
      </div>
      <Footer isMock={false} semanaRef="—" />
    </>
  )
}