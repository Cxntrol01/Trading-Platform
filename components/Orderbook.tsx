"use client";

import { useEffect, useState } from "react";

export default function Orderbook({ symbol }: { symbol: string }) {
  const [bids, setBids] = useState<any[]>([]);
  const [asks, setAsks] = useState<any[]>([]);

  useEffect(() => {
    let ws: WebSocket;

    function connect() {
      ws = new WebSocket(
        `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`
      );

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.b) setBids(data.b);
        if (data.a) setAsks(data.a);
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
      <h2 className="text-xl font-semibold mb-2">Orderbook</h2>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {/* Bids */}
        <div>
          <h3 className="text-green-400 font-semibold mb-1">Bids</h3>
          <div className="space-y-1 max-h-64 overflow-auto">
            {bids.map((b, i) => (
              <div key={i} className="flex justify-between">
                <span>{parseFloat(b[0]).toFixed(2)}</span>
                <span>{parseFloat(b[1]).toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asks */}
        <div>
          <h3 className="text-red-400 font-semibold mb-1">Asks</h3>
          <div className="space-y-1 max-h-64 overflow-auto">
            {asks.map((a, i) => (
              <div key={i} className="flex justify-between">
                <span>{parseFloat(a[0]).toFixed(2)}</span>
                <span>{parseFloat(a[1]).toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
