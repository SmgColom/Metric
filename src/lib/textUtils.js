// src/lib/textUtils.js
export function fixText(input) {
  if (input === null || input === undefined) return input;
  if (typeof input !== "string") return input;

  const s = input.trim();
  if (!s) return s;

  const looksBroken = /Ã.|Â./.test(s);
  let out = s;

  if (looksBroken) {
    try {
      out = Buffer.from(s, "latin1").toString("utf8");
    } catch {
      out = s;
    }
  }

  return out.replace(/;/g, " ").replace(/\s+/g, " ").trim();
}

export function formatPace(pace) {
  if (pace === null || pace === undefined) return "-";
  const s = String(pace).trim();
  if (!s) return "-";
  if (/min\/km/i.test(s)) return s;
  return `${s} min/km`;
}

