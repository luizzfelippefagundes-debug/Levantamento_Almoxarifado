'use client'

import { useState, useEffect } from 'react'
import styles from './Inventory.module.css'

interface Unit {
    id: string
    name: string
}

interface Toner {
    id: string
    name: string
    printers: { id: string, name: string, brand: string }[]
}

interface Stock {
    tonerId: string
    quantity: number
}

export default function InventoryPage() {
    const [units, setUnits] = useState<Unit[]>([])
    const [toners, setToners] = useState<Toner[]>([])
    const [selectedUnitId, setSelectedUnitId] = useState('')
    const [stocks, setStocks] = useState<Record<string, number>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (selectedUnitId) {
            fetchStocks(selectedUnitId)
        } else {
            setStocks({})
        }
    }, [selectedUnitId])

    async function fetchData() {
        try {
            const [unitsRes, tonersRes] = await Promise.all([
                fetch('/api/units'),
                fetch('/api/toners')
            ])
            const [unitsData, tonersData] = await Promise.all([
                unitsRes.json(),
                tonersRes.json()
            ])
            setUnits(Array.isArray(unitsData) ? unitsData : [])
            setToners(Array.isArray(tonersData) ? tonersData : [])
        } catch (error) {
            console.error('Failed to fetch data:', error)
        }
    }

    async function fetchStocks(unitId: string) {
        const res = await fetch(`/api/stock?unitId=${unitId}`)
        const data = await res.json()
        const stockMap: Record<string, number> = {}
        data.forEach((s: any) => {
            stockMap[s.tonerId] = s.quantity
        })
        setStocks(stockMap)
    }

    async function handleUpdateStock(tonerId: string, quantity: string, imageUrl?: string) {
        const qty = parseInt(quantity) || 0
        setStocks(prev => ({ ...prev, [tonerId]: qty }))

        await fetch('/api/stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                unitId: selectedUnitId,
                tonerId,
                quantity: qty,
                imageUrl: imageUrl || undefined
            })
        })
    }

    const handleCapture = (tonerId: string) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.capture = 'environment'
        input.onchange = async (e: any) => {
            const file = e.target.files[0]
            if (file) {
                const reader = new FileReader()
                reader.onload = async (event) => {
                    const base64 = event.target?.result as string
                    await handleUpdateStock(tonerId, stocks[tonerId]?.toString() || '0', base64)
                    alert('Foto salva com sucesso!')
                }
                reader.readAsDataURL(file)
            }
        }
        input.click()
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Levantamento de Estoque</h1>
                <p>Selecione uma unidade para registrar a quantidade de toners em estoque.</p>
            </header>

            <section className="card">
                <div className={styles.unitSelector}>
                    <label htmlFor="unit">Unidade/Setor:</label>
                    <select
                        id="unit"
                        className="input"
                        value={selectedUnitId}
                        onChange={e => setSelectedUnitId(e.target.value)}
                    >
                        <option value="">Selecione uma unidade...</option>
                        {units.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>
            </section>

            {selectedUnitId && (
                <section className={styles.tonerList}>
                    <h2>Estoques de Toners</h2>
                    <div className={styles.grid}>
                        {toners.map(toner => (
                            <div key={toner.id} className={`${styles.tonerCard} card`}>
                                <div className={styles.tonerInfo}>
                                    <span className={styles.tonerName}>{toner.name}</span>
                                    <div className={styles.printerBadges}>
                                        {toner.printers?.map(p => (
                                            <span key={p.id} className={styles.printerBadge}>
                                                {p.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className={styles.stockInput}>
                                    <label htmlFor={`toner-${toner.id}`}>Quantidade:</label>
                                    <div className={styles.inputWithCamera}>
                                        <input
                                            id={`toner-${toner.id}`}
                                            type="number"
                                            min="0"
                                            className="input"
                                            value={stocks[toner.id] ?? ''}
                                            placeholder="0"
                                            onChange={e => handleUpdateStock(toner.id, e.target.value)}
                                        />
                                        <button
                                            className={styles.cameraBtn}
                                            onClick={() => handleCapture(toner.id)}
                                            title="Tirar foto"
                                        >
                                            📷
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    )
}
