import { NextResponse } from "next/server";
import { fetchBinanceCandles } from "@/lib/binance";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const timeframe = searchParams.get("timeframe") || "1h";

  const candles = await fetchBinanceCandles(symbol, timeframe);

  return NextResponse.json({
    symbol,
    timeframe,
    candles,
  });
}
