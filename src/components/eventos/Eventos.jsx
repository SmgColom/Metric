// src/components/eventos/Eventos.jsx
import Link from "next/link";
import Image from "next/image";
import styles from "./Eventos.module.scss";

const EVENTS = [
  {
    key: "2728",
    title: "Carrera Corazón Quindío 2025",
    href: "/e/2728",
    banner: "/events/2728/Banner.png", 
  },
  {
    key: "2701",
    title: "Chequeo MRT 6K",
    href: "/e/2701",
    banner: "/events/2701/Banner.png", // en tu JSON aparece Banner.png con B mayúscula
  },
];

export default function Eventos() {
  return (
    <section className={styles.wrapper}>
      {/* HERO */}
      <header className={styles.header}>
        <div className={styles.heroContent}>
          <div className={styles.textContent}>
            <h2>Eventos</h2>
            <p>Visita los resultados de nuestros eventos recientes</p>
          </div>
        </div>
      </header>

      {/* CARDS */}
      <div className={styles.grid}>
        {EVENTS.map((ev) => (
          <Link key={ev.key} href={ev.href} className={styles.card}>
            <div className={styles.media}>
              <Image
                src={ev.banner}
                alt={`Banner ${ev.title}`}
                fill
                sizes="(max-width: 768px) 100vw, 520px"
                className={styles.img}
                priority={ev.key === "2728"}
              />
              <div className={styles.overlay} />
              <div className={styles.badge}>Evento</div>
            </div>

            <div className={styles.body}>
              <h3 className={styles.title}>{ev.title}</h3>
              <span className={styles.cta}>Ver evento →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}


