import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Trade } from "../types";
import { generateSeedTrades } from "./seed";

function toRow(t: Omit<Trade, "id">, userId: string) {
  return {
    user_id: userId,
    pair: t.pair,
    direction: t.direction,
    entry_price: t.entryPrice,
    exit_price: t.exitPrice,
    lot_size: t.lotSize,
    stop_loss: t.stopLoss ?? null,
    take_profit: t.takeProfit ?? null,
    entry_time: t.entryTime,
    exit_time: t.exitTime,
    strategy: t.strategy,
    emotion: t.emotion,
    notes: t.notes,
    screenshot_url: t.screenshotUrl ?? null,
  };
}

function mapRow(row: Record<string, unknown>): Trade {
  return {
    id: row.id as string,
    pair: row.pair as string,
    direction: row.direction as Trade["direction"],
    entryPrice: Number(row.entry_price),
    exitPrice: Number(row.exit_price),
    lotSize: Number(row.lot_size),
    stopLoss: row.stop_loss != null ? Number(row.stop_loss) : undefined,
    takeProfit: row.take_profit != null ? Number(row.take_profit) : undefined,
    entryTime: row.entry_time as string,
    exitTime: row.exit_time as string,
    strategy: row.strategy as string,
    emotion: row.emotion as Trade["emotion"],
    notes: (row.notes as string) ?? "",
    screenshotUrl: (row.screenshot_url as string) ?? undefined,
  };
}

function mapRows(rows: Record<string, unknown>[]): Trade[] {
  return rows.map(mapRow);
}

export function useTrades(userId: string | undefined) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrades = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("trades")
      .select("*")
      .eq("user_id", userId)
      .order("exit_time", { ascending: false });
    if (!error && data) {
      setTrades(mapRows(data as Record<string, unknown>[]));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const addTrade = useCallback(
    async (t: Omit<Trade, "id">) => {
      if (!userId) return;
      const { data, error } = await supabase
        .from("trades")
        .insert(toRow(t, userId))
        .select()
        .single();
      if (!error && data) {
        setTrades((prev) => [mapRow(data as Record<string, unknown>), ...prev]);
      }
    },
    [userId],
  );

  const deleteTrade = useCallback(async (id: string) => {
    await supabase.from("trades").delete().eq("id", id);
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const resetToSeed = useCallback(async () => {
    if (!userId) return;
    await supabase.from("trades").delete().eq("user_id", userId);
    const seed = generateSeedTrades();
    const rows = seed.map((t) => toRow(t, userId));
    const { data, error } = await supabase.from("trades").insert(rows).select();
    if (!error && data) {
      setTrades(mapRows(data as Record<string, unknown>[]));
    }
  }, [userId]);

  const clearAll = useCallback(async () => {
    if (!userId) return;
    await supabase.from("trades").delete().eq("user_id", userId);
    setTrades([]);
  }, [userId]);

  return { trades, addTrade, deleteTrade, resetToSeed, clearAll, loading };
}
