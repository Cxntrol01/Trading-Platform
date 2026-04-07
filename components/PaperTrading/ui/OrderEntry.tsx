"use client";

import { useState } from "react";
import {
  Direction,
  OrderSide,
  OrderType,
  TimeInForce,
} from "../types";

interface Props {
  price: number;
  onSubmit: (params: {
    side: OrderSide;
    direction: Direction;
    type: OrderType;
    price?: number;
    triggerPrice?: number;
    size: number;
    reduceOnly: boolean;
    postOnly: boolean;
    tif: TimeInForce;
    merge: boolean;
  }) => void;
}

export default function OrderEntry({ price, onSubmit }: Props) {
  const [limitPrice, setLimitPrice] = useState("");
  const [size, setSize] = useState("1");

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Advanced fields
  const [orderType, setOrderType] = useState<OrderType>("LIMIT");
  const [triggerPrice, setTriggerPrice] = useState("");
  const [reduceOnly, setReduceOnly] = useState(false);
  const [postOnly, setPostOnly] = useState(false);
  const [tif, setTif] = useState<TimeInForce>("GTC");
  const [merge, setMerge] = useState(true);

  const parseNum = (v: string) => {
    const n = parseFloat(v);
    return isNaN(n) ? undefined : n;
  };

  const handleSubmit = (side: OrderSide) => {
    const direction: Direction = side === "BUY" ? "LONG" : "SHORT";

    const params = {
      side,
      direction,
      type: orderType,
      price: parseNum(limitPrice),
      triggerPrice: parseNum(triggerPrice),
      size: parseNum(size) ?? 0,
      reduceOnly,
      postOnly,
      tif,
      merge,
    };

    if (!params.size || params.size <= 0) return;

    onSubmit(params);
  };

  return (
    <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-bold mb-3">Order Entry</h3>

      {/* Simple Mode */}
      <div className="space-y-3 mb-4">
        <div>
          <label className="text-sm text-gray-300">Limit Price</label>
          <input
            type="number"
            value={limitPrice}
            onChange={(e) => setLimitPrice(e.target.value)}
            className="w-full bg-black border border-gray-700 p-2 rounded"
            placeholder={price ? price.toFixed(2) : ""}
          />
        </div>

        <div>
          <label className="text-sm text-gray-300">Size</label>
          <input
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full bg-black border border-gray-700 p-2 rounded"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleSubmit("BUY")}
            className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
          >
            Limit Buy
          </button>
          <button
            onClick={() => handleSubmit("SELL")}
            className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
          >
            Limit Sell
          </button>
        </div>
      </div>

      {/* Advanced Toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="text-sm text-blue-400 hover:text-blue-300 mb-3"
      >
        {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
      </button>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg space-y-4">
          {/* Order Type */}
          <div>
            <label className="text-sm text-gray-300">Order Type</label>
            <select
              value={orderType}
              onChange={(e) => setOrderType(e.target.value as OrderType)}
              className="w-full bg-black border border-gray-700 p-2 rounded"
            >
              <option value="LIMIT">Limit</option>
              <option value="STOP">Stop</option>
              <option value="STOP_LIMIT">Stop-Limit</option>
              <option value="TAKE_PROFIT">Take-Profit</option>
              <option value="TP_LIMIT">TP-Limit</option>
            </select>
          </div>

          {/* Trigger Price */}
          {(orderType !== "LIMIT") && (
            <div>
              <label className="text-sm text-gray-300">Trigger Price</label>
              <input
                type="number"
                value={triggerPrice}
                onChange={(e) => setTriggerPrice(e.target.value)}
                className="w-full bg-black border border-gray-700 p-2 rounded"
              />
            </div>
          )}

          {/* Reduce Only */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={reduceOnly}
              onChange={(e) => setReduceOnly(e.target.checked)}
            />
            <label className="text-sm text-gray-300">Reduce Only</label>
          </div>

          {/* Post Only */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={postOnly}
              onChange={(e) => setPostOnly(e.target.checked)}
            />
            <label className="text-sm text-gray-300">Post Only</label>
          </div>

          {/* Time In Force */}
          <div>
            <label className="text-sm text-gray-300">Time in Force</label>
            <select
              value={tif}
              onChange={(e) => setTif(e.target.value as TimeInForce)}
              className="w-full bg-black border border-gray-700 p-2 rounded"
            >
              <option value="GTC">GTC</option>
              <option value="IOC">IOC</option>
              <option value="FOK">FOK</option>
            </select>
          </div>

          {/* Merge Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={merge}
              onChange={(e) => setMerge(e.target.checked)}
            />
            <label className="text-sm text-gray-300">
              Merge with existing positions
            </label>
          </div>
        </div>
      )}
    </div>
  );
                }
