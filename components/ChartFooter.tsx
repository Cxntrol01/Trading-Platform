"use client";

export default function ChartFooter() {
  return (
    <div className="flex items-center justify-between px-3 py-2 bg-gray-900 rounded mt-2">
      <div className="text-sm text-gray-400">Chart Footer</div>

      <div className="flex gap-2">
        <button className="px-3 py-1 bg-gray-800 rounded">Indicators</button>
        <button className="px-3 py-1 bg-gray-800 rounded">Volume</button>
      </div>
    </div>
  );
}
