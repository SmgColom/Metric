// src/components/event/EventShell.jsx
import Head from "next/head";
import Link from "next/link";

function resolveEventHref(eventKey, href = "./") {
  const ek = String(eventKey ?? "").trim();
  if (!ek) return "/"; // fallback seguro si falta eventKey

  const raw = String(href ?? "").trim();
  if (!raw || raw === "./") return `/e/${ek}`;

  // ✅ Si ya es absoluta, NO la toques
  if (raw.startsWith("/")) return raw;

  // ✅ Soporta "./results" => "/e/ek/results"
  if (raw.startsWith("./")) {
    const tail = raw.slice(2); // quita "./"
    return tail ? `/e/${ek}/${tail}` : `/e/${ek}`;
  }

  // ✅ Fallback: "results" => "/e/ek/results"
  return `/e/${ek}/${raw}`;
}

export default function EventShell({ config, data, children }) {
  const theme = config?.theme ?? {};
  const branding = config?.branding ?? {};
  const nav = Array.isArray(config?.nav) ? config.nav : [];
  const seo = config?.seo ?? {};

  // ✅ En vez de confiar en destructuring, normalizamos
  const eventKey = config?.eventKey;

  const title = seo?.title ?? data?.race?.title ?? "Evento";
  const description = seo?.description;
  const ogImage = seo?.ogImage;

  return (
    <>
      <Head>
        <title>{title}</title>
        {description ? <meta name="description" content={description} /> : null}
        {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      </Head>

      <div
        style={{
          "--primary": theme?.primary ?? "#00E676",
          "--secondary": theme?.secondary ?? "#0B1220",
          "--bg": theme?.bg ?? "#FFFFFF",
          "--text": theme?.text ?? "#0B1220",
          background: "var(--bg)",
          color: "var(--text)",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "14px 18px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
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
            {nav.map((item, idx) => {
              const href = resolveEventHref(eventKey, item?.href);
              const key = item?.href ? `${item.href}-${idx}` : `${item?.label ?? "nav"}-${idx}`;

              return (
                <Link
                  key={key}
                  href={href}
                  style={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}
                >
                  {item?.label ?? "Link"}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* Contenido */}
        <main style={{ padding: 18 }}>{children}</main>
      </div>
    </>
  );
}





