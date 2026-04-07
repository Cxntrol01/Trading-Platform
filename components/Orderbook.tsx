"use client";

import { useEffect, useState } from "react";

interface OrderLevel {
  price: number;
  amount: number;
}

export default function Orderbook({ symbol }: { symbol: string }) {
  const [bids, setBids] = useState<OrderLevel[]>([]);
  const [asks, setAsks] = useState<OrderLevel[]>([]);

  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const newBids = data.bids.map((b: any) => ({
        price: parseFloat(b[0]),
        amount: parseFloat(b[1]),
      }));

      const newAsks = data.asks.map((a: any) => ({
        price: parseFloat(a[0]),
        amount: parseFloat(a[1]),
      }));

      setBids(newBids);
      setAsks(newAsks);
    };

    return () => ws.close();
  }, [symbol]);

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-3">Orderbook</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Bids */}
        <div>
          <h3 className="text-green-400 font-semibold mb-2">Bids</h3>
          <div className="flex flex-col gap-1">
            {bids.map((b, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-green-400">{b.price.toFixed(2)}</span>
                <span>{b.amount.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Asks */}
        <div>
          <h3 className="text-red-400 font-semibold mb-2">Asks</h3>
          <div className="flex flex-col gap-1">
            {asks.map((a, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-red-400">{a.price.toFixed(2)}</span>
                <span>{a.amount.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
            }
