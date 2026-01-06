import { Fragment } from 'react';
import Head from 'next/head';
import HeroHome from '@/components/layout/HeroSection/HeroHome';

function HomePage() {
  return (
    <Fragment>
       <Head>
        <title>Metric Solutions | Home</title>
        <meta
          name="description"
          content="Soluciones de seguros personalizadas con el respaldo de Sura y la asesoría de Mile Toro."
        />
  <meta property="og:title" content="Seguros Mile Toro | Home" />
  <meta property="og:description" content="Encuentra soluciones de seguros a tu medida con el respaldo de Sura y el acompañamiento de Mile Toro." />
  <meta property="og:image" content="https://miletoroseguros.vercel.app/public/backgrounds/Logo.jpg" />
  <meta property="og:url" content="https://miletoroseguros.vercel.app/" />
  <meta property="og:type" content="website" />

  {/* Meta adicional para Twitter (opcional, pero recomendado) */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Seguros Mile Toro | Home" />
  <meta name="twitter:description" content="Soluciones de seguros a tu medida con el respaldo de Sura y el acompañamiento de Mile Toro." />
  <meta name="twitter:image" content="https://miletoroseguros.vercel.app/public/backgrounds/Logo.png" />
          </Head>
<HeroHome 
  title="Te acompañamos en la medición de tiempos de tu evento deportivo"
  description="Cronometraje con chips RFID, resultados en tiempo real, rankings automáticos y publicación inmediata de tiempos oficiales con experiencia, responsabilidad y tecnología de punta !"
  images={[
    { src: "/Carreras1.jpeg", alt: "Imagen metas en carreras" },
    { src: "/Carreras2.png", alt: "Imagen panorámica corredores" },
    { src: "/Carreras3.jpeg", alt: "Imagen panorámica corredores" },
    { src: "/Carreras4.jpeg", alt: "Imagen corredores celebrando en la meta" },
    { src: "/Carreras5.png", alt: "Imagen entrevista corredores" },
  ]}
/>
    </Fragment>
  )
}

export default HomePage;