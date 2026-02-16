// src/pages/api/feibot/[publicKey].js
import { fetchFeibotRace } from "@/lib/feibot";

// ===== Helpers =====
function toInt(v, fallback) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}

function toBool(v, fallback) {
  if (v === undefined || v === null) return fallback;
  const s = String(v).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(s)) return true;
  if (["0", "false", "no", "n", "off"].includes(s)) return false;
  return fallback;
}

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
  // prioriza neto (chip) y si no existe usa total (gun)
  return r?.net_score ?? r?.total_score ?? "";
}

function isFinisher(r) {
  // tu regla: finisher === 1 => finalizó
  return Number(r?.finisher) === 1;
}

function buildTopByCategory(scores, { limit = 3, onlyFinishers = true } = {}) {
  const list = Array.isArray(scores) ? scores : [];

  // 1) filtrar
  const filtered = onlyFinishers ? list.filter(isFinisher) : list;

  // 2) agrupar por categoría (id si existe, si no por nombre)
  const groups = new Map();
  for (const r of filtered) {
    const itemId = r?.item_id ?? "";
    const itemName = r?.item_name ?? r?.item ?? r?.category ?? "Categoría";
    const key = String(itemId || itemName);

    if (!groups.has(key)) {
      groups.set(key, {
        item_id: itemId ?? null,
        item_name: itemName,
        top: [],
      });
    }
    groups.get(key).top.push(r);
  }

  // 3) ordenar cada grupo por tiempo neto
  const out = [];
  for (const g of groups.values()) {
    const sorted = g.top
      .slice()
      .sort((a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b)));

    out.push({
      item_id: g.item_id,
      item_name: g.item_name,
      top: sorted.slice(0, Math.max(1, limit)),
    });
  }

  // 4) ordenar categorías por “mejor tiempo ganador” (opcional pero queda bonito)
  out.sort((a, b) => {
    const ta = timeToSeconds(getTimeValue(a?.top?.[0]));
    const tb = timeToSeconds(getTimeValue(b?.top?.[0]));
    return ta - tb;
  });

  return out;
}

export default async function handler(req, res) {
  const { publicKey } = req.query;

  if (!publicKey || typeof publicKey !== "string") {
    return res.status(400).json({ error: "Missing publicKey" });
  }

  // Params opcionales
  const limit = toInt(req.query.limit, 3); // por defecto 3 por categoría
  const onlyFinishers = toBool(req.query.onlyFinishers, true);
  const mode = String(req.query.mode ?? "topByCategory");

  try {
    const raw = await fetchFeibotRace(publicKey);

    // Cache CDN (Vercel)
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=300");

    const scores = Array.isArray(raw?.scores) ? raw.scores : [];

    // ✅ Computed: Top N por categoría (finalizados)
    let resultsPreviewByCategory = [];
    if (mode === "topByCategory") {
      resultsPreviewByCategory = buildTopByCategory(scores, { limit, onlyFinishers });
    }

    // ✅ Flat (compatibilidad): mezcla de todos los tops
    const resultsPreview = resultsPreviewByCategory.flatMap((g) =>
      (g.top || []).map((r, idx) => ({
        ...r,
        preview_rank_in_category: idx + 1,
        preview_item_name: g.item_name,
      }))
    );

    // Devuelve raw + computed (sin romper el contrato original)
    return res.status(200).json({
      ...raw,
      resultsPreviewByCategory,
      resultsPreview,
      _previewMeta: { mode, limit, onlyFinishers },
    });
  } catch (error) {
    console.error("Feibot API error:", error);
    return res.status(500).json({
      error: "Failed to fetch Feibot data",
      message: error?.message ?? String(error),
    });
  }
}


