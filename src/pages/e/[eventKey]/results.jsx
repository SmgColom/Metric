// src/pages/e/[eventKey]/results.jsx
import Link from "next/link";
import EventShell from "@/components/event/EventShell";

import { loadEventConfig } from "@/lib/loadEventConfig";
import { fetchFeibotRace } from "@/lib/feibot";
import { normalizeFeibot } from "@/lib/normalizeFeibot";

// ===== Helpers =====
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

// ✅ Fix mojibake + limpieza separadores (SSR-safe)
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

  // limpia separadores raros de nombres
  out = out.replace(/;/g, " ").replace(/\s+/g, " ").trim();
  return out;
}

export async function getServerSideProps({ params, query }) {
  const { eventKey } = params;

  try {
    // 1) Config
    const config = loadEventConfig(eventKey);
    if (!config?.feibot?.publicKey) return { notFound: true };

    // 2) Query params
    const page = Math.max(1, toInt(query.page, 1));
    const pageSize = Math.min(100, Math.max(10, toInt(query.pageSize, 25)));
    const q = (query.q ?? "").toString().trim();
    const itemId = query.itemId ? toInt(query.itemId, null) : null;

    // 3) Feibot + normalización base (race/items/stats)
    const raw = await fetchFeibotRace(config.feibot.publicKey);
    const base = normalizeFeibot(raw);

    // 4) Scores (limpiar textos aquí porque raw.scores se usa directo)
    const allScoresRaw = Array.isArray(raw?.scores) ? raw.scores : [];
    const allScores = allScoresRaw.map((r) => ({
      ...r,
      name: fixText(r?.name),
      item_name: fixText(r?.item_name),
      city: fixText(r?.city),
      country: fixText(r?.country),
      team: fixText(r?.team)
    }));

    // 5) Ranking real por categoría (tiempo neto asc)
    const rankMap = new Map();
    const groups = new Map();

    for (const r of allScores) {
      const catId = Number(r?.item_id ?? 0);
      if (!groups.has(catId)) groups.set(catId, []);
      groups.get(catId).push(r);
    }

    for (const [catId, arr] of groups.entries()) {
      const sorted = [...arr].sort(
        (a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b))
      );

      sorted.forEach((r, idx) => {
        const bib = String(r?.bib ?? "");
        const key = `${catId}::${bib}`;
        rankMap.set(key, idx + 1);
      });
    }

    // 6) Filtrar por categoría (si aplica)
    let filteredBase = itemId
      ? allScores.filter((r) => Number(r?.item_id) === Number(itemId))
      : allScores;

    // 7) Orden base: menor tiempo neto primero (ranking)
    let filtered = [...filteredBase].sort(
      (a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b))
    );

    // 8) Búsqueda (nombre / bib / doc)
    if (q) {
      const qq = q.toLowerCase();
      filtered = filtered.filter((r) => {
        const name = (r?.name ?? "").toString().toLowerCase();
        const bib = (r?.bib ?? "").toString().toLowerCase();
        const idCard = (r?.id_card ?? "").toString().toLowerCase();
        return name.includes(qq) || bib.includes(qq) || idCard.includes(qq);
      });
    }

    // 9) Paginación
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    const rows = filtered.slice(start, start + pageSize);

    // 10) Enriquecer filas con Posición categoría (rankMap)
    const rowsWithRank = rows.map((r) => {
      const catId = Number(r?.item_id ?? 0);
      const bib = String(r?.bib ?? "");
      const key = `${catId}::${bib}`;
      const categoryRank = rankMap.get(key) ?? null;
      return { ...r, categoryRank };
    });

    // 11) Payload final
    const data = {
      ...base,
      results: rowsWithRank,
      resultsMeta: {
        total,
        page: safePage,
        pageSize,
        totalPages,
        q,
        itemId
      }
    };

    return { props: { config, data } };
  } catch (error) {
    return {
      props: {
        error: error?.message ?? "Error cargando resultados",
        config: null,
        data: null
      }
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

  const basePath = `/e/${config.eventKey ?? ""}/results`;

  const makeHref = (patch) => {
    const nextQ = buildQuery(
      {
        page: meta.page,
        pageSize: meta.pageSize,
        q: meta.q,
        itemId: meta.itemId
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
            marginBottom: 16
          }}
        >
          {/* búsqueda */}
          <form
            action={basePath}
            method="GET"
            style={{ display: "flex", gap: 8, alignItems: "center" }}
          >
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
                minWidth: 260
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
                cursor: "pointer"
              }}
            >
              Buscar
            </button>

            {meta.q || meta.itemId ? (
              <Link
                href={makeHref({ q: "", itemId: "", page: 1 })}
                style={{ padding: "10px 8px", display: "inline-block" }}
              >
                Limpiar
              </Link>
            ) : null}
          </form>

          {/* categoría */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>Categoría:</span>
            <select
              value={meta.itemId ?? "all"}
              onChange={(e) => {
                const v = e.target.value;
                window.location.href = makeHref({ itemId: v === "all" ? "" : v, page: 1 });
              }}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd"
              }}
            >
              <option value="all">Todas</option>
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.title}
                </option>
              ))}
            </select>
          </div>

          {/* page size */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>Por página:</span>
            <select
              value={meta.pageSize ?? 25}
              onChange={(e) => {
                window.location.href = makeHref({ pageSize: e.target.value, page: 1 });
              }}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd"
              }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* meta */}
        <div style={{ marginBottom: 12, fontSize: 14, opacity: 0.8 }}>
          {meta.total ?? 0} resultados — página {meta.page ?? 1} de {meta.totalPages ?? 1}
        </div>

        {/* tabla */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 820 }}>
            <thead>
              <tr>
                {["#", "Pos. Cat.", "Nombre", "Bib", "Categoría", "Tiempo (neto/oficial)"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "10px 8px",
                      borderBottom: "1px solid #eee",
                      fontSize: 13,
                      opacity: 0.8,
                      whiteSpace: "nowrap"
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
                const bib = r?.bib ?? "";

                return (
                  <tr key={r.id ?? `${bib}-${idx}`}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {absoluteIndex}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {r?.categoryRank ?? "-"}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {bib ? (
                        <Link
                          href={`/e/${config.eventKey}/runner/${encodeURIComponent(String(bib))}`}
                          style={{ fontWeight: 800, textDecoration: "none" }}
                        >
                          {r?.name ?? "-"}
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 800 }}>{r?.name ?? "-"}</span>
                      )}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {bib || "-"}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {r?.item_name ?? "-"}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {time || "-"}
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 18, opacity: 0.7 }}>
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

          <Link
            href={makeHref({ page: meta.totalPages ?? 1 })}
            style={{ padding: "8px 10px", display: "inline-block" }}
          >
            ⟫
          </Link>
        </div>
      </section>
    </EventShell>
  );
}




