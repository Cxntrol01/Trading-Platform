"use client";

export default function TimeframeSelector({
  onSelect,
}: {
  onSelect: (tf: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onSelect("1m")}
      >
        1m
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onSelect("5m")}
      >
        5m
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onSelect("1h")}
      >
        1h
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onSelect("4h")}
      >
        4h
      </button>

      <button
        className="px-3 py-1 bg-gray-800 rounded"
        onClick={() => onSelect("1d")}
      >
        1D
      </button>
    </div>
  );
}
