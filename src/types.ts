export type Direction = "long" | "short";

export type Session = "Asia" | "London" | "NY" | "Overlap";

export interface Trade {
  id: string;
  pair: string; // always "XAUUSD" but kept for flexibility
  direction: Direction;
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  stopLoss?: number;
  takeProfit?: number;
  entryTime: string; // ISO
  exitTime: string;  // ISO
  strategy: string;
  emotion: "calm" | "confident" | "fomo" | "fearful" | "revenge" | "disciplined";
  notes: string;
  screenshotUrl?: string;
}

export interface TradeStats {
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  totalPnl: number;
  totalPips: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  expectancy: number;
  largestWin: number;
  largestLoss: number;
  maxDrawdown: number;
}
