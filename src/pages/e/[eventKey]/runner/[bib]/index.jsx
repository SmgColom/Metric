import Link from "next/link";
import EventShell from "@/components/event/EventShell";
import { toInt } from "@/lib/number";
import { loadEventConfig } from "@/lib/loadEventConfig";
import { normalizeFeibot } from "@/lib/normalizeFeibot";
import { feibotI18n } from "@/lib/i18n";
import { fetchFeibotRace } from "@/lib/feibot";
import { fixText } from "@/lib/textUtils";


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

export async function getServerSideProps({ params, query, res }) {
  const { eventKey } = params;

  try {
    const config = loadEventConfig(eventKey);
    if (!config?.feibot?.publicKey) return { notFound: true };

    // (Opcional) cache CDN en Vercel para esta página SSR
    // OJO: si "live" cambia mucho, bájalo a 5-10s.
    res?.setHeader?.("Cache-Control", "s-maxage=15, stale-while-revalidate=120");

    const page = Math.max(1, toInt(query.page, 1));
    const pageSize = Math.min(100, Math.max(10, toInt(query.pageSize, 25)));
    const q = (query.q ?? "").toString().trim();
    const itemId = query.itemId ? toInt(query.itemId, null) : null;

    const raw = await fetchFeibotRace(config.feibot.publicKey);

    // ✅ base info del evento (pero SIN scores gigantes)
    const baseFull = normalizeFeibot(raw);

    // Quita cualquier posible scores dentro del objeto base
    const { scores: _scoresOmit, ...base } = baseFull ?? {};
    // (por si normalizeFeibot anida algo raro)
    if (base?.race?.scores) delete base.race.scores;

    // scores crudos
    const allScoresRaw = Array.isArray(raw?.scores) ? raw.scores : [];

    // ====== Split meta (sin mapear TODO si no hace falta)
    // muestreamos solo una parte para detectar si hay laps o cps en el evento
    const sample = allScoresRaw.slice(0, 300);

    const sampleHasLaps = sample.some((r) => {
      return (
        (Array.isArray(r?.loop_a_format) && r.loop_a_format.length) ||
        (Array.isArray(r?.loop_b_format) && r.loop_b_format.length) ||
        (Array.isArray(r?.loop_c_format) && r.loop_c_format.length)
      );
    });

    const sampleHasCps = sample.some((r) => {
      for (let i = 1; i <= 9; i++) {
        const v = r?.[`cp${i}`];
        if (typeof v === "string" && v.trim()) return true;
      }
      return false;
    });

    const splitMeta = sampleHasLaps
      ? { enabled: true, mode: "laps", header: "Vueltas" }
      : sampleHasCps
      ? { enabled: true, mode: "checkpoints", header: "Checkpoints" }
      : { enabled: false, mode: null, header: null };

    // ====== Limpieza mínima para filtros/búsqueda/sorting (SIN clonar objetos enormes)
    // OJO: aquí NO hacemos map() gigante con {...r}
    // Solo leemos lo necesario para filtrar/ordenar.
    let filtered = allScoresRaw;

    // filtro por categoría
    if (itemId) {
      filtered = filtered.filter((r) => Number(r?.item_id) === Number(itemId));
    }

    // orden por tiempo neto
    filtered = [...filtered].sort((a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b)));

    // búsqueda
    if (q) {
      const qq = q.toLowerCase();
      filtered = filtered.filter((r) => {
        const name = fixText(r?.name ?? "").toString().toLowerCase();
        const bib = (r?.bib ?? "").toString().toLowerCase();
        const idCard = (r?.id_card ?? "").toString().toLowerCase();
        return name.includes(qq) || bib.includes(qq) || idCard.includes(qq);
      });
    }

    // paginación
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    // ====== Ranking por género (GLOBAL) (necesita allScoresRaw)
    // Si esto se te pone pesado con eventos gigantes, luego lo optimizamos con cache en API.
    const genderRankMap = new Map();
    const genderGroups = new Map();

    for (const r of allScoresRaw) {
      const sex = (r?.sex ?? "").toString().trim().toUpperCase();
      const bib = String(r?.bib ?? "");
      if (!sex || !bib) continue;
      if (!genderGroups.has(sex)) genderGroups.set(sex, []);
      genderGroups.get(sex).push(r);
    }

    for (const [sex, arr] of genderGroups.entries()) {
      const sorted = [...arr].sort((a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b)));
      sorted.forEach((r, idx) => {
        const bib = String(r?.bib ?? "");
        genderRankMap.set(`${sex}::${bib}`, idx + 1);
      });
    }

    // ====== Construir SOLO las filas que renderizas (payload liviano)
    const rowsSlim = pageRows.map((r) => {
      const bib = String(r?.bib ?? "");
      const sex = (r?.sex ?? "").toString().trim().toUpperCase();

      // splits SOLO para la fila actual
      let splitLines = [];
      if (splitMeta.enabled) {
        if (splitMeta.mode === "laps") {
          const pick =
            (Array.isArray(r?.loop_a_format) && r.loop_a_format) ||
            (Array.isArray(r?.loop_b_format) && r.loop_b_format) ||
            (Array.isArray(r?.loop_c_format) && r.loop_c_format) ||
            null;

          if (Array.isArray(pick) && pick.length) {
            splitLines = pick
              .map((l, idx) => {
                const n = l?.lap_number ?? idx + 1;
                const t = typeof l?.lap_time === "string" ? l.lap_time : "";
                return n && t ? `Vuelta ${n}: ${t}` : null;
              })
              .filter(Boolean);
          }
        } else if (splitMeta.mode === "checkpoints") {
          const out = [];
          for (let i = 1; i <= 9; i++) {
            const v = r?.[`cp${i}`];
            if (typeof v === "string" && v.trim()) out.push(`CP${i}: ${v.trim()}`);
          }
          splitLines = out;
        }
      }

      const time = r?.net_score ?? r?.total_score ?? "";

      return {
        // campos para UI
        id: r?.id ?? null,
        name: fixText(r?.name) ?? "-",
        bib,
        item_name: fixText(r?.item_name) ?? "-",
        net_score: r?.net_score ?? null,
        total_score: r?.total_score ?? null,

        // ranks
        overallRank: r?.net_ranking ?? null,
        categoryRank: r?.item_net_ranking ?? null,
        genderRank: sex ? genderRankMap.get(`${sex}::${bib}`) ?? null : null,
        sex,

        // pace display
        paceDisplay: formatPace(r?.pace),

        // splits
        splitLines,
      };
    });

    const data = {
      ...base,
      // ✅ SOLO lo necesario:
      results: rowsSlim,
      resultsMeta: {
        total,
        page: safePage,
        pageSize,
        totalPages,
        q,
        itemId,
        splitEnabled: splitMeta.enabled,
        splitHeader: splitMeta.header,
      },
    };

    return { props: { config, data } };
  } catch (error) {
    return {
      props: {
        error: error?.message ?? "Error cargando resultados",
        config: null,
        data: null,
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









