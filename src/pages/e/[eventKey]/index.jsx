// src/pages/e/[eventKey]/index.jsx
import EventShell from "@/components/event/EventShell";
import ModulesRenderer from "@/components/event/ModulesRenderer";

import { loadEventConfig } from "@/lib/loadEventConfig";
import { fetchFeibotRace } from "@/lib/feibot";
import { normalizeFeibot } from "@/lib/normalizeFeibot";

// Helpers (solo server-side)
function timeToSeconds(t) {
  if (!t) return Number.POSITIVE_INFINITY;
  const s = String(t).trim();
  const parts = s.split(":").map((x) => Number(x));
  if (parts.some((n) => !Number.isFinite(n))) return Number.POSITIVE_INFINITY;

  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return Number.POSITIVE_INFINITY;
}

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

    // 5) Summary liviano para usar en módulos (ranking, totals, etc.)
    const scores = raw?.scores ?? [];
    const items = data?.race?.items ?? [];

    const top10 = [...scores]
      .sort((a, b) => {
        const ta = a?.net_score ?? a?.total_score ?? "";
        const tb = b?.net_score ?? b?.total_score ?? "";
        return timeToSeconds(ta) - timeToSeconds(tb);
      })
      .slice(0, 10)
      .map((r) => ({
        id: r?.id ?? null,
        name: r?.name ?? "",
        bib: r?.bib ?? "",
        item_id: r?.item_id ?? null,
        item_name: r?.item_name ?? "",
        net_score: r?.net_score ?? "",
        total_score: r?.total_score ?? ""
      }));

    const summary = {
      totalResults: scores.length,
      itemsCount: items.length,
      top10
    };

    return {
      props: {
        config,
        data,
        summary
      }
    };
  } catch (error) {
    return {
      props: {
        error: error?.message ?? "Error cargando evento",
        config: null,
        data: null,
        summary: null
      }
    };
  }
}

export default function EventPage({ config, data, summary, error }) {
  if (error || !config) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Evento no disponible</h1>
        <p>{error ?? "No se pudo cargar la configuración del evento."}</p>
      </div>
    );
  }

  
  const enrichedData = { ...data, summary };

  return (
    <EventShell config={config} data={enrichedData}>
      <ModulesRenderer config={config} data={enrichedData} />
    </EventShell>
  );
}





