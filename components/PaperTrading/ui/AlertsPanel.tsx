"use client";

import { PriceAlert } from "../types";

interface Props {
  alerts: PriceAlert[];
  onDelete: (id: number) => void;
}

export default function AlertsPanel({ alerts, onDelete }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-bold mb-3">Price Alerts</h3>

      {alerts.length === 0 ? (
        <p className="text-sm text-gray-400">No alerts set.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded border ${
                alert.triggered
                  ? "bg-green-800/40 border-green-600"
                  : "bg-gray-800 border-gray-700"
              }`}
            >
              <div className="flex justify-between mb-1">
                <span className="font-semibold">
                  {alert.direction} {alert.price}
                </span>
                <button
                  onClick={() => onDelete(alert.id)}
                  className="text-xs bg-red-700/60 hover:bg-red-700 px-2 py-1 rounded"
                >
                  Delete
                </button>
              </div>

              <p className="text-xs text-gray-400">
                {alert.persistent ? "Persistent" : "One-shot"}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
