// src/components/event/EventShell.jsx
import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
  const eventKey = config?.eventKey;

  const title = seo?.title ?? data?.race?.title ?? "Evento";
  const description = seo?.description;
  const ogImage = seo?.ogImage;

  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ Resuelve hrefs una sola vez (evita recalcular en cada render)
  const navItems = useMemo(() => {
    return nav.map((item, idx) => {
      const href = resolveEventHref(eventKey, item?.href);
      const key = item?.href
        ? `${item.href}-${idx}`
        : `${item?.label ?? "nav"}-${idx}`;
      return { key, label: item?.label ?? "Link", href };
    });
  }, [nav, eventKey]);

  // ✅ Opcional: bloquear scroll cuando menú móvil está abierto
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

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
        {/* ✅ estilos inline con media queries (sin crear archivo scss) */}
        <style>{`
          .eventHeader {
            display: flex;
            align-items: center;
            gap: 14px;
            padding: 14px 18px;
            border-bottom: 1px solid rgba(0,0,0,0.06);
            position: sticky;
            top: 0;
            background: var(--bg);
            z-index: 40;
          }

          .eventLeft {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
          }

          .eventTitle {
            font-size: 18px;
            font-weight: 800;
            line-height: 1.1;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 40vw;
          }

          .eventNavDesktop {
            margin-left: auto;
            display: flex;
            gap: 18px;
            align-items: center;
          }

          .eventLink {
            text-decoration: none;
            color: inherit;
            font-weight: 600;
            padding: 8px 10px;
            border-radius: 10px;
          }
          .eventLink:hover {
            background: rgba(0,0,0,0.05);
          }

          .hamburgerBtn {
            margin-left: auto;
            display: none;
            border: none;
            background: transparent;
            font-size: 26px;
            line-height: 1;
            cursor: pointer;
            padding: 8px 10px;
            border-radius: 10px;
          }
          .hamburgerBtn:hover {
            background: rgba(0,0,0,0.05);
          }

          .mobilePanel {
            display: none;
            border-bottom: 1px solid rgba(0,0,0,0.06);
            background: var(--bg);
          }

          .mobilePanelInner {
            padding: 10px 18px 14px;
            display: grid;
            gap: 10px;
          }

          .mobileLink {
            text-decoration: none;
            color: inherit;
            font-weight: 700;
            padding: 12px 12px;
            border-radius: 12px;
            background: rgba(0,0,0,0.04);
          }
          .mobileLink:active {
            transform: scale(0.99);
          }

          /* ✅ solo en móvil activamos hamburger + panel */
          @media (max-width: 768px) {
            .eventNavDesktop { display: none; }
            .hamburgerBtn { display: inline-flex; align-items: center; justify-content: center; }
            .eventTitle { max-width: 52vw; }
            .mobilePanel.open { display: block; }
          }
        `}</style>

        {/* Header */}
        <header className="eventHeader">
          <div className="eventLeft">
            {branding?.logo ? (
              <img
                src={branding.logo}
                alt="logo"
                style={{ height: 44, width: 44, objectFit: "contain", borderRadius: 10 }}
              />
            ) : null}

            <div className="eventTitle">
              {branding?.nameOverride ?? data?.race?.title ?? "Evento"}
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="eventNavDesktop" aria-label="Navegación del evento">
            {navItems.map((item) => (
              <Link key={item.key} href={item.href} className="eventLink">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="hamburgerBtn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="event-mobile-nav"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </header>

        {/* Mobile panel */}
        <div
          id="event-mobile-nav"
          className={`mobilePanel ${menuOpen ? "open" : ""}`}
        >
          <div className="mobilePanelInner">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="mobileLink"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <main style={{ padding: 18 }}>{children}</main>
      </div>
    </>
  );
}






