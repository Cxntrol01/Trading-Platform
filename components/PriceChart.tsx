"use client";

import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { fetchCandles } from "@/lib/fetchCandles";

export default function PriceChart({
  symbol,
  timeframe,
}: {
  symbol: string;
  timeframe: string;
}) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const candleSeries = useRef<ISeriesApi<"Candlestick"> | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Create chart once
    if (!chartInstance.current) {
      chartInstance.current = createChart(chartRef.current, {
        layout: { background: { color: "#000" }, textColor: "#fff" },
        grid: { vertLines: { color: "#222" }, horzLines: { color: "#222" } },
        width: chartRef.current.clientWidth,
        height: 400,
      });

      candleSeries.current =
        chartInstance.current.addCandlestickSeries();
    }

    // Fetch candles when symbol/timeframe changes
    async function load() {
      const data = await fetchCandles(symbol, timeframe);

      if (data?.candles && candleSeries.current) {
        candleSeries.current.setData(data.candles);
      }
    }

    load();
  }, [symbol, timeframe]);

  return <div ref={chartRef} className="w-full h-[400px]" />;
}
