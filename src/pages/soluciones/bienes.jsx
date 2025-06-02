import { Fragment } from 'react';
import Head from 'next/head';
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import Content from '@/components/layout/HeroSection/Content';



function BienesPage() {
  return (
    <Fragment>
       <Head>
        <title>SegurosMileToro|Bienes Y Patrimonio</title>
        <meta 
          name='Seguros de Bienes y Patrimonio asesora Mile Toro'
          description='Descripción de la oferta de los seguros de Bienes y Patrimonio con el respaldo de Sura y la asesora Mile Toro'
          />
          </Head>
      <HeroSection 
      title="Bienes y Patrimonio"
      description="Protege tu empresa, impulsa tu tranquilidad"
      bgImage="/backgrounds/empresariales.jpeg"
        />
    <Content
      description="Cubre los costos de reparación o reemplazo de los bienes en caso de afectaciones causadas por situaciones accidentales, súbitas e imprevistas."
      finalmessage="No dejes tu empresa expuesta a lo inesperado. Asegura tu negocio hoy y enfócate en hacerlo crecer con confianza."
      />
    </Fragment>
  )
}

export default BienesPage;