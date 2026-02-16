// src/pages/e/[eventKey]/results.jsx
import Link from "next/link";
import EventShell from "@/components/event/EventShell";
import styles from "./Results.module.scss";
import { toInt } from "@/lib/number";
import { loadEventConfig } from "@/lib/loadEventConfig";
import { normalizeFeibot } from "@/lib/normalizeFeibot";
import { fetchFeibotRace } from "@/lib/feibot";
import { fixText } from "@/lib/textUtils";


function buildQuery(base = {}, patch = {}) {
  const q = { ...base, ...patch };
  Object.keys(q).forEach((k) => {
    if (q[k] === undefined || q[k] === null || q[k] === "" || q[k] === "all") delete q[k];
  });
  return q;
}

function timeToSeconds(t) {
  if (!t) return Number.POSITIVE_INFINITY;
  const s = String(t).trim();
  const parts = s.split(":").map(Number);
  if (parts.some((n) => !Number.isFinite(n))) return Number.POSITIVE_INFINITY;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0];
}

function getTimeValue(r) {
  return r?.net_score ?? r?.total_score ?? "";
}


function formatPace(pace) {
  if (!pace) return "-";
  return `${pace} min/km`;
}

/* ===== Splits ===== */
function extractLaps(score) {
  const pick =
    (Array.isArray(score?.loop_a_format) && score.loop_a_format) ||
    (Array.isArray(score?.loop_b_format) && score.loop_b_format) ||
    (Array.isArray(score?.loop_c_format) && score.loop_c_format);

  if (!pick) return null;

  return pick
    .map((l, i) => ({
      n: l?.lap_number ?? i + 1,
      t: l?.lap_time,
    }))
    .filter((l) => l.t);
}

function extractCheckpoints(score) {
  const out = [];
  for (let i = 1; i <= 9; i++) {
    const v = score?.[`cp${i}`];
    if (typeof v === "string" && v.trim()) out.push({ n: i, t: v });
  }
  return out.length ? out : null;
}

function buildSplitLines(score) {
  const laps = extractLaps(score);
  if (laps)
    return { mode: "laps", header: "Vueltas", lines: laps.map((l) => `Vuelta ${l.n}: ${l.t}`) };

  const cps = extractCheckpoints(score);
  if (cps)
    return {
      mode: "checkpoints",
      header: "Checkpoints",
      lines: cps.map((c) => `CP${c.n}: ${c.t}`),
    };

  return { mode: null, header: null, lines: [] };
}

/* ===== SSR ===== */
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


/* ===== Page ===== */
export default function ResultsPage({ config, data }) {
  const meta = data.resultsMeta;
  const rows = data.results;
  const items = data.race.items;

  const basePath = `/e/${config.eventKey}/results`;
  const makeHref = (patch) => {
    const qs = new URLSearchParams(buildQuery(meta, patch)).toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <EventShell config={config} data={data}>
      <section className={styles.page}>
        <div className={styles.headerRow}>
          <h1>Resultados</h1>
        </div>

        <div className={styles.controlsRow}>
          <form action={basePath}>
            <input className={styles.input} name="q" defaultValue={meta.q} placeholder="Buscar…" />
          </form>

          <div className={styles.selectGroup}>
            <span>Categoría:</span>
            <select
              className={styles.select}
              value={meta.itemId ?? "all"}
              onChange={(e) =>
                (window.location.href = makeHref({ itemId: e.target.value || "" }))
              }
            >
              <option value="all">Todas</option>
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.meta}>
          {meta.total} resultados — página {meta.page} de {meta.totalPages}
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {[
                  "#",
                  "Nombre",
                  "Bib",
                  "Categoría",
                  "Tiempo",
                  "Ritmo",
                  ...(meta.splitEnabled ? [meta.splitHeader] : []),
                  "Certificado",
                ].map((h) => (
                  <th key={h} className={styles.th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, i) => (
                <tr key={`${r.bib}-${i}`}>
                  <td className={styles.td}>{i + 1}</td>
                  <td className={styles.td}>
                    <Link
                      href={`/e/${config.eventKey}/runner/${r.bib}`}
                      className={styles.nameLink}
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className={styles.td}>{r.bib}</td>
                  <td className={styles.td}>{r.item_name}</td>
                  <td className={styles.td}>{r.net_score ?? r.total_score}</td>
                  <td className={styles.td}>{r.paceDisplay}</td>

                  {meta.splitEnabled ? (
                    <td className={styles.td}>
                      <div className={styles.splitCell}>
                        {r.splitLines.map((l, i) => (
                          <div key={i}>{l}</div>
                        ))}
                      </div>
                    </td>
                  ) : null}

                  <td className={styles.td}>
                    <Link
                      href={`/e/${config.eventKey}/runner/${r.bib}/certificate`}
                      className={styles.downloadBtn}
                    >
                      Descargar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </EventShell>
  );
}


