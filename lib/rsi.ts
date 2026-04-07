export function calculateRSI(candles: any[], length: number = 14) {
  const rsiData = [];
  let gains = 0;
  let losses = 0;

  // Seed initial average gain/loss
  for (let i = 1; i <= length; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  gains /= length;
  losses /= length;

  for (let i = length + 1; i < candles.length; i++) {
    const diff = candles[i].close - candles[i - 1].close;

    if (diff >= 0) {
      gains = (gains * (length - 1) + diff) / length;
      losses = (losses * (length - 1)) / length;
    } else {
      gains = (gains * (length - 1)) / length;
      losses = (losses * (length - 1) - diff) / length;
    }

    const rs = gains / (losses || 1);
    const rsi = 100 - 100 / (1 + rs);

    rsiData.push({
      time: candles[i].time,
      value: rsi,
    });
  }

  return rsiData;
}
