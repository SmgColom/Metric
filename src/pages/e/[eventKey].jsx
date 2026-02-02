// src/pages/e/[eventKey].jsx
import EventShell from "@/components/event/EventShell";
import ModulesRenderer from "@/components/event/ModulesRenderer";

import { loadEventConfig } from "@/lib/loadEventConfig";
import { fetchFeibotRace } from "@/lib/feibot";
import { normalizeFeibot } from "@/lib/normalizeFeibot";

export async function getServerSideProps({ params }) {
  const { eventKey } = params;

  try {
    // 1) Cargar config (default + override)
    const config = loadEventConfig(eventKey);

    // 2) Validación mínima
    if (!config?.feibot?.publicKey) {
      return { notFound: true };
    }

    // 3) Llamar API pública de Feibot
    const raw = await fetchFeibotRace(config.feibot.publicKey);

    // 4) Normalizar y reducir payload (clave para que no pese 2MB+)
    const data = normalizeFeibot(raw);

    return {
      props: {
        config,
        data
      }
    };
  } catch (error) {
    return {
      props: {
        error: error?.message ?? "Error cargando evento",
        config: null,
        data: null
      }
    };
  }
}

export default function EventPage({ config, data, error }) {
  if (error || !config) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Evento no disponible</h1>
        <p>{error ?? "No se pudo cargar la configuración del evento."}</p>
      </div>
    );
  }

  return (
    <EventShell config={config} data={data}>
      <ModulesRenderer config={config} data={data} />
    </EventShell>
  );
}




