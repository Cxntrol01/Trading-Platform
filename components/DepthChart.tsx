"use client";

import { useEffect, useState } from "react";

export default function DepthChart({ symbol }: { symbol: string }) {
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

  const totalBid = bids.reduce((sum, b) => sum + parseFloat(b[1]), 0);
  const totalAsk = asks.reduce((sum, a) => sum + parseFloat(a[1]), 0);

  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-700">
      <h2 className="text-xl font-semibold mb-2">Depth Chart</h2>

      <div className="flex gap-4 text-sm">
        <div className="flex-1">
          <h3 className="text-green-400 font-semibold mb-1">Bid Volume</h3>
          <div className="bg-green-600 h-4 rounded" style={{ width: `${(totalBid / (totalBid + totalAsk)) * 100}%` }} />
          <p className="mt-1 text-gray-400">{totalBid.toFixed(4)}</p>
        </div>

        <div className="flex-1">
          <h3 className="text-red-400 font-semibold mb-1">Ask Volume</h3>
          <div className="bg-red-600 h-4 rounded" style={{ width: `${(totalAsk / (totalBid + totalAsk)) * 100}%` }} />
          <p className="mt-1 text-gray-400">{totalAsk.toFixed(4)}</p>
        </div>
      </div>
    </div>
  );
}
