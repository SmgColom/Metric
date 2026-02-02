import Link from "next/link";

function formatUnix(unix) {
  if (!unix) return null;
  // unix viene en segundos
  const d = new Date(unix * 1000);
  return d.toLocaleString("es-CO", { dateStyle: "long", timeStyle: "short" });
}

function formatDistanceKm(meters) {
  const km = (Number(meters || 0) / 1000).toFixed(0);
  return `${km}K`;
}

export default function HeroModule({ config, data }) {
  const title = config?.branding?.nameOverride ?? data?.race?.title ?? "Evento";
  const heroImage = config?.branding?.heroImage;
  const dateLabel = formatUnix(data?.race?.dateTimeUnix ?? data?.race?.date_time ?? data?.race?.date_time);

  const items = data?.race?.items ?? [];
  const pills = items.slice(0, 6).map((it) => ({
    id: it.id,
    label: it.title ?? formatDistanceKm(it.distance ?? it.distanceM)
  }));

  const resultsHref = `/e/${config.eventKey}/results`;

  return (
    <section style={{ marginTop: 6 }}>
      {/* HERO */}
      <div
        style={{
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          minHeight: 280,
          background: heroImage
            ? `url(${heroImage}) center/cover no-repeat`
            : "linear-gradient(135deg, var(--secondary), var(--primary))"
        }}
      >
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.10) 100%)"
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            padding: 22,
            color: "#fff",
            maxWidth: 920
          }}
        >
          <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.05, letterSpacing: -0.5 }}>
            {title}
          </h1>

          {dateLabel ? (
            <p style={{ marginTop: 10, marginBottom: 0, opacity: 0.9, fontSize: 16 }}>
              {dateLabel}
            </p>
          ) : null}

          {/* Pills (distancias) */}
          {pills.length ? (
            <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
              {pills.map((p) => (
                <span
                  key={p.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    backdropFilter: "blur(6px)",
                    fontWeight: 700
                  }}
                >
                  {p.label}
                </span>
              ))}
            </div>
          ) : null}

          {/* CTAs */}
          <div style={{ marginTop: 18, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href={resultsHref}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 14px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 800,
                background: "var(--primary)",
                color: "#0B1220"
              }}
            >
              Ver resultados →
            </Link>

            <a
              href="#distances"
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "10px 14px",
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 800,
                background: "rgba(255,255,255,0.14)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.25)"
              }}
            >
              Ver distancias
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

