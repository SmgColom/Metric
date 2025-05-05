import Link from "next/link"

import styles from './Header.module.scss'

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Link href="/">
        <div className={styles.brand}><img src="/Logo.jpeg" alt="Logo asesora Milena Toro" /></div> 
        </Link>
      </div>
      <nav>
        <ul>
          <li><Link href="/">Inicio</Link></li>        
          <li><Link href="/about">Quien Soy Yo</Link></li>
          <li><Link href="/news">Entérate</Link></li>
          <li><Link href="/contact">Contáctame</Link></li>        
        </ul>
      </nav>
    </header>
  )
}

export default Header
