export async function fetchBinanceCandles(symbol: string, interval: string) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=500`;

  const res = await fetch(url);
  const data = await res.json();

  return data.map((candle: any) => ({
    time: Math.floor(candle[0] / 1000),
    open: parseFloat(candle[1]),
    high: parseFloat(candle[2]),
    low: parseFloat(candle[3]),
    close: parseFloat(candle[4]),
  }));
}
