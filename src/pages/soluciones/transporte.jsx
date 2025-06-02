import { Fragment } from 'react';
import Head from 'next/head';
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import Content from '@/components/layout/HeroSection/Content';



function TransportePage() {
  return (
    <Fragment>
       <Head>
        <title>SegurosMileToro|Transporte</title>
        <meta 
          name='Seguro de Transporte de mercancias asesora Mile Toro'
          description='Descripción de la oferta del seguro de Transporte de mercancias con el respaldo de Sura y la asesora Mile Toro'
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