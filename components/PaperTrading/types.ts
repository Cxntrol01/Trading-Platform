// Shared types for the Paper Trading system (Layer 2)

export type Direction = "LONG" | "SHORT";

export type OrderSide = "BUY" | "SELL";

export type OrderType =
  | "LIMIT"
  | "STOP"
  | "STOP_LIMIT"
  | "TAKE_PROFIT"
  | "TP_LIMIT";

export type TimeInForce = "GTC" | "IOC" | "FOK";

export interface Trade {
  side: OrderSide | "CLOSE";
  direction: Direction;
  price: number;
  size: number;
  pnl?: number;
  timestamp: number;
}

export interface Position {
  id: number;
  direction: Direction;
  entryPrice: number;
  size: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface Order {
  id: number;
  side: OrderSide;
  direction: Direction;
  type: OrderType;

  // Price fields
  price?: number;          // Limit price
  triggerPrice?: number;   // For stop/stop-limit/TP orders

  size: number;

  // Advanced flags
  reduceOnly: boolean;
  postOnly: boolean;
  tif: TimeInForce;

  // Merge behavior
  merge: boolean;

  timestamp: number;
}

export interface OrderFillResult {
  filled: boolean;
  fillPrice?: number;
  pnl?: number;
  closedPositions?: Position[];
  openedPositions?: Position[];
}
