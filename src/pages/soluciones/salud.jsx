import { Fragment } from 'react';
import Head from 'next/head';
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import Content from '@/components/layout/HeroSection/Content';



function SaludPage() {
  return (
    <Fragment>
       <Head>
       <title>Seguros Mile Toro|Salud</title>
        <meta 
          name='description'
          content='Descripción de la oferta de seguros de Salud con el respaldo de Sura y la asesoría de Mile Toro'
          />
          </Head>
      <HeroSection 
      title="Salud Familiar"
      description="Tu salud es lo primero: protege lo que más importa"
      bgImage="/backgrounds/salud.jpeg"
        />
    <Content
      description="En la vida, lo inesperado puede suceder en cualquier momento. Con nuestra póliza de salud, tú y tu familia estarán cubiertos ante cualquier eventualidad médica."
      feature1="Cobertura médica integral"
      feature2="Acceso a una amplia red de clínicas y hospitales"
      feature3="Atención médica de calidad sin largas esperas"
      feature4="Planes flexibles que se adaptan a tus necesidades y presupuesto"
      finalmessage="No pongas en pausa tu bienestar. Contrata hoy tu seguro de salud y vive con la tranquilidad de estar protegido"
      />
    </Fragment>
  )
}

export default SaludPage;