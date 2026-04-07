"use client";

export default function ChartControls() {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button className="px-3 py-1 bg-gray-800 rounded">1m</button>
      <button className="px-3 py-1 bg-gray-800 rounded">5m</button>
      <button className="px-3 py-1 bg-gray-800 rounded">15m</button>
      <button className="px-3 py-1 bg-gray-800 rounded">1H</button>
      <button className="px-3 py-1 bg-gray-800 rounded">4H</button>
      <button className="px-3 py-1 bg-gray-800 rounded">1D</button>

      <button className="px-3 py-1 bg-blue-600 rounded">Zoom In</button>
      <button className="px-3 py-1 bg-blue-600 rounded">Zoom Out</button>
    </div>
  );
}
