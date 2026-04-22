'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './Navbar.module.css'

export default function Navbar() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark'
        if (savedTheme) {
            setTheme(savedTheme)
            document.documentElement.setAttribute('data-theme', savedTheme)
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark')
            document.documentElement.setAttribute('data-theme', 'dark')
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
        localStorage.setItem('theme', newTheme)
    }

    const toggleMenu = () => setIsOpen(!isOpen)
    const closeMenu = () => setIsOpen(false)

    return (
        <>
            <nav className={styles.nav}>
                <div className={styles.container}>
                    <button className={styles.menuBtn} onClick={toggleMenu} aria-label="Abrir Menu">
                        <div className={`${styles.hamburger} ${isOpen ? styles.active : ''}`}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </button>

                    <Link href="/" className={styles.logo} onClick={closeMenu}>
                        TonnerSurvey
                    </Link>

                    <button onClick={toggleTheme} className={styles.themeToggle} title="Alternar Tema">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </nav>

            {/* Backdrop */}
            <div className={`${styles.backdrop} ${isOpen ? styles.visible : ''}`} onClick={closeMenu}></div>

            {/* Side Menu */}
            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <h3>Menu Principal</h3>
                    <button className={styles.closeBtn} onClick={closeMenu}>&times;</button>
                </div>
                <div className={styles.sidebarLinks}>
                    <Link href="/" onClick={closeMenu}>🏠 Home</Link>
                    <Link href="/units" onClick={closeMenu}>🏢 Unidades</Link>
                    <Link href="/toners" onClick={closeMenu}>📦 Toners & Impressoras</Link>
                    <Link href="/inventory" onClick={closeMenu}>📝 Novo Levantamento</Link>
                    <Link href="/labels" onClick={closeMenu}>🏷️ Imprimir Etiquetas</Link>
                    <Link href="/report" onClick={closeMenu}>📊 Relatórios</Link>
                </div>
                <div className={styles.sidebarFooter}>
                    <p>Prefeitura de Levantamento v3.0</p>
                </div>
            </aside>
        </>
    )
}
