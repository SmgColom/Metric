// src/lib/loadEventConfig.js
import fs from "fs";
import path from "path";

function readJsonSafe(absPath) {
  if (!fs.existsSync(absPath)) return null;
  try {
    const raw = fs.readFileSync(absPath, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Config inválido: ${absPath} (${e.message})`);
  }
}

function deepMerge(base, override) {
  if (!override) return base;
  const out = { ...base };
  for (const k of Object.keys(override)) {
    const bv = base?.[k];
    const ov = override?.[k];

    if (Array.isArray(ov)) out[k] = ov; // arrays override total
    else if (ov && typeof ov === "object" && !Array.isArray(ov)) out[k] = deepMerge(bv ?? {}, ov);
    else out[k] = ov;
  }
  return out;
}

function normalizeNav(nav, eventKey) {
  if (!Array.isArray(nav)) return nav;

  // Permite usar "./results" y lo convertimos a "/e/2728/results"
  return nav.map((item) => {
    const href = item?.href ?? "";
    if (href.startsWith("./")) {
      const tail = href.slice(2); // "" | "results" | "runner/..."
      const abs = tail ? `/e/${eventKey}/${tail}` : `/e/${eventKey}`;
      return { ...item, href: abs };
    }
    return item;
  });
}

export function loadEventConfig(eventKey) {
  const cwd = process.cwd();

  // ✅ carpeta en la raíz
  const eventsDir = path.join(cwd, "event-configs");

  const defaultPath = path.join(eventsDir, "default.json");
  const eventPath = path.join(eventsDir, `${eventKey}.json`);

  const base = readJsonSafe(defaultPath) ?? {};
  const override = readJsonSafe(eventPath);

  if (!override) {
    // No lo encontramos -> hará que tu SSR devuelva notFound
    return null;
  }

  const merged = deepMerge(base, override);

  merged.eventKey = merged.eventKey ?? String(eventKey);
  merged.nav = normalizeNav(merged.nav, merged.eventKey);

  return merged;
}



