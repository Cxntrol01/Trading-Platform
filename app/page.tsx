"use client";

import { useState } from "react";
import ChartWithIndicators from "@/components/ChartWithIndicators";

export default function Home() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [timeframe, setTimeframe] = useState("1h");

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <h1 className="text-3xl font-bold">Trading Dashboard</h1>

        {/* Controls */}
        <div className="flex gap-4">
          {/* Symbol selector */}
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="bg-gray-900 border border-gray-700 p-2 rounded"
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="BNBUSDT">BNB/USDT</option>
            <option value="SOLUSDT">SOL/USDT</option>
          </select>

          {/* Timeframe selector */}
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-gray-900 border border-gray-700 p-2 rounded"
          >
            <option value="1m">1m</option>
            <option value="5m">5m</option>
            <option value="15m">15m</option>
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1d">1d</option>
          </select>
        </div>

        {/* Chart + RSI */}
        <ChartWithIndicators symbol={symbol} timeframe={timeframe} />
      </div>
    </main>
  );
}
