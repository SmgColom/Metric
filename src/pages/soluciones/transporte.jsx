import { Fragment } from 'react';
import Head from 'next/head';
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import Content from '@/components/layout/HeroSection/Content';



function TransportePage() {
  return (
    <Fragment>
       <Head>
       <title>Seguros Mile Toro|Transporte</title>
        <meta 
          name='description'
          content='Descripción de la oferta de seguros de Transporte con el respaldo de Sura y la asesoría de Mile Toro'
          />
          </Head>
      <HeroSection 
      title="Transporte de mercancias"
      description="Protege tu empresa, impulsa tu tranquilidad"
      bgImage="/backgrounds/empresariales.jpeg"
        />
    <Content
      description="Proteger a los diferentes actores logísticos ante los riesgos asociados a la movilización de mercancías."
      finalmessage="No dejes tu empresa expuesta a lo inesperado. Asegura tu negocio hoy y enfócate en hacerlo crecer con confianza."
      />
    </Fragment>
  )
}

export default TransportePage;