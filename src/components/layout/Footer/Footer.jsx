import styles from './Footer.module.scss'
import { GrInstagram } from "react-icons/gr";
import { FaFacebook } from "react-icons/fa";

function Footer() {
  const getCurrentYear = () => new Date().getFullYear();

  return (
    <div className={styles.footerwrapper}>
      <div className={styles.footerTop}>
        <div className={styles.footerSection}>
          <h4>Quienes somos</h4>
          <a href="/about">Perfil</a>
          <div className={styles.socialIcons}>
          <a href="https://www.instagram.com/miletoroseguros/" title="Instagram" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><GrInstagram  size={20}/></a>
          <a href="https://www.facebook.com/profile.php?id=61582965730718" title="Facebook" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><FaFacebook size={20} /></a>
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



      </div>

      <div className={styles.footerbottom}>
        <span>&copy; {getCurrentYear()} Santiago Montoya</span>

      </div>
    </div>
  );
}

export default Footer;
