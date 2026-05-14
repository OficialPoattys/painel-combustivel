export default function Header() {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-dot" />
        <div>
          <div className="logo-text">Bomba Aberta</div>
          <div className="logo-sub">transparência nos preços</div>
        </div>
      </div>
      <nav className="header-nav">
        <a className="nav-link">Painel</a>
        <a className="nav-link">Metodologia</a>
        <a className="nav-link">Sobre</a>
      </nav>
    </header>
  );
}