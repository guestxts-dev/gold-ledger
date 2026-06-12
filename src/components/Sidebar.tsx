import { LayoutDashboard, BookOpen, BarChart3, CalendarDays, Plus, TrendingUp } from "lucide-react";
import { cn } from "../utils/cn";

export type View = "dashboard" | "trades" | "analytics" | "calendar";

interface Props {
  view: View;
  onChange: (v: View) => void;
  onNewTrade: () => void;
  onLogout: () => void;
}

const items: { key: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "trades", label: "Trade Log", icon: BookOpen },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
];

export function Sidebar({ view, onChange, onNewTrade, onLogout }: Props) {
  return (
    <aside className="hidden md:flex w-64 flex-col bg-slate-950/80 backdrop-blur border-r border-slate-800 p-4 sticky top-0 h-screen">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <TrendingUp className="w-5 h-5 text-slate-950" />
        </div>
        <div>
          <div className="font-bold text-white tracking-tight">PipLedger</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500">XAUUSD Journal</div>
        </div>
      </div>

      <button
        onClick={onNewTrade}
        className="mb-6 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-semibold py-2.5 rounded-lg hover:opacity-90 transition shadow-lg shadow-emerald-500/20"
      >
        <Plus className="w-4 h-4" /> New Trade
      </button>

      <nav className="flex flex-col gap-1">
        {items.map((it) => {
          const Icon = it.icon;
          const active = view === it.key;
          return (
            <button
              key={it.key}
              onClick={() => onChange(it.key)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition",
                active
                  ? "bg-slate-800/80 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              )}
            >
              <Icon className="w-4 h-4" />
              {it.label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800/40 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
