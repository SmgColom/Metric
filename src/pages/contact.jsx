import ContactForm from '@/components/layout/ContactSection/ContactForm';
import ContactInfo from '@/components/layout/ContactSection/ContactInfo';
import styles from '@/components/layout/ContactSection/ContactForm.module.scss';
import Head from "next/head";


const ContactPage = () => (

<>
<Head>
  <title>Contáctame | Mile Toro | Asesora en Seguros Sura</title>
  <meta 
    name="description" 
    content="¿Tienes dudas o deseas una asesoría personalizada? Contáctame para encontrar juntos las mejores soluciones de seguros con el respaldo de Sura." 
  />
  <meta property="og:title" content="Contáctame | Mile Toro | Asesora en Seguros Sura" />
  <meta property="og:description" content="¿Tienes dudas o deseas una asesoría personalizada? Contáctame para encontrar juntos las mejores soluciones de seguros con el respaldo de Sura." />
  <meta property="og:image" content="https://miletoroseguros.vercel.app/public/backgrounds/Logo.png" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://miletoroseguros.vercel.app/contact" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Contáctame | Mile Toro | Asesora en Seguros Sura" />
  <meta name="twitter:description" content="¿Tienes dudas o deseas una asesoría personalizada? Contáctame para encontrar juntos las mejores soluciones de seguros con el respaldo de Sura." />
  <meta name="twitter:image" content="https://miletoroseguros.vercel.app/public/backgrounds/Logo.jpg" />
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





