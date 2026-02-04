// src/lib/normalizeFeibot.js

// Corrige textos que vienen en UTF-8 pero fueron interpretados como latin1 (mojibake),
// y limpia separadores típicos (;) que aparecen en algunos nombres.
function fixText(input) {
  if (input === null || input === undefined) return input;
  if (typeof input !== "string") return input;

  const s = input.trim();
  if (!s) return s;

  // Detecta mojibake típico: Ã¡ Ã± Ã© Â etc.
  const looksBroken = /Ã.|Â./.test(s);

  let out = s;

  // ✅ Reinterpretación latin1 -> utf8 (funciona en Node SSR)
  // Si no está roto, no toca nada.
  if (looksBroken) {
    try {
      out = Buffer.from(s, "latin1").toString("utf8");
    } catch {
      out = s; // fallback seguro
    }
  }

  // Limpieza: reemplaza separadores raros de apellidos (p.ej. "Hoyos;Amaya")
  out = out
    .replace(/;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return out;
}

// Versión segura para números
function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeFeibot(payload) {
  const race = payload?.race ?? {};
  const scores = Array.isArray(payload?.scores) ? payload.scores : [];

  // ✅ Normaliza race
  const raceTitle = fixText(race?.title);

  const items = (Array.isArray(race?.items) ? race.items : []).map((it) => {
    const distanceM = toNumber(it?.distance, 0);
    return {
      id: it?.id,
      title: fixText(it?.title),
      distanceM,
      distanceKm: distanceM / 1000
    };
  });

  // ✅ Normaliza scores (por si algún módulo usa preview o stats)
  // Aquí limpiamos campos de texto comunes.
  const scoresNormalized = scores.map((r) => ({
    ...r,
    name: fixText(r?.name),
    city: fixText(r?.city),
    country: fixText(r?.country),
    team: fixText(r?.team),
    // si tienes más campos texto, agrégalos aquí:
    // email: fixText(r?.email), // normalmente no necesita, pero no hace daño
  }));

  return {
    race: {
      id: race?.id,
      title: raceTitle,
      dateTimeUnix: race?.date_time,
      items
    },
    stats: { totalRunners: scoresNormalized.length },

    // preview ampliable
    resultsPreview: scoresNormalized.slice(0, 20)
  };
}



