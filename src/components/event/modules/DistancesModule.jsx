export default function DistancesModule({ data }) {
  const items = data?.race?.items ?? [];

  return (
    <section id="distances" style={{ marginTop: 20 }}>
      <h2>Distancias</h2>
      <ul>
        {items.map((it) => (
          <li key={it.id}>
            {it.title} — {it.distanceKm}K
          </li>
        ))}
      </ul>
    </section>
  );
}

