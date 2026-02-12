// src/pages/e/[eventKey]/results.jsx
import Link from "next/link";
import EventShell from "@/components/event/EventShell";
import styles from "./Results.module.scss";

import { loadEventConfig } from "@/lib/loadEventConfig";
import { normalizeFeibot } from "@/lib/normalizeFeibot";

/* ===== Helpers ===== */
function toInt(v, fallback) {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
}

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

function fixText(input) {
  if (!input || typeof input !== "string") return input;
  const looksBroken = /Ã.|Â./.test(input);
  try {
    return looksBroken ? Buffer.from(input, "latin1").toString("utf8") : input;
  } catch {
    return input;
  }
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
export async function getServerSideProps({ params, query }) {
  const { eventKey } = params;

  const config = loadEventConfig(eventKey);
  if (!config?.feibot?.publicKey) return { notFound: true };

  const page = Math.max(1, toInt(query.page, 1));
  const pageSize = Math.min(100, Math.max(10, toInt(query.pageSize, 25)));
  const q = (query.q ?? "").trim();
  const itemId = query.itemId ? toInt(query.itemId, null) : null;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/feibot/${config.feibot.publicKey}`);
  const raw = await res.json();

  const base = normalizeFeibot(raw);

  const allScores = (raw?.scores ?? []).map((r) => {
    const split = buildSplitLines(r);
    return {
      ...r,
      name: fixText(r?.name),
      item_name: fixText(r?.item_name),
      sex: (r?.sex ?? "").toUpperCase(),
      paceDisplay: formatPace(r?.pace),
      splitMode: split.mode,
      splitHeader: split.header,
      splitLines: split.lines,
    };
  });

  const hasLaps = allScores.some((r) => r.splitMode === "laps");
  const hasCps = allScores.some((r) => r.splitMode === "checkpoints");
  const splitHeader = hasLaps ? "Vueltas" : hasCps ? "Checkpoints" : null;

  let filtered = itemId
    ? allScores.filter((r) => Number(r.item_id) === itemId)
    : allScores;

  filtered = filtered.sort(
    (a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b))
  );

  if (q) {
    const qq = q.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.name?.toLowerCase().includes(qq) ||
        String(r.bib).includes(qq) ||
        String(r.id_card ?? "").includes(qq)
    );
  }

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const rows = filtered.slice(start, start + pageSize);

  return {
    props: {
      config,
      data: {
        ...base,
        results: rows,
        resultsMeta: {
          total,
          page,
          pageSize,
          totalPages,
          q,
          itemId,
          splitEnabled: !!splitHeader,
          splitHeader,
        },
      },
    },
  };
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


