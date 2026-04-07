"use client";

import { useEffect, useState } from "react";

export default function MultiChart({ symbol }: { symbol: string }) {
  const [data, setData] = useState<any[]>([]);
  const timeframes = ["1m", "5m", "15m", "1h"];

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/chart`);
        const json = await res.json();
        setData(json.candles || []);
      } catch (err) {
        console.error("MultiChart error:", err);
      }
    }

    load();
  }, [symbol]);

  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-700">
      <h2 className="text-xl font-semibold mb-4">Multi‑Chart View</h2>

      <div className="grid grid-cols-2 gap-4">
        {timeframes.map((tf) => (
          <div
            key={tf}
            className="bg-gray-800 p-3 rounded border border-gray-700"
          >
            <h3 className="text-lg font-semibold mb-2">{tf} Chart</h3>

            {data.length === 0 ? (
              <div className="text-gray-400 text-sm">Loading...</div>
            ) : (
              <pre className="text-xs max-h-40 overflow-auto text-gray-300">
                {JSON.stringify(data.slice(0, 10), null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
