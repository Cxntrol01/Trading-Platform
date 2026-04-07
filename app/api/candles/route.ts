import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const symbol = searchParams.get("symbol") || "BTCUSD";
  const timeframe = searchParams.get("timeframe") || "1h";

  // Temporary mock data
  const mock = [
    { time: 1710000000, open: 50000, high: 50500, low: 49800, close: 50200 },
    { time: 1710000600, open: 50200, high: 50800, low: 50100, close: 50700 },
    { time: 1710001200, open: 50700, high: 51000, low: 50500, close: 50900 },
  ];

  return NextResponse.json({
    symbol,
    timeframe,
    candles: mock,
  });
}
