"use client";

import { useState } from "react";

export default function SymbolSearch({
  onSelect,
}: {
  onSelect: (symbol: string) => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div className="flex gap-2 items-center">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value.toUpperCase())}
        placeholder="Search symbol..."
        className="px-3 py-1 bg-gray-800 rounded text-white"
      />

      <button
        className="px-3 py-1 bg-blue-600 rounded"
        onClick={() => {
          if (value.trim() !== "") onSelect(value.trim());
        }}
      >
        Load
      </button>
    </div>
  );
}
