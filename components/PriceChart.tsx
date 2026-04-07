"use client";

import { useEffect, useRef, useState } from "react";
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
  const volumeSeries = useRef<ISeriesApi<"Histogram"> | null>(null);

  const [candles, setCandles] = useState<any[]>([]);

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
        crosshair: {
          mode: 1, // TradingView-style crosshair
        },
        width: chartRef.current.clientWidth,
        height: 400,
      });

      candleSeries.current =
        chartInstance.current.addCandlestickSeries();

      volumeSeries.current = chartInstance.current.addHistogramSeries({
        priceFormat: { type: "volume" },
        priceScaleId: "",
        color: "#26a69a",
      });

      volumeSeries.current.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      candleSeries.current.priceScale().applyOptions({
        scaleMargins: {
          top: 0.05,
          bottom: 0.25,
        },
      });

      smaSeries.current = chartInstance.current.addLineSeries({
        color: "#00bcd4",
        lineWidth: 2,
      });

      emaSeries.current = chartInstance.current.addLineSeries({
        color: "#ff9800",
        lineWidth: 2,
      });
    }

    async function load() {
      const data = await fetchCandles(symbol, timeframe);

      if (data?.candles) {
        setCandles(data.candles);

        candleSeries.current?.setData(data.candles);

        const volumeData = data.candles.map((c: any) => ({
          time: c.time,
          value: c.volume,
        }));
        volumeSeries.current?.setData(volumeData);

        smaSeries.current?.setData(calculateSMA(data.candles, 20));
        emaSeries.current?.setData(calculateEMA(data.candles, 50));
      }
    }

    load();

    // --- WebSocket for live candles ---
    const ws = new WebSocket(
      `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@kline_${timeframe}`
    );

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const k = data.k;

      const liveCandle = {
        time: Math.floor(k.t / 1000),
        open: parseFloat(k.o),
        high: parseFloat(k.h),
        low: parseFloat(k.l),
        close: parseFloat(k.c),
        volume: parseFloat(k.v),
      };

      setCandles((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;

        if (!k.x) {
          updated[lastIndex] = liveCandle;
        } else {
          updated[lastIndex] = liveCandle;
          updated.push(liveCandle);
        }

        candleSeries.current?.update(liveCandle);

        volumeSeries.current?.update({
          time: liveCandle.time,
          value: liveCandle.volume,
        });

        smaSeries.current?.setData(calculateSMA(updated, 20));
        emaSeries.current?.setData(calculateEMA(updated, 50));

        return updated;
      });
    };

    return () => ws.close();
  }, [symbol, timeframe]);

  // --- TradingView-style tooltips ---
  useEffect(() => {
    if (!chartInstance.current || !candleSeries.current) return;

    const priceTooltip = document.getElementById("price-tooltip");
    const timeTooltip = document.getElementById("time-tooltip");

    chartInstance.current.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesPrices) {
        priceTooltip!.style.display = "none";
        timeTooltip!.style.display = "none";
        return;
      }

      const candlePrice = param.seriesPrices.get(candleSeries.current!);

      if (candlePrice) {
        priceTooltip!.innerText = candlePrice.close.toFixed(2);
        priceTooltip!.style.display = "block";
        priceTooltip!.style.top = param.point?.y + "px";
      }

      const utc = new Date((param.time as number) * 1000);
      const timeStr = utc.toLocaleString();

      timeTooltip!.innerText = timeStr;
      timeTooltip!.style.display = "block";
      timeTooltip!.style.left = param.point?.x + "px";
    });
  }, []);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
      <div
        ref={chartRef}
        className="absolute inset-0"
      />

      {/* TradingView-style price tooltip */}
      <div
        id="price-tooltip"
        className="absolute right-0 bg-black/80 text-white px-2 py-1 text-sm rounded hidden pointer-events-none"
      ></div>

      {/* TradingView-style time tooltip */}
      <div
        id="time-tooltip"
        className="absolute bottom-0 bg-black/80 text-white px-2 py-1 text-sm rounded hidden pointer-events-none"
      ></div>
    </div>
  );
                           }
