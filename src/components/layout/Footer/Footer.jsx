import styles from './Footer.module.scss'
import { GrInstagram } from "react-icons/gr";
import { FaFacebook } from "react-icons/fa";

function Footer() {
  const getCurrentYear = () => new Date().getFullYear();

  return (
    <div className={styles.footerwrapper}>
      <div className={styles.footerTop}>
        <div className={styles.footerSection}>
          <h4>Quien soy yo</h4>
          <a href="/about">Perfil</a>
          <div className={styles.socialIcons}>
          <a href="https://instagram.com/mile_toro" title="Instagram" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><GrInstagram  size={20}/></a>
          <a href="https://www.facebook.com/mile.torogarcia?mibextid=wwXIfr&mibextid=wwXIfr" title="Facebook" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><FaFacebook size={20} /></a>
        </div>
        </div>

        <div className={styles.footerSection}>
          <h4>Soluciones para Personas</h4>
          <a href="/soluciones/vida">Vida Individual</a>
          <a href="/soluciones/salud">Salud Familiar</a>
          <a href="/soluciones/movilidad">Movilidad</a>
          <a href="/soluciones/hogar">Hogar</a>
        </div>

        <div className={styles.footerSection}>
          <h4>Soluciones para Empresas</h4>
          <a href="/soluciones/multiriesgo">Multiriesgo empresarial</a>
          <a href="/soluciones/responsabilidad">Responsabilidad Civil</a>
          <a href="/soluciones/transporte">Transporte</a>
          <a href="/soluciones/cumplimiento">Cumplimiento</a>
          <a href="/soluciones/bienes">Bienes y Patrimonio</a>
          <a href="/soluciones/construccion">Todo Riesgo Construcción</a>
          <a href="/soluciones/agro">Agro</a>
          <a href="/soluciones/arl">ARL</a>
        </div>

        <div className={styles.footerSection}>
          <h4>Medellín</h4>
          <a href="https://www.google.com/maps/place/Punto+Clave+-+Centro+Integral+de+Servicios./@6.2297246,-75.5766451,17z/data=!3m1!4b1!4m6!3m5!1s0x8e4429386f2d071b:0x1909cdb657bb546e!8m2!3d6.2297246!4d-75.5740648!16s%2Fg%2F1hm5pfrh_?entry=ttu&g_ep=EgoyMDI1MDYwMS4wIKXMDSoASAFQAw%3D%3D">Calle 27 #46-70, Local 144</a>
          <p>Centro Comercial Punto Clave</p>
          <p>302 246 0236</p>
        </div>

        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <img src="/Logo.jpeg" alt="Logo Mile Toro" />
          </div>
        </div>
      </div>

      <div className={styles.footerbottom}>
        <span>&copy; {getCurrentYear()} Santiago Montoya</span>

      </div>
    </div>
  );
}

export default Footer;
