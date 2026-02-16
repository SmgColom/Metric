// src/pages/e/[eventKey]/index.jsx
import EventShell from "@/components/event/EventShell";
import ModulesRenderer from "@/components/event/ModulesRenderer";

import { toInt } from "@/lib/number";
import { loadEventConfig } from "@/lib/loadEventConfig";
import { normalizeFeibot } from "@/lib/normalizeFeibot";
import { fetchFeibotRace } from "@/lib/feibot";

// ✅ NUEVO: helpers compartidos (crea este archivo: src/lib/textUtils.js)
import { fixText, formatPace } from "@/lib/textUtils";

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
      item_name: fixText(g.item_name),
      top: sorted.slice(0, limitPerCategory).map((r, idx) => ({
        id: r?.id ?? `${g.item_id ?? g.item_name}-${r?.bib ?? idx}`,
        name: fixText(r?.name ?? ""),
        bib: r?.bib ?? "",
        item_id: r?.item_id ?? null,
        item_name: fixText(r?.item_name ?? g.item_name ?? ""),
        net_score: r?.net_score ?? "",
        total_score: r?.total_score ?? "",
        finisher: r?.finisher ?? null,
        rank_in_category: idx + 1,
        paceDisplay: formatPace(r?.pace),
      })),
    });
  }

  out.sort((a, b) => {
    const ta = timeToSeconds(getTimeValue(a?.top?.[0]));
    const tb = timeToSeconds(getTimeValue(b?.top?.[0]));
    return ta - tb;
  });

  return out;
}

export async function getServerSideProps({ params, query, res }) {
  const { eventKey } = params;

  try {
    const config = loadEventConfig(eventKey);
    if (!config?.feibot?.publicKey) return { notFound: true };

    // Cache CDN en Vercel (ajusta si live cambia mucho)
    res?.setHeader?.("Cache-Control", "s-maxage=15, stale-while-revalidate=120");

    const page = Math.max(1, toInt(query.page, 1));
    const pageSize = Math.min(100, Math.max(10, toInt(query.pageSize, 25)));
    const q = (query.q ?? "").toString().trim();
    const itemId = query.itemId ? toInt(query.itemId, null) : null;

    const raw = await fetchFeibotRace(config.feibot.publicKey);

    // ✅ base info del evento (pero SIN scores gigantes)
    const baseFull = normalizeFeibot(raw);

    const { scores: _scoresOmit, ...base } = baseFull ?? {};
    if (base?.race?.scores) delete base.race.scores;

    // scores crudos (NO los mandes completos al cliente)
    const allScoresRaw = Array.isArray(raw?.scores) ? raw.scores : [];

    // ===== Split meta (muestra pequeña) =====
    const sample = allScoresRaw.slice(0, 300);

    const sampleHasLaps = sample.some((r) => {
      return (
        (Array.isArray(r?.loop_a_format) && r.loop_a_format.length) ||
        (Array.isArray(r?.loop_b_format) && r.loop_b_format.length) ||
        (Array.isArray(r?.loop_c_format) && r.loop_c_format.length)
      );
    });

    const sampleHasCps = sample.some((r) => {
      for (let i = 1; i <= 9; i++) {
        const v = r?.[`cp${i}`];
        if (typeof v === "string" && v.trim()) return true;
      }
      return false;
    });

    const splitMeta = sampleHasLaps
      ? { enabled: true, mode: "laps", header: "Vueltas" }
      : sampleHasCps
      ? { enabled: true, mode: "checkpoints", header: "Checkpoints" }
      : { enabled: false, mode: null, header: null };

    // ===== Filtros base =====
    let filtered = allScoresRaw;

    if (itemId) {
      filtered = filtered.filter((r) => Number(r?.item_id) === Number(itemId));
    }

    filtered = [...filtered].sort((a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b)));

    if (q) {
      const qq = q.toLowerCase();
      filtered = filtered.filter((r) => {
        const name = fixText(r?.name ?? "").toString().toLowerCase();
        const bib = (r?.bib ?? "").toString().toLowerCase();
        const idCard = (r?.id_card ?? "").toString().toLowerCase();
        return name.includes(qq) || bib.includes(qq) || idCard.includes(qq);
      });
    }

    // ===== Paginación =====
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    // ===== Ranking por género (GLOBAL) =====
    const genderRankMap = new Map();
    const genderGroups = new Map();

    for (const r of allScoresRaw) {
      const sex = (r?.sex ?? "").toString().trim().toUpperCase();
      const bib = String(r?.bib ?? "");
      if (!sex || !bib) continue;
      if (!genderGroups.has(sex)) genderGroups.set(sex, []);
      genderGroups.get(sex).push(r);
    }

    for (const [sex, arr] of genderGroups.entries()) {
      const sorted = [...arr].sort((a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b)));
      sorted.forEach((r, idx) => {
        const bib = String(r?.bib ?? "");
        genderRankMap.set(`${sex}::${bib}`, idx + 1);
      });
    }

    // ===== Construir SOLO filas necesarias (payload liviano) =====
    const rowsSlim = pageRows.map((r) => {
      const bib = String(r?.bib ?? "");
      const sex = (r?.sex ?? "").toString().trim().toUpperCase();

      let splitLines = [];
      if (splitMeta.enabled) {
        if (splitMeta.mode === "laps") {
          const pick =
            (Array.isArray(r?.loop_a_format) && r.loop_a_format) ||
            (Array.isArray(r?.loop_b_format) && r.loop_b_format) ||
            (Array.isArray(r?.loop_c_format) && r.loop_c_format) ||
            null;

          if (Array.isArray(pick) && pick.length) {
            splitLines = pick
              .map((l, idx) => {
                const n = l?.lap_number ?? idx + 1;
                const t = typeof l?.lap_time === "string" ? l.lap_time : "";
                return n && t ? `Vuelta ${n}: ${t}` : null;
              })
              .filter(Boolean);
          }
        } else if (splitMeta.mode === "checkpoints") {
          const out = [];
          for (let i = 1; i <= 9; i++) {
            const v = r?.[`cp${i}`];
            if (typeof v === "string" && v.trim()) out.push(`CP${i}: ${v.trim()}`);
          }
          splitLines = out;
        }
      }

      return {
        id: r?.id ?? null,
        name: fixText(r?.name) ?? "-",
        bib,
        item_name: fixText(r?.item_name) ?? "-",

        net_score: r?.net_score ?? null,
        total_score: r?.total_score ?? null,

        overallRank: r?.net_ranking ?? null,
        categoryRank: r?.item_net_ranking ?? null,
        genderRank: sex ? genderRankMap.get(`${sex}::${bib}`) ?? null : null,
        sex,

        paceDisplay: formatPace(r?.pace),
        splitLines,
      };
    });

    // ===== Summary (útil para módulos tipo resultsPreview) =====
    const resultsPreviewLimit = getResultsPreviewLimit(config);
    const topByCategory = buildTopByCategory(allScoresRaw, resultsPreviewLimit);

    const summary = {
      resultsPreviewLimit,
      topByCategory,
      splitMeta,
    };

    const data = {
      ...base,
      results: rowsSlim,
      resultsMeta: {
        total,
        page: safePage,
        pageSize,
        totalPages,
        q,
        itemId,
        splitEnabled: splitMeta.enabled,
        splitHeader: splitMeta.header,
      },
    };

    return { props: { config, data, summary } };
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

  const enrichedData = { ...data, summary };

  return (
    <EventShell config={config} data={enrichedData}>
      <ModulesRenderer config={config} data={enrichedData} />
    </EventShell>
  );
}







