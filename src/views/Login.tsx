import { useState } from "react";
import { TrendingUp, Mail, Lock, AlertCircle } from "lucide-react";
import { supabase } from "../lib/supabase";

export function Login() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const fn = mode === "signin" ? supabase.auth.signInWithPassword : supabase.auth.signUp;
    const { error: err } = await fn({ email, password });
    if (err) setError(err.message);
    setSubmitting(false);
  };

  const toggle = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">PipLedger</div>
              <div className="text-xs uppercase tracking-widest text-slate-500">XAUUSD Trading Journal</div>
            </div>
          </div>

          <h1 className="text-xl font-bold text-white text-center mb-2">
            {mode === "signin" ? "Welcome back" : "Create your journal"}
          </h1>
          <p className="text-sm text-slate-400 text-center mb-6">
            {mode === "signin" ? "Sign in to access your trades" : "Start tracking your gold trades"}
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {submitting ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-400">
            {mode === "signin" ? (
              <>No account yet?{" "}<button onClick={toggle} className="text-emerald-400 hover:text-emerald-300 font-semibold">Sign up</button></>
            ) : (
              <>Already have one?{" "}<button onClick={toggle} className="text-emerald-400 hover:text-emerald-300 font-semibold">Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
