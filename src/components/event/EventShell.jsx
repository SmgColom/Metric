import Head from "next/head";
import Link from "next/link";

function resolveEventHref(eventKey, href = "./") {
  // Acepta "./", "./results", "./live", "./certificates"
  const clean = href.replace(/^\.\//, ""); // "./results" -> "results"
  if (!clean) return `/e/${eventKey}`;
  return `/e/${eventKey}/${clean}`;
}

export default function EventShell({ config, data, children }) {
  const { theme, branding, nav, seo, eventKey } = config;

  return (
    <>
      <Head>
        <title>{seo?.title ?? data?.race?.title ?? "Evento"}</title>
        {seo?.description ? <meta name="description" content={seo.description} /> : null}
        {seo?.ogImage ? <meta property="og:image" content={seo.ogImage} /> : null}
      </Head>

      <div
        style={{
          "--primary": theme?.primary ?? "#00E676",
          "--secondary": theme?.secondary ?? "#0B1220",
          "--bg": theme?.bg ?? "#FFFFFF",
          "--text": theme?.text ?? "#0B1220",
          background: "var(--bg)",
          color: "var(--text)",
          minHeight: "100vh"
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 18px",
            borderBottom: "1px solid rgba(0,0,0,0.06)"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {branding?.logo ? (
              <img
                src={branding.logo}
                alt="logo"
                style={{ height: 44, width: "auto", objectFit: "contain" }}
              />
            ) : null}

            <strong style={{ fontSize: 18 }}>
              {branding?.nameOverride ?? data?.race?.title ?? "Evento"}
            </strong>
          </div>

          <nav style={{ marginLeft: "auto", display: "flex", gap: 18 }}>
            {(nav ?? []).map((item) => (
              <Link
                key={item.href}
                href={resolveEventHref(eventKey, item.href)}
                style={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        {/* Contenido */}
        <main style={{ padding: 18 }}>{children}</main>
      </div>
    </>
  );
}




