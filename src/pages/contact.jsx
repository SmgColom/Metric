import ContactForm from '@/components/layout/ContactSection/ContactForm';
import ContactInfo from '@/components/layout/ContactSection/ContactInfo';
import styles from '@/components/layout/ContactSection/ContactForm.module.scss';

const ContactPage = () => (
  <div className={styles.contact__wrapper}>
    {/* Columna izquierda: Título + Formulario */}
    <div className={styles.contact__column}>
      <h1 className={styles.contact__title}><span>Contáctame</span></h1>
      <ContactForm />
    </div>

    {/* Columna derecha: Info */}
    <div className={styles.contact__infoWrapper}>
      <ContactInfo />
    </div>
  </div>
);

export default ContactPage;





