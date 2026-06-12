import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Trade } from "../types";
import { tradePnl } from "../lib/calc";

export function Calendar({ trades }: { trades: Trade[] }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const dayMap = useMemo(() => {
    const m = new Map<string, { pnl: number; count: number }>();
    trades.forEach((t) => {
      const d = new Date(t.exitTime);
      if (d.getFullYear() !== year || d.getMonth() !== month) return;
      const key = d.toISOString().slice(0, 10);
      const cur = m.get(key) || { pnl: 0, count: 0 };
      cur.pnl += tradePnl(t);
      cur.count += 1;
      m.set(key, cur);
    });
    return m;
  }, [trades, year, month]);

  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = firstDay.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const totalMonth = Array.from(dayMap.values()).reduce((s, v) => s + v.pnl, 0);
  const tradeCount = Array.from(dayMap.values()).reduce((s, v) => s + v.count, 0);

  const go = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setMonth(m); setYear(y);
  };

  const maxAbs = Math.max(1, ...Array.from(dayMap.values()).map((v) => Math.abs(v.pnl)));

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Calendar</h1>
        <p className="text-slate-400 text-sm mt-1">Daily P&L heatmap — spot your hot streaks.</p>
      </div>

      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <button onClick={() => go(-1)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-lg font-semibold text-white px-3 min-w-[180px] text-center">{monthName}</div>
            <button onClick={() => go(1)} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-sm">
            <span className="text-slate-400">Month P&L: </span>
            <span className={`font-semibold ${totalMonth >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              {totalMonth >= 0 ? "+" : "-"}${Math.abs(totalMonth).toFixed(2)}
            </span>
            <span className="text-slate-500 ml-3 text-xs">{tradeCount} trades</span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2 text-xs text-slate-500 text-center font-semibold">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {cells.map((day, idx) => {
            if (day === null) return <div key={idx} />;
            const key = new Date(year, month, day).toISOString().slice(0, 10);
            const data = dayMap.get(key);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            if (data) {
              const intensity = Math.min(1, Math.abs(data.pnl) / maxAbs);
              const alpha = 0.15 + intensity * 0.6;
              return (
                <div key={idx}
                  className={`aspect-square rounded-lg p-2 flex flex-col justify-between border ${isToday ? "border-cyan-400" : "border-transparent"} transition hover:scale-105 cursor-pointer`}
                  style={{ backgroundColor: data.pnl >= 0 ? `rgba(16,185,129,${alpha})` : `rgba(244,63,94,${alpha})` }}
                  title={`${data.count} trades`}
                >
                  <div className="text-xs font-semibold text-white">{day}</div>
                  <div>
                    <div className="text-[10px] font-bold text-white tabular-nums">
                      {data.pnl >= 0 ? "+" : "-"}${Math.abs(data.pnl).toFixed(0)}
                    </div>
                    <div className="text-[9px] text-white/70">{data.count}t</div>
                  </div>
                </div>
              );
            }
            return (
              <div key={idx}
                className={`aspect-square rounded-lg p-2 bg-slate-950/40 border ${isToday ? "border-cyan-400" : "border-slate-800/40"}`}>
                <div className="text-xs text-slate-500">{day}</div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-rose-500/30" />
            <div className="w-3 h-3 rounded bg-rose-500/60" />
            <div className="w-3 h-3 rounded bg-rose-500" />
            <span className="ml-1">Loss</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Win</span>
            <div className="w-3 h-3 rounded bg-emerald-500/30" />
            <div className="w-3 h-3 rounded bg-emerald-500/60" />
            <div className="w-3 h-3 rounded bg-emerald-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
