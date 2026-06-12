import { useEffect, useState } from "react";
import { RotateCcw, Loader2, LogOut, Settings } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "./lib/supabase";
import { Sidebar, type View } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";
import { NewTradeModal } from "./components/NewTradeModal";
import { Dashboard } from "./views/Dashboard";
import { TradeLog } from "./views/TradeLog";
import { Analytics } from "./views/Analytics";
import { Calendar } from "./views/Calendar";
import { Login } from "./views/Login";
import { useTrades } from "./lib/store";

function ConfigError() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md text-center">
        <Settings className="w-12 h-12 text-amber-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Supabase Not Configured</h1>
        <p className="text-slate-400 text-sm mb-6">
          Set the <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded text-xs">VITE_SUPABASE_URL</code> and{" "}
          <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded text-xs">VITE_SUPABASE_ANON_KEY</code>{" "}
          environment variables in your Vercel project settings.
        </p>
        <ol className="text-left text-sm text-slate-400 space-y-2 bg-slate-900/60 rounded-xl p-5 border border-slate-800">
          <li>1. Go to your Vercel project dashboard</li>
          <li>2. Navigate to <strong className="text-white">Settings → Environment Variables</strong></li>
          <li>3. Add both variables with your Supabase project values</li>
          <li>4. Redeploy the project</li>
        </ol>
        <p className="text-xs text-slate-500 mt-6">
          Need a Supabase project? Create one at <span className="text-emerald-400">supabase.com</span>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  if (!supabaseConfigured) return <ConfigError />;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChanged((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!user) return <Login />;

  return <AuthenticatedApp user={user} />;
}

function AuthenticatedApp({ user }: { user: User }) {
  const [view, setView] = useState<View>("dashboard");
  const [modalOpen, setModalOpen] = useState(false);
  const { trades, addTrade, deleteTrade, resetToSeed, loading: tradesLoading } = useTrades(user.id);

  const logout = () => {
    supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <Sidebar view={view} onChange={setView} onNewTrade={() => setModalOpen(true)} onLogout={logout} />

      <main className="flex-1 relative pb-20 md:pb-0">
        <header className="md:hidden sticky top-0 z-30 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-cyan-500" />
            <span className="font-bold text-white">PipLedger</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={resetToSeed} title="Reset to demo data" className="text-xs text-slate-400 flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
            <button onClick={logout} title="Sign out" className="text-xs text-slate-400 flex items-center gap-1">
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </header>

        <div className="hidden md:flex items-center justify-end gap-3 px-8 pt-6">
          <button
            onClick={resetToSeed}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700"
            title="Reset all data to demo seed"
          >
            <RotateCcw className="w-3 h-3" /> Reset demo data
          </button>
          <div className="text-xs text-slate-500">{user.email}</div>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {tradesLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
          ) : (
            <>
              {view === "dashboard" && <Dashboard trades={trades} />}
              {view === "trades" && <TradeLog trades={trades} onDelete={deleteTrade} />}
              {view === "analytics" && <Analytics trades={trades} />}
              {view === "calendar" && <Calendar trades={trades} />}
            </>
          )}
        </div>
      </main>

      <MobileNav view={view} onChange={setView} onNewTrade={() => setModalOpen(true)} />

      <NewTradeModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={addTrade} />
    </div>
  );
}
