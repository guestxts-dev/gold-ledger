import { Activity, DollarSign, Percent, TrendingDown, TrendingUp, Target, Award, AlertTriangle, Zap } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Trade } from "../types";
import { computeStats, equityCurve, pnlByDayOfWeek, pnlBySession, tradePnl, tradeSession } from "../lib/calc";
import { StatCard } from "../components/StatCard";

export function Dashboard({ trades }: { trades: Trade[] }) {
  const stats = computeStats(trades);
  const curve = equityCurve(trades);
  const dow = pnlByDayOfWeek(trades);
  const bySession = pnlBySession(trades);
  const bestSession = [...bySession].sort((a, b) => b.pnl - a.pnl)[0];
  const recent = [...trades].sort((a, b) => +new Date(b.exitTime) - +new Date(a.exitTime)).slice(0, 5);

  const fmt$ = (n: number) =>
    `${n >= 0 ? "+" : "-"}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-emerald-400 font-semibold mb-1">XAUUSD Trading Journal</div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Your gold trading edge at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Net P&L" value={fmt$(stats.totalPnl)} icon={DollarSign}
          tone={stats.totalPnl >= 0 ? "positive" : "negative"}
          hint={`${stats.totalTrades} trades`} />
        <StatCard label="Total Pips" value={`${stats.totalPips >= 0 ? "+" : ""}${stats.totalPips.toFixed(0)}`} icon={Zap}
          tone={stats.totalPips >= 0 ? "positive" : "negative"}
          hint="cumulative" />
        <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} icon={Percent}
          hint={`${stats.wins}W / ${stats.losses}L`} />
        <StatCard label="Profit Factor" value={stats.profitFactor.toFixed(2)} icon={Target}
          tone={stats.profitFactor >= 1.5 ? "positive" : stats.profitFactor >= 1 ? "default" : "negative"}
          hint={stats.profitFactor >= 1.5 ? "Strong edge" : "Needs work"} />
      </div>

      {/* Equity curve */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold">Equity Curve</h2>
            <p className="text-xs text-slate-400">Cumulative P&L on XAUUSD over time</p>
          </div>
          <div className={`text-sm font-semibold ${stats.totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {fmt$(stats.totalPnl)}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={curve}>
              <defs>
                <linearGradient id="eq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#94a3b8" }}
              />
              <Area type="monotone" dataKey="equity" stroke="#10b981" strokeWidth={2} fill="url(#eq)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Day of week */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
          <h2 className="text-white font-semibold mb-1">P&L by Day of Week</h2>
          <p className="text-xs text-slate-400 mb-4">When are you sharpest?</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dow}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }}
                  cursor={{ fill: "#1e293b80" }}
                />
                <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                  {dow.map((d, i) => (
                    <Cell key={i} fill={d.pnl >= 0 ? "#10b981" : "#f43f5e"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk snapshot */}
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
          <h2 className="text-white font-semibold mb-4">Risk Snapshot</h2>
          <div className="space-y-3">
            <SnapshotRow icon={Award} label="Largest Win" value={fmt$(stats.largestWin)} tone="positive" />
            <SnapshotRow icon={TrendingDown} label="Largest Loss" value={fmt$(stats.largestLoss)} tone="negative" />
            <SnapshotRow icon={AlertTriangle} label="Max Drawdown" value={`-$${stats.maxDrawdown.toFixed(2)}`} tone="negative" />
            <SnapshotRow icon={TrendingUp} label="Avg Win" value={fmt$(stats.avgWin)} tone="positive" />
            <SnapshotRow icon={Activity} label="Expectancy / trade" value={fmt$(stats.expectancy)} tone={stats.expectancy >= 0 ? "positive" : "negative"} />
          </div>
        </div>
      </div>

      {/* Session breakdown highlight */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-semibold">Session Edge</h2>
            <p className="text-xs text-slate-400">
              Best session: <span className="text-emerald-300 font-semibold">{bestSession?.session}</span> · {fmt$(bestSession?.pnl || 0)} on {bestSession?.count || 0} trades
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {bySession.map((s) => (
            <div key={s.session} className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/50">
              <div className="text-xs uppercase tracking-wider text-slate-500">{s.session}</div>
              <div className={`text-lg font-bold mt-1 ${s.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {fmt$(s.pnl)}
              </div>
              <div className="text-xs text-slate-500 mt-1">{s.count} trades · {s.winRate}% WR</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent trades */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
        <h2 className="text-white font-semibold mb-4">Recent Trades</h2>
        <div className="space-y-2">
          {recent.map((t) => {
            const pnl = tradePnl(t);
            const session = tradeSession(t);
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-950/50 border border-slate-800/50">
                <div className={`w-1 h-10 rounded-full ${pnl >= 0 ? "bg-emerald-400" : "bg-rose-400"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white">XAUUSD</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${t.direction === "long" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                      {t.direction === "long" ? "BUY" : "SELL"}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                      {session}
                    </span>
                    <span className="text-xs text-slate-500 truncate">{t.strategy}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{new Date(t.exitTime).toLocaleString()}</div>
                </div>
                <div className={`text-right font-semibold tabular-nums ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {fmt$(pnl)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SnapshotRow({ icon: Icon, label, value, tone }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; tone: "positive" | "negative" }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/40">
      <div className="flex items-center gap-3 text-sm text-slate-300">
        <Icon className={`w-4 h-4 ${tone === "positive" ? "text-emerald-400" : "text-rose-400"}`} />
        {label}
      </div>
      <div className={`font-semibold tabular-nums ${tone === "positive" ? "text-emerald-400" : "text-rose-400"}`}>
        {value}
      </div>
    </div>
  );
}
