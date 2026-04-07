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

                  const data = await response.json();

                      return NextResponse.json({ data });
    } catch (error) {
          return NextResponse.json(
                  { error: 'Error fetching Binance data' },
                        { status: 500 }
          );
    }
}
          )
    }
              }
          )
    }
}
