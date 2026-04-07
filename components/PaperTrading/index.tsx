"use client";

import { useEffect, useState } from "react";

export default function PaperTrading({ symbol }: { symbol: string }) {
  const [price, setPrice] = useState<number | null>(null);
  const [balance, setBalance] = useState(10000); // starting balance
  const [position, setPosition] = useState(0);   // asset amount
  const [avgPrice, setAvgPrice] = useState(0);   // average entry price

  // Live price feed
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

      ws.onclose = () => setTimeout(connect, 1000);
    }

    connect();
    return () => ws && ws.close();
  }, [symbol]);

  function buy() {
    if (!price) return;

    const amount = (balance / price) * 0.1; // buy with 10% of balance
    const cost = amount * price;

    if (cost > balance) return;

    const newTotal = position + amount;
    const newAvg = (avgPrice * position + cost) / newTotal;

    setPosition(newTotal);
    setAvgPrice(newAvg);
    setBalance(balance - cost);
  }

  function sell() {
    if (!price || position === 0) return;

    const amount = position * 0.1; // sell 10%
    const revenue = amount * price;

    setPosition(position - amount);
    setBalance(balance + revenue);

    if (position - amount <= 0) {
      setAvgPrice(0);
    }
  }

  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-700">
      <h2 className="text-xl font-semibold mb-3">Paper Trading</h2>

      <div className="text-gray-300 space-y-2 text-sm">
        <p>Balance: ${balance.toFixed(2)}</p>
        <p>Position: {position.toFixed(4)} {symbol}</p>
        <p>Avg Entry: {avgPrice ? avgPrice.toFixed(2) : "-"}</p>
        <p>Current Price: {price ? price.toFixed(2) : "Loading..."}</p>
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={buy}
          className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
        >
          Buy 10%
        </button>

        <button
          onClick={sell}
          className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
        >
          Sell 10%
        </button>
      </div>
    </div>
  );
}
