"use client";

import { useEffect, useState } from "react";

export default function TradesFeed({ symbol }: { symbol: string }) {
  const [trades, setTrades] = useState<any[]>([]);

  useEffect(() => {
    let ws: WebSocket;

    function connect() {
      ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
      );

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        setTrades((prev) => {
          const updated = [data, ...prev];
          return updated.slice(0, 40); // keep last 40 trades
        });
      };

      ws.onclose = () => {
        setTimeout(connect, 1000); // auto reconnect
      };
    }

    connect();

    return () => ws && ws.close();
  }, [symbol]);

  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-700">
      <h2 className="text-xl font-semibold mb-2">Recent Trades</h2>

      <div className="max-h-64 overflow-auto text-sm space-y-1">
        {trades.map((t, i) => (
          <div
            key={i}
            className={`flex justify-between ${
              t.m ? "text-red-400" : "text-green-400"
            }`}
          >
            <span>{parseFloat(t.p).toFixed(2)}</span>
            <span>{parseFloat(t.q).toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
