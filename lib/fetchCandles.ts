export async function fetchCandles(symbol: string, timeframe: string) {
  try {
    const url = `/api/candles?symbol=${symbol}&timeframe=${timeframe}`;

    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Failed to fetch candles");
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("fetchCandles error:", err);
    return [];
  }
}
