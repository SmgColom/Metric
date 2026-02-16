// src/pages/e/[eventKey]/results.jsx
import Link from "next/link";
import EventShell from "@/components/event/EventShell";
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


// ✅ Ritmo: "6:05" -> "6:05 min/km"
function formatPace(pace) {
  if (pace === null || pace === undefined) return "-";
  const s = String(pace).trim();
  if (!s) return "-";

  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) {
    // Si viene HH:MM:SS lo llevamos a MM:SS (poco común pero por seguridad)
    const parts = s.split(":").map((x) => Number(x));
    if (parts.length === 3) {
      const mm = parts[0] * 60 + parts[1];
      const ss = parts[2];
      return `${mm}:${String(ss).padStart(2, "0")} min/km`;
    }
    return `${s} min/km`;
  }

  // fallback sin inventar conversiones
  return `${s} min/km`;
}

/**
 * ===== Split extractor (AUTO) =====
 * mode:
 * - "laps" -> usa loop_*_format (arrays) y muestra "Vuelta X: t" en vertical
 * - "checkpoints" -> usa cp1..cp9 (strings) y muestra "CPX: t" en vertical
 * - null -> nada
 */
function extractLaps(score) {
  const pick =
    (Array.isArray(score?.loop_a_format) && score.loop_a_format) ||
    (Array.isArray(score?.loop_b_format) && score.loop_b_format) ||
    (Array.isArray(score?.loop_c_format) && score.loop_c_format) ||
    null;

  if (Array.isArray(pick) && pick.length) {
    return pick
      .map((l, idx) => ({
        lap_number: l?.lap_number ?? idx + 1,
        lap_time: typeof l?.lap_time === "string" ? l.lap_time : null,
      }))
      .filter((l) => l.lap_number && l.lap_time);
  }

  return null;
}

function extractCheckpoints(score) {
  // cp1..cp9, solo los que tengan valor
  const out = [];
  for (let i = 1; i <= 9; i++) {
    const k = `cp${i}`;
    const v = score?.[k];
    if (typeof v === "string" && v.trim()) out.push({ cp: i, time: v.trim() });
  }
  return out.length ? out : null;
}

function buildSplitLines({ laps, checkpoints }) {
  if (Array.isArray(laps) && laps.length) {
    return {
      mode: "laps",
      header: "Vueltas",
      lines: laps.map((l) => `Vuelta ${l.lap_number}: ${l.lap_time}`),
    };
  }

  if (Array.isArray(checkpoints) && checkpoints.length) {
    return {
      mode: "checkpoints",
      header: "Checkpoints",
      lines: checkpoints.map((c) => `CP${c.cp}: ${c.time}`),
    };
  }

  return { mode: null, header: null, lines: [] };
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
    console.log("[Feibot] scores:", Array.isArray(raw?.scores) ? raw.scores.length : 0);
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


export default function ResultsPage({ config, data, error }) {
  if (error || !config) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Resultados no disponibles</h1>
        <p>{error ?? "No se pudo cargar el evento."}</p>
        <Link href="/" style={{ display: "inline-block", padding: "8px 0" }}>
          Volver
        </Link>
      </div>
    );
  }

  const meta = data?.resultsMeta ?? {};
  const items = data?.race?.items ?? [];
  const rows = data?.results ?? [];
  const splitEnabled = !!meta.splitEnabled;
  const splitHeader = meta.splitHeader ?? "Splits";

  const basePath = `/e/${config.eventKey ?? ""}/results`;

  const makeHref = (patch) => {
    const nextQ = buildQuery(
      {
        page: meta.page,
        pageSize: meta.pageSize,
        q: meta.q,
        itemId: meta.itemId,
      },
      patch
    );
    const qs = new URLSearchParams(nextQ).toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <EventShell config={config} data={data}>
      <section style={{ paddingTop: 10 }}>
        <h1 style={{ margin: "0 0 12px" }}>Resultados</h1>

        {/* Filtros */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <form action={basePath} method="GET" style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="hidden" name="pageSize" value={meta.pageSize ?? 25} />
            <input type="hidden" name="itemId" value={meta.itemId ?? ""} />

            <input
              name="q"
              defaultValue={meta.q ?? ""}
              placeholder="Buscar por nombre, bib o documento…"
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                minWidth: 260,
              }}
            />
            <button
              type="submit"
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "var(--primary)",
                color: "white",
                cursor: "pointer",
              }}
            >
              Buscar
            </button>

            {meta.q || meta.itemId ? (
              <Link href={makeHref({ q: "", itemId: "", page: 1 })} style={{ padding: "10px 8px", display: "inline-block" }}>
                Limpiar
              </Link>
            ) : null}
          </form>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>Categoría:</span>
            <select
              value={meta.itemId ?? "all"}
              onChange={(e) => {
                const v = e.target.value;
                window.location.href = makeHref({ itemId: v === "all" ? "" : v, page: 1 });
              }}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
            >
              <option value="all">Todas</option>
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>Por página:</span>
            <select
              value={meta.pageSize ?? 25}
              onChange={(e) => {
                window.location.href = makeHref({ pageSize: e.target.value, page: 1 });
              }}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #ddd" }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 12, fontSize: 14, opacity: 0.8 }}>
          {meta.total ?? 0} resultados — página {meta.page ?? 1} de {meta.totalPages ?? 1}
          {splitEnabled ? ` — incluye ${splitHeader.toLowerCase()}` : ""}
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
            <thead>
              <tr>
                {[
                  "#",
                  "Pos. Gen (net)",
                  "Pos. Género",
                  "Género",
                  "Pos. Cat (net)",
                  "Nombre",
                  "Bib",
                  "Categoría",
                  "Tiempo (neto/oficial)",
                  "Ritmo",
                  ...(splitEnabled ? [splitHeader] : []),
                  "Certificado",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 8px",
                      borderBottom: "1px solid #eee",
                      fontSize: 13,
                      opacity: 0.8,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => {
                const absoluteIndex = (meta.page - 1) * meta.pageSize + idx + 1;
                const time = r?.net_score ?? r?.total_score ?? "";
                const bibStr = String(r?.bib ?? "");

                const runnerHref = `/e/${config.eventKey}/runner/${encodeURIComponent(bibStr)}`;
                const certificateHref = `/e/${config.eventKey}/runner/${encodeURIComponent(bibStr)}/certificate`;

                return (
                  <tr key={r.id ?? `${bibStr}-${idx}`}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{absoluteIndex}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{r?.overallRank ?? "-"}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{r?.genderRank ?? "-"}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{r?.sex ? String(r.sex).toUpperCase() : "-"}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{r?.categoryRank ?? "-"}</td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {bibStr ? (
                        <Link href={runnerHref} style={{ fontWeight: 800, textDecoration: "none" }}>
                          {r?.name ?? "-"}
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 800 }}>{r?.name ?? "-"}</span>
                      )}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{bibStr || "-"}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{r?.item_name ?? "-"}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{time || "-"}</td>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>{r?.paceDisplay ?? "-"}</td>

                    {splitEnabled ? (
                      <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                        {Array.isArray(r?.splitLines) && r.splitLines.length ? (
                          <div style={{ fontSize: 12, opacity: 0.9, lineHeight: 1.35 }}>
                            {r.splitLines.map((line, i) => (
                              <div key={i}>{line}</div>
                            ))}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                    ) : null}

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {bibStr ? (
                        <Link
                          href={certificateHref}
                          style={{
                            fontWeight: 900,
                            textDecoration: "none",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 10px",
                            borderRadius: 10,
                            border: "1px solid #ddd",
                          }}
                        >
                          Descargar
                        </Link>
                      ) : (
                        <span style={{ opacity: 0.6 }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 ? (
                <tr>
                  <td colSpan={splitEnabled ? 12 : 11} style={{ padding: 18, opacity: 0.7 }}>
                    No hay resultados para estos filtros.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* paginación */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16 }}>
          <Link href={makeHref({ page: 1 })} style={{ padding: "8px 10px", display: "inline-block" }}>
            ⟪
          </Link>

          <Link
            href={makeHref({ page: Math.max(1, (meta.page ?? 1) - 1) })}
            style={{ padding: "8px 10px", display: "inline-block" }}
          >
            Anterior
          </Link>

          <span style={{ fontSize: 14, opacity: 0.8 }}>
            Página {meta.page ?? 1} / {meta.totalPages ?? 1}
          </span>

          <Link
            href={makeHref({ page: Math.min(meta.totalPages ?? 1, (meta.page ?? 1) + 1) })}
            style={{ padding: "8px 10px", display: "inline-block" }}
          >
            Siguiente
          </Link>

          <Link href={makeHref({ page: meta.totalPages ?? 1 })} style={{ padding: "8px 10px" }}>
            ⟫
          </Link>
        </div>
      </section>
    </EventShell>
  );
}












