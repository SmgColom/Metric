export default function ResultsPreviewModule({ data, module }) {
  const limit = module?.limit ?? 10;
  const rows = (data?.resultsPreview ?? []).slice(0, limit);

  return (
    <section style={{ marginTop: 16 }}>
      <h2>Resultados (preview)</h2>
      {rows.map((r) => (
        <div key={r.id} style={{ padding: 10, border: "1px solid #ddd", borderRadius: 10, marginBottom: 8 }}>
          <strong>{r.name}</strong> — #{r.bib} — {r.item_name} — {r.net_score ?? r.total_score}
        </div>
      ))}
    </section>
  );
}
