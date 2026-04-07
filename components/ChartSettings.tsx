"use client";

export default function ChartSettings({ onChange }: { onChange: () => void }) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button className="px-3 py-1 bg-gray-800 rounded">Light</button>
      <button className="px-3 py-1 bg-gray-800 rounded">Dark</button>
      <button className="px-3 py-1 bg-gray-800 rounded">Candles</button>
      <button className="px-3 py-1 bg-gray-800 rounded">Bars</button>
      <button className="px-3 py-1 bg-gray-800 rounded">Line</button>
    </div>
  );
}
