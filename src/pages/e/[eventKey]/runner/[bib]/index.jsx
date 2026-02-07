import Link from "next/link";
import EventShell from "@/components/event/EventShell";

import { loadEventConfig } from "@/lib/loadEventConfig";
import { fetchFeibotRace } from "@/lib/feibot";
import { normalizeFeibot } from "@/lib/normalizeFeibot";

import { feibotI18n } from "@/lib/i18n";

// ===== i18n helpers =====
const dictES = feibotI18n?.es ?? {};
function tKey(key) {
  return dictES[key] ?? key;
}

// ===== Helpers =====
function safeStr(v) {
  if (v === undefined || v === null || v === "") return "-";
  return String(v);
}

function isScalar(v) {
  if (v === null || v === undefined) return false;
  const type = typeof v;
  return type === "string" || type === "number" || type === "boolean";
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
  return r?.net_score ?? r?.total_score ?? "";
}

/**
 * Resolver valores especiales:
 * - "race.items[].title" no existe como key en runner, pero el valor real está en runner.item_name
 * - "category_rank" es calculado, no viene del runner
 */
function getRunnerValue(runner, key, categoryRank) {
  if (key === "race.items[].title") return runner?.item_name;
  if (key === "category_rank") return categoryRank;
  return runner?.[key];
}

// Genera filas [labelTraducido, value] usando tu i18n
function buildFields(runner, keys, categoryRank) {
  return keys
    .map((k) => [tKey(k), getRunnerValue(runner, k, categoryRank)])
    .filter(([, v]) => isScalar(v) && String(v) !== "");
}

// Detecta si runner trae parciales en algún campo típico
function extractSplitsFromRunner(runner) {
  const candidates = ["splits", "laps", "checkpoints", "points", "passings", "segments"];
  for (const key of candidates) {
    const v = runner?.[key];
    if (Array.isArray(v) && v.length) return v;
  }
  return [];
}

// Normaliza split/lap a columnas
function normalizeSplit(x, idx) {
  const point =
    x?.point ??
    x?.name ??
    x?.checkpoint_name ??
    x?.cp_name ??
    x?.location ??
    (idx === 0 ? "Salida" : `Punto ${idx + 1}`);

  const distance = x?.distance ?? x?.km ?? x?.kilo ?? x?.dist ?? x?.meters ?? x?.m ?? "";
  const time = x?.time ?? x?.chip_time ?? x?.gun_time ?? x?.timestamp ?? x?.t ?? "";
  const lapTime = x?.lap_time ?? x?.split_time ?? x?.delta ?? x?.segment_time ?? "";
  const pace = x?.pace ?? x?.lap_pace ?? x?.split_pace ?? "";

  return {
    point: safeStr(point),
    distance: distance === "" ? "-" : safeStr(distance),
    time: safeStr(time),
    lapTime: safeStr(lapTime),
    pace: safeStr(pace),
  };
}

export async function getServerSideProps({ params }) {
  const { eventKey, bib } = params;

  try {
    const config = loadEventConfig(eventKey);
    if (!config?.feibot?.publicKey) return { notFound: true };

    const raw = await fetchFeibotRace(config.feibot.publicKey);
    const base = normalizeFeibot(raw);

    const allScores = raw?.scores ?? [];
    const runner = allScores.find((r) => String(r?.bib ?? "") === String(bib));
    if (!runner) return { notFound: true };

    // Ranking en su categoría (por tiempo neto)
    const catId = Number(runner?.item_id ?? 0);
    const sameCategory = allScores.filter((r) => Number(r?.item_id ?? 0) === catId);

    const sorted = [...sameCategory].sort((a, b) => {
      return timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b));
    });

    const categoryRank = sorted.findIndex((r) => String(r?.bib ?? "") === String(bib)) + 1;

    // Parciales desde runner (si existen)
    const splitsRaw = extractSplitsFromRunner(runner);
    const splits = Array.isArray(splitsRaw) ? splitsRaw.map(normalizeSplit) : [];

    return {
      props: {
        config,
        data: base,
        runner,
        categoryRank: categoryRank > 0 ? categoryRank : null,
        splits,
        eventKey, // ✅ IMPORTANTE para armar links correctos
      },
    };
  } catch (error) {
    return {
      props: {
        error: error?.message ?? "Error cargando corredor",
        config: null,
        data: null,
        runner: null,
        categoryRank: null,
        splits: [],
        eventKey: null,
      },
    };
  }
}

export default function RunnerDetailPage({ config, data, runner, categoryRank, splits, error, eventKey }) {
  if (error || !config || !runner || !eventKey) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Corredor no disponible</h1>
        <p>{error ?? "No se pudo cargar el corredor."}</p>
        <Link href="/" style={{ display: "inline-block", padding: "8px 0" }}>
          Volver
        </Link>
      </div>
    );
  }

  // ✅ Links correctos SIEMPRE usando eventKey del route
  const resultsHref = `/e/${eventKey}/results`;
  const certificateHref = `/e/${eventKey}/runner/${encodeURIComponent(runner?.bib ?? "")}/certificate`;

  const leftKeys = ["bib", "name", "gender", "age_group", "age_group2", "race.items[].title", "status"];

  const rightKeys = [
    "total_score",
    "net_score",
    "pace",
    "category_rank",
    "overall_gun_rank",
    "overall_chip_rank",
    "gender_gun_rank",
    "gender_chip_rank",
    "age_group_gun_rank",
    "age_group_chip_rank",
    "age_group2_gun_rank",
    "age_group2_chip_rank",
  ];

  const leftRows = buildFields(runner, leftKeys, categoryRank);
  const rightRows = buildFields(runner, rightKeys, categoryRank);

  return (
    <EventShell config={config} data={data}>
      <section style={{ paddingTop: 10 }}>
        {/* Acciones superiores */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <Link
            href={resultsHref}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              textDecoration: "none",
              fontWeight: 800,
              display: "inline-block",
            }}
          >
            ← Volver a resultados
          </Link>

          <Link
            href={certificateHref}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              background: "var(--primary)",
              color: "#0B1220",
              textDecoration: "none",
              fontWeight: 900,
              display: "inline-block",
            }}
          >
            Descargar certificado
          </Link>
        </div>

        <h1 style={{ margin: "8px 0 12px" }}>
          {runner?.name ? safeStr(runner.name) : "Detalle del corredor"}
        </h1>

        {/* Resumen */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
            alignItems: "start",
            marginTop: 10,
            marginBottom: 16,
          }}
        >
          <InfoTable title="Información" rows={leftRows} />
          <InfoTable title="Tiempos y posiciones" rows={rightRows} />
        </div>

        {/* Parciales */}
        <h2 style={{ margin: "18px 0 10px", fontSize: 18 }}>Parciales</h2>

        {Array.isArray(splits) && splits.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr>
                  {["split_point", "split_distance", "split_time_total", "split_time_lap", "split_pace"].map((k) => (
                    <th
                      key={k}
                      style={{
                        textAlign: "left",
                        padding: "10px 8px",
                        borderBottom: "1px solid #eee",
                        fontSize: 13,
                        opacity: 0.8,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tKey(k)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {splits.map((s, i) => (
                  <tr key={`${s.point}-${i}`}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{s.point}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{s.distance}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{s.time}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{s.lapTime}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{s.pace}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "10px 0", opacity: 0.75 }}>
            Este evento no tiene parciales publicados para este corredor.
          </div>
        )}
      </section>
    </EventShell>
  );
}

function InfoTable({ title, rows }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #eee", fontWeight: 800 }}>{title}</div>

      <div style={{ display: "grid" }}>
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
  );
}







