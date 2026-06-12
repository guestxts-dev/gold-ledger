import { LayoutDashboard, BookOpen, BarChart3, CalendarDays, Plus } from "lucide-react";
import { cn } from "../utils/cn";
import type { View } from "./Sidebar";

interface Props {
  view: View;
  onChange: (v: View) => void;
  onNewTrade: () => void;
}

const items: { key: View; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "dashboard", label: "Home", icon: LayoutDashboard },
  { key: "trades", label: "Trades", icon: BookOpen },
  { key: "analytics", label: "Stats", icon: BarChart3 },
  { key: "calendar", label: "Cal", icon: CalendarDays },
];

export function MobileNav({ view, onChange, onNewTrade }: Props) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur border-t border-slate-800 flex items-center justify-around py-2 px-1">
      {items.slice(0, 2).map((it) => {
        const Icon = it.icon;
        const active = view === it.key;
        return (
          <button key={it.key} onClick={() => onChange(it.key)}
            className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px]",
              active ? "text-emerald-400" : "text-slate-500")}>
            <Icon className="w-5 h-5" />
            {it.label}
          </button>
        );
      })}
      <button onClick={onNewTrade}
        className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
        <Plus className="w-6 h-6 text-slate-950" />
      </button>
      {items.slice(2).map((it) => {
        const Icon = it.icon;
        const active = view === it.key;
        return (
          <button key={it.key} onClick={() => onChange(it.key)}
            className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px]",
              active ? "text-emerald-400" : "text-slate-500")}>
            <Icon className="w-5 h-5" />
            {it.label}
          </button>
        );
      })}
    </nav>
  );
}
