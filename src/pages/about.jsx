import { Fragment } from 'react';
import Head from 'next/head';
import HeroHome from '@/components/layout/HeroSection/HeroHome';

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
      <HeroHome 
      title="Mile Toro, tu asesora de soluciones en seguros"
      description="Porque cuidar lo que más quieres no debería ser complicado,estoy para acompañarte con empatía, claridad y de la mano de la compañía que cumple cuando más lo necesitas. Solo dime qué te preocupa, y construimos juntos la mejor solución. 💙"
       imageUrl="/Imagenperfil.jpeg"
      />
    </Fragment>
  )
}

export default AboutPage;