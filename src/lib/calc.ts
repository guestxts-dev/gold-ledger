import type { Trade, TradeStats, Session } from "../types";

export const GOLD_PIP_SIZE = 0.1;
export const GOLD_PIP_VALUE_PER_LOT = 1;

export function tradePips(t: Trade): number {
  const diff = t.direction === "long" ? t.exitPrice - t.entryPrice : t.entryPrice - t.exitPrice;
  return diff / GOLD_PIP_SIZE;
}

export function tradePnl(t: Trade): number {
  return tradePips(t) * GOLD_PIP_VALUE_PER_LOT * t.lotSize - (t.commission ?? 0);
}

export function tradeRR(t: Trade): number | null {
  if (!t.stopLoss || !t.takeProfit) return null;
  const risk = Math.abs(t.entryPrice - t.stopLoss);
  const reward = Math.abs(t.takeProfit - t.entryPrice);
  if (risk === 0) return null;
  return reward / risk;
}

export function tradeRiskDollars(t: Trade): number | null {
  if (!t.stopLoss) return null;
  const riskPips = Math.abs(t.entryPrice - t.stopLoss) / GOLD_PIP_SIZE;
  return riskPips * GOLD_PIP_VALUE_PER_LOT * t.lotSize;
}

export function tradeSession(t: Trade): Session {
  const h = new Date(t.entryTime).getUTCHours();
  if (h >= 13 && h < 15) return "Overlap";
  if (h >= 7 && h < 13) return "London";
  if (h >= 13 && h < 21) return "NY";
  return "Asia";
}

export function tradeDurationMinutes(t: Trade): number {
  return Math.round((+new Date(t.exitTime) - +new Date(t.entryTime)) / 60000);
}

export function computeStats(trades: Trade[]): TradeStats {
  if (trades.length === 0) {
    return {
      totalTrades: 0, wins: 0, losses: 0, winRate: 0, totalPnl: 0, totalPips: 0,
      avgWin: 0, avgLoss: 0, profitFactor: 0, expectancy: 0,
      largestWin: 0, largestLoss: 0, maxDrawdown: 0,
    };
  }
  const pnls = trades.map(tradePnl);
  const pips = trades.map(tradePips);
  const wins = pnls.filter((p) => p > 0);
  const losses = pnls.filter((p) => p < 0);
  const totalPnl = pnls.reduce((a, b) => a + b, 0);
  const totalPips = pips.reduce((a, b) => a + b, 0);
  const grossWin = wins.reduce((a, b) => a + b, 0);
  const grossLoss = Math.abs(losses.reduce((a, b) => a + b, 0));
  const avgWin = wins.length ? grossWin / wins.length : 0;
  const avgLoss = losses.length ? grossLoss / losses.length : 0;
  const winRate = (wins.length / trades.length) * 100;
  const profitFactor = grossLoss === 0 ? grossWin : grossWin / grossLoss;
  const expectancy = (winRate / 100) * avgWin - (1 - winRate / 100) * avgLoss;

  const sorted = [...trades].sort((a, b) => +new Date(a.exitTime) - +new Date(b.exitTime));
  let equity = 0, peak = 0, maxDD = 0;
  for (const t of sorted) {
    equity += tradePnl(t);
    if (equity > peak) peak = equity;
    const dd = peak - equity;
    if (dd > maxDD) maxDD = dd;
  }

  return {
    totalTrades: trades.length,
    wins: wins.length,
    losses: losses.length,
    winRate,
    totalPnl,
    totalPips,
    avgWin,
    avgLoss,
    profitFactor,
    expectancy,
    largestWin: wins.length ? Math.max(...wins) : 0,
    largestLoss: losses.length ? Math.min(...losses) : 0,
    maxDrawdown: maxDD,
  };
}

export function equityCurve(trades: Trade[]): { date: string; equity: number; pnl: number }[] {
  const sorted = [...trades].sort((a, b) => +new Date(a.exitTime) - +new Date(b.exitTime));
  let equity = 0;
  return sorted.map((t) => {
    const pnl = tradePnl(t);
    equity += pnl;
    return {
      date: new Date(t.exitTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      equity: Math.round(equity * 100) / 100,
      pnl: Math.round(pnl * 100) / 100,
    };
  });
}

export function pnlBySession(trades: Trade[]) {
  const sessions: Session[] = ["Asia", "London", "Overlap", "NY"];
  const map = new Map<Session, { pnl: number; count: number; wins: number }>();
  sessions.forEach((s) => map.set(s, { pnl: 0, count: 0, wins: 0 }));
  trades.forEach((t) => {
    const s = tradeSession(t);
    const cur = map.get(s)!;
    const p = tradePnl(t);
    cur.pnl += p;
    cur.count += 1;
    if (p > 0) cur.wins += 1;
  });
  return sessions.map((s) => {
    const v = map.get(s)!;
    return {
      session: s,
      pnl: Math.round(v.pnl * 100) / 100,
      count: v.count,
      winRate: v.count ? Math.round((v.wins / v.count) * 100) : 0,
    };
  });
}

export function pnlByDayOfWeek(trades: Trade[]) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const totals = new Array(7).fill(0);
  trades.forEach((t) => {
    const d = new Date(t.exitTime).getDay();
    totals[d] += tradePnl(t);
  });
  return days.map((day, i) => ({ day, pnl: Math.round(totals[i] * 100) / 100 }));
}

export function pnlByStrategy(trades: Trade[]) {
  const map = new Map<string, { pnl: number; count: number; wins: number }>();
  trades.forEach((t) => {
    const cur = map.get(t.strategy) || { pnl: 0, count: 0, wins: 0 };
    const p = tradePnl(t);
    cur.pnl += p;
    cur.count += 1;
    if (p > 0) cur.wins += 1;
    map.set(t.strategy, cur);
  });
  return Array.from(map.entries()).map(([strategy, v]) => ({
    strategy,
    pnl: Math.round(v.pnl * 100) / 100,
    count: v.count,
    winRate: Math.round((v.wins / v.count) * 100),
  }));
}

export function pnlByEmotion(trades: Trade[]) {
  const map = new Map<string, { pnl: number; count: number }>();
  trades.forEach((t) => {
    const c = map.get(t.emotion) || { pnl: 0, count: 0 };
    c.pnl += tradePnl(t);
    c.count += 1;
    map.set(t.emotion, c);
  });
  return Array.from(map.entries()).map(([emotion, v]) => ({
    emotion,
    pnl: +v.pnl.toFixed(2),
    count: v.count,
  }));
}
