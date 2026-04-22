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

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
  }, [])

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
          <button className="btn btn-primary">🔍 Buscar</button>
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
