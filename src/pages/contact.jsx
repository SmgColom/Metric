import ContactForm from '@/components/layout/ContactSection/ContactForm';
import ContactInfo from '@/components/layout/ContactSection/ContactInfo';
import styles from '@/components/layout/ContactSection/ContactForm.module.scss';
import Head from "next/head";


const ContactPage = () => (

<>
<Head>
  <title>Contáctanos | Metric Solutions</title>
  <meta 
    name="description" 
    content="¿Tienes dudas o deseas una asesoría personalizada? Contáctanos para encontrar juntos la mejor experiencia para tu evento deportivo" 
  />
  <meta property="og:title" content="Contáctanos | Metric Solutions | Cronometraje de eventos deportivos" />
  <meta property="og:description" content="¿Tienes dudas o deseas una asesoría personalizada? Contáctanos para encontrar juntos la mejor experiencia para tu evento deportivo" />
  <meta property="og:image" content="https://metric-omega.vercel.app/public/Logo.png" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://metric-omega.vercel.app/contact" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Contáctanos | Metric Solutions | Cronometraje de eventos deportivos" />
  <meta name="twitter:description" content="¿Tienes dudas o deseas una asesoría personalizada? Contáctanos para encontrar juntos la mejor experiencia para tu evento deportivo" />
  <meta name="twitter:image" content="https://metric-omega.vercel.app/public/Logo.png" />
</Head>
  <h1 className={styles.title}><span>Contáctanos</span></h1>
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





