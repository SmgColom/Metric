import fs from "fs";
import path from "path";

const CONFIG_DIR = path.join(process.cwd(), "event-configs");

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (e) {
    return null;
  }
}

function deepMerge(base, override) {
  if (!override) return base;
  const out = { ...base };

  for (const key of Object.keys(override)) {
    const ov = override[key];
    const bv = base?.[key];

    const isPlainObject =
      ov && typeof ov === "object" && !Array.isArray(ov);

    if (Array.isArray(ov)) {
      // arrays: override completo (modules, nav, etc.)
      out[key] = ov;
    } else if (isPlainObject) {
      out[key] = deepMerge(bv || {}, ov);
    } else {
      out[key] = ov;
    }
  }

  return out;
}

export function loadEventConfig(eventKey) {
  const defaultPath = path.join(CONFIG_DIR, "default.json");
  const base = readJsonSafe(defaultPath);

  if (!base) {
    throw new Error(`Falta default.json en ${CONFIG_DIR}`);
  }

  const eventPath = path.join(CONFIG_DIR, `${eventKey}.json`);
  const override = fs.existsSync(eventPath) ? readJsonSafe(eventPath) : null;

  const merged = deepMerge(base, override);

  // garantías mínimas
  merged.eventKey = String(eventKey);
  merged.lang = merged.lang || "es";

  // Si no viene feibotRaceId, intentamos usar eventKey como id numérico
  if (!merged.feibotRaceId) {
    const maybeId = Number(eventKey);
    if (!Number.isNaN(maybeId)) merged.feibotRaceId = maybeId;
  }

  return merged;
}
