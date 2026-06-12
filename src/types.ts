export type Direction = "long" | "short";

export type Session = "Asia" | "London" | "NY" | "Overlap";

export interface Trade {
  id: string;
  pair: string;
  direction: Direction;
  entryPrice: number;
  exitPrice: number;
  lotSize: number;
  stopLoss?: number;
  takeProfit?: number;
  commission?: number;
  entryTime: string;
  exitTime: string;
  strategy: string;
  emotion: string;
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
