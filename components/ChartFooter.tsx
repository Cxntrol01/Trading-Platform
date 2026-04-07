"use client";

export default function ChartSettings({
  onChange,
}: {
  onChange: (setting: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onChange("candles")}
      >
        Candles
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onChange("bars")}
      >
        Bars
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onChange("line")}
      >
        Line
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onChange("dark")}
      >
        Dark Mode
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onChange("light")}
      >
        Light Mode
      </button>
    </div>
  );
}
