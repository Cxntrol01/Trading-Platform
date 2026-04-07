"use client";

import { useEffect, useState } from "react";

interface Trade {
  price: number;
  qty: number;
  side: "buy" | "sell";
  time: number;
}

export default function TradesFeed({ symbol }: { symbol: string }) {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const trade: Trade = {
        price: parseFloat(data.p),
        qty: parseFloat(data.q),
        side: data.m ? "sell" : "buy", // Binance: m=true means buyer is market maker → SELL
        time: data.T,
      };

      setTrades((prev) => {
        const updated = [trade, ...prev];
        return updated.slice(0, 50); // keep last 50
      });
    };

    return () => ws.close();
  }, [symbol]);

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-3">Recent Trades</h2>

      <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
        {trades.map((t, i) => (
          <div
            key={i}
            className="flex justify-between text-sm"
          >
            <span className={t.side === "buy" ? "text-green-400" : "text-red-400"}>
              {t.price.toFixed(2)}
            </span>
            <span>{t.qty.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
