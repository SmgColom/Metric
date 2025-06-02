import { Fragment } from 'react';
import Head from 'next/head';
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import Content from '@/components/layout/HeroSection/Content';



function ResponsabilidadPage() {
  return (
    <Fragment>
       <Head>
        <title>SegurosMileToro|Responsabilidad Civil</title>
        <meta 
          name='Seguro de Responsabilidad Civil asesora Mile Toro'
          description='Descripción de la oferta del seguro de Responsabilidad Civil con el respaldo de Sura y la asesora Mile Toro'
          />
          </Head>
      <HeroSection 
      title="Responsabilidad Civil"
      description="Protege tu empresa, impulsa tu tranquilidad"
      bgImage="/backgrounds/empresariales.jpeg"
        />
    <Content
      description="Cuida el patrimonio de las personas y empresas ante los daños y perjuicios a otras personas o empresas y su patrimonio."
      finalmessage="No dejes tu empresa expuesta a lo inesperado. Asegura tu negocio hoy y enfócate en hacerlo crecer con confianza."
      />
    </Fragment>
  )
}

export default ResponsabilidadPage;