// src/pages/e/[eventKey]/runner/[bib]/certificate.jsx
import dynamic from "next/dynamic";
import Link from "next/link";
import EventShell from "@/components/event/EventShell";

import { loadEventConfig } from "@/lib/loadEventConfig";
import { normalizeFeibot } from "@/lib/normalizeFeibot";

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

export async function getServerSideProps({ params }) {
  const { eventKey, bib } = params;

  try {
    const config = loadEventConfig(eventKey);
    if (!config?.feibot?.publicKey) return { notFound: true };

    // ✅ Si el evento no tiene certificado activado, 404
    if (!config?.certificate?.enabled) return { notFound: true };

    // ✅ Validación mínima del template
    const tpl = config?.certificate?.template;
    if (!tpl?.src || !tpl?.width || !tpl?.height) {
      return {
        props: {
          error:
            "El certificado está habilitado pero falta configurar certificate.template (src/width/height) en el JSON del evento.",
          config: null,
          data: null,
          runner: null,
          computed: null,
          eventKey,
          bib,
        },
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/feibot/${config.feibot.publicKey}`);
    if (!res.ok) throw new Error("Feibot API failed");

    const raw = await res.json();
    const base = normalizeFeibot(raw);

    const allScoresRaw = Array.isArray(raw?.scores) ? raw.scores : [];
    const allScores = allScoresRaw.map(sanitizeRunner);

    const runner = allScores.find((r) => String(r?.bib ?? "") === String(bib));
    if (!runner) return { notFound: true };

    // ✅ Total corredores (finalizadores)
    const totalFinishers = allScores.filter((r) => Number(r?.finisher) === 1).length;

    // ✅ Posición general (net) desde Feibot
    const overallRankNet = runner?.net_ranking ?? null;

    // ✅ Posición por categoría (net) desde Feibot (si existe)
    const categoryRankNetFromApi = runner?.item_net_ranking ?? null;

    // ✅ Fallback categoría si no viene item_net_ranking
    let categoryRankFallback = null;
    if (!categoryRankNetFromApi) {
      const catId = Number(runner?.item_id ?? 0);
      const sameCategory = allScores.filter((r) => Number(r?.item_id ?? 0) === catId);
      const sorted = [...sameCategory].sort(
        (a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b))
      );
      const idx = sorted.findIndex((r) => String(r?.bib ?? "") === String(bib));
      categoryRankFallback = idx >= 0 ? idx + 1 : null;
    }

    // ✅ Posición por género (net) calculada
    const genderRankNet = computeGenderRankNet(allScores, runner);

    // ✅ Género (F/M)
    const sexDisplay = runner?.sex || "-";

    // ✅ Ritmo con unidad
    const paceDisplay = formatPace(runner?.pace);

    return {
      props: {
        config,
        data: base,
        runner,
        eventKey, // ✅ usa SIEMPRE el del route
        bib,

        computed: {
          sexDisplay, // Género
          paceDisplay, // Ritmo min/km
          overallRankNet, // Posición General
          categoryRankNet: categoryRankNetFromApi ?? categoryRankFallback, // Posición Categoría
          categoryRankNetFromApi, // opcional, por si lo quieres mostrar/debug
          categoryRankFallback, // opcional, por si lo quieres mostrar/debug
          genderRankNet, // Posición Género
          totalFinishers, // Total corredores (finalizadores)
        },
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
        bib,
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




