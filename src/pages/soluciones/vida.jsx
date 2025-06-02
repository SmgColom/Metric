import { Fragment } from 'react';
import Head from 'next/head';
import HeroSection from "@/components/layout/HeroSection/HeroSection";
import Content from '@/components/layout/HeroSection/Content';



function VidaPage() {
  return (
    <Fragment>
       <Head>
        <title>SegurosMileToro|Vida Individual</title>
        <meta 
          name='Seguros de Vida Individual asesora Mile Toro'
          description='Descripción de la oferta del seguro de vida individual con el respaldo de Sura y la asesora Mile Toro'
          />
          </Head>
      <HeroSection 
      title="Vida Individual"
      description="Protege el futuro de quienes más amas💙"
      bgImage="/backgrounds/vida.jpeg"
        />
    <Content
      description="La vida está llena de momentos valiosos, y aunque no podemos predecir el futuro, sí podemos prepararnos para él. Con nuestra póliza de seguro de vida, garantizas tranquilidad y respaldo económico para tus seres queridos cuando más lo necesiten."
      feature1="Apoyo financiero para tu familia en caso de fallecimiento"
      feature2="Cobertura flexible y adaptada a tus necesidades"
      feature3="Opciones de ahorro e inversión a largo plazo"
      feature4="Trámite fácil, rápido y sin complicaciones"
      finalmessage="Haz que tu legado sea seguridad y amor. Asegura tu vida hoy y vive con la tranquilidad de saber que estás cuidando a los tuyos."
      />
    </Fragment>
  )
}

export default VidaPage;