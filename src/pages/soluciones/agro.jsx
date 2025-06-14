import { Fragment } from 'react';
import Head from 'next/head';
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import Content from '@/components/layout/HeroSection/Content';



function AgroPage() {
  return (
    <Fragment>
       <Head>
        <title>Seguros Mile Toro|Agro</title>
        <meta 
          name='description'
          content='Descripción de la oferta de seguros de Agro con el respaldo de Sura y la asesoría de Mile Toro'
          />
          </Head>
      <HeroSection 
      title="Agro"
      description="Protege tu empresa, impulsa tu tranquilidad"
      bgImage="/backgrounds/empresariales.jpeg"
        />
    <Content
      description="Protege a los productores agropecuarios contra pérdidas económicas derivadas de eventos climáticos y naturales que afectan sus cultivos y animales vivos."
      finalmessage="No dejes tu empresa expuesta a lo inesperado. Asegura tu negocio hoy y enfócate en hacerlo crecer con confianza."
      />
    </Fragment>
  )
}

export default AgroPage;