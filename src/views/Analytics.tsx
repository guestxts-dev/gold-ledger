import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { Trade } from "../types";
import { pnlBySession, pnlByStrategy, pnlByEmotion, tradePnl } from "../lib/calc";

export function Analytics({ trades }: { trades: Trade[] }) {
  const bySession = pnlBySession(trades);
  const byStrat = pnlByStrategy(trades);
  const byEmo = pnlByEmotion(trades);

  const colors = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#f43f5e"];

  const longs = trades.filter((t) => t.direction === "long");
  const shorts = trades.filter((t) => t.direction === "short");
  const dirData = [
    { name: "Long", value: longs.length, pnl: longs.reduce((s, t) => s + tradePnl(t), 0) },
    { name: "Short", value: shorts.length, pnl: shorts.reduce((s, t) => s + tradePnl(t), 0) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Find your edge — and the leaks — in XAUUSD.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Panel title="P&L by Trading Session" subtitle="London, NY, Overlap, Asia — when do you print?">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bySession}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="session" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1e293b50" }} />
              <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                {bySession.map((d, i) => (
                  <Cell key={i} fill={d.pnl >= 0 ? "#10b981" : "#f43f5e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {bySession.map((s) => (
              <div key={s.session} className="p-2 rounded-lg bg-slate-950/40 text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">{s.session}</div>
                <div className="text-xs text-slate-300 mt-0.5">{s.count} trades</div>
                <div className="text-xs font-semibold text-emerald-400">{s.winRate}% WR</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Strategy Performance" subtitle="Which setups are paying you?">
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {byStrat.sort((a, b) => b.pnl - a.pnl).map((s) => (
              <div key={s.strategy} className="p-3 rounded-lg bg-slate-950/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white text-sm">{s.strategy}</span>
                  <span className={`text-sm font-semibold ${s.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {s.pnl >= 0 ? "+" : "-"}${Math.abs(s.pnl).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{s.count} trades</span>
                  <span>•</span>
                  <span>{s.winRate}% win rate</span>
                </div>
                <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{ width: `${s.winRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Emotional Edge" subtitle="P&L by mindset at entry">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byEmo}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="emotion" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#1e293b50" }} />
              <Bar dataKey="pnl" radius={[6, 6, 0, 0]}>
                {byEmo.map((d, i) => (
                  <Cell key={i} fill={d.pnl >= 0 ? "#10b981" : "#f43f5e"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Long vs Short Bias" subtitle="Are you over-trading one direction?">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={dirData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={4}
              >
                {dirData.map((_, i) => (
                  <Cell key={i} fill={colors[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-2 text-center">
            {dirData.map((d) => (
              <div key={d.name} className="p-2 rounded-lg bg-slate-950/40">
                <div className="text-xs text-slate-400">{d.name} · {d.value}</div>
                <div className={`font-semibold ${d.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {d.pnl >= 0 ? "+" : "-"}${Math.abs(d.pnl).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

const tooltipStyle = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  fontSize: 12,
};

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5">
      <div className="mb-4">
        <h2 className="text-white font-semibold">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
