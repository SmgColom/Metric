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



 



      </div>

      <div className={styles.footerbottom}>
        <span>&copy; {getCurrentYear()} Santiago Montoya</span>

      </div>
    </div>
  );
}

export default Footer;
