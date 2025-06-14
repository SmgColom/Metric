import { Fragment } from 'react';
import Head from 'next/head';
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import Content from '@/components/layout/HeroSection/Content';



function MultiriesgoPage() {
  return (
    <Fragment>
       <Head>
       <title>Seguros Mile Toro|Multiriesgo</title>
        <meta 
          name='description'
          content='Descripción de la oferta de seguros Multiriesgo con el respaldo de Sura y la asesoría de Mile Toro'
          />
          </Head>
      <HeroSection 
      title="Multiriesgo Empresarial"
      description="Protege tu empresa, impulsa tu tranquilidad"
      bgImage="/backgrounds/empresariales.jpeg"
        />
    <Content
      description="Tu negocio es el resultado de esfuerzo, visión y compromiso. Con nuestra póliza de seguros empresariales, te ayudamos a proteger lo que has construido frente a riesgos operativos, patrimoniales y legales."
      feature1="Cobertura contra incendios, robos, daños materiales y responsabilidad civil"
      feature2="Protección para maquinaria, equipos, mercancía y activos clave"
      feature3="Planes personalizados según el tamaño y sector de tu empresa"
      feature4="Asistencia jurídica y soporte especializado"
      finalmessage="No dejes tu empresa expuesta a lo inesperado. Asegura tu negocio hoy y enfócate en hacerlo crecer con confianza."
      />
    </Fragment>
  )
}

export default MultiriesgoPage;