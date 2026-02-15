import styles from './Footer.module.scss';
import { GrInstagram } from "react-icons/gr";
import { FaFacebook } from "react-icons/fa";

function Footer() {
  const getCurrentYear = () => new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerbottom}>
        <span>&copy; {getCurrentYear()}</span>
              <div className={styles.socialIcons}>
      </div>
      </div>
    </footer>
  );
}

export default Footer;

