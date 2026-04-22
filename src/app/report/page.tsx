'use client'

import { useState, useEffect } from 'react'
import styles from './Report.module.css'

interface ReportItem {
    id: string
    name: string
    totalStock: number
    printerCount: number
}

export default function ReportPage() {
    const [report, setReport] = useState<ReportItem[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchReport()
    }, [])

    async function fetchReport() {
        const res = await fetch('/api/report')
        const data = await res.json()
        setReport(data)
        setIsLoading(false)
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Relatório de Reposição</h1>
                <p>Consolidado de todos os toners disponíveis na Prefeitura.</p>
            </header>

            <section className="card">
                {isLoading ? (
                    <p>Gerando relatório...</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Modelo do Toner</th>
                                <th>Qtd. Impressoras Compatíveis</th>
                                <th>Estoque Total (Geral)</th>
                                <th>Status Sugerido</th>
                            </tr>
                        </thead>
                        <tbody>
                            {report.map(item => (
                                <tr key={item.id}>
                                    <td className={styles.tonerName}>{item.name}</td>
                                    <td>{item.printerCount}</td>
                                    <td className={item.totalStock < 5 ? styles.lowStock : ''}>
                                        {item.totalStock} unidades
                                    </td>
                                    <td>
                                        {item.totalStock === 0 ? (
                                            <span className={`${styles.badge} ${styles.badgeDanger}`}>Crítico</span>
                                        ) : item.totalStock < 10 ? (
                                            <span className={`${styles.badge} ${styles.badgeWarning}`}>Comprar</span>
                                        ) : (
                                            <span className={`${styles.badge} ${styles.badgeSuccess}`}>Estoque OK</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>

            <div className={styles.printAction}>
                <button className="btn btn-primary" onClick={() => window.print()}>
                    Imprimir / Salvar PDF
                </button>
            </div>
        </div>
    )
}
