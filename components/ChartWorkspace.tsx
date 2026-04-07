"use client";

import { useState } from "react";

import Chart from "./Chart";
import ChartControls from "./ChartControls";
import ChartSettings from "./ChartSettings";
import ChartLayoutSelector from "./ChartLayoutSelector";
import DrawingTools from "./DrawingTools";
import MarketReplay from "./MarketReplay";
import SaveLayout from "./SaveLayout";
import FullscreenChart from "./FullscreenChart";
import ChartPresets from "./ChartPresets";
import MobileChartControls from "./MobileChartControls";

import IndicatorSettings from "./IndicatorSettings";
import AutoTrendlineSettings from "./AutoTrendlineSettings";
import AIAnnotationSettings from "./AIAnnotationSettings";
import AutoSRSettings from "./AutoSRSettings";

import RefreshInterval from "./RefreshInterval";
import AIRefreshRate from "./AIRefreshRate";

export default function ChartWorkspace() {
  const [layout, setLayout] = useState(1);

  const [indicatorSettings, setIndicatorSettings] = useState({
    RSI: { length: 14 },
    EMA: { period: 20 },
    SMA: { period: 20 },
    MACD: { fast: 12, slow: 26, signal: 9 },
    autoTrendlines: {},
    aiAnnotations: {},
    autoSR: {}
  });

  const [refreshRate, setRefreshRate] = useState(15000);

  const applyPreset = (preset: any) => {
    console.log("Preset applied:", preset);
  };

  const renderCharts = () => {
    const charts = [];
    for (let i = 0; i < layout; i++) {
      charts.push(
        <div key={i} className="w-full">
          <Chart refreshRate={refreshRate} />
        </div>
      );
    }
    return charts;
  };

  return (
    <div className="space-y-4">

      {/* DESKTOP TOOLBAR */}
      <div className="hidden md:flex flex-wrap gap-3 items-center">

        <ChartSettings onChange={() => {}} />

        <ChartPresets onApply={applyPreset} />

        <ChartLayoutSelector onChange={setLayout} />

        <MarketReplay />

        <SaveLayout />

        <FullscreenChart>
          <div className="space-y-4">{renderCharts()}</div>
        </FullscreenChart>

        <RefreshInterval onChange={(ms) => setRefreshRate(ms)} />
        <AIRefreshRate onChange={(ms) => setRefreshRate(ms)} />

        <IndicatorSettings
          indicator="RSI"
          onSave={(s) => setIndicatorSettings({ ...indicatorSettings, RSI: s })}
        />
        <IndicatorSettings
          indicator="EMA"
          onSave={(s) => setIndicatorSettings({ ...indicatorSettings, EMA: s })}
        />
        <IndicatorSettings
          indicator="SMA"
          onSave={(s) => setIndicatorSettings({ ...indicatorSettings, SMA: s })}
        />
        <IndicatorSettings
          indicator="MACD"
          onSave={(s) => setIndicatorSettings({ ...indicatorSettings, MACD: s })}
        />

        <AutoTrendlineSettings
          onSave={(s) =>
            setIndicatorSettings({ ...indicatorSettings, autoTrendlines: s })
          }
        />
        <AIAnnotationSettings
          onSave={(s) =>
            setIndicatorSettings({ ...indicatorSettings, aiAnnotations: s })
          }
        />
        <AutoSRSettings
          onSave={(s) =>
            setIndicatorSettings({ ...indicatorSettings, autoSR: s })
          }
        />
      </div>

      {/* MOBILE TOOLBAR */}
      <MobileChartControls>
        <ChartSettings onChange={() => {}} />
        <ChartPresets onApply={applyPreset} />
        <ChartLayoutSelector onChange={setLayout} />
        <MarketReplay />
        <SaveLayout />

        <RefreshInterval onChange={(ms) => setRefreshRate(ms)} />
        <AIRefreshRate onChange={(ms) => setRefreshRate(ms)} />

        <IndicatorSettings
          indicator="RSI"
          onSave={(s) => setIndicatorSettings({ ...indicatorSettings, RSI: s })}
        />
        <IndicatorSettings
          indicator="EMA"
          onSave={(s) => setIndicatorSettings({ ...indicatorSettings, EMA: s })}
        />
        <IndicatorSettings
          indicator="SMA"
          onSave={(s) => setIndicatorSettings({ ...indicatorSettings, SMA: s })}
        />
        <IndicatorSettings
          indicator="MACD"
          onSave={(s) => setIndicatorSettings({ ...indicatorSettings, MACD: s })}
        />

        <AutoTrendlineSettings
          onSave={(s) =>
            setIndicatorSettings({ ...indicatorSettings, autoTrendlines: s })
          }
        />
        <AIAnnotationSettings
          onSave={(s) =>
            setIndicatorSettings({ ...indicatorSettings, aiAnnotations: s })
          }
        />
        <AutoSRSettings
          onSave={(s) =>
            setIndicatorSettings({ ...indicatorSettings, autoSR: s })
          }
        />
      </MobileChartControls>

      <DrawingTools onSelect={() => {}} />

      <div
        className={`grid gap-4 ${
          layout === 1
            ? "grid-cols-1"
            : layout === 2
            ? "grid-cols-2"
            : layout === 3
            ? "grid-cols-3"
            : "grid-cols-2 md:grid-cols-2"
        }`}
      >
        {renderCharts()}
      </div>
    </div>
  );
            }
