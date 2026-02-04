// src/pages/e/[eventKey]/live.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import EventShell from "@/components/event/EventShell";

import { loadEventConfig } from "@/lib/loadEventConfig";
import { fetchFeibotRace } from "@/lib/feibot";
import { normalizeFeibot } from "@/lib/normalizeFeibot";
import { feibotI18n } from "@/lib/i18n";

// ===== i18n =====
const dict = feibotI18n?.es ?? {};
const tKey = (k) => dict[k] ?? k;

// ===== Helpers =====
function toInt(v, fallback) {
  const n = parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) ? n : fallback;
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

function safeStr(v) {
  if (v === undefined || v === null || v === "") return "-";
  return String(v);
}

/**
 * Calcula el rank por categoría (pos. cat.) basado en net_score/total_score.
 * OJO: con 1950 corredores está bien hacerlo cada 15s (pero evita 1s).
 */
function buildCategoryRankMap(scores) {
  const rankMap = new Map();

  const groups = new Map();
  for (const r of scores) {
    const item = Number(r?.item_id ?? 0);
    if (!groups.has(item)) groups.set(item, []);
    groups.get(item).push(r);
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

  return rankMap;
}

// ===== SSR =====
export async function getServerSideProps({ params, query }) {
  const { eventKey } = params;

  try {
    const config = loadEventConfig(eventKey);
    if (!config?.feibot?.publicKey) return { notFound: true };

    // filtros iniciales (desde query)
    const page = Math.max(1, toInt(query.page, 1));
    const pageSize = Math.min(100, Math.max(10, toInt(query.pageSize, 25)));
    const q = (query.q ?? "").toString().trim();
    const itemId = query.itemId ? toInt(query.itemId, null) : null;

    // data inicial
    const raw = await fetchFeibotRace(config.feibot.publicKey);
    const base = normalizeFeibot(raw);

    return {
      props: {
        config,
        initialBase: base,
        initialRaw: raw,
        initialFilters: { page, pageSize, q, itemId },
      },
    };
  } catch (error) {
    return {
      props: {
        error: error?.message ?? "Error cargando resultados en vivo",
        config: null,
        initialBase: null,
        initialRaw: null,
        initialFilters: { page: 1, pageSize: 25, q: "", itemId: null },
      },
    };
  }
}

// ===== Page =====
export default function LiveResultsPage({
  config,
  initialBase,
  initialRaw,
  initialFilters,
  error,
}) {
  if (error || !config || !initialBase || !initialRaw) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Resultados en vivo no disponibles</h1>
        <p>{error ?? "No se pudo cargar el evento."}</p>
        <Link href="/" style={{ display: "inline-block", padding: "8px 0" }}>
          Volver
        </Link>
      </div>
    );
  }

  // estado del "live"
  const [raw, setRaw] = useState(initialRaw);
  const [base, setBase] = useState(initialBase);

  // filtros live (cliente)
  const [q, setQ] = useState(initialFilters?.q ?? "");
  const [itemId, setItemId] = useState(initialFilters?.itemId ?? "");
  const [pageSize, setPageSize] = useState(initialFilters?.pageSize ?? 25);
  const [page, setPage] = useState(initialFilters?.page ?? 1);

  // polling
  const [isLive, setIsLive] = useState(true);
  const [intervalSec, setIntervalSec] = useState(15);
  const [lastUpdatedAt, setLastUpdatedAt] = useState(Date.now());
  const [liveError, setLiveError] = useState("");

  const timerRef = useRef(null);

  // refresco (cliente)
  async function refresh() {
    try {
      setLiveError("");
      const nextRaw = await fetchFeibotRace(config.feibot.publicKey);
      const nextBase = normalizeFeibot(nextRaw);
      setRaw(nextRaw);
      setBase(nextBase);
      setLastUpdatedAt(Date.now());
    } catch (e) {
      setLiveError(e?.message ?? "Error actualizando en vivo");
    }
  }

  // auto-polling
  useEffect(() => {
    if (!isLive) return;

    // primer refresh suave (opcional)
    // refresh();

    timerRef.current = setInterval(() => {
      refresh();
    }, Math.max(5, intervalSec) * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLive, intervalSec, config?.feibot?.publicKey]);

  // derived data
  const allScores = raw?.scores ?? [];
  const items = base?.race?.items ?? [];

  const rankMap = useMemo(() => buildCategoryRankMap(allScores), [allScores]);

  const filtered = useMemo(() => {
    let list = allScores;

    if (itemId) {
      list = list.filter((r) => Number(r?.item_id ?? 0) === Number(itemId));
    }

    // orden por neto/oficial
    list = [...list].sort(
      (a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b))
    );

    if (q.trim()) {
      const qq = q.toLowerCase();
      list = list.filter((r) => {
        const name = (r?.name ?? "").toString().toLowerCase();
        const bib = (r?.bib ?? "").toString().toLowerCase();
        const idCard = (r?.id_card ?? "").toString().toLowerCase();
        return name.includes(qq) || bib.includes(qq) || idCard.includes(qq);
      });
    }

    return list;
  }, [allScores, itemId, q]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  const rows = useMemo(() => {
    const slice = filtered.slice(start, start + pageSize);
    return slice.map((r) => {
      const catId = Number(r?.item_id ?? 0);
      const bib = String(r?.bib ?? "");
      const key = `${catId}::${bib}`;
      const categoryRank = rankMap.get(key) ?? null;
      return { ...r, categoryRank };
    });
  }, [filtered, start, pageSize, rankMap]);

  // "hace X segundos"
  const secondsAgo = Math.floor((Date.now() - lastUpdatedAt) / 1000);

  const backHref = `/e/${config.eventKey}/results`;
  const resultsHref = `/e/${config.eventKey}/results`;

  return (
    <EventShell config={config} data={base}>
      <section style={{ paddingTop: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ margin: "0 0 12px" }}>Resultados en vivo</h1>

          <Link href={resultsHref} style={{ opacity: 0.8 }}>
            Ver resultados (paginado)
          </Link>
        </div>

        {/* Barra Live */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            padding: "10px 12px",
            border: "1px solid #eee",
            borderRadius: 12,
            marginBottom: 14,
          }}
        >
          <span style={{ fontWeight: 800 }}>
            Estado:{" "}
            <span style={{ color: isLive ? "var(--primary)" : "#888" }}>
              {isLive ? "EN VIVO" : "PAUSADO"}
            </span>
          </span>

          <button
            type="button"
            onClick={() => setIsLive((v) => !v)}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            {isLive ? "Pausar" : "Reanudar"}
          </button>

          <button
            type="button"
            onClick={() => refresh()}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              background: "var(--primary)",
              color: "#0B1220",
              cursor: "pointer",
              fontWeight: 900,
            }}
          >
            Actualizar ahora
          </button>

          <div style={{ opacity: 0.8, fontSize: 14 }}>
            Actualizado hace {secondsAgo}s
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>Cada:</span>
            <select
              value={intervalSec}
              onChange={(e) => setIntervalSec(toInt(e.target.value, 15))}
              style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd" }}
            >
              {[5, 10, 15, 30, 60].map((n) => (
                <option key={n} value={n}>
                  {n}s
                </option>
              ))}
            </select>
          </div>

          {liveError ? (
            <span style={{ color: "#b00020", fontWeight: 700 }}>
              {liveError}
            </span>
          ) : null}
        </div>

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
          <input
            value={q}
            onChange={(e) => {
              setPage(1);
              setQ(e.target.value);
            }}
            placeholder="Buscar por nombre, bib o documento…"
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              minWidth: 260,
            }}
          />

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>Categoría:</span>
            <select
              value={itemId || "all"}
              onChange={(e) => {
                setPage(1);
                const v = e.target.value;
                setItemId(v === "all" ? "" : v);
              }}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
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

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>Por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPage(1);
                setPageSize(toInt(e.target.value, 25));
              }}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          {(q || itemId) ? (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setItemId("");
                setPage(1);
              }}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "white",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Limpiar
            </button>
          ) : null}
        </div>

        {/* meta */}
        <div style={{ marginBottom: 12, fontSize: 14, opacity: 0.8 }}>
          {total} resultados — página {safePage} de {totalPages}
        </div>

        {/* tabla */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 980 }}>
            <thead>
              <tr>
                {["#", "Pos. Cat.", "Nombre", "Bib", "Categoría", "Tiempo (neto/oficial)", "Ritmo"].map(
                  (h) => (
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
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {rows.map((r, idx) => {
                const absoluteIndex = (safePage - 1) * pageSize + idx + 1;
                const time = r?.net_score ?? r?.total_score ?? "";
                const pace = r?.pace ?? "-";
                const bib = r?.bib ?? "";

                return (
                  <tr key={r.id ?? `${r.bib}-${idx}`}>
                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {absoluteIndex}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {r?.categoryRank ?? "-"}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {bib ? (
                        <Link
                          href={`/e/${config.eventKey}/runner/${encodeURIComponent(bib)}`}
                          style={{ fontWeight: 800, textDecoration: "none" }}
                        >
                          {safeStr(r?.name)}
                        </Link>
                      ) : (
                        <strong>{safeStr(r?.name)}</strong>
                      )}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {bib || "-"}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {safeStr(r?.item_name)}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {time || "-"}
                    </td>

                    <td style={{ padding: "10px 8px", borderBottom: "1px solid #f2f2f2" }}>
                      {pace || "-"}
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 18, opacity: 0.7 }}>
                    No hay resultados para estos filtros.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* paginación (cliente) */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 16 }}>
          <button
            type="button"
            onClick={() => setPage(1)}
            style={pagerBtnStyle}
            disabled={safePage <= 1}
          >
            ⟪
          </button>

          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={pagerBtnStyle}
            disabled={safePage <= 1}
          >
            Anterior
          </button>

          <span style={{ fontSize: 14, opacity: 0.8 }}>
            Página {safePage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={pagerBtnStyle}
            disabled={safePage >= totalPages}
          >
            Siguiente
          </button>

          <button
            type="button"
            onClick={() => setPage(totalPages)}
            style={pagerBtnStyle}
            disabled={safePage >= totalPages}
          >
            ⟫
          </button>
        </div>

        <div style={{ marginTop: 14, opacity: 0.7, fontSize: 13 }}>
          Tip: usa 15s o 30s para no saturar el API.
        </div>

        <div style={{ marginTop: 14 }}>
          <Link href={backHref} style={{ opacity: 0.8 }}>
            ← Volver a resultados (paginado)
          </Link>
        </div>
      </section>
    </EventShell>
  );
}

const pagerBtnStyle = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  cursor: "pointer",
  fontWeight: 800,
};
