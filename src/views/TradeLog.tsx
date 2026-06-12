import { useMemo, useState } from "react";
import { Search, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { Trade } from "../types";
import { tradePips, tradePnl, tradeRR, tradeSession } from "../lib/calc";

interface Props {
  trades: Trade[];
  onDelete: (id: string) => void;
}

export function TradeLog({ trades, onDelete }: Props) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "wins" | "losses">("all");
  const [sessionFilter, setSessionFilter] = useState<"all" | "Asia" | "London" | "Overlap" | "NY">("all");

  const filtered = useMemo(() => {
    return trades
      .filter((t) => {
        if (filter === "wins" && tradePnl(t) <= 0) return false;
        if (filter === "losses" && tradePnl(t) >= 0) return false;
        if (sessionFilter !== "all" && tradeSession(t) !== sessionFilter) return false;
        const s = q.toLowerCase();
        return !s || t.strategy.toLowerCase().includes(s) || t.notes.toLowerCase().includes(s);
      })
      .sort((a, b) => +new Date(b.exitTime) - +new Date(a.exitTime));
  }, [trades, q, filter, sessionFilter]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">XAUUSD Trade Log</h1>
        <p className="text-slate-400 text-sm mt-1">{filtered.length} trades shown</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search strategy, notes..."
            className="w-full bg-slate-900/60 border border-slate-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
        <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-lg p-1">
          {(["all", "wins", "losses"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs rounded-md capitalize ${filter === f ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-slate-900/60 border border-slate-800 rounded-lg p-1">
          {(["all", "Asia", "London", "Overlap", "NY"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSessionFilter(s)}
              className={`px-3 py-1.5 text-xs rounded-md ${sessionFilter === s ? "bg-emerald-500/20 text-emerald-300" : "text-slate-400 hover:text-white"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-slate-900/60 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500 bg-slate-950/50">
                <th className="px-4 py-3">Dir</th>
                <th className="px-4 py-3">Entry → Exit</th>
                <th className="px-4 py-3">Lot</th>
                <th className="px-4 py-3">Pips</th>
                <th className="px-4 py-3">R:R</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Strategy</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">P&L</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => {
                const pnl = tradePnl(t);
                const pips = tradePips(t);
                const rr = tradeRR(t);
                const session = tradeSession(t);
                return (
                  <tr key={t.id} className="border-t border-slate-800/60 hover:bg-slate-800/20 transition">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded ${t.direction === "long" ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"}`}>
                        {t.direction === "long" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {t.direction === "long" ? "BUY" : "SELL"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 tabular-nums text-xs">
                      ${t.entryPrice} → ${t.exitPrice}
                    </td>
                    <td className="px-4 py-3 text-slate-300 tabular-nums">{t.lotSize}</td>
                    <td className={`px-4 py-3 tabular-nums font-medium ${pips >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {pips >= 0 ? "+" : ""}{pips.toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-slate-300 tabular-nums">{rr ? `1:${rr.toFixed(1)}` : "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">{session}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{t.strategy}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(t.exitTime).toLocaleDateString()}
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold tabular-nums ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {pnl >= 0 ? "+" : "-"}${Math.abs(pnl).toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onDelete(t.id)}
                        className="text-slate-500 hover:text-rose-400 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-500">
                    No trades match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
