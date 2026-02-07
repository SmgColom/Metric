import Link from "next/link";
import { useMemo, useState } from "react";

// PDF (solo cliente)
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from "@react-pdf/renderer";

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

// Traduce/normaliza valores especiales
function getRunnerValue(runner, key, categoryRank) {
  if (key === "race.items[].title") return runner?.item_name;
  if (key === "category_rank") return categoryRank;
  return runner?.[key];
}

// arma filas [label,value]
function buildFields(runner, keys, categoryRank) {
  return keys
    .map((k) => [tKey(k), getRunnerValue(runner, k, categoryRank)])
    .filter(([, v]) => isScalar(v) && String(v) !== "");
}

// ===== PDF DOC =====
function CertificatePDF({ title, runner, rows }) {
  const styles = useMemo(
    () =>
      StyleSheet.create({
        page: { padding: 28, fontSize: 12 },
        header: { marginBottom: 14 },
        title: { fontSize: 18, fontWeight: 700 },
        subtitle: { marginTop: 6, opacity: 0.8 },
        box: {
          marginTop: 14,
          borderWidth: 1,
          borderColor: "#e5e5e5",
          borderRadius: 8,
        },
        row: {
          display: "flex",
          flexDirection: "row",
          padding: 10,
          borderBottomWidth: 1,
          borderBottomColor: "#f0f0f0",
        },
        label: { width: "42%", fontWeight: 700, opacity: 0.8 },
        value: { width: "58%", fontWeight: 700 },
      }),
    []
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            {safeStr(runner?.name)} — Bib {safeStr(runner?.bib)}
          </Text>
        </View>

        <View style={styles.box}>
          {rows.map(([label, value]) => (
            <View key={label} style={styles.row}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.value}>{safeStr(value)}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}

export default function CertificateClient({ config, data, runner, categoryRank }) {
  const backHref = `/e/${config.eventKey}/runner/${encodeURIComponent(
    runner?.bib ?? ""
  )}`;
  const eventTitle =
    config?.branding?.nameOverride ?? data?.race?.title ?? "Evento";

  const selectable = [
    "name",
    "bib",
    "id_card",
    "item_name",
    "total_score",
    "net_score",
    "pace",
    "category_rank",
  ];

  const [selected, setSelected] = useState(() => new Set(selectable));

  const toggle = (k) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  };

  const selectedKeys = useMemo(() => Array.from(selected), [selected]);

  const rows = useMemo(() => {
    return buildFields(runner, selectedKeys, categoryRank);
  }, [runner, selectedKeys, categoryRank]);

  const fileName = `certificado_${config.eventKey}_bib_${safeStr(
    runner?.bib
  )}.pdf`;

  return (
    <section style={{ paddingTop: 10 }}>
      <Link href={backHref} style={{ display: "inline-block", padding: "8px 0" }}>
        ← Volver al corredor
      </Link>

      <h1 style={{ margin: "8px 0 10px" }}>Certificado</h1>
      <p style={{ margin: "0 0 14px", opacity: 0.8 }}>
        Selecciona qué datos van en el PDF y descárgalo.
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
        {selectable.map((k) => (
          <label
            key={k}
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
            <input
              type="checkbox"
              checked={selected.has(k)}
              onChange={() => toggle(k)}
            />
            <span style={{ fontWeight: 700 }}>{tKey(k)}</span>
          </label>
        ))}
      </div>

      {/* preview */}
      <div
        style={{
          border: "1px solid #eee",
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            padding: "12px 14px",
            borderBottom: "1px solid #eee",
            fontWeight: 800,
          }}
        >
          Preview
        </div>

        <div>
          {rows.map(([label, value]) => (
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
              <div style={{ fontWeight: 700 }}>{safeStr(value)}</div>
            </div>
          ))}
        </div>
      </div>

      <PDFDownloadLink
        document={<CertificatePDF title={eventTitle} runner={runner} rows={rows} />}
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
    </section>
  );
}
