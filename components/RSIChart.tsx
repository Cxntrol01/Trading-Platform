"use client";

import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { calculateRSI } from "@/lib/rsi";
import { fetchCandles } from "@/lib/fetchCandles";

export default function RSIChart({
  symbol,
  timeframe,
}: {
  symbol: string;
  timeframe: string;
}) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const rsiSeries = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = createChart(chartRef.current, {
        layout: { background: { color: "#000" }, textColor: "#fff" },
        grid: {
          vertLines: { color: "#222" },
          horzLines: { color: "#222" },
        },
        width: chartRef.current.clientWidth,
        height: 150,
      });

      rsiSeries.current = chartInstance.current.addLineSeries({
        color: "#9c27b0",
        lineWidth: 2,
      });
    }

    async function load() {
      const data = await fetchCandles(symbol, timeframe);

      if (data?.candles && rsiSeries.current) {
        const rsi = calculateRSI(data.candles, 14);
        rsiSeries.current.setData(rsi);
      }
    }

    load();
    const interval = setInterval(load, 10000);

    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  return <div ref={chartRef} className="w-full h-[150px]" />;
}
