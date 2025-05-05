import Link from "next/link"
// [E1b] IMPORT COMPONENT-LEVEL CSS
import styles from './Header.module.scss'

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>Navigation</div>
      <nav>
        <ul>
          <li>
            <Link href="/">Home</Link>
          </li>        
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/news">News</Link>
          </li>
          <li>
            <Link href="/contact">Contact Us</Link>
          </li>        
        </ul>
      </nav>
    </header>
  )
}

export default Header