import type { Trade } from "../types";

const strategies = [
  "London Open Breakout",
  "NY Open Reversal",
  "Liquidity Sweep",
  "Key Level Rejection",
  "News Spike (NFP/CPI)",
  "Asian Range Break",
  "ATH Continuation",
  "Fibonacci",
  "Support/Resistance",
  "Candlestick",
  "Flag/Pennant",
  "Buy Zone",
  "Sell Zone",
  "News Buy",
  "News Sell",
  "Heads/Shoulders",
  "Double Top/Bottom",
  "Triangles",
  "Cup & Handle",
  "Trend Channels",
  "Divergence",
  "Breakouts",
  "Overbought/Oversold",
  "Rounding Bottom",
  "Other",
];
const emotions = ["Calm", "Confident", "Fomo", "Fearful", "Revenge", "Disciplined", "Bot", "Personal", "Aba Trades", "Apex Fx", "Coffie Fx", "UpDown Fx"];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function generateSeedTrades(count = 50): Trade[] {
  const trades: Trade[] = [];
  const now = Date.now();
  let goldBase = 2350;

  for (let i = 0; i < count; i++) {
    goldBase += randBetween(-15, 15);
    goldBase = Math.max(1900, Math.min(2700, goldBase));

    const direction: "long" | "short" = Math.random() > 0.4 ? "long" : "short";
    const win = Math.random() > 0.42;
    const dollarsMoved = (win ? 1 : -1) * randBetween(2, 35);

    const entry = +goldBase.toFixed(2);
    const exit = +(direction === "long" ? entry + dollarsMoved : entry - dollarsMoved).toFixed(2);
    const slDist = randBetween(3, 12);
    const tpDist = slDist * randBetween(1.5, 3);
    const sl = +(direction === "long" ? entry - slDist : entry + slDist).toFixed(2);
    const tp = +(direction === "long" ? entry + tpDist : entry - tpDist).toFixed(2);

    const daysAgo = count - i;
    const hourBias = Math.random() < 0.75 ? randBetween(7, 21) : randBetween(0, 24);
    const entryTime = new Date(now - daysAgo * 24 * 60 * 60 * 1000);
    entryTime.setUTCHours(Math.floor(hourBias), Math.floor(randBetween(0, 59)), 0, 0);
    const exitTime = new Date(entryTime.getTime() + randBetween(0.25, 6) * 3600 * 1000);

    trades.push({
      id: crypto.randomUUID(),
      pair: "XAUUSD",
      direction,
      entryPrice: entry,
      exitPrice: exit,
      lotSize: +randBetween(0.05, 0.5).toFixed(2),
      stopLoss: sl,
      takeProfit: tp,
      commission: +randBetween(0, 15).toFixed(2),
      entryTime: entryTime.toISOString(),
      exitTime: exitTime.toISOString(),
      strategy: rand(strategies),
      emotion: rand(emotions),
      notes: win
        ? "Clean setup at key level. Waited for confirmation, scaled out at 1R and 2R."
        : "Got faked out — entered too early on a sweep. Should have waited for the close.",
    });
  }
  return trades;
}
