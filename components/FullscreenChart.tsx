"use client";

import { useState } from "react";
import PriceChart from "./PriceChart";
import TimeframeSelector from "./TimeframeSelector";
import IndicatorPanel from "./IndicatorPanel";
import ChartSettings from "./ChartSettings";

export default function FullscreenChart() {
  const [symbol, setSymbol] = useState("BTCUSD");
  const [timeframe, setTimeframe] = useState("1h");

  function handleIndicatorToggle(indicator: string) {
    console.log("Toggle indicator:", indicator);
  }

  function handleSettingChange(setting: string) {
    console.log("Chart setting changed:", setting);
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">{symbol}</h1>

        <TimeframeSelector onSelect={setTimeframe} />
      </div>

      <PriceChart symbol={symbol} timeframe={timeframe} />

      <div className="flex justify-between items-center">
        <IndicatorPanel onToggle={handleIndicatorToggle} />
        <ChartSettings onChange={handleSettingChange} />
      </div>
    </div>
  );
}
