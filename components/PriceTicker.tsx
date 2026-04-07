"use client";

import { useEffect, useState } from "react";

interface TickerData {
  price: number;
  change: number;
  percent: number;
}

export default function PriceTicker({ symbol }: { symbol: string }) {
  const [data, setData] = useState<TickerData>({
    price: 0,
    change: 0,
    percent: 0,
  });

  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
    );

    ws.onmessage = (event) => {
      const d = JSON.parse(event.data);

      const last = parseFloat(d.c);
      const open = parseFloat(d.o);

      const change = last - open;
      const percent = (change / open) * 100;

      setData({
        price: last,
        change,
        percent,
      });
    };

    return () => ws.close();
  }, [symbol]);

  const color = data.change >= 0 ? "text-green-400" : "text-red-400";

  return (
    <div className="flex items-center gap-4 bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg">
      <span className="text-xl font-bold">{symbol}</span>

      <span className={`text-xl font-semibold ${color}`}>
        {data.price.toFixed(2)}
      </span>

      <span className={`${color}`}>
        {data.change >= 0 ? "+" : ""}
        {data.change.toFixed(2)} ({data.percent.toFixed(2)}%)
      </span>
    </div>
  );
      }
