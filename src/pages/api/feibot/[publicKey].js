import { fetchFeibotRace } from "@/lib/feibot";

export default async function handler(req, res) {
  const { publicKey } = req.query;

  if (!publicKey || typeof publicKey !== "string") {
    return res.status(400).json({ error: "Missing publicKey" });
  }

  try {
    const data = await fetchFeibotRace(publicKey);

    // Cache CDN (Vercel)
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

    return res.status(200).json(data);
  } catch (error) {
    console.error("Feibot API error:", error);
    return res.status(500).json({
      error: "Failed to fetch Feibot data",
      message: error?.message ?? String(error),
    });
  }
}

