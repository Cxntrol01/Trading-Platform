"use client";

import { Order } from "../types";

interface Props {
  orders: Order[];
  onCancel: (id: number) => void;
}

export default function OrdersPanel({ orders, onCancel }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-bold mb-3">Open Orders</h3>

      {orders.length === 0 ? (
        <p className="text-sm text-gray-400">No open orders.</p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-gray-800 border border-gray-700 p-3 rounded text-sm"
            >
              <div className="flex justify-between mb-1">
                <span className="font-semibold">
                  {order.type} {order.side}
                </span>
                <button
                  onClick={() => onCancel(order.id)}
                  className="text-xs bg-red-700/60 hover:bg-red-700 px-2 py-1 rounded"
                >
                  Cancel
                </button>
              </div>

              <p>
                Direction:{" "}
                <span
                  className={
                    order.direction === "LONG"
                      ? "text-green-400"
                      : "text-red-400"
                  }
                >
                  {order.direction}
                </span>
              </p>

              {order.price !== undefined && (
                <p>Limit Price: {order.price.toFixed(2)}</p>
              )}

              {order.triggerPrice !== undefined && (
                <p>Trigger: {order.triggerPrice.toFixed(2)}</p>
              )}

              <p>Size: {order.size.toFixed(4)}</p>

              {/* Advanced flags */}
              <div className="text-xs text-gray-400 mt-1 space-y-1">
                {order.reduceOnly && <p>Reduce Only</p>}
                {order.postOnly && <p>Post Only</p>}
                <p>TIF: {order.tif}</p>
                <p>Merge: {order.merge ? "Yes" : "No"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
