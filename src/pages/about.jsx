import { Fragment } from 'react';
import Head from 'next/head';
import HeroHome from '@/components/layout/HeroSection/HeroHome';
import Content from '@/components/layout/HeroSection/Content';

import {
  AiOutlineSetting,
  AiOutlineTool,
  AiOutlineClockCircle,
  AiOutlineFileDone
} from "react-icons/ai";

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
        description="Somos expertos en eventos deportivos. En 2025 acompañamos la Carrera Fuerza Rosa (Cúcuta), la Carrera Corazón Quindío (Montenegro) y permanentemente carreras de clubes de Running. Nuestros equipos cuentan con el respaldo de Feibot, tecnología de punta que soporta eventos en todo el mundo. Te acompañamos en todo el territorio nacional con nuestro servicio que incluye:"
        images={[
          { src: "/Logo.png", alt: "Logo de Metrics Solutions" }
        ]}
      >
        <Content
          features={[
            {
              label: "Planeación Técnica",
              icon: <AiOutlineSetting />
            },
            {
              label: "Instalación y Pruebas",
              icon: <AiOutlineTool />
            },
            {
              label: "Cronometraje en vivo",
              icon: <AiOutlineClockCircle />
            },
            {
              label: "Publicación de resultados",
              icon: <AiOutlineFileDone />
            }
          ]}
        />
      </HeroHome>
    </Fragment>
  );
}

export default AboutPage;

