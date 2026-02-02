export async function fetchFeibotRace(publicKey) {
  const url = `https://time.feibot.com/api/scores-data/${publicKey}`;
  const res = await fetch(url);

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Feibot error ${res.status}: ${text}`);
  }

  return res.json();
}
