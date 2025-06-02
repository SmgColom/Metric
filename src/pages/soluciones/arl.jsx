import { Fragment } from 'react';
import Head from 'next/head';
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import Content from '@/components/layout/HeroSection/Content';



function ArlPage() {
  return (
    <Fragment>
       <Head>
        <title>SegurosMileToro|ARL</title>
        <meta 
          name='Seguros de ARL asesora Mile Toro'
          description='Descripción de la oferta del seguro ARL con el respaldo de Sura y la asesora Mile Toro'
          />
          </Head>
      <HeroSection 
      title="ARL Sura"
      description="Protege a tu equipo, fortalece tu empresa"
      bgImage="/backgrounds/empresariales.jpeg"
        />
    <Content
      description="En SURA, entendemos que el capital humano es el activo más valioso de tu organización. Nuestra Administradora de Riesgos Laborales (ARL) está diseñada para prevenir, atender y proteger a tus colaboradores frente a accidentes de trabajo y enfermedades laborales."
      feature1="Cobertura integral en salud ocupacional"
      feature2="Acompañamiento en prevención y gestión del riesgo"
      feature3="Atención médica especializada y oportuna"
      feature4="Asesoría en seguridad y salud en el trabajo (SST)"
      feature5="Afiliación fácil y 100% en línea"
      finalmessage="Con ARL SURA, tu empresa cumple con la normativa legal y, lo más importante, cuida el bienestar de quienes la hacen posible."
      />
    </Fragment>
  )
}

export default ArlPage;