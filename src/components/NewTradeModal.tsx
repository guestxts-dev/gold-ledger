import { useState } from "react";
import { X } from "lucide-react";
import type { Trade } from "../types";
import { tradePips, tradePnl, tradeRR, tradeRiskDollars } from "../lib/calc";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (t: Omit<Trade, "id">) => void;
}

const strategies = [
  "London Open Breakout",
  "NY Open Reversal",
  "Liquidity Sweep",
  "Key Level Rejection",
  "News Spike (NFP/CPI)",
  "Asian Range Break",
  "ATH Continuation",
  "Other",
];
const emotions: Trade["emotion"][] = ["calm", "confident", "fomo", "fearful", "revenge", "disciplined"];

export function NewTradeModal({ open, onClose, onSave }: Props) {
  const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  const [form, setForm] = useState<Omit<Trade, "id">>({
    pair: "XAUUSD",
    direction: "long",
    entryPrice: 2350.00,
    exitPrice: 2365.50,
    lotSize: 0.10,
    stopLoss: 2342.00,
    takeProfit: 2375.00,
    entryTime: nowLocal(),
    exitTime: nowLocal(),
    strategy: "London Open Breakout",
    emotion: "calm",
    notes: "",
  });

  if (!open) return null;

  const previewPnl = tradePnl(form as Trade);
  const previewPips = tradePips(form as Trade);
  const previewRR = tradeRR(form as Trade);
  const previewRisk = tradeRiskDollars(form as Trade);

  const update = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      pair: "XAUUSD",
      entryTime: new Date(form.entryTime).toISOString(),
      exitTime: new Date(form.exitTime).toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Log a New Trade</h2>
            <p className="text-xs text-slate-400">XAUUSD · Capture every detail while it's fresh.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-4">
          <Field label="Direction">
            <div className="flex gap-2">
              {(["long", "short"] as const).map((d) => (
                <button key={d} type="button" onClick={() => update("direction", d)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition ${form.direction === d ? (d === "long" ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20" : "bg-rose-500 text-white shadow-lg shadow-rose-500/20") : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}>
                  {d === "long" ? "▲ BUY" : "▼ SELL"}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Entry $">
              <input type="number" step="0.01" value={form.entryPrice} onChange={(e) => update("entryPrice", +e.target.value)} className={inputCls} />
            </Field>
            <Field label="Exit $">
              <input type="number" step="0.01" value={form.exitPrice} onChange={(e) => update("exitPrice", +e.target.value)} className={inputCls} />
            </Field>
            <Field label="Stop Loss">
              <input type="number" step="0.01" value={form.stopLoss ?? ""} onChange={(e) => update("stopLoss", +e.target.value)} className={inputCls} />
            </Field>
            <Field label="Take Profit">
              <input type="number" step="0.01" value={form.takeProfit ?? ""} onChange={(e) => update("takeProfit", +e.target.value)} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Lot Size">
              <input type="number" step="0.01" value={form.lotSize} onChange={(e) => update("lotSize", +e.target.value)} className={inputCls} />
            </Field>
            <Field label="Entry Time">
              <input type="datetime-local" value={form.entryTime} onChange={(e) => update("entryTime", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Exit Time">
              <input type="datetime-local" value={form.exitTime} onChange={(e) => update("exitTime", e.target.value)} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Strategy / Setup">
              <select value={form.strategy} onChange={(e) => update("strategy", e.target.value)} className={inputCls}>
                {strategies.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Emotion">
              <select value={form.emotion} onChange={(e) => update("emotion", e.target.value as Trade["emotion"])} className={inputCls}>
                {emotions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Notes">
            <textarea value={form.notes} onChange={(e) => update("notes", e.target.value)} rows={3}
              placeholder="Context, news catalyst, what you saw, lessons..."
              className={inputCls + " resize-none"} />
          </Field>

          {/* Live preview */}
          <div className="grid grid-cols-4 gap-3 p-4 rounded-lg bg-slate-950/60 border border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Pips</div>
              <div className={`text-lg font-bold tabular-nums ${previewPips >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {previewPips >= 0 ? "+" : ""}{previewPips.toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">P&L</div>
              <div className={`text-lg font-bold tabular-nums ${previewPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {previewPnl >= 0 ? "+" : "-"}${Math.abs(previewPnl).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">R:R</div>
              <div className="text-lg font-bold text-slate-200 tabular-nums">
                {previewRR ? `1:${previewRR.toFixed(1)}` : "—"}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Risk</div>
              <div className="text-lg font-bold text-rose-300 tabular-nums">
                {previewRisk !== null ? `$${previewRisk.toFixed(2)}` : "—"}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-semibold hover:opacity-90">
              Save Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
