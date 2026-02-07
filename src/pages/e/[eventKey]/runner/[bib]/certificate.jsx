import dynamic from "next/dynamic";
import Link from "next/link";
import EventShell from "@/components/event/EventShell";

import { loadEventConfig } from "@/lib/loadEventConfig";
import { fetchFeibotRace } from "@/lib/feibot";
import { normalizeFeibot } from "@/lib/normalizeFeibot";

// ✅ Importa el componente que usa react-pdf SOLO en cliente
const CertificateClient = dynamic(
  () => import("@/components/certificates/CertificateClient"),
  { ssr: false }
);

export async function getServerSideProps({ params }) {
  const { eventKey, bib } = params;

  try {
    const config = loadEventConfig(eventKey);
    if (!config?.feibot?.publicKey) return { notFound: true };

    const raw = await fetchFeibotRace(config.feibot.publicKey);
    const base = normalizeFeibot(raw);

    const allScores = raw?.scores ?? [];
    const runner = allScores.find((r) => String(r?.bib ?? "") === String(bib));
    if (!runner) return { notFound: true };

    // rank por categoría (net_score -> total_score)
    const getTimeValue = (r) => r?.net_score ?? r?.total_score ?? "";

    const timeToSeconds = (t) => {
      if (!t) return Number.POSITIVE_INFINITY;
      const s = String(t).trim();
      const parts = s.split(":").map((x) => Number(x));
      if (parts.some((n) => !Number.isFinite(n))) return Number.POSITIVE_INFINITY;
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      if (parts.length === 1) return parts[0];
      return Number.POSITIVE_INFINITY;
    };

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
  if (error || !config || !runner) {
    return (
      <div style={{ padding: 24 }}>
        <h1>Certificado no disponible</h1>
        <p>{error ?? "No se pudo cargar el certificado."}</p>
        <Link href="/" style={{ display: "inline-block", padding: "8px 0" }}>
          Volver
        </Link>
      </div>
    );
  }

  return (
    <EventShell config={config} data={data}>
      {/* react-pdf vive aquí, pero solo en cliente */}
      <CertificateClient
        config={config}
        data={data}
        runner={runner}
        categoryRank={categoryRank}
      />
    </EventShell>
  );
}

