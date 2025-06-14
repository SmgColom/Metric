import { Fragment } from 'react';
import Head from 'next/head';
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import Content from '@/components/layout/HeroSection/Content';



function CumplimientoPage() {
  return (
    <Fragment>
       <Head>
       <title>Seguros Mile Toro|Cumplimiento</title>
        <meta 
          name='description'
          content='Descripción de la oferta de seguros de Cumplimiento con el respaldo de Sura y la asesoría de Mile Toro'
          />
          </Head>
      <HeroSection 
      title="Cumplimiento"
      description="Protege tu empresa, impulsa tu tranquilidad"
      bgImage="/backgrounds/empresariales.jpeg"
        />
    <Content
      description="Protege al contratante en caso de incumplimiento por parte del contratista de las obligaciones pactadas en el contrato asegurado."
      finalmessage="No dejes tu empresa expuesta a lo inesperado. Asegura tu negocio hoy y enfócate en hacerlo crecer con confianza."
      />
    </Fragment>
  )
}

export default CumplimientoPage;