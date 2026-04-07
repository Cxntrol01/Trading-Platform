"use client";

import { useState } from "react";
import ChartWithIndicators from "@/components/ChartWithIndicators";

export default function MultiChart({ symbol }: { symbol: string }) {
  const [leftTF, setLeftTF] = useState("1h");
  const [rightTF, setRightTF] = useState("5m");

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-4">Multi‑Chart View</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left chart */}
        <div>
          <div className="flex gap-2 mb-2">
            <select
              value={leftTF}
              onChange={(e) => setLeftTF(e.target.value)}
              className="bg-black border border-gray-700 p-2 rounded"
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1d">1d</option>
            </select>
          </div>

          <ChartWithIndicators symbol={symbol} timeframe={leftTF} />
        </div>

        {/* Right chart */}
        <div>
          <div className="flex gap-2 mb-2">
            <select
              value={rightTF}
              onChange={(e) => setRightTF(e.target.value)}
              className="bg-black border border-gray-700 p-2 rounded"
            >
              <option value="1m">1m</option>
              <option value="5m">5m</option>
              <option value="15m">15m</option>
              <option value="1h">1h</option>
              <option value="4h">4h</option>
              <option value="1d">1d</option>
            </select>
          </div>

          <ChartWithIndicators symbol={symbol} timeframe={rightTF} />
        </div>

      </div>
    </div>
  );
}
