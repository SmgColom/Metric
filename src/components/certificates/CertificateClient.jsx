// src/components/certificates/CertificateClient.jsx
import Link from "next/link";
import { useMemo, useState, useCallback, useEffect } from "react";

// PDF (solo cliente)
import { Document, Page, Text, Image, PDFDownloadLink, StyleSheet } from "@react-pdf/renderer";

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

// Valores especiales
function getRunnerValue(runner, key, categoryRank) {
  if (key === "category_rank") return categoryRank;
  return runner?.[key];
}

// Clamp para evitar “Aw Snap” por tamaños locos en JSON
function clampNumber(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.min(max, Math.max(min, x));
}

// ===== PDF DOC =====
function CertificatePDF({ runner, categoryRank, templateSrc, pageWidth, pageHeight, fields, enabledKeys }) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        page: { position: "relative", width: pageWidth, height: pageHeight, padding: 0 },
        bg: { position: "absolute", left: 0, top: 0, width: pageWidth, height: pageHeight },
      }),
    [pageWidth, pageHeight]
  );

  return (
    <Document>
      <Page size={{ width: pageWidth, height: pageHeight }} style={styles.page}>
        {templateSrc ? <Image src={templateSrc} style={styles.bg} fixed /> : null}

        {fields
          .filter((f) => enabledKeys.has(f.key))
          .map((f) => {
            const rawValue = f.key === "category_rank" ? categoryRank : getRunnerValue(runner, f.key, categoryRank);
            if (!isScalar(rawValue) || String(rawValue) === "") return null;

            const value = safeStr(rawValue);
            const label = f.label ?? tKey(f.key);
            const text = `${label}: ${value}`;

            return (
              <Text
                key={f.key}
                style={{
                  position: "absolute",
                  left: Number(f.x ?? 0),
                  top: Number(f.y ?? 0),
                  fontSize: Number(f.fontSize ?? 28),
                  fontWeight: f.fontWeight ?? 700,
                }}
              >
                {text}
              </Text>
            );
          })}
      </Page>
    </Document>
  );
}

export default function CertificateClient({ config, data, runner, categoryRank }) {
  const backHref = `/e/${config.eventKey}/runner/${encodeURIComponent(String(runner?.bib ?? ""))}`;

  // ===== Lee config de certificados =====
  const certCfg = config?.certificate ?? {};
  const template = certCfg?.template ?? {};
  const fields = Array.isArray(certCfg?.fields) ? certCfg.fields : [];

  // URL absoluta (react-pdf se pone delicado con rutas relativas)
  const templateSrc = useMemo(() => {
    const src = template?.src;
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    if (typeof window === "undefined") return src;
    return `${window.location.origin}${src}`;
  }, [template?.src]);

  // ===== Auto-detect tamaño real del PNG (evita recortes) =====
  const [naturalSize, setNaturalSize] = useState(() => ({
    w: clampNumber(template.width, 300, 4000, 1365),
    h: clampNumber(template.height, 300, 6000, 2048),
  }));

  useEffect(() => {
    if (!templateSrc) return;

    const img = new window.Image();
    img.onload = () => {
      // si el PNG es real, esto manda
      const w = clampNumber(img.naturalWidth, 300, 4000, naturalSize.w);
      const h = clampNumber(img.naturalHeight, 300, 6000, naturalSize.h);
      setNaturalSize({ w, h });
    };
    img.onerror = () => {
      // si falla carga, nos quedamos con el fallback seguro
      setNaturalSize((s) => ({ w: clampNumber(s.w, 300, 4000, 1365), h: clampNumber(s.h, 300, 6000, 2048) }));
    };
    img.src = templateSrc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateSrc]);

  const pageWidth = naturalSize.w;
  const pageHeight = naturalSize.h;

  // Checkboxes: por defecto habilita TODOS los fields del JSON
  const initialKeys = useMemo(() => new Set(fields.map((f) => f.key)), [fields]);
  const [enabledKeys, setEnabledKeys] = useState(() => initialKeys);

  const toggle = useCallback((k) => {
    setEnabledKeys((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }, []);

  // Zoom del preview visual
  const [zoom, setZoom] = useState(0.4);

  // ===== PDF “bajo demanda” =====
  // Evita que PDFDownloadLink regenere el PDF con cada cambio de checkbox/preview.
  const [pdfSnapshot, setPdfSnapshot] = useState(null);
  const preparePdf = () => {
    setPdfSnapshot({
      enabledKeys: new Set(enabledKeys),
      templateSrc,
      pageWidth,
      pageHeight,
    });
  };

  const fileName = `certificado_${config.eventKey}_bib_${safeStr(runner?.bib)}.pdf`;

  // Preview (texto simple)
  const previewRows = useMemo(() => {
    return fields
      .filter((f) => enabledKeys.has(f.key))
      .map((f) => {
        const value = f.key === "category_rank" ? categoryRank : getRunnerValue(runner, f.key, categoryRank);
        return [f.label ?? tKey(f.key), value];
      })
      .filter(([, v]) => isScalar(v) && String(v) !== "");
  }, [fields, enabledKeys, runner, categoryRank]);

  const missingTemplate = !template?.src;
  const missingFields = !fields.length;

  const scaledW = Math.round(pageWidth * zoom);
  const scaledH = Math.round(pageHeight * zoom);

  return (
    <section style={{ paddingTop: 10 }}>
      {/* ✅ SOLO una vez */}
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
        Selecciona qué datos van en el certificado y luego descárgalo en PDF.
      </p>

      {/* selector de campos */}
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
            <span style={{ fontWeight: 700 }}>{f.label ?? tKey(f.key)}</span>
          </label>
        ))}
      </div>

      {/* ===== PREVIEW VISUAL ===== */}
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
            <input type="range" min="0.2" max="0.8" step="0.05" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
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
                  const rawValue = f.key === "category_rank" ? categoryRank : getRunnerValue(runner, f.key, categoryRank);
                  if (!isScalar(rawValue) || String(rawValue) === "") return null;

                  const value = safeStr(rawValue);
                  const label = f.label ?? tKey(f.key);
                  const text = `${label}: ${value}`;

                  return (
                    <div
                      key={f.key}
                      style={{
                        position: "absolute",
                        left: Math.round(Number(f.x ?? 0) * zoom),
                        top: Math.round(Number(f.y ?? 0) * zoom),
                        fontSize: Math.round(Number(f.fontSize ?? 28) * zoom),
                        fontWeight: f.fontWeight ?? 700,
                        color: "#0B1220",
                        whiteSpace: "pre",
                      }}
                    >
                      {text}
                    </div>
                  );
                })}
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
            Template: <code>{templateSrc || "(sin template)"}</code> — Size: <code>{pageWidth}×{pageHeight}</code>
          </div>
        </div>
      </div>

      {/* ===== PREVIEW TEXTO ===== */}
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

      {/* ===== PDF bajo demanda ===== */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <button
          type="button"
          onClick={preparePdf}
          style={{
            padding: "10px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 900,
          }}
        >
          Preparar PDF
        </button>

        {pdfSnapshot ? (
          <PDFDownloadLink
            document={
              <CertificatePDF
                runner={runner}
                categoryRank={categoryRank}
                templateSrc={pdfSnapshot.templateSrc}
                pageWidth={pdfSnapshot.pageWidth}
                pageHeight={pdfSnapshot.pageHeight}
                fields={fields}
                enabledKeys={pdfSnapshot.enabledKeys}
              />
            }
            fileName={fileName}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 12,
              textDecoration: "none",
              fontWeight: 900,
              background: "var(--primary)",
              color: "#0B1220",
            }}
          >
            {({ loading }) => (loading ? "Generando PDF..." : "Descargar certificado (PDF)")}
          </PDFDownloadLink>
        ) : (
          <span style={{ fontSize: 13, opacity: 0.7 }}>Primero haz clic en “Preparar PDF”.</span>
        )}
      </div>
    </section>
  );
}





