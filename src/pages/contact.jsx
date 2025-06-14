import ContactForm from '@/components/layout/ContactSection/ContactForm';
import ContactInfo from '@/components/layout/ContactSection/ContactInfo';
import styles from '@/components/layout/ContactSection/ContactForm.module.scss';

const ContactPage = () => (

<>
  <h1 className={styles.title}><span>Contáctame</span></h1>
  <div className={styles.Wrapper}>
      
    {/* Columna izquierda: Título + Formulario */}
    <div className={styles.column}>
    
      <ContactForm />
    </div>

    {/* Columna derecha: Info */}
    <div className={styles.infoWrapper}>
      <ContactInfo />
    </div>
  </div>
  </>

  
);

export default ContactPage;





