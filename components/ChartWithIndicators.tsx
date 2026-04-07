"use client";

import { useEffect, useState } from "react";

export default function ChartWithIndicators({ symbol, timeframe }: { symbol: string; timeframe: string }) {
  const [candles, setCandles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/chart`);
        const json = await res.json();
        setCandles(json.candles || []);
      } catch (err) {
        console.error("Chart error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [symbol, timeframe]);

  if (loading) return <div className="text-gray-400">Loading chart...</div>;

  return (
    <div className="bg-gray-900 p-4 rounded border border-gray-700">
      <h2 className="text-xl font-semibold mb-2">{symbol} — {timeframe} Chart</h2>

      <div className="text-gray-400">
        {candles.length === 0 && "No data available."}

        {candles.length > 0 && (
          <pre className="text-xs overflow-auto max-h-64">
            {JSON.stringify(candles.slice(0, 20), null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
