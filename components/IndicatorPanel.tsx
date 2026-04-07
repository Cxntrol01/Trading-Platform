"use client";

export default function IndicatorPanel({
  onToggle,
}: {
  onToggle: (indicator: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onToggle("rsi")}
      >
        RSI
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onToggle("macd")}
      >
        MACD
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onToggle("ema")}
      >
        EMA
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onToggle("vwap")}
      >
        VWAP
      </button>
    </div>
  );
}
