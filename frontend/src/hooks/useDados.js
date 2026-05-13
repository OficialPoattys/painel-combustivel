import { useState, useEffect } from 'react'
import { mockDados } from '../mockDados'

/*
  useDados
  Tenta buscar /dados.json (copiado pelo GitHub Actions para frontend/public/).
  Se não encontrar (ambiente de dev sem dados reais), usa mockDados como fallback.
*/
export function useDados() {
  const [dados, setDados]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro]     = useState(null)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function carregar() {
      try {
        const res = await fetch('/dados.json', { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        setDados(json)
        setIsMock(false)
      } catch (err) {
        if (err.name === 'AbortError') return
        // Fallback: usa dados de demonstração
        console.warn('[useDados] dados.json não encontrado — usando dados de demonstração.')
        setDados(mockDados)
        setIsMock(true)
        setErro(null)
      } finally {
        setLoading(false)
      }
    }

    carregar()
    return () => controller.abort()
  }, [])

  return { dados, loading, erro, isMock }
}
