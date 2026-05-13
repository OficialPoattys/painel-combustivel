const S = {
  wrap: {
    background: '#FEF3C7',
    borderBottom: '2px solid #F59E0B',
    padding: '9px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#78350F',
  },
  icon: { fontSize: '15px', flexShrink: 0 },
  anomalia: { color: '#991B1B', fontWeight: 700 },
  atencao:  { color: '#92400E', fontWeight: 700 },
  detalhe: {
    marginLeft: 'auto',
    fontSize: '11px',
    background: '#FCD34D',
    padding: '3px 10px',
    borderRadius: '12px',
    color: '#78350F',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  mockBanner: {
    background: '#EFF6FF',
    borderBottom: '2px solid #3B82F6',
    padding: '8px 24px',
    fontSize: '12px',
    color: '#1E40AF',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
}

export default function AlertBanner({ alertas = [], isMock = false }) {
  const anomalias = alertas.filter(a => a.nivel === 'anomalia')
  const atencoes  = alertas.filter(a => a.nivel === 'atencao')

  return (
    <>
      {isMock && (
        <div style={S.mockBanner}>
          🔵 <strong>Modo demonstração</strong> — exibindo dados de exemplo.
          Os dados reais serão carregados após a primeira execução do coletor da ANP.
        </div>
      )}

      {alertas.length > 0 && (
        <div style={S.wrap}>
          <span style={S.icon}>⚠️</span>
          <span>
            Esta semana:{' '}
            {anomalias.length > 0 && (
              <span style={S.anomalia}>{anomalias.length} {anomalias.length === 1 ? 'anomalia' : 'anomalias'} de margem</span>
            )}
            {anomalias.length > 0 && atencoes.length > 0 && ' e '}
            {atencoes.length > 0 && (
              <span style={S.atencao}>{atencoes.length} {atencoes.length === 1 ? 'alerta' : 'alertas'} de atenção</span>
            )}
            {' '}detectados em distribuidoras.
          </span>
          <span style={S.detalhe} onClick={() => document.getElementById('tabela-alertas')?.scrollIntoView({ behavior: 'smooth' })}>
            Ver detalhes ↓
          </span>
        </div>
      )}
    </>
  )
}
