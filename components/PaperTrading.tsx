"use client";

import { useEffect, useState } from "react";

interface Trade {
  side: "BUY" | "SELL";
  price: number;
  size: number;
  timestamp: number;
}

export default function PaperTrading({ symbol }: { symbol: string }) {
  const [price, setPrice] = useState(0);

  const [positionSize, setPositionSize] = useState(0);
  const [entryPrice, setEntryPrice] = useState(0);
  const [realizedPnl, setRealizedPnl] = useState(0);

  const [history, setHistory] = useState<Trade[]>([]);

  // Live price feed
  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrice(parseFloat(data.p));
    };

    return () => ws.close();
  }, [symbol]);

  // Unrealized PnL
  const unrealizedPnl =
    positionSize === 0 ? 0 : (price - entryPrice) * positionSize;

  // Buy logic
  const buy = () => {
    const size = 1; // 1 unit for simplicity

    if (positionSize === 0) {
      // Opening a new long
      setEntryPrice(price);
      setPositionSize(size);
    } else {
      // Adding to position (average entry)
      const newSize = positionSize + size;
      const newEntry =
        (entryPrice * positionSize + price * size) / newSize;

      setEntryPrice(newEntry);
      setPositionSize(newSize);
    }

    setHistory((prev) => [
      { side: "BUY", price, size, timestamp: Date.now() },
      ...prev,
    ]);
  };

  // Sell logic
  const sell = () => {
    if (positionSize === 0) return;

    const size = 1;

    if (positionSize - size <= 0) {
      // Closing full position
      const pnl = (price - entryPrice) * positionSize;
      setRealizedPnl((prev) => prev + pnl);
      setPositionSize(0);
      setEntryPrice(0);
    } else {
      // Partial close
      const pnl = (price - entryPrice) * size;
      setRealizedPnl((prev) => prev + pnl);
      setPositionSize(positionSize - size);
    }

    setHistory((prev) => [
      { side: "SELL", price, size, timestamp: Date.now() },
      ...prev,
    ]);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-4">Paper Trading</h2>

      {/* Live price */}
      <div className="text-2xl font-semibold mb-4">
        Price: <span className="text-green-400">{price.toFixed(2)}</span>
      </div>

      {/* Position info */}
      <div className="mb-4">
        <p>Position Size: {positionSize}</p>
        <p>Entry Price: {entryPrice.toFixed(2)}</p>
        <p>
          Unrealized PnL:{" "}
          <span
            className={
              unrealizedPnl >= 0 ? "text-green-400" : "text-red-400"
            }
          >
            {unrealizedPnl.toFixed(2)}
          </span>
        </p>
        <p>
          Realized PnL:{" "}
          <span
            className={
              realizedPnl >= 0 ? "text-green-400" : "text-red-400"
            }
          >
            {realizedPnl.toFixed(2)}
          </span>
        </p>
      </div>

      {/* Buy/Sell buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={buy}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Buy 1
        </button>
        <button
          onClick={sell}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Sell 1
        </button>
      </div>

      {/* Trade history */}
      <h3 className="text-lg font-bold mb-2">Trade History</h3>
      <div className="max-h-40 overflow-y-auto space-y-2">
        {history.map((t, i) => (
          <div
            key={i}
            className="bg-gray-800 p-2 rounded border border-gray-700"
          >
            <p>
              {t.side} {t.size} @ {t.price.toFixed(2)}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(t.timestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
