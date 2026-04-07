"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
} from "lightweight-charts";

import { fetchCandles } from "@/lib/fetchCandles";
import { calculateSMA, calculateEMA } from "@/lib/indicators";

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
  const smaSeries = useRef<ISeriesApi<"Line"> | null>(null);
  const emaSeries = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Create chart once
    if (!chartInstance.current) {
      chartInstance.current = createChart(chartRef.current, {
        layout: { background: { color: "#000" }, textColor: "#fff" },
        grid: {
          vertLines: { color: "#222" },
          horzLines: { color: "#222" },
        },
        width: chartRef.current.clientWidth,
        height: 400,
      });

      candleSeries.current =
        chartInstance.current.addCandlestickSeries();
    }

    async function load() {
      const data = await fetchCandles(symbol, timeframe);

      if (data?.candles && candleSeries.current) {
        // Set candle data
        candleSeries.current.setData(data.candles);

        // --- Indicators ---
        const sma20 = calculateSMA(data.candles, 20);
        const ema50 = calculateEMA(data.candles, 50);

        // SMA line
        if (!smaSeries.current) {
          smaSeries.current = chartInstance.current.addLineSeries({
            color: "#00bcd4",
            lineWidth: 2,
          });
        }
        smaSeries.current.setData(sma20);

        // EMA line
        if (!emaSeries.current) {
          emaSeries.current = chartInstance.current.addLineSeries({
            color: "#ff9800",
            lineWidth: 2,
          });
        }
        emaSeries.current.setData(ema50);
      }
    }

    // Load immediately
    load();

    // Auto-refresh every 10 seconds
    const interval = setInterval(load, 10000);

    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  return (
    <div
      ref={chartRef}
      className="w-full h-[400px] rounded-lg overflow-hidden"
    />
  );
}
