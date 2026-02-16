// src/pages/e/[eventKey]/runner/certificate.jsx
import dynamic from "next/dynamic";
import Link from "next/link";
import EventShell from "@/components/event/EventShell";
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

  // ✅ robusto: bib puede venir como ?bib=1105 o (si queda alguna ruta vieja) params.bib
  const bibRaw =
    (Array.isArray(query?.bib) ? query.bib[0] : query?.bib) ??
    (Array.isArray(params?.bib) ? params.bib[0] : params?.bib) ??
    "";

  const bib = String(bibRaw).trim();

  try {
    const config = loadEventConfig(eventKey);
    if (!config?.feibot?.publicKey) return { notFound: true };

    res?.setHeader?.("Cache-Control", "s-maxage=15, stale-while-revalidate=120");

    // ✅ casos inválidos
    if (!bib) {
      return {
        props: {
          error: "No se especificó dorsal (bib). Ej: /runner/certificate?bib=1105",
          config,
          data: null,
          runner: null,
          computed: null,
          eventKey,
          bib: null,
        },
      };
    }

    // ✅ si una ruta vieja está capturando /runner/certificate como [bib]="certificate"
    if (bib.toLowerCase() === "certificate") {
      return {
        props: {
          error:
            'La ruta dinámica antigua está capturando "certificate" como bib. Asegúrate de usar /runner/certificate?bib=XXXX y agrega el redirect en /runner/[bib]/certificate.jsx.',
          config,
          data: null,
          runner: null,
          computed: null,
          eventKey,
          bib,
        },
      };
    }

    const raw = await fetchFeibotRace(config.feibot.publicKey);

    // ✅ base info del evento (pero SIN scores gigantes)
    const baseFull = normalizeFeibot(raw);
    const { scores: _scoresOmit, ...base } = baseFull ?? {};
    if (base?.race?.scores) delete base.race.scores;

    const allScores = Array.isArray(raw?.scores) ? raw.scores : [];

    // ✅ match robusto (bib puede venir numérico o string)
    const bibAsNumber = Number(bib);
    const bibAlt = Number.isFinite(bibAsNumber) ? String(bibAsNumber) : null;

    const runnerRaw =
      allScores.find((r) => String(r?.bib ?? "").trim() === bib) ??
      (bibAlt ? allScores.find((r) => String(r?.bib ?? "").trim() === bibAlt) : null) ??
      null;

    if (!runnerRaw) {
      return {
        props: {
          error: "Corredor no encontrado para ese bib.",
          config,
          data: base,
          runner: null,
          computed: null,
          eventKey,
          bib,
        },
      };
    }

    const runner = sanitizeRunner(runnerRaw);

    const computed = {
      // tiempos
      total_score: runner?.total_score ?? null,
      net_score: runner?.net_score ?? null,

      // ritmo visible
      paceDisplay: formatPace(runner?.pace),

      // posiciones (net)
      overallRankNet: runner?.net_ranking ?? null,
      categoryRankNet: runner?.item_net_ranking ?? null,
      genderRankNet: computeGenderRankNet(allScores, runner),

      // total corredores
      totalFinishers: allScores.length,
    };

    return {
      props: {
        config,
        data: base,
        runner,
        computed,
        eventKey,
        bib,
      },
    };
  } catch (error) {
    return {
      props: {
        error: error?.message ?? "Error cargando certificado",
        config: null,
        data: null,
        runner: null,
        computed: null,
        eventKey,
        bib: bib || null,
      },
    };
  }
}

export default function CertificatePage({
  config,
  data,
  runner,
  computed,
  error,
  eventKey,
  bib,
}) {
  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Certificado no disponible</h1>
        <p>{error}</p>
        <Link
          href={`/e/${eventKey ?? ""}/results`}
          style={{ display: "inline-block", padding: "8px 0" }}
        >
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
        <Link
          href={`/e/${eventKey ?? ""}/results`}
          style={{ display: "inline-block", padding: "8px 0" }}
        >
          Volver
        </Link>
      </div>
    );
  }

  const safeEventKey = config?.eventKey ?? eventKey ?? "";
  const safeBib = String(runner?.bib ?? bib ?? "");

  return (
    <EventShell config={{ ...config, eventKey: safeEventKey }} data={data}>
      <div style={{ padding: "10px 0 14px", display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link
          href={`/e/${safeEventKey}/runner?bib=${encodeURIComponent(safeBib)}`}
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #ddd",
            textDecoration: "none",
            fontWeight: 800,
            display: "inline-block",
          }}
        >
          ← Volver al corredor
        </Link>

        <Link
          href={`/e/${safeEventKey}/results`}
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
      </div>

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






