'use client'

import { useState, useEffect } from 'react'
import styles from './Units.module.css'

interface Unit {
    id: string
    name: string
    location: string | null
}

export default function UnitsPage() {
    const [units, setUnits] = useState<Unit[]>([])
    const [name, setName] = useState('')
    const [location, setLocation] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchUnits()
    }, [])

    async function fetchUnits() {
        try {
            const res = await fetch('/api/units')
            const data = await res.json()
            if (Array.isArray(data)) {
                setUnits(data)
            } else {
                console.error('Data is not an array:', data)
                setUnits([])
            }
        } catch (error) {
            console.error('Failed to fetch units:', error)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name) return

        const res = await fetch('/api/units', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, location })
        })

        if (res.ok) {
            setName('')
            setLocation('')
            fetchUnits()
        }
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h1>Unidades / Departamentos</h1>
                <p>Gerencie as unidades e setores cadastrados no sistema.</p>
            </header>

            <section className="card">
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label htmlFor="name">Nome da Unidade/Setor</label>
                        <input
                            id="name"
                            type="text"
                            className="input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Secretaria de Saúde"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="location">Localização/Bairro</label>
                        <input
                            id="location"
                            type="text"
                            className="input"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Ex: Centro"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">Adicionar Unidade</button>
                </form>
            </section>

            <section className={styles.list}>
                {isLoading ? (
                    <p>Carregando...</p>
                ) : units.length === 0 ? (
                    <p>Nenhuma unidade cadastrada.</p>
                ) : (
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Localização</th>
                            </tr>
                        </thead>
                        <tbody>
                            {units.map((unit) => (
                                <tr key={unit.id}>
                                    <td>{unit.name}</td>
                                    <td>{unit.location || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    )
}
