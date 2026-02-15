import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import styles from "./Header.module.scss";
import Image from "next/image";

function Header() {
  const headerRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 50);
  }, []);

  // ✅ Mide altura real del header y la guarda en CSS var
  const syncHeaderOffset = useCallback(() => {
    const h = headerRef.current?.getBoundingClientRect().height ?? 0;
    document.body.style.setProperty("--header-offset", `${Math.ceil(h)}px`);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // ✅ Aplica clase menu-open y setea offset cuando abre/cierra
  useLayoutEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);

    // mide en el mismo frame para que el push sea correcto
    syncHeaderOffset();

    return () => {
      document.body.classList.remove("menu-open");
    };
  }, [menuOpen, syncHeaderOffset]);

  // ✅ Recalcula offset al cambiar tamaño (rotación móvil / resize)
  useEffect(() => {
    const onResize = () => syncHeaderOffset();
    window.addEventListener("resize", onResize);

    // por si la fuente/imagenes cambian un poco después de cargar
    const t = setTimeout(syncHeaderOffset, 50);

    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, [syncHeaderOffset]);

  // ✅ Cierra menú al cambiar ruta o click en link (ya lo hacías)
  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${scrolled ? styles.scrolled : ""} ${
        menuOpen ? styles.menuOpen : ""
      }`}
    >
      <div className={styles.brand}>
        <button
          type="button"
          className={styles.logoButton}
          onClick={() => setShowModal(true)}
          aria-label="Ver logo"
        >
          <Image
            src="/Logo.png"
            alt="Logo Metric Solutions"
            width={120}
            height={120}
            priority
          />
        </button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modalContent}>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className={styles.closeButton}
              aria-label="Cerrar"
            >
              ✖️
            </button>
            {/* Mantengo img normal para modal */}
            <img src="/Logo.png" alt="Logo grande" className={styles.modalImage} />
          </div>
        </div>
      )}

      {/* ✅ Botón hamburguesa accesible */}
      <button
        type="button"
        className={styles.hamburger}
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-controls="main-nav"
        aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
      >
        <span />
        <span />
        <span />
      </button>

      {/* ✅ Menú */}
      <nav id="main-nav" className={`${styles.nav} ${menuOpen ? styles.active : ""}`}>
        <ul>
          <li><Link href="/" onClick={closeMenu}>Inicio</Link></li>
          <li><Link href="/about" onClick={closeMenu}>Quienes Somos</Link></li>
          <li><Link href="/servicios/servicios" onClick={closeMenu}>Servicios</Link></li>
          <li><Link href="/eventos" onClick={closeMenu}>Eventos</Link></li>
          <li><Link href="/news/blog" onClick={closeMenu}>Infórmate</Link></li>
          <li><Link href="/contact" onClick={closeMenu}>Contáctanos</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;







