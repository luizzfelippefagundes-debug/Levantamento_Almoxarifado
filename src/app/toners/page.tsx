'use client'

import { useState, useEffect } from 'react'
import styles from './Toners.module.css'

interface Printer {
    id: string
    name: string
    brand: string
    toners: Toner[]
}

interface Toner {
    id: string
    name: string
    printers: Printer[]
}

export default function TonersPage() {
    const [printers, setPrinters] = useState<Printer[]>([])
    const [toners, setToners] = useState<Toner[]>([])

    const [newPrinterName, setNewPrinterName] = useState('')
    const [newPrinterBrand, setNewPrinterBrand] = useState('')
    const [newTonerName, setNewTonerName] = useState('')

    const [selectedToners, setSelectedToners] = useState<string[]>([])
    const [selectedPrinters, setSelectedPrinters] = useState<string[]>([])

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        const [printersRes, tonersRes] = await Promise.all([
            fetch('/api/printers'),
            fetch('/api/toners')
        ])
        const [printersData, tonersData] = await Promise.all([
            printersRes.json(),
            tonersRes.json()
        ])
        setPrinters(printersData)
        setToners(tonersData)
    }

    async function handleAIConsult(modelName: string, type: 'printer' | 'toner') {
        if (!modelName) return alert('Digite o nome do modelo primeiro.')

        try {
            const res = await fetch('/api/ai/compatibility', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ modelName, type })
            })
            const data = await res.json()

            if (data.error) {
                alert(data.tip || data.error)
                return
            }

            if (confirm(`A IA sugere estas compatibilidades: ${data.result}\n\nDeseja que eu tente selecionar os itens correspondentes na lista abaixo?`)) {
                const suggestions = data.result.toLowerCase().split(',').map((s: string) => s.trim())
                if (type === 'printer') {
                    const idsToSelect = toners.filter(t => suggestions.some((s: string) => t.name.toLowerCase().includes(s)))
                        .map(t => t.id)
                    setSelectedToners(prev => Array.from(new Set([...prev, ...idsToSelect])))
                } else {
                    const idsToSelect = printers.filter(p => suggestions.some((s: string) => p.name.toLowerCase().includes(s)))
                        .map(p => p.id)
                    setSelectedPrinters(prev => Array.from(new Set([...prev, ...idsToSelect])))
                }
            }
        } catch (error) {
            alert('Erro ao consultar a IA.')
        }
    }

    async function handleAddPrinter(e: React.FormEvent) {
        e.preventDefault()
        const res = await fetch('/api/printers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newPrinterName,
                brand: newPrinterBrand,
                tonerIds: selectedToners
            })
        })
        if (res.ok) {
            setNewPrinterName('')
            setNewPrinterBrand('')
            setSelectedToners([])
            fetchData()
        }
    }

    async function handleAddToner(e: React.FormEvent) {
        e.preventDefault()
        const res = await fetch('/api/toners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: newTonerName,
                printerIds: selectedPrinters
            })
        })
        if (res.ok) {
            setNewTonerName('')
            setSelectedPrinters([])
            fetchData()
        }
    }

    async function handleVisionDetect(type: 'printer' | 'toner') {
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
                    const res = await fetch('/api/ai/compatibility', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: base64 })
                    })
                    const data = await res.json()
                    if (data.result && data.result !== 'Não identificado') {
                        if (type === 'printer') setNewPrinterName(data.result)
                        else setNewTonerName(data.result)
                    } else {
                        alert('IA não conseguiu identificar o modelo na foto. Tente tirar uma foto mais nítida da etiqueta.')
                    }
                }
                reader.readAsDataURL(file)
            }
        }
        input.click()
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Impressoras e Toners</h1>
                <p>Gerencie os modelos de impressoras e seus toners compatíveis.</p>
            </header>

            <div className={styles.grid}>
                <section className="card">
                    <h2>Nova Impressora</h2>
                    <form onSubmit={handleAddPrinter} className={styles.formContainer}>
                        <div className={styles.inputWithAI}>
                            <input
                                className="input"
                                placeholder="Modelo da Impressora"
                                value={newPrinterName}
                                onChange={e => setNewPrinterName(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className={`${styles.aiBtn} btn`}
                                onClick={() => handleAIConsult(newPrinterName, 'printer')}
                                title="Consultar Toners Compatíveis com IA"
                            >
                                ✨ IA
                            </button>
                            <button
                                type="button"
                                className={`${styles.photoBtn} btn`}
                                onClick={() => handleVisionDetect('printer')}
                                title="Identificar por Foto"
                            >
                                📷
                            </button>
                        </div>
                        <input
                            className="input"
                            placeholder="Marca"
                            value={newPrinterBrand}
                            onChange={e => setNewPrinterBrand(e.target.value)}
                        />
                        <div className={styles.selector}>
                            <label>Toners Compatíveis:</label>
                            <div className={styles.checkboxList}>
                                {toners.map(t => (
                                    <label key={t.id} className={styles.checkboxItem}>
                                        <input
                                            type="checkbox"
                                            checked={selectedToners.includes(t.id)}
                                            onChange={e => {
                                                if (e.target.checked) setSelectedToners([...selectedToners, t.id])
                                                else setSelectedToners(selectedToners.filter(id => id !== t.id))
                                            }}
                                        />
                                        {t.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Adicionar Impressora</button>
                    </form>
                </section>

                <section className="card">
                    <h2>Novo Toner</h2>
                    <form onSubmit={handleAddToner} className={styles.formContainer}>
                        <div className={styles.inputWithAI}>
                            <input
                                className="input"
                                placeholder="Modelo do Toner"
                                value={newTonerName}
                                onChange={e => setNewTonerName(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className={`${styles.aiBtn} btn`}
                                onClick={() => handleAIConsult(newTonerName, 'toner')}
                                title="Consultar Impressoras Compatíveis com IA"
                            >
                                ✨ IA
                            </button>
                            <button
                                type="button"
                                className={`${styles.photoBtn} btn`}
                                onClick={() => handleVisionDetect('toner')}
                                title="Identificar por Foto"
                            >
                                📷
                            </button>
                        </div>
                        <div className={styles.selector}>
                            <label>Impressoras Compatíveis:</label>
                            <div className={styles.checkboxList}>
                                {printers.map(p => (
                                    <label key={p.id} className={styles.checkboxItem}>
                                        <input
                                            type="checkbox"
                                            checked={selectedPrinters.includes(p.id)}
                                            onChange={e => {
                                                if (e.target.checked) setSelectedPrinters([...selectedPrinters, p.id])
                                                else setSelectedPrinters(selectedPrinters.filter(id => id !== p.id))
                                            }}
                                        />
                                        {p.name} ({p.brand})
                                    </label>
                                ))}
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary">Adicionar Toner</button>
                    </form>
                </section>
            </div>

            <section className={styles.tablesSection}>
                <div className="card">
                    <h3>Modelos de Impressoras</h3>
                    <div className="tableContainer">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Marca</th>
                                    <th>Modelo</th>
                                    <th>Toners Compatíveis</th>
                                </tr>
                            </thead>
                            <tbody>
                                {printers.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.brand}</strong></td>
                                        <td>{p.name}</td>
                                        <td>
                                            <div className={styles.badgeList}>
                                                {p.toners.length > 0 ? p.toners.map(t => (
                                                    <span key={t.id} className={styles.badge}>{t.name}</span>
                                                )) : <span className={styles.empty}>Nenhum</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="card">
                    <h3>Modelos de Toners</h3>
                    <div className="tableContainer">
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Modelo</th>
                                    <th>Impressoras Compatíveis</th>
                                </tr>
                            </thead>
                            <tbody>
                                {toners.map(t => (
                                    <tr key={t.id}>
                                        <td><strong>{t.name}</strong></td>
                                        <td>
                                            <div className={styles.badgeList}>
                                                {t.printers.length > 0 ? t.printers.map(p => (
                                                    <span key={p.id} className={styles.badge}>{p.name} ({p.brand})</span>
                                                )) : <span className={styles.empty}>Nenhuma</span>}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </div>
    )
}
