import { Fragment } from 'react';
import Head from 'next/head';
import HeroAbout from '@/components/layout/AboutSection/HeroAbout';

function AboutPage() {
  return (
    <Fragment>
       <Head>
        <title>SegurosMileToro | Quien Soy Yo</title>
        <meta 
          name='Seguros Mile Toro '
          description='Perfil profesional de la asesora Mile Toro'
          />
          </Head>
      <HeroAbout 
      title="Mile Toro, tu asesora de soluciones de seguros"
      description="Porque cuidar lo que más quieres no debería ser complicado.Soy asesora de seguros y estoy para acompañarte con empatía, claridad y el respaldo de la mano de la compañía que cumple cuando más lo necesitás.solo dime qué te preocupa, y construimos juntos la mejor solución. 💙"
       imageUrl="/Imagenperfil.jpeg"
      />
    </Fragment>
  )
}

export default AboutPage;