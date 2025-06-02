import Link from "next/link";
import { useEffect, useState } from "react";
import styles from './Header.module.scss';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const handleScroll = () => setScrolled(window.scrollY > 50);

  useEffect(() => {

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
    return () => {
      
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.brand}>
        <Link href="/">
          <div><img src="/Logo.jpeg" alt="Logo asesora Milena Toro" /></div>
        </Link>
      </div>

      {/* Botón hamburguesa */}
      <div className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Menú de navegación con clase activa si está abierto */}
      <nav className={`${styles.nav} ${menuOpen ? styles.active : ''}`}>
        <ul>
          <li><Link href="/" onClick={() => setMenuOpen(false)}>Inicio</Link></li>
          <li><Link href="/about" onClick={() => setMenuOpen(false)}>Quien Soy Yo</Link></li>

          <li className={styles.dropdown}>
            <a>Soluciones</a>
            <ul className={styles.dropdownMenu}>
              <li className={styles.submenu}>
                <a>Para personas</a>
                <ul className={styles.submenuList}>
                  <li><Link href="/soluciones/vida" onClick={() => setMenuOpen(false)}>Vida Individual</Link></li>
                  <li><Link href="/soluciones/salud" onClick={() => setMenuOpen(false)}>Salud Familiar</Link></li>
                  <li><Link href="/soluciones/movilidad" onClick={() => setMenuOpen(false)}>Movilidad</Link></li>
                  <li><Link href="/soluciones/hogar" onClick={() => setMenuOpen(false)}>Hogar</Link></li>
                </ul>
              </li>
              <li className={styles.submenu}>
                <a>Para empresas</a>
                <ul className={styles.submenuList}>
                  <li><Link href="/soluciones/multiriesgo" onClick={() => setMenuOpen(false)}>Multiriesgo Empresarial</Link></li>
                  <li><Link href="/soluciones/responsabilidad" onClick={() => setMenuOpen(false)}>Responsabilidad Civil</Link></li>
                  <li><Link href="/soluciones/transporte" onClick={() => setMenuOpen(false)}>Transporte</Link></li>
                  <li><Link href="/soluciones/cumplimiento" onClick={() => setMenuOpen(false)}>Cumplimiento</Link></li>
                  <li><Link href="/soluciones/bienes" onClick={() => setMenuOpen(false)}>Bienes y Patrimonio</Link></li>
                  <li><Link href="/soluciones/construccion" onClick={() => setMenuOpen(false)}>Todo Riesgo Construcción</Link></li>
                  <li><Link href="/soluciones/agro" onClick={() => setMenuOpen(false)}>Agro</Link></li>
                  <li><Link href="/soluciones/arl" onClick={() => setMenuOpen(false)}>ARL</Link></li>
                </ul>
              </li>
            </ul>
          </li>

          <li><Link href="/news/blog" onClick={() => setMenuOpen(false)}>Salud y Bienestar</Link></li>
          <li><Link href="https://pagos.segurossura.com.co/pagos" target="_blank" rel="noopener noreferrer">Pago Express</Link></li>
          <li><Link href="/contact" onClick={() => setMenuOpen(false)}>Contáctame</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;






