import { useState, useEffect } from 'react'
import { mockDados } from '../mockDados'

/**
 * useDados (Versão Corrigida)
 * - Adiciona tratamento de erro robusto
 * - Evita loops de renderização
 * - Garante que o estado de loading seja limpo corretamente
 */
export function useDados() {
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [isMock, setIsMock] = useState(false)

  useEffect(() => {
    let isMounted = true
    const controller = new AbortController()

    async function carregar() {
      try {
        // Tenta buscar o JSON real
        const res = await fetch('/dados.json', { 
          signal: controller.signal,
          headers: { 'Cache-Control': 'no-cache' } 
        })

        if (!res.ok) {
          throw new Error(`Erro ao carregar dados: ${res.status}`)
        }

        const json = await res.json()
        
        if (isMounted) {
          setDados(json)
          setIsMock(false)
          setErro(null)
        }
      } catch (err) {
        if (err.name === 'AbortError') return

        console.error('[useDados] Erro na busca:', err.message)
        
        if (isMounted) {
          // Fallback para mock apenas se não houver dados anteriores
          setDados(prev => prev || mockDados)
          setIsMock(true)
          setErro(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    carregar()

    return () => {
      isMounted = false
      controller.abort()
    }
  }, [])

  return { dados, loading, erro, isMock }
}