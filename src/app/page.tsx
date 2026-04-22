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

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<{ units: any[], items: any[] } | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
  }, [])

  useEffect(() => {
    if (searchTerm.length > 2) {
      handleSearch(searchTerm)
    } else {
      setResults(null)
    }
  }, [searchTerm])

  async function handleSearch(term: string) {
    try {
      const [uRes, pRes, tRes] = await Promise.all([
        fetch('/api/units'),
        fetch('/api/printers'),
        fetch('/api/toners')
      ])
      const [uData, pData, tData] = await Promise.all([
        uRes.json(),
        pRes.json(),
        tRes.json()
      ])

      const filteredUnits = Array.isArray(uData) ? uData.filter((u: any) => u.name.toLowerCase().includes(term.toLowerCase())) : []
      const filteredItems = [
        ...(Array.isArray(pData) ? pData.filter((p: any) => p.name.toLowerCase().includes(term.toLowerCase()) || p.brand.toLowerCase().includes(term.toLowerCase())) : []),
        ...(Array.isArray(tData) ? tData.filter((t: any) => t.name.toLowerCase().includes(term.toLowerCase())) : [])
      ]

      setResults({ units: filteredUnits, items: filteredItems })
    } catch (e) {
      console.error(e)
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
            placeholder="Pesquisar unidade, toner ou impressora..."
            className="input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => handleSearch(searchTerm)}>🔍 Buscar</button>

          {results && (
            <div className={styles.searchResults}>
              {results.units.length > 0 && (
                <div className={styles.resultGroup}>
                  <h4>Unidades</h4>
                  {results.units.map((u: any) => (
                    <Link key={u.id} href={`/inventory?unitId=${u.id}`} className={styles.resultItem}>
                      🏢 {u.name}
                    </Link>
                  ))}
                </div>
              )}
              {results.items.length > 0 && (
                <div className={styles.resultGroup}>
                  <h4>Modelos (Impressoras/Toners)</h4>
                  {results.items.map((item: any) => (
                    <Link key={item.id} href="/toners" className={styles.resultItem}>
                      📦 {item.name} {item.brand ? `(${item.brand})` : ''}
                    </Link>
                  ))}
                </div>
              )}
              {results.units.length === 0 && results.items.length === 0 && (
                <p className={styles.noResults}>Nenhum resultado encontrado.</p>
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
