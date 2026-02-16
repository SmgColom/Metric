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
          content="Cronometraje de competencias multideportivas"
        />
  <meta property="og:title" content="Metric Solutions | Home" />
  <meta property="og:description" content="Cronometraje profesional con chips RFID, resultados en tiempo real, rankings automáticos y publicación inmediata de tiempos oficiales con precisión y tecnología de alto nivel" />
  <meta property="og:image" content="https://metric-omega.vercel.app//Logo.jpg" />
  <meta property="og:url" content="https://metric-omega.vercel.app/" />
  <meta property="og:type" content="website" />

  {/* Meta adicional para Twitter (opcional, pero recomendado) */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Metric Solutions | Home" />
  <meta name="twitter:description" content="https://metric-omega.vercel.app/" />
  <meta name="twitter:image" content="https://metric-omega.vercel.app/Logo.png" />
          </Head>
<HeroHome 
  title="Medición de tiempos para tu evento deportivo"
  description="Cronometraje profesional con chips RFID, resultados en tiempo real, rankings automáticos y publicación inmediata de tiempos oficiales con precisión y tecnología de alto nivel. Lectura inteligente por chip y validación en puntos de control para entregar resultados confiables, certificados digitales personalizados y una experiencia impecable para tu evento"
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