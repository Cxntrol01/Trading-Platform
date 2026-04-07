"use client";

export default function DrawingTools({ onSelect }: { onSelect: (tool: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onSelect("trendline")}
      >
        Trendline
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onSelect("ray")}
      >
        Ray
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onSelect("horizontal")}
      >
        Horizontal Line
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onSelect("vertical")}
      >
        Vertical Line
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onSelect("brush")}
      >
        Brush
      </button>

      <button
        className="px-3 py-1 bg-red-600 rounded"
        onClick={() => onSelect("clear")}
      >
        Clear
      </button>
    </div>
  );
}
