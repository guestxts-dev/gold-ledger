import { useEffect, useState } from "react";
import { RotateCcw, Loader2, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { Sidebar, type View } from "./components/Sidebar";
import { MobileNav } from "./components/MobileNav";
import { NewTradeModal } from "./components/NewTradeModal";
import { Dashboard } from "./views/Dashboard";
import { TradeLog } from "./views/TradeLog";
import { Analytics } from "./views/Analytics";
import { Calendar } from "./views/Calendar";
import { Login } from "./views/Login";
import { useTrades } from "./lib/store";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

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
