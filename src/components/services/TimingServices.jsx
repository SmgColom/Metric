import styles from "./TimingServices.module.scss";
import Content from '@/components/layout/HeroSection/Content';
import {
  AiOutlineSetting,
  AiOutlineTool,
  AiOutlineClockCircle,
  AiOutlineFileDone
} from "react-icons/ai";

export default function TimingServices() {
  return (
    <section className={styles.wrapper}>
      {/* HERO */}
      <header className={styles.header}>
        <div className={styles.heroContent}>
          <div className={styles.textContent}>
            <h2>Nuestros Servicios</h2>
            <p>
              Soluciones profesionales para garantizar un cronometraje confiable,
              preciso y alineado con los estándares de eventos deportivos. Te acompañamos en todo el territorio nacional con nuestro servicio que incluye:
            </p>
            <Content
          features={[
            {
              label: "Planeación Técnica",
              icon: <AiOutlineSetting />
            },
            {
              label: "Instalación y Pruebas",
              icon: <AiOutlineTool />
            },
            {
              label: "Cronometraje en vivo",
              icon: <AiOutlineClockCircle />
            },
            {
              label: "Publicación de resultados",
              icon: <AiOutlineFileDone />
            }
          ]}
        />
          </div>

          <div className={styles.mediaWrapper}>
            <video
              className={styles.video}
              src="/video.mov"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        </div>
      </header>

      {/* Soluciones incluidas */}
      <div className={styles.block}>
        <h3>Soluciones incluidas</h3>

        <div className={styles.cards}>
          <div className={styles.card}>
            <h4>Cronometraje oficial</h4>
            <ul>
              <li>Lectura por chip RFID y validación por punto</li>
              <li>Control de duplicados y ventanas de seguridad</li>
              <li>Generación de tiempos brutos (gun) y netos (chip)</li>
              <li>Soporte técnico durante el evento</li>
            </ul>
          </div>

          <div className={styles.card}>
            <h4>Dorsales de competencia</h4>
            <ul>
              <li>Dorsal unisex liviano y resistente</li>
              <li>Material impermeable y de alta durabilidad</li>
              <li>Integración de chip RFID y numeración</li>
              <li>Diseño funcional para eventos deportivos</li>
            </ul>
          </div>

          <div className={styles.card}>
            <h4>Seguimiento en vivo (no oficial)</h4>
            <ul>
              <li>Visualización web de pasos por puntos intermedios</li>
              <li>Enlaces para redes sociales y pantallas</li>
              <li>Ideal para espectadores y acompañantes</li>
              <li>Soporte informativo del evento</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Servicios adicionales */}
      <div className={styles.block}>
        <h3>Servicios adicionales</h3>

        <div className={styles.cards}>
          <div className={styles.cardAlt}>
            <h4>Reloj LED de meta</h4>
            <p>
              Visualización clara del tiempo oficial para atletas,
              espectadores y cobertura audiovisual.
            </p>
          </div>

          <div className={styles.cardAlt}>
            <h4>Puntos adicionales de cronometraje</h4>
            <p>
              Mayor precisión en el control del recorrido y segmentación
              de resultados por distancia o categoría.
            </p>
          </div>

          <div className={styles.cardAlt}>
            <h4>Inscripción y gestión de participantes</h4>
            <p>
              Plataforma web para registro de participantes y
              consolidación de base de datos del evento.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

