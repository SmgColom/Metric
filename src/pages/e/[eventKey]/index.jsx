// src/pages/e/[eventKey]/index.jsx
import EventShell from "@/components/event/EventShell";
import ModulesRenderer from "@/components/event/ModulesRenderer";

import { loadEventConfig } from "@/lib/loadEventConfig";
import { normalizeFeibot } from "@/lib/normalizeFeibot";

// ===== Helpers (SSR) =====
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

function getTimeValue(r) {
  return r?.net_score ?? r?.total_score ?? "";
}

function isFinisher(r) {
  return Number(r?.finisher) === 1;
}

function getResultsPreviewLimit(config) {
  const mods = Array.isArray(config?.modules) ? config.modules : [];
  const m = mods.find((x) => x?.type === "resultsPreview" && x?.enabled);
  const limit = Number(m?.limit);
  return Number.isFinite(limit) && limit > 0 ? limit : 3;
}

function buildTopByCategory(scores, limitPerCategory) {
  const finishers = scores.filter(isFinisher);

  // agrupar por item_id (ideal). fallback item_name.
  const groups = new Map();

  for (const r of finishers) {
    const itemId = r?.item_id ?? "";
    const itemName = r?.item_name ?? "Categoría";
    const key = String(itemId || itemName);

    if (!groups.has(key)) {
      groups.set(key, {
        item_id: itemId || null,
        item_name: itemName,
        top: [],
      });
    }
    groups.get(key).top.push(r);
  }

  const out = [];
  for (const g of groups.values()) {
    const sorted = g.top
      .slice()
      .sort((a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b)));

    out.push({
      item_id: g.item_id,
      item_name: g.item_name,
      top: sorted.slice(0, limitPerCategory).map((r, idx) => ({
        id: r?.id ?? `${g.item_id ?? g.item_name}-${r?.bib ?? idx}`,
        name: r?.name ?? "",
        bib: r?.bib ?? "",
        item_id: r?.item_id ?? null,
        item_name: r?.item_name ?? g.item_name ?? "",
        net_score: r?.net_score ?? "",
        total_score: r?.total_score ?? "",
        finisher: r?.finisher ?? null,
        rank_in_category: idx + 1, // 👈 útil para mostrar #1/#2/#3
      })),
    });
  }

  // ordenar categorías por el tiempo del ganador (opcional, pero queda “pro”)
  out.sort((a, b) => {
    const ta = timeToSeconds(getTimeValue(a?.top?.[0]));
    const tb = timeToSeconds(getTimeValue(b?.top?.[0]));
    return ta - tb;
  });

  return out;
}

export async function getServerSideProps({ params }) {
  const { eventKey } = params;

  try {
    const config = loadEventConfig(eventKey);
    if (!config?.feibot?.publicKey) return { notFound: true };

    const raw = await fetchFeibotRace(config.feibot.publicKey);


    // reduce payload
    const data = normalizeFeibot(raw);

    const scores = Array.isArray(raw?.scores) ? raw.scores : [];
    const items = data?.race?.items ?? [];

    // ✅ limit por categoría desde el JSON del evento
    const limitPerCategory = getResultsPreviewLimit(config);

    // ✅ TOP 3 por categoría (solo finishers)
    const resultsPreviewByCategory = buildTopByCategory(scores, limitPerCategory);

    // (opcional) flat para compatibilidad
    const resultsPreview = resultsPreviewByCategory.flatMap((g) => g.top);

    // (mantengo tu top10 global por tiempo neto)
    const top10 = scores
      .filter(isFinisher) // 👈 si quieres incluir DNFs quita esta línea
      .slice()
      .sort((a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b)))
      .slice(0, 10)
      .map((r) => ({
        id: r?.id ?? null,
        name: r?.name ?? "",
        bib: r?.bib ?? "",
        item_id: r?.item_id ?? null,
        item_name: r?.item_name ?? "",
        net_score: r?.net_score ?? "",
        total_score: r?.total_score ?? "",
      }));

    const summary = {
      totalResults: scores.length,
      totalFinishers: scores.filter(isFinisher).length,
      itemsCount: items.length,
      limitPerCategory,
      resultsPreviewByCategory,
      resultsPreview, // plano, por si tu módulo aún lo usa
      top10,
    };

    return {
      props: { config, data, summary },
    };
  } catch (error) {
    return {
      props: {
        error: error?.message ?? "Error cargando evento",
        config: null,
        data: null,
        summary: null,
      },
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

  // ✅ Data enriquecida
  const enrichedData = { ...data, summary };

  return (
    <EventShell config={config} data={enrichedData}>
      <ModulesRenderer config={config} data={enrichedData} />
    </EventShell>
  );
}






