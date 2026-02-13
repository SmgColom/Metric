// ResultsPreviewModule.jsx

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

function getNetTime(r) {
  return r?.net_score ?? r?.total_score ?? "";
}

function isFinisher(r) {
  return Number(r?.finisher) === 1;
}

function getCategoryKey(r) {
  const id = r?.item_id;
  if (id !== undefined && id !== null && String(id) !== "") return `id:${id}`;
  return `name:${String(r?.item_name ?? "Categoría")}`;
}

function getTopByCategory(scores, topN = 3) {
  const finishers = (Array.isArray(scores) ? scores : []).filter(isFinisher);
  const groupsMap = new Map();

  for (const r of finishers) {
    const key = getCategoryKey(r);
    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        item_id: r?.item_id ?? null,
        item_name: r?.item_name ?? "Categoría",
        runners: [],
      });
    }
    groupsMap.get(key).runners.push(r);
  }

  const groups = Array.from(groupsMap.values()).map((g) => {
    const sorted = g.runners
      .slice()
      .sort((a, b) => timeToSeconds(getNetTime(a)) - timeToSeconds(getNetTime(b)));

    return {
      ...g,
      top: sorted.slice(0, topN).map((r, idx) => ({
        ...r,
        rank_in_category: idx + 1,
      })),
    };
  });

  groups.sort((a, b) => String(a.item_name).localeCompare(String(b.item_name), "es"));

  return groups;
}

export default function ResultsPreviewModule({ data, module }) {
  // ✅ Top N por categoría
  const topN = Number(module?.limit ?? 3);

  /**
   * ✅ Fuente #1 (PRO): lo que ya calculaste en SSR
   * data.summary.resultsPreviewByCategory = [{ item_name, top: [...] }, ...]
   */
  const ssrGroups = data?.summary?.resultsPreviewByCategory;

  let groups = [];

  if (Array.isArray(ssrGroups) && ssrGroups.length) {
    // Aseguramos topN por si el JSON cambió
    groups = ssrGroups.map((g) => ({
      ...g,
      key: g?.item_id ? `id:${g.item_id}` : `name:${g.item_name}`,
      top: (Array.isArray(g?.top) ? g.top : []).slice(0, topN).map((r, idx) => ({
        ...r,
        rank_in_category: r?.rank_in_category ?? idx + 1,
      })),
    }));
  } else {
    /**
     * ✅ Fallback local (por si summary no viene por alguna razón)
     * OJO: normalmente normalizeFeibot NO trae data.scores, por eso intentamos varias fuentes.
     */
    const fallbackScores =
      (Array.isArray(data?.scores) && data.scores) ||
      (Array.isArray(data?.resultsPreview) && data.resultsPreview) ||
      (Array.isArray(data?.summary?.top10) && data.summary.top10) ||
      [];

    groups = getTopByCategory(fallbackScores, topN);
  }

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Resultados (previsualización)</h2>

      {groups.length === 0 ? (
        <div style={{ padding: 10, opacity: 0.75 }}>
          No hay finalizadores para mostrar.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {groups.map((g) => (
            <div
              key={g.key ?? g.item_name}
              style={{
                border: "1px solid #eee",
                borderRadius: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "10px 14px",
                  borderBottom: "1px solid #eee",
                  fontWeight: 900,
                }}
              >
                {g.item_name ?? "Categoría"}
              </div>

              <div style={{ padding: 10, display: "grid", gap: 8 }}>
                {(g.top ?? []).map((r, idx) => (
                  <div
                    key={`${g.key}-${String(r?.bib ?? idx)}`}
                    style={{
                      padding: 10,
                      border: "1px solid #ddd",
                      borderRadius: 10,
                    }}
                  >
                    <strong>#{r?.rank_in_category ?? idx + 1}</strong>{" "}
                    — <strong>{r?.name ?? "Corredor"}</strong>{" "}
                    — #{r?.bib ?? "-"} — {getNetTime(r) || "-"}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}


