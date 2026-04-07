export function calculateSMA(data: any[], length: number) {
  const result = [];

  for (let i = 0; i < data.length; i++) {
    if (i < length) continue;

    const slice = data.slice(i - length, i);
    const avg =
      slice.reduce((sum, c) => sum + c.close, 0) / length;

    result.push({
      time: data[i].time,
      value: avg,
    });
  }

  return result;
}

export function calculateEMA(data: any[], length: number) {
  const result = [];
  const k = 2 / (length + 1);

  let emaPrev = data[0].close;

  for (let i = 1; i < data.length; i++) {
    const close = data[i].close;
    const ema = close * k + emaPrev * (1 - k);

    result.push({
      time: data[i].time,
      value: ema,
    });

    emaPrev = ema;
  }

  return result;
}
