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
                        <input
                            className="input"
                            placeholder="Modelo da Impressora"
                            value={newPrinterName}
                            onChange={e => setNewPrinterName(e.target.value)}
                            required
                        />
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
                        <input
                            className="input"
                            placeholder="Modelo do Toner"
                            value={newTonerName}
                            onChange={e => setNewTonerName(e.target.value)}
                            required
                        />
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
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>Toners</th>
                            </tr>
                        </thead>
                        <tbody>
                            {printers.map(p => (
                                <tr key={p.id}>
                                    <td>{p.brand}</td>
                                    <td>{p.name}</td>
                                    <td>{p.toners.map(t => t.name).join(', ') || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="card">
                    <h3>Modelos de Toners</h3>
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
                                    <td>{t.name}</td>
                                    <td>{t.printers.map(p => p.name).join(', ') || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    )
}
