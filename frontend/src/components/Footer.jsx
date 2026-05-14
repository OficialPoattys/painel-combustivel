export default function Footer({ isMock, semanaRef }) {
  return (
    <footer className="footer">
      <span>
        <strong>Bomba Aberta</strong> — Dados: ANP (gov.br) · 
        Semana {semanaRef ?? '–'} · Atualizado toda segunda-feira
      </span>
      <span>
        {isMock && <span style={{ color: '#3B82F6' }}>Modo demonstração · </span>}
        Metodologia e fontes disponíveis na aba <strong>Metodologia</strong>
      </span>
    </footer>
  )
}