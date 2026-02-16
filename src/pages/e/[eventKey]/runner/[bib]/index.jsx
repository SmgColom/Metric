import Link from "next/link";
import EventShell from "@/components/event/EventShell";

import { loadEventConfig } from "@/lib/loadEventConfig";
import { normalizeFeibot } from "@/lib/normalizeFeibot";
import { feibotI18n } from "@/lib/i18n";

// ===== i18n helpers =====
const dictES = feibotI18n?.es ?? {};
function tKey(key) {
  // Ajustes solicitados de nombres visibles
  if (key === "race.items[].title") return "Categoría";
  if (key === "sex_display") return "Género";
  if (key === "pace_display") return "Ritmo";
  if (key === "overall_rank_net") return "Posición General";
  if (key === "category_rank_net") return "Posición Categoría";
  if (key === "gender_rank_net") return "Posición Género";
  if (key === "total_finishers") return "Total corredores";

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

// Fix mojibake (JoaquÃ­n -> Joaquín)
function fixText(input) {
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

  out = out.replace(/;/g, " ").replace(/\s+/g, " ").trim();
  return out;
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

// Ritmo con unidad
function formatPace(pace) {
  if (pace === null || pace === undefined) return "-";
  const s = String(pace).trim();
  if (!s) return "-";
  return `${s} min/km`;
}

function getRunnerValue(runner, key, computed) {
  if (key === "race.items[].title") return runner?.item_name;

  if (key === "category_rank") return computed?.categoryRankFallback ?? null;

  if (key === "sex_display") return runner?.sex ?? runner?.gender ?? "-";
  if (key === "pace_display") return computed?.paceDisplay ?? "-";

  if (key === "overall_rank_net") return computed?.overallRankNet ?? null;
  if (key === "category_rank_net") return computed?.categoryRankNet ?? null;
  if (key === "gender_rank_net") return computed?.genderRankNet ?? null;

  if (key === "total_finishers") return computed?.totalFinishers ?? null;

  return runner?.[key];
}

// Genera filas [label, value] usando i18n + computed
function buildFields(runner, keys, computed) {
  return keys
    .map((k) => [tKey(k), getRunnerValue(runner, k, computed)])
    .filter(([, v]) => isScalar(v) && String(v) !== "");
}

// Detecta splits array en runner (si existiera)
function extractSplitsFromRunner(runner) {
  const candidates = ["splits", "laps", "checkpoints", "points", "passings", "segments"];
  for (const key of candidates) {
    const v = runner?.[key];
    if (Array.isArray(v) && v.length) return v;
  }
  return [];
}

// Normaliza split genérico (si viene como array)
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
    pace: pace ? formatPace(pace) : "-",
  };
}

// ===== Parciales desde Feibot (sin array) =====
function extractLapsFromFeibot(runner) {
  const loopArrays = ["loop_a_format", "loop_b_format", "loop_c_format"];

  for (const key of loopArrays) {
    const arr = runner?.[key];
    if (Array.isArray(arr) && arr.length) {
      return arr
        .map((l, idx) => {
          const n = l?.lap_number ?? idx + 1;
          const lap = l?.lap_time ?? "";
          const total = l?.total_time ?? "";
          return {
            point: `Vuelta ${n}`,
            distance: "-",
            time: total ? String(total) : "-",
            lapTime: lap ? String(lap) : "-",
            pace: "-",
          };
        })
        .filter((x) => x.lapTime !== "-" || x.time !== "-");
    }
  }

  return [];
}

function extractCheckpointsFromFeibot(runner) {
  const out = [];
  for (let i = 1; i <= 9; i++) {
    const k = `cp${i}`;
    const v = runner?.[k];
    if (typeof v === "string" && v.trim()) {
      out.push({
        point: `CP${i}`,
        distance: "-",
        time: v.trim(),
        lapTime: "-",
        pace: "-",
      });
    }
  }
  return out;
}

// ===== Ranking por género (net) =====
function computeGenderRankNet(allScores, runner) {
  const sex = (runner?.sex ?? runner?.gender ?? "").toString().trim().toUpperCase();
  const bib = String(runner?.bib ?? "");
  if (!sex || !bib) return null;

  const list = allScores
    .filter(
      (r) =>
        String(r?.bib ?? "") &&
        (r?.sex ?? r?.gender ?? "").toString().trim().toUpperCase() === sex
    )
    .slice()
    .sort((a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b)));

  const idx = list.findIndex((r) => String(r?.bib ?? "") === bib);
  return idx >= 0 ? idx + 1 : null;
}

export async function getServerSideProps({ params }) {
  const { eventKey, bib } = params;

  try {
    const config = loadEventConfig(eventKey);
    if (!config?.feibot?.publicKey) return { notFound: true };

    const raw = await fetchFeibotRace(config.feibot.publicKey);

    const base = normalizeFeibot(raw);

    const allScoresRaw = Array.isArray(raw?.scores) ? raw.scores : [];

    const allScores = allScoresRaw.map((r) => ({
      ...r,
      name: fixText(r?.name),
      item_name: fixText(r?.item_name),
      city: fixText(r?.city),
      country: fixText(r?.country),
      team: fixText(r?.team),
      sex: (r?.sex ?? r?.gender ?? "").toString().trim().toUpperCase(),
    }));

    const runner = allScores.find((r) => String(r?.bib ?? "") === String(bib));
    if (!runner) return { notFound: true };

    // Total finalizados (finisher === 1)
    const totalFinishers = allScores.filter((r) => Number(r?.finisher) === 1).length;

    // Posiciones netas desde Feibot
    const overallRankNet = runner?.net_ranking ?? null;
    const categoryRankNet = runner?.item_net_ranking ?? null;

    // Fallback categoría
    const catId = Number(runner?.item_id ?? 0);
    const sameCategory = allScores.filter((r) => Number(r?.item_id ?? 0) === catId);
    const sortedCat = [...sameCategory].sort(
      (a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b))
    );
    const categoryRankFallback =
      sortedCat.findIndex((r) => String(r?.bib ?? "") === String(bib)) + 1;

    // Posición por género (net) calculada
    const genderRankNet = computeGenderRankNet(allScores, runner);

    // Ritmo con unidad
    const paceDisplay = formatPace(runner?.pace);

    // Parciales
    const splitsRaw = extractSplitsFromRunner(runner);
    let splits = Array.isArray(splitsRaw) && splitsRaw.length ? splitsRaw.map(normalizeSplit) : [];

    if (!splits.length) {
      const laps = extractLapsFromFeibot(runner);
      const cps = extractCheckpointsFromFeibot(runner);
      splits = laps.length ? laps : cps;
    }

    return {
      props: {
        config,
        data: base,
        runner,
        eventKey,
        computed: {
          totalFinishers,
          overallRankNet,
          categoryRankNet,
          categoryRankFallback: categoryRankFallback > 0 ? categoryRankFallback : null,
          genderRankNet,
          paceDisplay,
        },
        splits,
      },
    };
  } catch (error) {
    return {
      props: {
        error: error?.message ?? "Error cargando corredor",
        config: null,
        data: null,
        runner: null,
        eventKey: null,
        computed: null,
        splits: [],
      },
    };
  }
}

export default function RunnerDetailPage({
  config,
  data,
  runner,
  computed,
  splits,
  error,
  eventKey,
}) {
  if (error || !config || !runner || !eventKey || !computed) {
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

  const resultsHref = `/e/${eventKey}/results`;
  const certificateHref = `/e/${eventKey}/runner/${encodeURIComponent(runner?.bib ?? "")}/certificate`;

  const leftKeys = ["bib", "name", "sex_display", "race.items[].title"];

  const rightKeys = [
    "total_score",
    "net_score",
    "pace_display",
    "overall_rank_net",
    "category_rank_net",
    "gender_rank_net",
    "total_finishers",
  ];

  const leftRows = buildFields(runner, leftKeys, computed);
  const rightRows = buildFields(runner, rightKeys, computed);

  return (
    <EventShell config={config} data={data}>
      <section style={{ paddingTop: 10 }}>
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

        <h2 style={{ margin: "18px 0 10px", fontSize: 18 }}>Parciales</h2>

        {Array.isArray(splits) && splits.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
              <thead>
                <tr>
                  {["split_point", "split_distance", "split_time_total", "split_time_lap", "split_pace"].map(
                    (k) => (
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
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {splits.map((s, i) => (
                  <tr key={`${s.point}-${i}`}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {safeStr(s.point)}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {safeStr(s.distance)}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {safeStr(s.time)}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {safeStr(s.lapTime)}
                    </td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {safeStr(s.pace)}
                    </td>
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
      <div style={{ padding: "12px 14px", borderBottom: "1px solid #eee", fontWeight: 800 }}>
        {title}
      </div>

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









