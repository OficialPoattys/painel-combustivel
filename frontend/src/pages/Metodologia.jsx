import { Link } from 'react-router-dom'

export default function Metodologia() {
  return (
    <div className="main-content" style={{ maxWidth: '960px', margin: '0 auto' }}>
      <div className="section">
        <div className="section-header">
          <span className="label">Metodologia</span>
        </div>
        <div className="card" style={{ padding: '32px', lineHeight: 1.6 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '16px' }}>Como calculamos os alertas</h1>
          <p style={{ marginBottom: '24px', color: 'var(--color-text-secondary)' }}>
            O Bomba Aberta estima a margem bruta de distribuição + revenda e compara com o histórico para detectar distorções.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginTop: '32px', marginBottom: '12px' }}>📐 Fórmula da Margem Bruta</h2>
          <div className="code-block" style={{ background: 'var(--color-surface)', padding: '16px', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginBottom: '16px' }}>
            Margem = Preço na bomba − Preço do produtor − Tributos estaduais (ICMS)
          </div>
          <ul style={{ marginLeft: '20px', marginBottom: '24px' }}>
            <li><strong>Preço na bomba</strong>: média simples por estado, produto e bandeira (dados ANP).</li>
            <li><strong>Preço do produtor</strong>: referência Petrobras + importadores (fonte: ANP/SIMP). Atualizado manualmente.</li>
            <li><strong>Tributos</strong>: ICMS por estado e produto, com base nas alíquotas vigentes.</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginTop: '32px', marginBottom: '12px' }}>📊 Baseline histórico</h2>
          <p>Comparamos a margem da semana atual com a <strong>média das últimas 12 semanas</strong> (excluindo a atual). Quanto maior o desvio percentual, mais severo o alerta.</p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginTop: '32px', marginBottom: '12px' }}>🚦 Thresholds</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
            <thead>
              <tr><th style={{ textAlign: 'left', padding: '8px', background: 'var(--color-surface)' }}>Nível</th><th style={{ textAlign: 'left', padding: '8px', background: 'var(--color-surface)' }}>Variação da margem</th><th style={{ textAlign: 'left', padding: '8px', background: 'var(--color-surface)' }}>Cor</th></tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>🔴 Anomalia</td><td style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>≥ +15%</td><td style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>Vermelho</td></tr>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>🟡 Atenção</td><td style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>+7% a +15%</td><td style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>Amarelo</td></tr>
              <tr><td style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>🟢 Normal</td><td style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>entre -7% e +7%</td><td style={{ padding: '8px', borderBottom: '1px solid var(--color-border)' }}>Verde</td></tr>
              <tr><td style={{ padding: '8px' }}>🟢 Favorável (consumidor)</td><td style={{ padding: '8px' }}>≤ -7%</td><td style={{ padding: '8px' }}>Verde</td></tr>
            </tbody>
          </table>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginTop: '32px', marginBottom: '12px' }}>📅 Atualização dos dados</h2>
          <p>Toda <strong>segunda-feira às 10h (horário de Brasília)</strong> um robô baixa os CSVs mais recentes da ANP, recalcula as margens e atualiza os alertas. Os dados históricos são acumulados desde a primeira execução.</p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginTop: '32px', marginBottom: '12px' }}>⚠️ Limitações</h2>
          <ul style={{ marginLeft: '20px', marginBottom: '24px' }}>
            <li>O <strong>preço do produtor</strong> é uma aproximação – não consideramos fretes, perdas ou mistura de etanol anidro na gasolina.</li>
            <li>Os <strong>tributos</strong> variam ao longo do tempo; atualizamos manualmente quando há mudanças.</li>
            <li>Alertas são <strong>estimativas</strong>; recomendamos verificar com órgãos oficiais antes de qualquer ação.</li>
          </ul>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginTop: '32px', marginBottom: '12px' }}>🔗 Fontes</h2>
          <ul style={{ marginLeft: '20px', marginBottom: '24px' }}>
            <li><a href="https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/serie-historica-de-precos-de-combustiveis" target="_blank" rel="noopener noreferrer">ANP – Série histórica de preços</a></li>
            <li><a href="https://www.gov.br/anp/pt-br/centrais-de-conteudo/dados-abertos/precos-de-produtores-e-importadores-de-combustiveis" target="_blank" rel="noopener noreferrer">ANP – Preços de produtores e importadores</a></li>
            <li><a href="https://www.confaz.fazenda.gov.br/legislacao/convenios/2022/icms-2022" target="_blank" rel="noopener noreferrer">CONFAZ – Alíquotas de ICMS</a></li>
          </ul>

          <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--color-border)', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <span>🧪 Projeto open-source – <a href="https://github.com/OficialPoattys/painel-combustivel" target="_blank" rel="noopener noreferrer">Contribua no GitHub</a></span>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '24px', marginBottom: '32px' }}>
        <Link to="/" className="select-pill" style={{ textDecoration: 'none', display: 'inline-block' }}>
          ← Voltar ao painel
        </Link>
      </div>
    </div>
  )
}