'use client'

import { useState, useEffect, useRef } from 'react'
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

export default function InventoryPage() {
    const [units, setUnits] = useState<Unit[]>([])
    const [toners, setToners] = useState<Toner[]>([])
    const [selectedUnitId, setSelectedUnitId] = useState('')
    const [stocks, setStocks] = useState<Record<string, number>>({})
    const [searchTerm, setSearchTerm] = useState('')
    const [isAiIdentifying, setIsAiIdentifying] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

    const handleCameraClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsAiIdentifying(true)
        const reader = new FileReader()
        reader.onload = async (event) => {
            const base64 = event.target?.result as string
            try {
                const res = await fetch('/api/ai/compatibility', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image: base64 })
                })
                const data = await res.json()
                if (data.result && data.result !== "Não identificado") {
                    setSearchTerm(data.result)
                    alert(`IA identificou: ${data.result}. A lista foi filtrada.`)
                } else {
                    alert("A IA não conseguiu identificar este modelo. Tente outra foto ou busque pelo nome.")
                }
            } catch (error) {
                console.error("AI Error:", error)
            } finally {
                setIsAiIdentifying(false)
            }
        }
        reader.readAsDataURL(file)
    }

    const filteredToners = toners.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.printers.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Levantamento de Estoque</h1>
                <p>Abra as caixas, tire fotos e registre o que encontrou.</p>
            </header>

            <section className={styles.controls}>
                <div className={`${styles.unitCard} card`}>
                    <label>📍 Onde você está?</label>
                    <select
                        className="input"
                        value={selectedUnitId}
                        onChange={e => setSelectedUnitId(e.target.value)}
                    >
                        <option value="">Selecione a Unidade...</option>
                        {units.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>

                <div className={`${styles.aiSearchCard} card`}>
                    <label>🔍 Buscar ou Identificar</label>
                    <div className={styles.searchRow}>
                        <input 
                            type="text" 
                            className="input" 
                            placeholder="Nome do toner ou impressora..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button 
                            className={styles.smartIdentifyBtn} 
                            onClick={handleCameraClick}
                            disabled={isAiIdentifying}
                        >
                            {isAiIdentifying ? '⌛' : '📷 IA'}
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            style={{ display: 'none' }} 
                            accept="image/*" 
                            capture="environment"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
            </section>

            {selectedUnitId && (
                <section className={styles.tonerList}>
                    <div className={styles.listHeader}>
                        <h2>Itens Encontrados ({filteredToners.length})</h2>
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="btn-text">Limpar Filtro</button>}
                    </div>
                    <div className={styles.grid}>
                        {filteredToners.map(toner => (
                            <div key={toner.id} className={`${styles.tonerItem} card`}>
                                <div className={styles.tonerMain}>
                                    <div>
                                        <span className={styles.tonerName}>{toner.name}</span>
                                        <div className={styles.printerBadges}>
                                            {toner.printers?.map(p => (
                                                <span key={p.id} className={styles.badge}>{p.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className={styles.counter}>
                                        <button onClick={() => handleUpdateStock(toner.id, (stocks[toner.id] || 0) > 0 ? ((stocks[toner.id] || 0) - 1).toString() : '0')}>-</button>
                                        <input
                                            type="number"
                                            value={stocks[toner.id] ?? ''}
                                            onChange={e => handleUpdateStock(toner.id, e.target.value)}
                                            placeholder="0"
                                        />
                                        <button onClick={() => handleUpdateStock(toner.id, ((stocks[toner.id] || 0) + 1).toString())}>+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
            
            {!selectedUnitId && (
                <div className={styles.emptyState}>
                    <p>Por favor, selecione uma unidade para começar o levantamento.</p>
                </div>
            )}
        </div>
    )
}
