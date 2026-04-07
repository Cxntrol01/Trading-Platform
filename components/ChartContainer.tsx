"use client";

import ChartHeader from "./ChartHeader";
import ChartFooter from "./ChartFooter";
import FullscreenChart from "./FullscreenChart";

export default function ChartContainer({
  symbol,
  children,
}: {
  symbol: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-950 p-3 rounded-lg border border-gray-800">
      <ChartHeader symbol={symbol} />

      <FullscreenChart>
        {children}
      </FullscreenChart>

      <ChartFooter />
    </div>
  );
}
