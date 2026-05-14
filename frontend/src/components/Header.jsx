import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="editorial-header">
      <div className="header-top-bar">
        <span>VOL. MMXXVI — Nº 142</span>
        <span className="logo">BOMBA ABERTA</span>
        <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</span>
      </div>
      <nav className="header-nav">
        <Link to="/">TERMINAL</Link>
        <Link to="/metodologia">METODOLOGIA</Link>
        <Link to="/sobre">SOBRE O PROJETO</Link>
      </nav>
      <style jsx>{`
        .editorial-header {
          border-bottom: 5px solid var(--color-ink);
          margin-bottom: 2rem;
        }
        .header-top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          border-bottom: 1px solid var(--color-border-light);
        }
        .logo {
          font-family: var(--font-headline);
          font-size: 4rem;
          letter-spacing: -0.05em;
          font-weight: 900;
          text-decoration: none;
          color: var(--color-ink);
        }
        .header-nav {
          display: flex;
          justify-content: center;
          gap: 3rem;
          padding: 0.75rem 0;
          font-size: 0.8rem;
          font-weight: 700;
        }
        .header-nav a {
          color: var(--color-ink);
          text-decoration: none;
          position: relative;
        }
        .header-nav a:hover::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--color-ink);
        }
      `}</style>
    </header>
  )
}
