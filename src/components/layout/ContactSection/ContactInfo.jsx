import styles from "./ContactForm.module.scss";
import { BsWhatsapp } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";

const ContactInfo = () => (
  <div className={styles.infoBox}>
    <div>
      <a
        href="https://wa.me/573022460236?text=Hola!%20Quisiera%20hablar%20contigo%20sobre%20una%20consulta."
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className={styles.contact__icon}><BsWhatsapp /></div>
      </a>
      <h3>WhatsApp</h3>
      <p>3157274796</p>
    </div>
    <div>
      <a href="mailto:metrictrackingsolutionsmed@gmail.com">
        <div className={styles.contact__icon}><MdEmail /></div>
      </a>
      <h3>Correo</h3>
      <p>metrictrackingsolutionsmed@gmail.com</p>
    </div>

  </div>
);

export default ContactInfo;


