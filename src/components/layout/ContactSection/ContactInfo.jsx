import styles from "./ContactForm.module.scss";
import { BsWhatsapp } from "react-icons/bs";
import { MdEmail } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";

const ContactInfo = () => (
  <div className={styles.contact__infoBox}>
    <div>
      <a
        href="https://wa.me/573022460236?text=Hola!%20Quisiera%20hablar%20contigo%20sobre%20una%20consulta."
        target="_blank"
        rel="noopener noreferrer"
      >
        <div className={styles.contact__icon}><BsWhatsapp /></div>
      </a>
      <h3>WhatsApp</h3>
      <p>302 246 0236</p>
    </div>
    <div>
      <a href="mailto:milena.toro@asesorsura.com">
        <div className={styles.contact__icon}><MdEmail /></div>
      </a>
      <h3>Correo</h3>
      <p>milena.toro@asesorsura.com</p>
    </div>
    <div>
      <div className={styles.contact__icon}><IoLocationOutline /></div>
      <h3>Ubicación</h3>
      <p>Calle 27 #46-70, Local 144, Medellín</p>
    </div>
  </div>
);

export default ContactInfo;


