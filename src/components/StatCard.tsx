import type { LucideIcon } from "lucide-react";
import { cn } from "../utils/cn";

interface Props {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "positive" | "negative";
}

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: Props) {
  const toneClasses = {
    default: "text-white",
    positive: "text-emerald-400",
    negative: "text-rose-400",
  }[tone];

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-900/60 border border-slate-800 p-5 hover:border-slate-700 transition group">
      <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 group-hover:from-emerald-500/10 group-hover:to-cyan-500/10 transition" />
      <div className="flex items-center justify-between mb-3 relative">
        <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className={cn("text-2xl font-bold tabular-nums relative", toneClasses)}>{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1 relative">{hint}</div>}
    </div>
  );
}
