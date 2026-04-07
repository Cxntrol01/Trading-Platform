"use client";

import { useEffect, useRef } from "react";

export default function Chart({ refreshRate = 15000 }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const tvScript = document.createElement("script");
    tvScript.src = "https://s3.tradingview.com/tv.js";
    tvScript.async = true;

    tvScript.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: "AAPL",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          container_id: chartRef.current.id,
        });
      }
    };

    document.body.appendChild(tvScript);

    const interval = setInterval(() => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: "AAPL",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          container_id: chartRef.current.id,
        });
      }
    }, refreshRate);

    return () => clearInterval(interval);
  }, [refreshRate]);

  return (
    <div
      id={`tv_chart_${Math.random().toString(36).substring(2)}`}
      ref={chartRef}
      className="w-full h-[400px] rounded-lg overflow-hidden"
    />
  );
}
