import { Link } from 'react-router-dom'

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
        <Link to="/" className="nav-link">Painel</Link>
        <Link to="/metodologia" className="nav-link">Metodologia</Link>
        <Link to="/sobre" className="nav-link">Sobre</Link>
      </nav>
    </header>
  );
}