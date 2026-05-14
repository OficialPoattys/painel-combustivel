export default function AlertBanner({ alertas = [], isMock = false }) {
  const anomalias = alertas.filter(a => a.nivel === 'anomalia')
  const atencoes  = alertas.filter(a => a.nivel === 'atencao')

  return (
    <>
      {isMock && (
        <div className="mock-banner">
          🔵 <strong>Modo demonstração</strong> — exibindo dados de exemplo. Os dados reais serão carregados após a primeira execução do coletor da ANP.
        </div>
      )}

      {alertas.length > 0 && (
        <div className="alert-banner">
          <span className="alert-icon">⚠️</span>
          <span>
            Esta semana:{' '}
            {anomalias.length > 0 && (
              <span className="alert-anomalia">{anomalias.length} {anomalias.length === 1 ? 'anomalia' : 'anomalias'} de margem</span>
            )}
            {anomalias.length > 0 && atencoes.length > 0 && ' e '}
            {atencoes.length > 0 && (
              <span className="alert-atencao">{atencoes.length} {atencoes.length === 1 ? 'alerta' : 'alertas'} de atenção</span>
            )}{' '}
            detectados em distribuidoras.
          </span>
          <button className="alert-detail" onClick={() => document.getElementById('tabela-alertas')?.scrollIntoView({ behavior: 'smooth' })}>
            Ver detalhes ↓
          </button>
        </div>
      )}
    </>
  );
}