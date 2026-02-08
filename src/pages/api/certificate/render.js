import { PDFDocument, rgb } from "pdf-lib";
import fs from "fs/promises";
import path from "path";

import { loadEventConfig } from "@/lib/loadEventConfig";
import { fetchFeibotRace } from "@/lib/feibot";

// ✅ ajusta esta import según cómo guardes templates por evento
import { certificateTemplate as defaultTemplate } from "@/events/2728/certificate.template";

// ---- helpers ----
function safeText(v) {
  if (v === undefined || v === null) return "";
  return String(v);
}

// Centrado básico (aproximado). Para precisión, se puede medir texto con font.widthOfTextAtSize
function applyAlign({ x, align, text, font, size, pageWidth }) {
  if (align !== "center" && align !== "right") return x;

  const textWidth = font.widthOfTextAtSize(text, size);
  if (align === "center") return x - textWidth / 2;
  if (align === "right") return x - textWidth;
  return x;
}

function computeCategoryRank(allScores, bib) {
  const runner = allScores.find((r) => String(r?.bib ?? "") === String(bib));
  if (!runner) return null;

  const catId = Number(runner?.item_id ?? 0);
  const sameCategory = allScores.filter((r) => Number(r?.item_id ?? 0) === catId);

  // ordenar por net_score (fallback total_score)
  const timeToSeconds = (t) => {
    if (!t) return Number.POSITIVE_INFINITY;
    const parts = String(t).trim().split(":").map(Number);
    if (parts.some((n) => !Number.isFinite(n))) return Number.POSITIVE_INFINITY;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 1) return parts[0];
    return Number.POSITIVE_INFINITY;
  };

  const getTime = (r) => r?.net_score ?? r?.total_score ?? "";

  const sorted = [...sameCategory].sort((a, b) => timeToSeconds(getTime(a)) - timeToSeconds(getTime(b)));
  const pos = sorted.findIndex((r) => String(r?.bib ?? "") === String(bib)) + 1;

  return pos > 0 ? pos : null;
}

export default async function handler(req, res) {
  try {
    const { eventKey, bib } = req.query;
    if (!eventKey || !bib) {
      return res.status(400).json({ error: "Faltan parámetros eventKey o bib" });
    }

    // 1) cargar config + template (aquí lo dejo fijo para ejemplo)
    const config = loadEventConfig(eventKey);

    // ✅ aquí deberías escoger template por evento:
    // const template = loadCertificateTemplate(eventKey)
    const template = defaultTemplate;

    if (!config?.feibot?.publicKey) return res.status(404).json({ error: "Evento sin publicKey" });

    // 2) traer data
    const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

const res = await fetch(
  `${baseUrl}/api/feibot/${config.feibot.publicKey}`
);

if (!res.ok) throw new Error("Feibot API failed");

const raw = await res.json();
    const allScores = raw?.scores ?? [];
    const runner = allScores.find((r) => String(r?.bib ?? "") === String(bib));
    if (!runner) return res.status(404).json({ error: "Corredor no encontrado" });

    // 3) valores calculados
    const categoryRank = computeCategoryRank(allScores, bib);

    // 4) cargar PDF base
    const pdfPath = path.join(process.cwd(), "public", template.basePdfUrl.replace(/^\//, ""));
    const basePdfBytes = await fs.readFile(pdfPath);

    // 5) cargar fuente (para tildes/ñ)
    const fontPath = path.join(process.cwd(), "public", template.font.replace(/^\//, ""));
    const fontBytes = await fs.readFile(fontPath);

    const pdfDoc = await PDFDocument.load(basePdfBytes);
    const customFont = await pdfDoc.embedFont(fontBytes);

    const pages = pdfDoc.getPages();
    const page = pages[template.page ?? 0];
    const { width: pageWidth } = page.getSize();

    // 6) dibujar campos
    for (const f of template.fields) {
      let value = runner?.[f.key];

      // mapeos especiales
      if (f.key === "category_rank") value = categoryRank;
      if (f.key === "item_title") value = runner?.item_name; // ejemplo de alias

      const text = safeText(value);
      if (!text) continue;

      const size = Number(f.size ?? 16);
      const xAligned = applyAlign({
        x: Number(f.x),
        align: f.align,
        text,
        font: customFont,
        size,
        pageWidth,
      });

      // pdf-lib usa coordenadas desde abajo (0 abajo, sube hacia arriba)
      page.drawText(text, {
        x: xAligned,
        y: Number(f.y),
        size,
        font: customFont,
        color: rgb(0.05, 0.08, 0.12),
      });
    }

    // 7) devolver PDF
    const out = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="certificado-${eventKey}-${bib}.pdf"`);
    return res.status(200).send(Buffer.from(out));
  } catch (err) {
    return res.status(500).json({ error: err?.message ?? "Error generando certificado" });
  }
}
