import Link from "next/link";
import { useEffect, useState } from "react";
import styles from './Header.module.scss';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          <li><Link href="/">Inicio</Link></li>
          <li><Link href="/about">Quien Soy Yo</Link></li>

          <li className={styles.dropdown}>
            <a>Soluciones</a>
            <ul className={styles.dropdownMenu}>
              <li className={styles.submenu}>
                <a>Para personas</a>
                <ul className={styles.submenuList}>
                  <li><Link href="/soluciones/vida">Vida Individual</Link></li>
                  <li><Link href="/soluciones/salud">Salud Familiar</Link></li>
                  <li><Link href="/soluciones/movilidad">Movilidad</Link></li>
                  <li><Link href="/soluciones/hogar">Hogar</Link></li>
                </ul>
              </li>
              <li className={styles.submenu}>
                <a>Para empresas</a>
                <ul className={styles.submenuList}>
                  <li><Link href="/soluciones/multiriesgo">Multiriesgo Empresarial</Link></li>
                  <li><Link href="/soluciones/responsabilidad">Responsabilidad Civil</Link></li>
                  <li><Link href="/soluciones/transporte">Transporte</Link></li>
                  <li><Link href="/soluciones/cumplimiento">Cumplimiento</Link></li>
                  <li><Link href="/soluciones/bienes">Bienes y Patrimonio</Link></li>
                  <li><Link href="/soluciones/construccion">Todo Riesgo Construcción</Link></li>
                  <li><Link href="/soluciones/agro">Agro</Link></li>
                  <li><Link href="/soluciones/arl">ARL</Link></li>
                </ul>
              </li>
            </ul>
          </li>

          <li><Link href="/news/blog">Salud y Bienestar</Link></li>
          <li><Link href="/contact">Contáctame</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;






