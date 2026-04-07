"use client";

export default function ChartLayoutSelector({
  onChange,
}: {
  onChange: (layout: number) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onChange(1)}
      >
        1 Chart
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onChange(2)}
      >
        2 Charts
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onChange(3)}
      >
        3 Charts
      </button>
    </div>
  );
}
