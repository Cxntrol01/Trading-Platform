import {
  Direction,
  Order,
  OrderSide,
  OrderType,
  Position,
  Trade,
} from "./types";

// --- Helpers --------------------------------------------------------

const now = () => Date.now();

const makeId = () => now() + Math.random();

// Basic trigger logic for different order types
function shouldFill(order: Order, lastPrice: number): boolean {
  const { side, type, price, triggerPrice } = order;

  switch (type) {
    case "LIMIT": {
      if (price === undefined) return false;
      if (side === "BUY") return lastPrice <= price;
      return lastPrice >= price;
    }
    case "STOP": {
      if (triggerPrice === undefined) return false;
      if (side === "BUY") return lastPrice >= triggerPrice;
      return lastPrice <= triggerPrice;
    }
    case "STOP_LIMIT": {
      // Simplified: treat as STOP that executes at limit price if provided,
      // otherwise at market.
      if (triggerPrice === undefined) return false;
      if (side === "BUY") return lastPrice >= triggerPrice;
      return lastPrice <= triggerPrice;
    }
    case "TAKE_PROFIT": {
      if (triggerPrice === undefined) return false;
      // TP is opposite of STOP
      if (side === "BUY") return lastPrice <= triggerPrice;
      return lastPrice >= triggerPrice;
    }
    case "TP_LIMIT": {
      if (triggerPrice === undefined) return false;
      if (side === "BUY") return lastPrice <= triggerPrice;
      return lastPrice >= triggerPrice;
    }
    default:
      return false;
  }
}

function getFillPrice(order: Order, lastPrice: number): number {
  // For simplicity:
  // - LIMIT: fill at limit price
  // - STOP / TAKE_PROFIT: fill at market (lastPrice)
  // - STOP_LIMIT / TP_LIMIT: fill at limit price if set, else market
  switch (order.type) {
    case "LIMIT":
      return order.price ?? lastPrice;
    case "STOP":
    case "TAKE_PROFIT":
      return lastPrice;
    case "STOP_LIMIT":
    case "TP_LIMIT":
      return order.price ?? lastPrice;
    default:
      return lastPrice;
  }
}

// --- Public API -----------------------------------------------------

export function createOrder(params: {
  side: OrderSide;
  direction: Direction;
  type: OrderType;
  price?: number;
  triggerPrice?: number;
  size: number;
  reduceOnly?: boolean;
  postOnly?: boolean;
  tif?: "GTC" | "IOC" | "FOK";
  merge?: boolean;
}): Order {
  return {
    id: makeId(),
    side: params.side,
    direction: params.direction,
    type: params.type,
    price: params.price,
    triggerPrice: params.triggerPrice,
    size: params.size,
    reduceOnly: params.reduceOnly ?? false,
    postOnly: params.postOnly ?? false,
    tif: params.tif ?? "GTC",
    merge: params.merge ?? true,
    timestamp: now(),
  };
}

interface ProcessResult {
  updatedPositions: Position[];
  remainingOrders: Order[];
  trades: Trade[];
  realizedPnlDelta: number;
}

// Core function: process all open orders on a new price tick
export function processOrdersOnPrice(args: {
  lastPrice: number;
  positions: Position[];
  orders: Order[];
}): ProcessResult {
  const { lastPrice } = args;
  let positions = [...args.positions];
  const remainingOrders: Order[] = [];
  const trades: Trade[] = [];
  let realizedPnlDelta = 0;

  for (const order of args.orders) {
    // Post-only: in a real exchange this would prevent immediate execution.
    // Here we keep it simple and still allow fills if triggered.
    const willFill = shouldFill(order, lastPrice);

    if (!willFill) {
      remainingOrders.push(order);
      continue;
    }

    const fillPrice = getFillPrice(order, lastPrice);

    // Reduce-only: only touch existing positions in that direction
    if (order.reduceOnly) {
      const { pnlDelta, updatedPositions, trade } = applyReduceOnlyFill(
        order,
        positions,
        fillPrice
      );
      positions = updatedPositions;
      if (trade) trades.push(trade);
      realizedPnlDelta += pnlDelta;
      // Reduce-only orders are one-shot
      continue;
    }

    // Normal / merge behavior
    const {
      updatedPositions,
      trade,
      pnlDelta,
    } = applyNormalFill(order, positions, fillPrice);

    positions = updatedPositions;
    if (trade) trades.push(trade);
    realizedPnlDelta += pnlDelta;

    // Time-in-force:
    // - GTC: already removed (we don't re-add)
    // - IOC/FOK: also one-shot in this simplified model
  }

  return {
    updatedPositions: positions,
    remainingOrders,
    trades,
    realizedPnlDelta,
  };
}

// --- Fill logic -----------------------------------------------------

function applyNormalFill(
  order: Order,
  positions: Position[],
  fillPrice: number
): {
  updatedPositions: Position[];
  trade?: Trade;
  pnlDelta: number;
} {
  const updatedPositions = [...positions];
  let pnlDelta = 0;

  // Merge behavior: if merge is true, we try to merge with an existing
  // position in the same direction. Otherwise, we always create a new one.
  if (order.merge) {
    const idx = updatedPositions.findIndex(
      (p) => p.direction === order.direction
    );

    if (idx >= 0) {
      const existing = updatedPositions[idx];

      // Simple model: we only ever increase size in that direction.
      const newSize = existing.size + order.size;
      const newEntry =
        (existing.entryPrice * existing.size + fillPrice * order.size) /
        newSize;

      updatedPositions[idx] = {
        ...existing,
        size: newSize,
        entryPrice: newEntry,
      };
    } else {
      // No existing position in that direction → open new
      updatedPositions.unshift({
        id: makeId(),
        direction: order.direction,
        entryPrice: fillPrice,
        size: order.size,
      });
    }
  } else {
    // No merge: always open a new independent position
    updatedPositions.unshift({
      id: makeId(),
      direction: order.direction,
      entryPrice: fillPrice,
      size: order.size,
    });
  }

  const trade: Trade = {
    side: order.side,
    direction: order.direction,
    price: fillPrice,
    size: order.size,
    timestamp: now(),
  };

  return { updatedPositions, trade, pnlDelta };
}

function applyReduceOnlyFill(
  order: Order,
  positions: Position[],
  fillPrice: number
): {
  updatedPositions: Position[];
  trade?: Trade;
  pnlDelta: number;
} {
  const updatedPositions = [...positions];
  let pnlDelta = 0;

  const idx = updatedPositions.findIndex(
    (p) => p.direction === order.direction
  );

  if (idx < 0) {
    // No position to reduce → nothing happens
    return { updatedPositions, trade: undefined, pnlDelta };
  }

  const existing = updatedPositions[idx];

  const reduceSize = Math.min(existing.size, order.size);
  const remainingSize = existing.size - reduceSize;

  // PnL on the reduced portion
  const pnl =
    existing.direction === "LONG"
      ? (fillPrice - existing.entryPrice) * reduceSize
      : (existing.entryPrice - fillPrice) * reduceSize;

  pnlDelta += pnl;

  if (remainingSize <= 0) {
    updatedPositions.splice(idx, 1);
  } else {
    updatedPositions[idx] = {
      ...existing,
      size: remainingSize,
    };
  }

  const trade: Trade = {
    side: order.side,
    direction: order.direction,
    price: fillPrice,
    size: reduceSize,
    pnl,
    timestamp: now(),
  };

  return { updatedPositions, trade, pnlDelta };
}
