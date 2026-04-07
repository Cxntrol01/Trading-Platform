"use client";

export default function ChartPresets({
  onApply,
}: {
  onApply: (preset: any) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onApply({ type: "scalping" })}
      >
        Scalping
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onApply({ type: "day" })}
      >
        Day Trading
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onApply({ type: "swing" })}
      >
        Swing Trading
      </button>
    </div>
  );
}
