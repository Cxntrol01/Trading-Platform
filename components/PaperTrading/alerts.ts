import { PriceAlert } from "./types";

const now = () => Date.now();
const makeId = () => now() + Math.random();

export function createAlert(params: {
  price: number;
  direction: "ABOVE" | "BELOW";
  persistent?: boolean;
}): PriceAlert {
  return {
    id: makeId(),
    price: params.price,
    direction: params.direction,
    persistent: params.persistent ?? false,
    triggered: false,
    timestamp: now(),
  };
}

export function checkAlerts(args: {
  price: number;
  alerts: PriceAlert[];
}): {
  remainingAlerts: PriceAlert[];
  triggeredAlerts: PriceAlert[];
} {
  const { price, alerts } = args;

  const triggered: PriceAlert[] = [];
  const remaining: PriceAlert[] = [];

  for (const alert of alerts) {
    const shouldTrigger =
      (alert.direction === "ABOVE" && price >= alert.price) ||
      (alert.direction === "BELOW" && price <= alert.price);

    if (shouldTrigger && !alert.triggered) {
      triggered.push({ ...alert, triggered: true });

      if (alert.persistent) {
        remaining.push({ ...alert, triggered: true });
      }
    } else {
      remaining.push(alert);
    }
  }

  return { remainingAlerts: remaining, triggeredAlerts: triggered };
}
