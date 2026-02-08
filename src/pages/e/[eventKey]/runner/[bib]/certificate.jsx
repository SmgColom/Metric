// src/pages/e/[eventKey]/runner/[bib]/certificate.jsx
import dynamic from "next/dynamic";
import Link from "next/link";
import EventShell from "@/components/event/EventShell";

import { loadEventConfig } from "@/lib/loadEventConfig";
import { fetchFeibotRace } from "@/lib/feibot";
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

  // típicos casos: "RINCÃ" / "HernÃ¡ndez"
  const looksBroken = /Ã.|Â./.test(s);
  let out = s;

  if (looksBroken) {
    try {
      out = Buffer.from(s, "latin1").toString("utf8");
    } catch {
      out = s;
    }
  }

  // separadores raros vistos en nombres: ";" o "¡"
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
  };
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
          categoryRank: null,
        },
      };
    }

    const raw = await fetchFeibotRace(config.feibot.publicKey);
    const base = normalizeFeibot(raw);

    const allScoresRaw = Array.isArray(raw?.scores) ? raw.scores : [];
    const allScores = allScoresRaw.map(sanitizeRunner);

    const runnerRaw = allScores.find((r) => String(r?.bib ?? "") === String(bib));
    if (!runnerRaw) return { notFound: true };

    const runner = runnerRaw;

    // Rank por categoría (por tiempo neto)
    const catId = Number(runner?.item_id ?? 0);
    const sameCategory = allScores.filter((r) => Number(r?.item_id ?? 0) === catId);

    const sorted = [...sameCategory].sort(
      (a, b) => timeToSeconds(getTimeValue(a)) - timeToSeconds(getTimeValue(b))
    );

    const categoryRank = sorted.findIndex((r) => String(r?.bib ?? "") === String(bib)) + 1;

    return {
      props: {
        config,
        data: base,
        runner,
        categoryRank: categoryRank > 0 ? categoryRank : null,
      },
    };
  } catch (error) {
    return {
      props: {
        error: error?.message ?? "Error cargando certificado",
        config: null,
        data: null,
        runner: null,
        categoryRank: null,
      },
    };
  }
}

export default function CertificatePage({ config, data, runner, categoryRank, error }) {
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

  if (!config || !runner) {
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

  const backHref = `/e/${config.eventKey}/runner/${encodeURIComponent(String(runner?.bib ?? ""))}`;

  return (
    <EventShell config={config} data={data}>
      {/* Acciones arriba */}
      <div style={{ paddingTop: 10 }}>
      </div>

      {/* ✅ react-pdf vive aquí, pero solo en cliente */}
      <CertificateClient
        config={config}
        data={data}
        runner={runner}
        categoryRank={categoryRank}
      />
    </EventShell>
  );
}


