import { Fragment } from 'react';
import Head from 'next/head';
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import Content from '@/components/layout/HeroSection/Content';



function MovilidadPage() {
  return (
    <Fragment>
       <Head>
        <title>SegurosMileToro|Movilidad</title>
        <meta 
          name='Seguros de Movilidad asesora Mile Toro'
          description='Descripción de la oferta del seguro de Movilidad con el respaldo de Sura y la asesora Mile Toro'
          />
          </Head>
      <HeroSection 
      title="Movilidad"
      description="Conduce tranquilo, nosotros te respaldamos"
      bgImage="/backgrounds/movilidad.jpeg"
        />
    <Content
      description="Tu vehículo es más que un medio de transporte: es parte de tu día a día. Con nuestra póliza de seguro para autos, estarás protegido ante cualquier imprevisto en la vía."
      feature1="Cobertura contra accidentes, robos y daños a terceros"
      feature2="Asistencia 24/7 en carretera"
      feature3="Red de talleres aliados y servicio ágil de atención"
      feature4="Planes personalizados según tu tipo de vehículo y uso"
      finalmessage="No dejes tu seguridad al azar. Asegura tu auto hoy y maneja con la confianza de estar en buenas manos."
      />
    </Fragment>
  )
}

export default MovilidadPage;