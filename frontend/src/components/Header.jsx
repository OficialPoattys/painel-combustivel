import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header style={{ borderBottom: '5px solid var(--color-ink)', marginBottom: '2rem' }}>
      <div style={{
        display: 'flex',
        justify-content: space-between,
        alignItems: 'center',
        padding: '1rem 0',
        fontSize: '0.7rem',
        fontWeight: '800',
        letterSpacing: '0.1em',
        borderBottom: '1px solid var(--color-border-light)'
      }}>
        <span>VOL. MMXXVI — Nº 142</span>
        <Link to="/" style={{
          fontFamily: 'var(--font-headline)',
          fontSize: '4rem',
          letterSpacing: '-0.05em',
          fontWeight: '900',
          textDecoration: 'none',
          color: 'var(--color-ink)'
        }}>BOMBA ABERTA</Link>
        <span>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</span>
      </div>
      <nav style={{
        display: 'flex',
        justify-content: 'center',
        gap: '3rem',
        padding: '0.75rem 0',
        fontSize: '0.8rem',
        fontWeight: '700'
      }}>
        <Link to="/" style={{ color: 'var(--color-ink)', textDecoration: 'none' }}>TERMINAL</Link>
        <Link to="/metodologia" style={{ color: 'var(--color-ink)', textDecoration: 'none' }}>METODOLOGIA</Link>
        <Link to="/sobre" style={{ color: 'var(--color-ink)', textDecoration: 'none' }}>SOBRE O PROJETO</Link>
      </nav>
    </header>
  )
}
