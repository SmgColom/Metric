// src/lib/feibot.js

/**
 * Detecta qué decodificación produce menos "basura"
 */
function scoreDecodedText(str) {
  if (!str) return Number.POSITIVE_INFINITY;

  const replacement = (str.match(/\uFFFD/g) || []).length; // �
  const mojibake = (str.match(/Ã.|Â./g) || []).length;     // Ã¡ Ã± Â¿
  const semicolons = (str.match(/;/g) || []).length;      // separadores raros

  return replacement * 10 + mojibake * 3 + semicolons;
}

/**
 * Prueba UTF-8 vs ISO-8859-1 y se queda con la mejor
 */
function decodeSmart(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);

  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const latin1 = new TextDecoder("iso-8859-1", { fatal: false }).decode(bytes);

  return scoreDecodedText(latin1) < scoreDecodedText(utf8)
    ? latin1
    : utf8;
}

/**
 * Limpieza profunda de strings (nombres, ciudades, etc.)
 */
function cleanStringsDeep(value) {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") {
    return value
      // carácter inválido Unicode (ya perdido)
      .replace(/\uFFFD/g, " ")

      // mojibake común que aún se escape
      .replace(/Ã¡/g, "á")
      .replace(/Ã©/g, "é")
      .replace(/Ã­/g, "í")
      .replace(/Ã³/g, "ó")
      .replace(/Ãº/g, "ú")
      .replace(/ÃÁ/g, "Á")
      .replace(/Ã‰/g, "É")
      .replace(/ÃÍ/g, "Í")
      .replace(/Ã“/g, "Ó")
      .replace(/Ãš/g, "Ú")
      .replace(/Ã±/g, "ñ")
      .replace(/Ã‘/g, "Ñ")

      // separadores sucios de Feibot
      .replace(/[;|]/g, " ")

      // espacios duplicados
      .replace(/\s+/g, " ")
      .trim();
  }

  if (Array.isArray(value)) {
    return value.map(cleanStringsDeep);
  }

  if (typeof value === "object") {
    const out = {};
    for (const k of Object.keys(value)) {
      out[k] = cleanStringsDeep(value[k]);
    }
    return out;
  }

  return value;
}


/**
 * ✅ FUNCIÓN FINAL CORREGIDA
 */
export async function fetchFeibotRace(publicKey) {
  if (!publicKey) {
    throw new Error("Feibot: falta publicKey");
  }

  // ✅ URL REAL Y CORRECTA
  const url = `https://time.feibot.com/api/scores-data/${encodeURIComponent(
    publicKey
  )}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json,text/plain,*/*",
    },
  });

  // Leemos bytes (NO res.json)
  const buffer = await res.arrayBuffer();
  const decodedText = decodeSmart(buffer);

  // Detectar HTML (404, bloqueo, etc.)
  const looksLikeHtml =
    /^\s*</.test(decodedText) &&
    (decodedText.toLowerCase().includes("<html") ||
      decodedText.toLowerCase().includes("<!doctype"));

  if (!res.ok || looksLikeHtml) {
    throw new Error(
      `Feibot error ${res.status}: respuesta no válida (HTML en vez de JSON)`
    );
  }

  let json;
  try {
    json = JSON.parse(decodedText);
  } catch (e) {
    throw new Error("Feibot: no se pudo parsear JSON (encoding incorrecto)");
  }

  // 🔥 AQUÍ SE ARREGLAN DEFINITIVAMENTE LOS NOMBRES
  return cleanStringsDeep(json);
}

