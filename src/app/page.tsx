'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './Dashboard.module.css'

interface Stats {
  unitCount: number
  printerCount: number
  tonerCount: number
  criticalCount: number
}

interface SearchResult {
  units: any[]
  models: any[]
  stocks: any[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult | null>(null)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length > 2) {
        handleSearch(searchTerm)
      } else {
        setResults(null)
        if (!isAiLoading) setAiResponse(null)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  async function handleSearch(term: string) {
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`)
      const data = await res.json()
      setResults(data)
    } catch (e) {
      console.error(e)
    }
  }

  async function handleAIAsk() {
    if (!searchTerm) return
    setIsAiLoading(true)
    setAiResponse(null)
    try {
      const res = await fetch('/api/ai/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelName: searchTerm, type: 'chat' })
      })
      const data = await res.json()
      if (data.result) {
        setAiResponse(data.result)
      } else if (data.details) {
        setAiResponse(`Erro Técnico: ${data.details}`)
      } else if (data.tip) {
        setAiResponse(`Dica: ${data.tip}`)
      } else {
        setAiResponse("Ops, não consegui processar sua dúvida agora.")
      }
    } catch (e) {
      setAiResponse("Erro ao consultar o assistente.")
    } finally {
      setIsAiLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.greeting}>
          <h1>Central de Comando</h1>
          <p>Olá! O que vamos organizar hoje?</p>
        </div>
        <div className={styles.searchBox}>
          <input
            type="search"
            placeholder="Pesquise unidades, modelos ou tire dúvidas com a IA..."
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAIAsk()}
          />
          <button className="btn btn-primary" onClick={handleAIAsk} disabled={isAiLoading}>
            {isAiLoading ? 'Pensando...' : '✨ Perguntar à IA'}
          </button>

          {(results || aiResponse || isAiLoading) && (
            <div className={styles.searchResults}>
              {aiResponse && (
                <div className={styles.aiBubble}>
                  <div className={styles.aiHeader}>✨ Assistente IA</div>
                  <p>{aiResponse}</p>
                </div>
              )}

              {isAiLoading && <p className={styles.loading}>Chamando o expert...</p>}

              {results && results.stocks.length > 0 && (
                <div className={styles.resultGroup}>
                  <h4>🗺️ Onde tem estoque?</h4>
                  {results.stocks.map((s: any, idx: number) => (
                    <Link key={idx} href={`/inventory?unitId=${s.unitId}`} className={styles.resultItem}>
                      <div className={styles.stockDetails}>
                        <span className={styles.stockUnit}>🏢 {s.unit}</span>
                        <span className={styles.stockInfo}>
                          <strong>{s.quantity}x</strong> {s.toner}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {results && results.units.length > 0 && (
                <div className={styles.resultGroup}>
                  <h4>🏢 Unidades</h4>
                  {results.units.map((u: any) => (
                    <Link key={u.id} href={`/inventory?unitId=${u.id}`} className={styles.resultItem}>
                      {u.name} <small>{u.location || ''}</small>
                    </Link>
                  ))}
                </div>
              )}

              {results && results.models.length > 0 && (
                <div className={styles.resultGroup}>
                  <h4>📦 Catálogo Técnico</h4>
                  {results.models.map((item: any) => (
                    <Link key={item.id} href="/toners" className={styles.resultItem}>
                      {item.name} {item.brand ? `(${item.brand})` : ''}
                    </Link>
                  ))}
                </div>
              )}

              {results && results.units.length === 0 && results.models.length === 0 && results.stocks.length === 0 && !aiResponse && !isAiLoading && (
                <div className={styles.noResults}>
                  <p>Nenhum item local encontrado.</p>
                  <button className="btn" onClick={handleAIAsk}>Perguntar à IA Global ✨</button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} card`}>
          <div className={styles.statLabel}>Unidades</div>
          <div className={styles.statValue}>{stats?.unitCount ?? '-'}</div>
          <Link href="/units" className={styles.statLink}>Gerenciar →</Link>
        </div>
        <div className={`${styles.statCard} card`}>
          <div className={styles.statLabel}>Modelos</div>
          <div className={styles.statValue}>{(stats?.printerCount || 0) + (stats?.tonerCount || 0)}</div>
          <Link href="/toners" className={styles.statLink}>Ver Catálogo →</Link>
        </div>
        <div className={`${styles.criticalCard} card`}>
          <div className={styles.statLabel}>Estoque Crítico</div>
          <div className={styles.statValue}>{stats?.criticalCount ?? '-'}</div>
          <Link href="/report" className={styles.statLink}>Ver Alertas →</Link>
        </div>
      </div>

      <section className={styles.quickLaunch}>
        <h2>Lançamento Rápido</h2>
        <div className={styles.launchGrid}>
          <Link href="/inventory" className={styles.launchBtn}>
            <span className={styles.icon}>📝</span>
            <span className={styles.label}>Novo Levantamento</span>
          </Link>
          <Link href="/labels" className={styles.launchBtn}>
            <span className={styles.icon}>🏷️</span>
            <span className={styles.label}>Imprimir Etiquetas</span>
          </Link>
          <Link href="/report" className={styles.launchBtn}>
            <span className={styles.icon}>📉</span>
            <span className={styles.label}>Relatório de Compras</span>
          </Link>
          <Link href="/toners" className={styles.launchBtn}>
            <span className={styles.icon}>🖨️</span>
            <span className={styles.label}>Cadastro Técnico</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
