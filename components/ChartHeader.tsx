"use client";

export default function ChartHeader({ symbol }: { symbol: string }) {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-900 rounded">
      <div className="text-lg font-semibold">{symbol}</div>

      <div className="flex gap-2">
        <button className="px-3 py-1 bg-gray-800 rounded">1D</button>
        <button className="px-3 py-1 bg-gray-800 rounded">1W</button>
        <button className="px-3 py-1 bg-gray-800 rounded">1M</button>
      </div>
    </div>
  );
}
