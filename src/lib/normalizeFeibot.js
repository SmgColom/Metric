export function normalizeFeibot(payload) {
  const race = payload?.race ?? {};
  const scores = payload?.scores ?? [];

  return {
    race: {
      id: race.id,
      title: race.title,
      dateTimeUnix: race.date_time,
      items: (race.items ?? []).map((it) => ({
        id: it.id,
        title: it.title,
        distanceM: it.distance,
        distanceKm: (it.distance ?? 0) / 1000
      }))
    },
    stats: { totalRunners: scores.length },
    resultsPreview: scores.slice(0, 20) // preview ampliable
  };
}


