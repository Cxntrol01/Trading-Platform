import { NextResponse } from 'next/server';

export async function GET() {
    try {
          const response = await fetch(
                  'https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=100',
                        { cache: 'no-store' }
          );

              if (!response.ok) {
                      throw new Error('Failed to fetch Binance data');
              }

                  const raw = await response.json();

                      // Format candles for charting
                          const candles = raw.map((candle: any[]) => ({
                                  time: candle[0],
                                        open: parseFloat(candle[1]),
                                              high: parseFloat(candle[2]),
                                                    low: parseFloat(candle[3]),
                                                          close: parseFloat(candle[4]),
                          }));

                              return NextResponse.json({ candles });
    } catch (error) {
          return NextResponse.json(
                  { error: 'Error generating chart data' },
                        { status: 500 }
          );
    }
}
          )
    }
                          }))
              }
          )
    }
}
