// src/pages/e/[eventKey]/runner/[bib]/certificate.jsx
import dynamic from "next/dynamic";
import Link from "next/link";
import EventShell from "@/components/event/EventShell";
import { toInt } from "@/lib/number";
import { loadEventConfig } from "@/lib/loadEventConfig";
import { normalizeFeibot } from "@/lib/normalizeFeibot";
import { fetchFeibotRace } from "@/lib/feibot";
import { fixText } from "@/lib/textUtils";

// ✅ react-pdf SOLO en cliente
const CertificateClient = dynamic(
  () => import("@/components/certificates/CertificateClient"),
  { ssr: false }
);

// ===== Helpers =====
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

  out = out.replace(/;/g, " ").replace(/¡/g, "").replace(/\s+/g, " ").trim();
  return out;
}

function sanitizeRunner(r) {
  if (!r || typeof r !== "object") return r;
  return {
    ...r,
    name: fixText(r?.name),
    item_name: fixText(r?.item_name),
    city: fixText(r?.city),
    country: fixText(r?.country),
    team: fixText(r?.team),
    sex: (r?.sex ?? r?.gender ?? "").toString().trim().toUpperCase(),
  };
}

// Ritmo con unidad
function formatPace(pace) {
  if (pace === null || pace === undefined) return "-";
  const s = String(pace).trim();
  if (!s) return "-";
  // si ya viene con unidad, no dupliques
  if (/min\/km/i.test(s)) return s;
  return `${s} min/km`;
}

// Posición por género (net) calculada
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


export default function CertificatePage({ config, data, runner, computed, error, eventKey, bib }) {
  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Certificado no disponible</h1>
        <p>{error}</p>
        <Link href="/" style={{ display: "inline-block", padding: "8px 0" }}>
          Volver
        </Link>
      </div>
    );
  }

  if (!config || !runner || !computed) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Certificado no disponible</h1>
        <p>No se pudo cargar la información del corredor.</p>
        <Link href="/" style={{ display: "inline-block", padding: "8px 0" }}>
          Volver
        </Link>
      </div>
    );
  }

  // ✅ si config.eventKey no existe, usamos eventKey del route
  const safeEventKey = config?.eventKey ?? eventKey ?? "";
  const safeBib = String(runner?.bib ?? bib ?? "");

  return (
    <EventShell config={{ ...config, eventKey: safeEventKey }} data={data}>
      {/* ✅ react-pdf vive aquí, pero solo en cliente */}
      <CertificateClient
        config={{ ...config, eventKey: safeEventKey }}
        data={data}
        runner={runner}
        computed={computed}
      />
    </EventShell>
  );
}




