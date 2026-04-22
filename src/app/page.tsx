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

  useEffect(() => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setStats(data))
  }, [])

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Bem-vindo ao TonnerSurvey</h1>
        <p>Visão geral do seu sistema de almoxarifado da Prefeitura.</p>
      </header>

      <div className={styles.statsGrid}>
        <div className="card">
          <div className={styles.statLabel}>Unidades</div>
          <div className={styles.statValue}>{stats?.unitCount ?? '-'}</div>
          <Link href="/units" className={styles.statLink}>Ver todas →</Link>
        </div>
        <div className="card">
          <div className={styles.statLabel}>Impressoras</div>
          <div className={styles.statValue}>{stats?.printerCount ?? '-'}</div>
          <Link href="/toners" className={styles.statLink}>Ver modelos →</Link>
        </div>
        <div className="card">
          <div className={styles.statLabel}>Toners</div>
          <div className={styles.statValue}>{stats?.tonerCount ?? '-'}</div>
          <Link href="/toners" className={styles.statLink}>Ver modelos →</Link>
        </div>
        <div className={`${styles.criticalCard} card`}>
          <div className={styles.statLabel}>Itens Críticos</div>
          <div className={styles.statValue}>{stats?.criticalCount ?? '-'}</div>
          <Link href="/report" className={styles.statLink}>Ver relatório →</Link>
        </div>
      </div>

      <section className={styles.actions}>
        <h2>Ações Rápidas</h2>
        <div className={styles.actionGrid}>
          <Link href="/inventory" className={`${styles.actionCard} card`}>
            <h3>📋 Novo Levantamento</h3>
            <p>Substitua o papel e caneta. Registre o estoque físico dos setores diretamente aqui.</p>
          </Link>
          <Link href="/report" className={`${styles.actionCard} card`}>
            <h3>📦 Lista de Compras</h3>
            <p>Veja quais toners precisam ser comprados para reabastecer as unidades.</p>
          </Link>
        </div>
      </section>
    </div>
  )
}
