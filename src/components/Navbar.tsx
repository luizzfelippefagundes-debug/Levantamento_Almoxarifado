import Link from 'next/link'
import styles from './Navbar.module.css'

export default function Navbar() {
    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    TonnerSurvey
                </Link>
                <div className={styles.links}>
                    <Link href="/units">Unidades</Link>
                    <Link href="/toners">Toners</Link>
                    <Link href="/labels">Etiquetas</Link>
                    <Link href="/inventory">Levantamento</Link>
                    <Link href="/report">Relatório</Link>
                </div>
            </div>
        </nav>
    )
}
