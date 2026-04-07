"use client";

import { useState } from "react";

interface Props {
  onSubmit: (params: {
    price: number;
    direction: "ABOVE" | "BELOW";
    persistent: boolean;
  }) => void;
}

export default function AlertEntry({ onSubmit }: Props) {
  const [price, setPrice] = useState("");
  const [direction, setDirection] = useState<"ABOVE" | "BELOW">("ABOVE");
  const [persistent, setPersistent] = useState(false);

  const handleSubmit = () => {
    const p = parseFloat(price);
    if (isNaN(p) || p <= 0) return;

    onSubmit({ price: p, direction, persistent });
    setPrice("");
  };

  return (
    <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-bold mb-3">Create Price Alert</h3>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-300">Alert Price</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-black border border-gray-700 p-2 rounded"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300">Direction</label>
          <select
            value={direction}
            onChange={(e) =>
              setDirection(e.target.value as "ABOVE" | "BELOW")
            }
            className="w-full bg-black border border-gray-700 p-2 rounded"
          >
            <option value="ABOVE">Price goes ABOVE</option>
            <option value="BELOW">Price goes BELOW</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={persistent}
            onChange={(e) => setPersistent(e.target.checked)}
          />
          <label className="text-sm text-gray-300">Persistent Alert</label>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded font-semibold"
        >
          Add Alert
        </button>
      </div>
    </div>
  );
}
