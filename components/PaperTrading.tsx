"use client";

import { useEffect, useState } from "react";

type Direction = "LONG" | "SHORT";

interface Trade {
  side: "BUY" | "SELL" | "CLOSE";
  direction: Direction;
  price: number;
  size: number;
  pnl?: number;
  timestamp: number;
}

interface Position {
  id: number;
  direction: Direction;
  entryPrice: number;
  size: number;
  stopLoss?: number;
  takeProfit?: number;
}

type SizingMode = "FIXED" | "RISK";

export default function PaperTrading({ symbol }: { symbol: string }) {
  const [price, setPrice] = useState(0);

  const [balance, setBalance] = useState<number | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceInput, setBalanceInput] = useState("10000");

  const [sizingMode, setSizingMode] = useState<SizingMode>("FIXED");
  const [fixedSize, setFixedSize] = useState("1");
  const [riskPercent, setRiskPercent] = useState("1");
  const [slInput, setSlInput] = useState("");
  const [tpInput, setTpInput] = useState("");

  const [positions, setPositions] = useState<Position[]>([]);
  const [realizedPnl, setRealizedPnl] = useState(0);
  const [history, setHistory] = useState<Trade[]>([]);

  // Load balance from localStorage or show modal
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

  // Auto SL/TP execution
  useEffect(() => {
    if (price === 0 || positions.length === 0) return;

    setPositions((prev) => {
      const remaining: Position[] = [];
      let realizedDelta = 0;
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

          realizedDelta += pnl;

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

      if (realizedDelta !== 0) {
        setRealizedPnl((prevPnl) => prevPnl + realizedDelta);
        setBalance((prevBal) =>
          prevBal !== null ? prevBal + realizedDelta : prevBal
        );
      }

      if (closedTrades.length > 0) {
        setHistory((prevHist) => [...closedTrades, ...prevHist]);
      }

      return remaining;
    });
  }, [price, positions.length]);

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
    setHistory([]);
    setBalanceInput("10000");
    setShowBalanceModal(true);
  };

  const parseSlTp = () => {
    const sl = slInput.trim() === "" ? undefined : parseFloat(slInput);
    const tp = tpInput.trim() === "" ? undefined : parseFloat(tpInput);
    return { sl, tp };
  };

  const computeSize = (direction: Direction): number | null => {
    if (sizingMode === "FIXED") {
      const size = parseFloat(fixedSize);
      if (isNaN(size) || size <= 0) return null;
      return size;
    }

    // RISK mode
    if (balance === null) return null;
    const risk = parseFloat(riskPercent);
    const { sl } = parseSlTp();
    if (!sl || isNaN(risk) || risk <= 0) return null;

    const riskAmount = (balance * risk) / 100;
    const distance = Math.abs(price - sl);
    if (distance === 0) return null;

    const size = riskAmount / distance;
    if (!isFinite(size) || size <= 0) return null;
    return size;
  };

  const openPosition = (direction: Direction, side: "BUY" | "SELL") => {
    if (price === 0) return;
    const size = computeSize(direction);
    if (!size) return;

    const { sl, tp } = parseSlTp();

    const newPos: Position = {
      id: Date.now() + Math.random(),
      direction,
      entryPrice: price,
      size,
      stopLoss: sl,
      takeProfit: tp,
    };

    setPositions((prev) => [newPos, ...prev]);

    setHistory((prev) => [
      {
        side,
        direction,
        price,
        size,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
  };

  const handleMarketBuy = () => {
    openPosition("LONG", "BUY");
  };

  const handleMarketSell = () => {
    openPosition("SHORT", "SELL");
  };

  const closePosition = (pos: Position) => {
    if (price === 0) return;

    const closePrice = price;
    const pnl =
      pos.direction === "LONG"
        ? (closePrice - pos.entryPrice) * pos.size
        : (pos.entryPrice - closePrice) * pos.size;

    setPositions((prev) => prev.filter((p) => p.id !== pos.id));
    setRealizedPnl((prev) => prev + pnl);
    setBalance((prev) => (prev !== null ? prev + pnl : prev));

    setHistory((prev) => [
      {
        side: "CLOSE",
        direction: pos.direction,
        price: closePrice,
        size: pos.size,
        pnl,
        timestamp: Date.now(),
      },
      ...prev,
    ]);
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

      {/* Sizing mode */}
      <div className="mb-4">
        <div className="flex gap-2 mb-2">
          <button
            onClick={() => setSizingMode("FIXED")}
            className={`px-3 py-1 rounded text-sm ${
              sizingMode === "FIXED"
                ? "bg-blue-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            Fixed Size
          </button>
          <button
            onClick={() => setSizingMode("RISK")}
            className={`px-3 py-1 rounded text-sm ${
              sizingMode === "RISK"
                ? "bg-blue-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            Risk %
          </button>
        </div>

        {sizingMode === "FIXED" ? (
          <div className="space-y-2">
            <label className="text-sm text-gray-300">
              Position size (units)
            </label>
            <input
              type="number"
              value={fixedSize}
              onChange={(e) => setFixedSize(e.target.value)}
              className="w-full bg-black border border-gray-700 p-2 rounded"
              min="0"
            />
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm text-gray-300">
              Risk per trade (% of balance)
            </label>
            <input
              type="number"
              value={riskPercent}
              onChange={(e) => setRiskPercent(e.target.value)}
              className="w-full bg-black border border-gray-700 p-2 rounded"
              min="0"
            />
            <p className="text-xs text-gray-400">
              Size is calculated from risk, balance, and stop‑loss distance.
            </p>
          </div>
        )}
      </div>

      {/* SL / TP inputs */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-300">Stop‑loss price</label>
          <input
            type="number"
            value={slInput}
            onChange={(e) => setSlInput(e.target.value)}
            className="w-full bg-black border border-gray-700 p-2 rounded"
          />
        </div>
        <div>
          <label className="text-sm text-gray-300">Take‑profit price</label>
          <input
            type="number"
            value={tpInput}
            onChange={(e) => setTpInput(e.target.value)}
            className="w-full bg-black border border-gray-700 p-2 rounded"
          />
        </div>
      </div>

      {/* Market buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={handleMarketBuy}
          className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold"
        >
          Market Buy (Long)
        </button>
        <button
          onClick={handleMarketSell}
          className="flex-1 bg-red-600 hover:bg-red-700 px-4 py-2 rounded font-semibold"
        >
          Market Sell (Short)
        </button>
      </div>

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
                  <button
                    onClick={() => closePosition(pos)}
                    className="mt-2 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded"
                  >
                    Close at Market
                  </button>
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
