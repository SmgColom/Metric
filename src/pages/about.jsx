import { Fragment } from 'react';
import Head from 'next/head';
import HeroHome from '@/components/layout/HeroSection/HeroHome';

function AboutPage() {
  return (
    <Fragment>
      <Head>
        <title>Metric Solutions | Quiénes Somos</title>
        <meta 
          name="description"
          content="Metric Solutions es una empresa especializada en cronometraje deportivo, con tecnología RFID y experiencia en eventos a nivel nacional."
        />
      </Head>

      <HeroHome
        title="Metrics Solutions"
        description="Somos especialistas en cronometraje de competencias multideportivas. Combinamos precisión, experiencia y estrategia para organizadores que buscan resultados confiables y una experiencia de primer nivel para sus participantes. En 2025 acompañamos eventos como la Carrera Fuerza Rosa (Cúcuta), la Carrera Corazón Quindío (Montenegro) y múltiples carreras de clubes de running en todo el país.

        Nuestra tecnología reconocida internacionalmente, procesa grandes volúmenes de corredores con estabilidad y seguridad. Además del cronometraje oficial, ofrecemos visualización en línea de resultados, seguimiento intermedio y soporte integral durante todo el evento."
        images={[
          
          { src: "/Logo.png", alt: "Logo de Metrics Solutions" }
          
        ]}
        
      >
        
      </HeroHome>
    </Fragment
    
    >
  );
}

export default AboutPage;

