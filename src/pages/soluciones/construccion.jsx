import { Fragment } from 'react';
import Head from 'next/head';
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import Content from '@/components/layout/HeroSection/Content';



function ConstruccionPage() {
  return (
    <Fragment>
       <Head>
        <title>SegurosMileToro|Todo Riesgo Construcción</title>
        <meta 
          name='Seguro Todo Riesgo Construcción asesora Mile Toro'
          description='Descripción de la oferta del seguro Todo Riesgo Construcción con el respaldo de Sura y la asesora Mile Toro'
          />
          </Head>
      <HeroSection 
      title="Todo Riesgo Construcción"
      description="Protege tu empresa, impulsa tu tranquilidad"
      bgImage="/backgrounds/empresariales.jpeg"
        />
    <Content
      description="Protege tu empresa y contratistas frente a los daños que sucedan de manera súbita, accidental e imprevista y afecten sus proyectos."
      finalmessage="No dejes tu empresa expuesta a lo inesperado. Asegura tu negocio hoy y enfócate en hacerlo crecer con confianza."
      />
    </Fragment>
  )
}

export default ConstruccionPage;