import { Fragment } from 'react';
import Head from 'next/head';
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import Content from '@/components/layout/HeroSection/Content';



function HogarPage() {
  return (
    <Fragment>
       <Head>
        <title>SegurosMileToro|Hogar</title>
        <meta 
          name='Seguros de Hogar asesora Mile Toro'
          description='Descripción de la oferta del seguro de Hogar con el respaldo de Sura y la asesora Mile Toro'
          />
          </Head>
      <HeroSection 
      title="Hogar"
      description="Tu hogar, siempre protegido"
      bgImage="/backgrounds/hogar.jpeg"
        />
    <Content
      description="Tu casa es más que un lugar: es donde construyes recuerdos, compartes momentos y te sientes seguro. Con nuestra póliza de seguro para el hogar, cuidas lo que más valoras frente a imprevistos como incendios, robos, daños por agua y más."
      feature1="Cobertura para la estructura y el contenido del hogar"
      feature2="Protección ante desastres naturales, robos y accidentes domésticos"
      feature3="Asistencia domiciliaria 24/7 (plomería, cerrajería, electricidad, etc.)"
      feature4="Planes flexibles según el tipo de vivienda y tus necesidades"
      finalmessage="No esperes a que algo pase para actuar. Asegura tu hogar hoy y vive con la tranquilidad de estar respaldado."
      />
    </Fragment>
  )
}

export default HogarPage;