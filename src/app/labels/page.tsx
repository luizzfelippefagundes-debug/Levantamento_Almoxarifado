'use client'

import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import styles from './Labels.module.css'

interface Unit {
    id: string
    name: string
    location?: string
}

export default function LabelsPage() {
    const [units, setUnits] = useState<Unit[]>([])
    const [origin, setOrigin] = useState('')

    useEffect(() => {
        setOrigin(window.location.origin)
        fetchUnits()
    }, [])

    async function fetchUnits() {
        const res = await fetch('/api/units')
        const data = await res.json()
        setUnits(Array.isArray(data) ? data : [])
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Etiquetas de QR Code</h1>
                <p>Imprima estas etiquetas e cole nas unidades/setores para acesso rápido ao estoque.</p>
                <button
                    onClick={() => window.print()}
                    className="btn btn-primary no-print"
                >
                    Imprimir Etiquetas
                </button>
            </header>

            <div className={styles.labelGrid}>
                {units.map(unit => (
                    <div key={unit.id} className={styles.labelCard}>
                        <div className={styles.qrContainer}>
                            {origin && (
                                <QRCodeSVG
                                    value={`${origin}/inventory?unitId=${unit.id}`}
                                    size={120}
                                    level="H"
                                    includeMargin={true}
                                />
                            )}
                        </div>
                        <div className={styles.info}>
                            <h3 className={styles.unitName}>{unit.name}</h3>
                            <p className={styles.location}>{unit.location || 'Setor Geral'}</p>
                            <span className={styles.scanText}>Escaneie para Inventariar</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
