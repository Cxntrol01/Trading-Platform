"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, ISeriesApi } from "lightweight-charts";

interface Order {
  price: number;
  qty: number;
}

export default function DepthChart({ symbol }: { symbol: string }) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chart = useRef<any>(null);
  const bidsSeries = useRef<ISeriesApi<"Area"> | null>(null);
  const asksSeries = useRef<ISeriesApi<"Area"> | null>(null);

  const [bids, setBids] = useState<Order[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);

  useEffect(() => {
    if (!chartRef.current) return;

    chart.current = createChart(chartRef.current, {
      layout: { background: { color: "#000" }, textColor: "#fff" },
      grid: {
        vertLines: { color: "#222" },
        horzLines: { color: "#222" },
      },
      width: chartRef.current.clientWidth,
      height: 300,
    });

    bidsSeries.current = chart.current.addAreaSeries({
      lineColor: "#00ff99",
      topColor: "rgba(0,255,153,0.4)",
      bottomColor: "rgba(0,255,153,0.0)",
    });

    asksSeries.current = chart.current.addAreaSeries({
      lineColor: "#ff0066",
      topColor: "rgba(255,0,102,0.4)",
      bottomColor: "rgba(255,0,102,0.0)",
    });

    // WebSocket for orderbook depth
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@depth20@100ms`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const newBids = data.bids.map((b: any) => ({
        price: parseFloat(b[0]),
        qty: parseFloat(b[1]),
      }));

      const newAsks = data.asks.map((a: any) => ({
        price: parseFloat(a[0]),
        qty: parseFloat(a[1]),
      }));

      // Convert to cumulative depth
      const cumulativeBids = [];
      let totalBid = 0;
      for (const b of newBids) {
        totalBid += b.qty;
        cumulativeBids.push({ time: b.price, value: totalBid });
      }

      const cumulativeAsks = [];
      let totalAsk = 0;
      for (const a of newAsks) {
        totalAsk += a.qty;
        cumulativeAsks.push({ time: a.price, value: totalAsk });
      }

      bidsSeries.current?.setData(cumulativeBids);
      asksSeries.current?.setData(cumulativeAsks);

      setBids(newBids);
      setAsks(newAsks);
    };

    return () => ws.close();
  }, [symbol]);

  return (
    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold mb-3">Depth Chart</h2>
      <div ref={chartRef} className="w-full h-[300px]" />
    </div>
  );
}
