const S = {
  header: {
    background: '#0F172A',
    color: '#fff',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '56px',
    flexShrink: 0,
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  dot: {
    width: '10px', height: '10px',
    background: '#EF4444',
    borderRadius: '50%',
    flexShrink: 0,
    boxShadow: '0 0 0 3px rgba(239,68,68,0.25)',
  },
  logoWrap: {},
  logoText: {
    fontFamily: "'IBM Plex Serif', serif",
    fontSize: '18px',
    fontWeight: 700,
    letterSpacing: '-0.3px',
    lineHeight: 1,
  },
  logoSub: {
    fontSize: '10px',
    fontWeight: 400,
    color: '#64748B',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginTop: '2px',
  },
  nav: { display: 'flex', gap: '24px' },
  navLink: {
    fontSize: '13px',
    color: '#94A3B8',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.15s',
  },
}

export default function Header() {
  return (
    <header style={S.header}>
      <div style={S.left}>
        <div style={S.dot} />
        <div style={S.logoWrap}>
          <div style={S.logoText}>Bomba Aberta</div>
          <div style={S.logoSub}>Transparência no preço dos combustíveis</div>
        </div>
      </div>

      <nav style={S.nav}>
        <a style={S.navLink}>Painel</a>
        <a style={S.navLink}>Metodologia</a>
        <a style={S.navLink}>Sobre</a>
      </nav>
    </header>
  )
}
