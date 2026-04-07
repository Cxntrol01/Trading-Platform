"use client";

import { useEffect, useState } from "react";
import { Position, Trade, Order, PriceAlert } from "./types";
import OrderEntry from "./ui/OrderEntry";
import OrdersPanel from "./ui/OrdersPanel";
import AlertEntry from "./ui/AlertEntry";
import AlertsPanel from "./ui/AlertsPanel";
import { createOrder, processOrdersOnPrice } from "./orders";
import { createAlert, checkAlerts } from "./alerts";

export default function PaperTrading({ symbol }: { symbol: string }) {
  const [price, setPrice] = useState(0);

  // Balance + PnL
  const [balance, setBalance] = useState<number | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceInput, setBalanceInput] = useState("10000");
  const [realizedPnl, setRealizedPnl] = useState(0);

  // Positions + Orders + History
  const [positions, setPositions] = useState<Position[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<Trade[]>([]);

  // Alerts
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([]);

  // Load balance from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("paper_balance");
    if (stored) {
      const val = parseFloat(stored);
      if (!isNaN(val)) {
        setBalance(val);
        setBalanceInput(val.toString());
        return;
      }
    }
    setShowBalanceModal(true);
  }, []);

  // Live price feed
  useEffect(() => {
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@trade`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrice(parseFloat(data.p));
    };

    return () => ws.close();
  }, [symbol]);

  // Auto SL/TP + Order Execution + Alerts
  useEffect(() => {
    if (price === 0) return;

    // 1. Process open orders
    const orderResult = processOrdersOnPrice({
      lastPrice: price,
      positions,
      orders,
    });

    if (
      orderResult.updatedPositions !== positions ||
      orderResult.remainingOrders !== orders
    ) {
      setPositions(orderResult.updatedPositions);
      setOrders(orderResult.remainingOrders);

      if (orderResult.trades.length > 0) {
        setHistory((prev) => [...orderResult.trades, ...prev]);
      }

      if (orderResult.realizedPnlDelta !== 0) {
        setRealizedPnl((prev) => prev + orderResult.realizedPnlDelta);
        setBalance((prev) =>
          prev !== null ? prev + orderResult.realizedPnlDelta : prev
        );
      }
    }

    // 2. Process SL/TP on positions
    setPositions((prev) => {
      const remaining: Position[] = [];
      let pnlDelta = 0;
      const closedTrades: Trade[] = [];

      for (const pos of prev) {
        let closed = false;
        let closePrice = price;

        if (
          pos.stopLoss !== undefined &&
          ((pos.direction === "LONG" && price <= pos.stopLoss) ||
            (pos.direction === "SHORT" && price >= pos.stopLoss))
        ) {
          closed = true;
          closePrice = pos.stopLoss!;
        } else if (
          pos.takeProfit !== undefined &&
          ((pos.direction === "LONG" && price >= pos.takeProfit) ||
            (pos.direction === "SHORT" && price <= pos.takeProfit))
        ) {
          closed = true;
          closePrice = pos.takeProfit!;
        }

        if (closed) {
          const pnl =
            pos.direction === "LONG"
              ? (closePrice - pos.entryPrice) * pos.size
              : (pos.entryPrice - closePrice) * pos.size;

          pnlDelta += pnl;

          closedTrades.push({
            side: "CLOSE",
            direction: pos.direction,
            price: closePrice,
            size: pos.size,
            pnl,
            timestamp: Date.now(),
          });
        } else {
          remaining.push(pos);
        }
      }

      if (pnlDelta !== 0) {
        setRealizedPnl((prev) => prev + pnlDelta);
        setBalance((prev) => (prev !== null ? prev + pnlDelta : prev));
      }

      if (closedTrades.length > 0) {
        setHistory((prev) => [...closedTrades, ...prev]);
      }

      return remaining;
    });

    // 3. Price Alerts
    const alertResult = checkAlerts({ price, alerts });

    if (alertResult.triggeredAlerts.length > 0) {
      setTriggeredAlerts((prev) => [
        ...alertResult.triggeredAlerts,
        ...prev,
      ]);

      // Optional: play a sound
      try {
        const audio = new Audio("/alert.mp3");
        audio.play().catch(() => {});
      } catch {}

      // Optional: flash the screen
      flashScreen();
    }

    setAlerts(alertResult.remainingAlerts);
  }, [price]);

  // Flash screen on alert
  const flashScreen = () => {
    if (typeof document === "undefined") return;
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.inset = "0";
    el.style.background = "rgba(255,0,0,0.2)";
    el.style.zIndex = "9999";
    el.style.pointerEvents = "none";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 150);
  };

  const unrealizedPnlTotal = positions.reduce((acc, pos) => {
    const pnl =
      pos.direction === "LONG"
        ? (price - pos.entryPrice) * pos.size
        : (pos.entryPrice - price) * pos.size;
    return acc + pnl;
  }, 0);

  const saveStartingBalance = () => {
    const val = parseFloat(balanceInput);
    if (isNaN(val) || val <= 0) return;
    setBalance(val);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("paper_balance", val.toString());
    }
    setShowBalanceModal(false);
  };

  const resetBalance = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("paper_balance");
    }
    setBalance(null);
    setRealizedPnl(0);
    setPositions([]);
    setOrders([]);
    setAlerts([]);
    setHistory([]);
    setTriggeredAlerts([]);
    setBalanceInput("10000");
    setShowBalanceModal(true);
  };

  // Handle new order submission
  const handleOrderSubmit = (params: any) => {
    const order = createOrder(params);
    setOrders((prev) => [order, ...prev]);
  };

  // Cancel order
  const cancelOrder = (id: number) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  // Add alert
  const handleAlertSubmit = (params: any) => {
    const alert = createAlert(params);
    setAlerts((prev) => [alert, ...prev]);
  };

  // Delete alert
  const deleteAlert = (id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 relative">
      {/* Starting balance modal */}
      {showBalanceModal && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Set Starting Balance</h2>
            <input
              type="number"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              className="w-full bg-black border border-gray-700 p-2 rounded mb-4"
              min="1"
            />
            <button
              onClick={saveStartingBalance}
              className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold mb-4">Paper Trading</h2>

      {/* Live price */}
      <div className="text-2xl font-semibold mb-4">
        Price:{" "}
        <span className="text-green-400">
          {price > 0 ? price.toFixed(2) : "--"}
        </span>
      </div>

      {/* Balance + PnL */}
      <div className="mb-4 space-y-1">
        <p>
          Balance:{" "}
          <span className="font-semibold">
            {balance !== null ? balance.toFixed(2) : "--"}
          </span>
        </p>
        <p>
          Unrealized PnL:{" "}
          <span
            className={
              unrealizedPnlTotal >= 0 ? "text-green-400" : "text-red-400"
            }
          >
            {unrealizedPnlTotal.toFixed(2)}
          </span>
        </p>
        <p>
          Realized PnL:{" "}
          <span
            className={realizedPnl >= 0 ? "text-green-400" : "text-red-400"}
          >
            {realizedPnl.toFixed(2)}
          </span>
        </p>
        <button
          onClick={resetBalance}
          className="mt-2 text-xs bg-red-700/60 hover:bg-red-700 px-3 py-1 rounded"
        >
          Reset Balance
        </button>
      </div>

      {/* Order Entry */}
      <OrderEntry price={price} onSubmit={handleOrderSubmit} />

      {/* Alerts */}
      <AlertEntry onSubmit={handleAlertSubmit} />
      <AlertsPanel alerts={alerts} onDelete={deleteAlert} />

      {/* Open Orders */}
      <OrdersPanel orders={orders} onCancel={cancelOrder} />

      {/* Positions */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Open Positions</h3>
        {positions.length === 0 ? (
          <p className="text-sm text-gray-400">No open positions.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {positions.map((pos) => {
              const pnl =
                pos.direction === "LONG"
                  ? (price - pos.entryPrice) * pos.size
                  : (pos.entryPrice - price) * pos.size;

              return (
                <div
                  key={pos.id}
                  className="bg-gray-800 p-3 rounded border border-gray-700 text-sm"
                >
                  <div className="flex justify-between mb-1">
                    <span
                      className={
                        pos.direction === "LONG"
                          ? "text-green-400 font-semibold"
                          : "text-red-400 font-semibold"
                      }
                    >
                      {pos.direction}
                    </span>
                    <span>Size: {pos.size.toFixed(4)}</span>
                  </div>
                  <p>Entry: {pos.entryPrice.toFixed(2)}</p>
                  <p>
                    SL:{" "}
                    {pos.stopLoss !== undefined
                      ? pos.stopLoss.toFixed(2)
                      : "--"}
                    {"  "}TP:{" "}
                    {pos.takeProfit !== undefined
                      ? pos.takeProfit.toFixed(2)
                      : "--"}
                  </p>
                  <p>
                    Unrealized PnL:{" "}
                    <span
                      className={
                        pnl >= 0 ? "text-green-400" : "text-red-400"
                      }
                    >
                      {pnl.toFixed(2)}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trade history */}
      <div>
        <h3 className="text-lg font-bold mb-2">Trade History</h3>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400">No trades yet.</p>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto text-sm">
            {history.map((t, i) => (
              <div
                key={i}
                className="bg-gray-800 p-2 rounded border border-gray-700"
              >
                <p>
                  {t.side} {t.direction} {t.size.toFixed(4)} @{" "}
                  {t.price.toFixed(2)}
                  {typeof t.pnl === "number" && (
                    <>
                      {" "}
                      — PnL:{" "}
                      <span
                        className={
                          t.pnl >= 0 ? "text-green-400" : "text-red-400"
                        }
                      >
                        {t.pnl.toFixed(2)}
                      </span>
                    </>
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(t.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
              }
