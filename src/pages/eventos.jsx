import Head from "next/head";
import Eventos from "@/components/eventos/Eventos";

export default function EventosPage() {
  return (
    <>
      <Head>
        <title>Servicios de Cronometraje Deportivo | Metrics Solutions</title>
        <meta
          name="description"
          content="Servicios profesionales de cronometraje deportivo con tecnología RFID, resultados en tiempo real y soporte técnico para eventos."
        />
      </Head>

      <Eventos />
    </>
  );
}

