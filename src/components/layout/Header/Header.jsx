import Link from "next/link";
import { useEffect, useState } from "react";
import styles from './Header.module.scss';
import Image from 'next/image'; 

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const handleScroll = () => setScrolled(window.scrollY > 50);
  const [showModal, setShowModal] = useState(false);

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
        <div onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
          <Image 
            src="/Logo.png" 
            alt="Logo Metric Solutions" 
            width={120} 
            height={120} 
  />
        </div>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button onClick={() => setShowModal(false)} className={styles.closeButton}>
              ✖️
            </button>
            <img src="/Logo.png" alt="Logo grande" className={styles.modalImage} />
          </div>
        </div>
      )}

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
          <li><Link href="/about" onClick={() => setMenuOpen(false)}>Quienes Somos</Link></li>
          <li><Link href="/servicios/servicios" onClick={() => setMenuOpen(false)}>Nuestros Servicios</Link></li>
          <li><Link href="/news/blog" onClick={() => setMenuOpen(false)}>Infórmate</Link></li>
          <li><Link href="/contact" onClick={() => setMenuOpen(false)}>Contáctanos</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;






