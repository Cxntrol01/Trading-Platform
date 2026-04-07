"use client";

import { useEffect, useState } from "react";

export default function PriceTicker({ symbol }: { symbol: string }) {
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    let ws: WebSocket;

    function connect() {
      ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`
      );

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.c) {
          setPrice(parseFloat(data.c));
        }
      };

      ws.onclose = () => {
        setTimeout(connect, 1000); // auto‑reconnect
      };
    }

    connect();

    return () => ws && ws.close();
  }, [symbol]);

  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-700">
      <h2 className="text-xl font-semibold mb-2">Live Price</h2>

      <div className="text-2xl font-bold text-green-400">
        {price ? price.toFixed(2) : "Loading..."}
      </div>
    </div>
  );
}
