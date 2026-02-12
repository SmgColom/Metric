// src/components/certificates/CertificateClient.jsx
import Link from "next/link";
import { useMemo, useState, useCallback, useEffect } from "react";

import { feibotI18n, t as tFn } from "@/lib/i18n";

// ===== i18n helpers =====
const lang = "es";
function tKey(key) {
  try {
    return tFn(key, lang);
  } catch {
    return feibotI18n?.[lang]?.[key] ?? key;
  }
}

function safeStr(v) {
  if (v === undefined || v === null || v === "") return "-";
  return String(v);
}

function isScalar(v) {
  if (v === null || v === undefined) return false;
  const type = typeof v;
  return type === "string" || type === "number" || type === "boolean";
}

// Clamp para evitar tamaños locos
function clampNumber(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, x));
}

// ===== Labels overrides =====
function labelForKey(key, fallbackLabel) {
  const overrides = {
    sex_display: "Género",
    pace_display: "Ritmo",
    overall_rank_net: "Posición General",
    category_rank_net: "Posición Categoría",
    gender_rank_net: "Posición Género",
    total_finishers: "Total corredores",
    category_rank: "Posición Categoría",
    "race.items[].title": "Categoría",
  };

  if (overrides[key]) return overrides[key];
  return fallbackLabel ?? tKey(key);
}

// ===== Value resolver (runner + computed) =====
function formatPaceWithUnit(pace) {
  if (pace === null || pace === undefined) return "-";
  const s = String(pace).trim();
  if (!s) return "-";
  if (/min\/km/i.test(s)) return s;
  return `${s} min/km`;
}

function getValueForKey({ runner, computed, key, categoryRankFallback }) {
  if (key === "race.items[].title") return runner?.item_name ?? "-";
  if (key === "category_rank") return categoryRankFallback ?? null;

  if (key === "sex_display") {
    const s = computed?.sexDisplay ?? runner?.sex ?? runner?.gender ?? "";
    return s ? String(s).toUpperCase() : "-";
  }

  if (key === "pace_display") {
    const s = computed?.paceDisplay ?? runner?.pace ?? "";
    return formatPaceWithUnit(s);
  }

  if (key === "overall_rank_net") return computed?.overallRankNet ?? runner?.net_ranking ?? null;
  if (key === "category_rank_net") return computed?.categoryRankNet ?? runner?.item_net_ranking ?? null;
  if (key === "gender_rank_net") return computed?.genderRankNet ?? null;
  if (key === "total_finishers") return computed?.totalFinishers ?? null;

  return runner?.[key];
}

// ===== Canvas helpers (descarga PNG) =====
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // importante si el template fuera externo
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Wrap de texto para canvas:
 * - rompe por palabras
 * - si una palabra es muy larga, rompe por caracteres
 */
function wrapTextCanvas(ctx, text, x, y, maxWidth, lineHeight, maxLines = 6) {
  const str = String(text ?? "");
  if (!str) return { lines: 0, ended: true };

  const words = str.split(" ");
  const lines = [];
  let line = "";

  const pushLine = (l) => {
    if (lines.length < maxLines) lines.push(l);
  };

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const test = line ? `${line} ${w}` : w;

    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
      continue;
    }

    // si la línea actual tiene algo, la cerramos
    if (line) {
      pushLine(line);
      line = w;
      if (lines.length >= maxLines) break;
      continue;
    }

    // si la palabra sola no cabe, rompemos por caracteres
    let chunk = "";
    for (const ch of w) {
      const testChunk = chunk + ch;
      if (ctx.measureText(testChunk).width <= maxWidth) {
        chunk = testChunk;
      } else {
        pushLine(chunk);
        chunk = ch;
        if (lines.length >= maxLines) break;
      }
    }
    line = chunk;
    if (lines.length >= maxLines) break;
  }

  if (lines.length < maxLines && line) pushLine(line);

  // pintar
  lines.forEach((l, idx) => ctx.fillText(l, x, y + idx * lineHeight));

  return { lines: lines.length, ended: lines.length < maxLines };
}

async function exportCertificatePng({
  templateSrc,
  pageWidth,
  pageHeight,
  fields,
  enabledKeys,
  runner,
  computed,
  categoryRankFallback,
  fileName,
  scale = 2, // ✅ 2x para que quede nítido
}) {
  if (!templateSrc) throw new Error("No hay templateSrc para exportar.");
  const img = await loadImage(templateSrc);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(pageWidth * scale);
  canvas.height = Math.round(pageHeight * scale);

  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  // fondo
  ctx.drawImage(img, 0, 0, pageWidth, pageHeight);

  // default boxWidth: 70% del ancho
  const defaultBoxWidth = Math.round(pageWidth * 0.7);

  // pintar fields
  for (const f of fields) {
    if (!enabledKeys.has(f.key)) continue;

    const rawValue = getValueForKey({
      runner,
      computed,
      key: f.key,
      categoryRankFallback,
    });

    if (!isScalar(rawValue) || String(rawValue) === "") continue;

    const value = safeStr(rawValue);
    const label = labelForKey(f.key, f.label);
    const text = `${label}: ${value}`;

    const x = Number(f.x ?? 0);
    const y = Number(f.y ?? 0);

    const fontSize = clampNumber(f.fontSize, 8, 300, 40);
    const fontWeight = f.fontWeight ?? 700;
    const color = f.color ?? "#FFFFFF";

    // Wrap
    const boxWidth = clampNumber(f.boxWidth, 120, pageWidth, defaultBoxWidth);
    const lineHeightPx = clampNumber(
      // si lineHeight es "1.1" (ratio), lo convertimos; si es px (>= 8) también sirve
      Number(f.lineHeight) > 8 ? Number(f.lineHeight) : Math.round(fontSize * (Number(f.lineHeight ?? 1.15))),
      8,
      600,
      Math.round(fontSize * 1.15)
    );

    const maxLines = clampNumber(f.maxLines, 1, 20, 6);

    // fuente canvas (usa sans por defecto)
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    ctx.font = `${fontWeight} ${fontSize}px Arial`;

    wrapTextCanvas(ctx, text, x, y, boxWidth, lineHeightPx, maxLines);
  }

  // descargar
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 1));
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName || "certificado.png";
  a.click();

  URL.revokeObjectURL(url);
}

export default function CertificateClient({ config, data, runner, computed, categoryRank }) {
  const backHref = `/e/${config.eventKey}/runner/${encodeURIComponent(String(runner?.bib ?? ""))}`;

  // ===== Leer config =====
  const certCfg = config?.certificate ?? {};
  const template = certCfg?.template ?? {};
  const fieldsFromJson = Array.isArray(certCfg?.fields) ? certCfg.fields : [];

  // Defaults si el JSON no trae fields
  const defaultFields = useMemo(
    () => [
      { key: "name", label: "Nombre", x: 160, y: 680, fontSize: 36, fontWeight: 800, color: "#FFFFFF", boxWidth: 900, lineHeight: 1.15 },
      { key: "bib", label: "Dorsal", x: 160, y: 760, fontSize: 36, fontWeight: 700, color: "#FFFFFF", boxWidth: 900, lineHeight: 1.15 },
      { key: "race.items[].title", label: "Categoría", x: 160, y: 840, fontSize: 36, fontWeight: 700, color: "#FFFFFF", boxWidth: 900, lineHeight: 1.15 },
      { key: "net_score", label: "Tiempo neto", x: 160, y: 920, fontSize: 36, fontWeight: 700, color: "#FFFFFF", boxWidth: 900, lineHeight: 1.15 },

      { key: "overall_rank_net", label: "Posición General", x: 160, y: 1000, fontSize: 36, fontWeight: 700, color: "#FFFFFF", boxWidth: 900, lineHeight: 1.15 },
      { key: "sex_display", label: "Género", x: 160, y: 1080, fontSize: 36, fontWeight: 700, color: "#FFFFFF", boxWidth: 900, lineHeight: 1.15 },
      { key: "gender_rank_net", label: "Posición Género", x: 160, y: 1160, fontSize: 36, fontWeight: 700, color: "#FFFFFF", boxWidth: 900, lineHeight: 1.15 },
      { key: "category_rank_net", label: "Posición Categoría", x: 160, y: 1240, fontSize: 36, fontWeight: 700, color: "#FFFFFF", boxWidth: 900, lineHeight: 1.15 },
      { key: "pace_display", label: "Ritmo", x: 160, y: 1320, fontSize: 36, fontWeight: 700, color: "#FFFFFF", boxWidth: 900, lineHeight: 1.15 },
      { key: "total_finishers", label: "Total corredores", x: 160, y: 1400, fontSize: 36, fontWeight: 700, color: "#FFFFFF", boxWidth: 900, lineHeight: 1.15 },
    ],
    []
  );

  const fields = useMemo(
    () => (fieldsFromJson.length ? fieldsFromJson : defaultFields),
    [fieldsFromJson, defaultFields]
  );

  // URL absoluta
  const templateSrc = useMemo(() => {
    const src = template?.src;
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (typeof window === "undefined") return src;
    return `${window.location.origin}${src}`;
  }, [template?.src]);

  // tamaño natural
  const [naturalSize, setNaturalSize] = useState(() => ({
    w: clampNumber(template.width, 300, 4000, 1365),
    h: clampNumber(template.height, 300, 6000, 2048),
  }));

  useEffect(() => {
    if (!templateSrc) return;

    const img = new window.Image();
    img.onload = () => {
      const w = clampNumber(img.naturalWidth, 300, 4000, naturalSize.w);
      const h = clampNumber(img.naturalHeight, 300, 6000, naturalSize.h);
      setNaturalSize({ w, h });
    };
    img.onerror = () => {
      setNaturalSize((s) => ({
        w: clampNumber(s.w, 300, 4000, 1365),
        h: clampNumber(s.h, 300, 6000, 2048),
      }));
    };
    img.src = templateSrc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateSrc]);

  const pageWidth = naturalSize.w;
  const pageHeight = naturalSize.h;

  // enabled keys
  const initialKeys = useMemo(() => new Set(fields.map((f) => f.key)), [fields]);
  const [enabledKeys, setEnabledKeys] = useState(() => initialKeys);

  useEffect(() => {
    setEnabledKeys(new Set(fields.map((f) => f.key)));
  }, [fields]);

  const toggle = useCallback((k) => {
    setEnabledKeys((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }, []);

  // Zoom preview
  const [zoom, setZoom] = useState(0.4);

  // Preview texto
  const previewRows = useMemo(() => {
    return fields
      .filter((f) => enabledKeys.has(f.key))
      .map((f) => {
        const value = getValueForKey({
          runner,
          computed,
          key: f.key,
          categoryRankFallback: categoryRank,
        });
        return [labelForKey(f.key, f.label), value];
      })
      .filter(([, v]) => isScalar(v) && String(v) !== "");
  }, [fields, enabledKeys, runner, computed, categoryRank]);

  const missingTemplate = !template?.src;
  const missingFields = !fields.length;

  const scaledW = Math.round(pageWidth * zoom);
  const scaledH = Math.round(pageHeight * zoom);

  // wrap en preview HTML
  const defaultBoxWidthPreview = Math.round(pageWidth * 0.7);

  const pngFileName = `certificado_${config.eventKey}_bib_${safeStr(runner?.bib)}.png`;

  const [imgBusy, setImgBusy] = useState(false);
  const [imgError, setImgError] = useState("");

  const onDownloadImage = async () => {
    try {
      setImgError("");
      setImgBusy(true);

      await exportCertificatePng({
        templateSrc,
        pageWidth,
        pageHeight,
        fields,
        enabledKeys,
        runner,
        computed,
        categoryRankFallback: categoryRank,
        fileName: pngFileName,
        scale: 2, // ✅ calidad
      });
    } catch (e) {
      setImgError(e?.message ?? "Error generando imagen");
    } finally {
      setImgBusy(false);
    }
  };

  return (
    <section style={{ paddingTop: 10 }}>
      <Link href={backHref} style={{ display: "inline-block", padding: "8px 0" }}>
        ← Volver al corredor
      </Link>

      <h1 style={{ margin: "8px 0 10px" }}>Certificado</h1>

      {(missingTemplate || missingFields) && (
        <div style={{ padding: 12, border: "1px solid #f0c", borderRadius: 12, marginBottom: 14 }}>
          <strong>Config incompleta:</strong>
          <div style={{ marginTop: 6, opacity: 0.9 }}>
            {missingTemplate ? <div>- Falta certificate.template.src</div> : null}
            {missingFields ? <div>- Falta certificate.fields[]</div> : null}
          </div>
        </div>
      )}

      <p style={{ margin: "0 0 14px", opacity: 0.8 }}>
        Selecciona qué datos van en el certificado y luego descárgalo en imagen (PNG).
      </p>

      {/* selector */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {fields.map((f) => (
          <label
            key={f.key}
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid #eee",
              cursor: "pointer",
            }}
          >
            <input type="checkbox" checked={enabledKeys.has(f.key)} onChange={() => toggle(f.key)} />
            <span style={{ fontWeight: 700 }}>{labelForKey(f.key, f.label)}</span>
          </label>
        ))}
      </div>

      {/* PREVIEW VISUAL */}
      <div style={{ border: "1px solid #eee", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
        <div
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid #eee",
            fontWeight: 800,
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "center",
          }}
        >
          <span>Preview (visual)</span>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, opacity: 0.8 }}>Zoom</span>
            <input
              type="range"
              min="0.2"
              max="0.8"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
            <span style={{ fontSize: 13, opacity: 0.8 }}>{Math.round(zoom * 100)}%</span>
          </div>
        </div>

        <div style={{ padding: 14 }}>
          <div
            style={{
              overflow: "auto",
              borderRadius: 12,
              border: "1px solid #f3f3f3",
              background: "#fafafa",
              maxHeight: "70vh",
            }}
          >
            <div style={{ position: "relative", width: scaledW, height: scaledH }}>
              {templateSrc ? (
                <img
                  src={templateSrc}
                  alt="Template certificado"
                  loading="lazy"
                  style={{ width: scaledW, height: scaledH, display: "block" }}
                />
              ) : null}

              {fields
                .filter((f) => enabledKeys.has(f.key))
                .map((f) => {
                  const rawValue = getValueForKey({
                    runner,
                    computed,
                    key: f.key,
                    categoryRankFallback: categoryRank,
                  });
                  if (!isScalar(rawValue) || String(rawValue) === "") return null;

                  const value = safeStr(rawValue);
                  const label = labelForKey(f.key, f.label);
                  const text = `${label}: ${value}`;

                  const boxW = clampNumber(f.boxWidth, 120, pageWidth, defaultBoxWidthPreview);

                  return (
                    <div
                      key={f.key}
                      style={{
                        position: "absolute",
                        left: Math.round(Number(f.x ?? 0) * zoom),
                        top: Math.round(Number(f.y ?? 0) * zoom),
                        width: Math.round(boxW * zoom),
                        fontSize: Math.round(Number(f.fontSize ?? 28) * zoom),
                        fontWeight: f.fontWeight ?? 700,
                        color: f.color ?? "#FFFFFF",
                        whiteSpace: "normal",
                        lineHeight: 1.15,
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }}
                    >
                      {text}
                    </div>
                  );
                })}
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Template: <code>{templateSrc || "(sin template)"}</code> — Size:{" "}
            <code>
              {pageWidth}×{pageHeight}
            </code>
          </div>
        </div>
      </div>

      {/* PREVIEW TEXTO */}
      <div style={{ border: "1px solid #eee", borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ padding: "12px 14px", borderBottom: "1px solid #eee", fontWeight: 800 }}>
          Preview (texto)
        </div>

        <div>
          {previewRows.map(([label, value]) => (
            <div
              key={label}
              style={{
                display: "grid",
                gridTemplateColumns: "220px 1fr",
                gap: 12,
                padding: "10px 14px",
                borderBottom: "1px solid #f3f3f3",
              }}
            >
              <div style={{ fontWeight: 700, opacity: 0.8 }}>{label}</div>
              <div style={{ fontWeight: 800 }}>{safeStr(value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* DESCARGA IMAGEN */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button
          type="button"
          onClick={onDownloadImage}
          disabled={imgBusy || !templateSrc}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "var(--primary)",
            color: "#0B1220",
            cursor: imgBusy ? "not-allowed" : "pointer",
            fontWeight: 900,
            opacity: imgBusy ? 0.7 : 1,
          }}
        >
          {imgBusy ? "Generando imagen..." : "Descargar certificado (PNG)"}
        </button>

        {imgError ? <span style={{ color: "#b00020", fontWeight: 700 }}>{imgError}</span> : null}

        <span style={{ fontSize: 13, opacity: 0.7 }}>
          Tip: si un texto es muy largo, agrega <code>boxWidth</code> y <code>maxLines</code> en el JSON.
        </span>
      </div>
    </section>
  );
}







