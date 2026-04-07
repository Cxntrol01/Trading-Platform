import PriceChart from "./PriceChart";
import RSIChart from "./RSIChart";

export default function ChartWithIndicators({
  symbol,
  timeframe,
}: {
  symbol: string;
  timeframe: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <PriceChart symbol={symbol} timeframe={timeframe} />
      <RSIChart symbol={symbol} timeframe={timeframe} />
    </div>
  );
}
