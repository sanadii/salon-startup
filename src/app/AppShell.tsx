import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Calendar, CheckCircle2, LogOut, Settings as SettingsIcon, TrendingUp, Wallet } from 'lucide-react';
import { signOut as logOut } from '../supabase/auth';
import { usePlanner } from '../hooks/usePlanner';
import { SyncBanner } from '../components/SyncBanner';
import { cn } from '../lib/cn';
import {
  daysToOpening,
  onTrackStatus,
  progressPercent,
} from '../lib/selectors';
import type { PlannerAuthUser } from '../types/auth';

function trackLabel(status: ReturnType<typeof onTrackStatus>): string {
  switch (status) {
    case 'at-risk':
      return 'Needs attention';
    case 'over-budget':
      return 'Over budget';
    default:
      return 'On track';
  }
}

function trackDotClass(status: ReturnType<typeof onTrackStatus>): string {
  switch (status) {
    case 'at-risk':
      return 'bg-amber-400';
    case 'over-budget':
      return 'bg-rose-400';
    default:
      return 'bg-emerald-400 animate-pulse';
  }
}

export function AppShell({ user }: { user: PlannerAuthUser }) {
  const { state, syncStatus, syncMessage, dismissSyncError } = usePlanner();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', state.brandSettings.palette.primary);
    root.style.setProperty('--brand-secondary', state.brandSettings.palette.secondary);
    root.style.setProperty('--brand-accent', state.brandSettings.palette.accent);
    root.style.setProperty('--brand-muted', state.brandSettings.palette.muted);
    root.style.setProperty('--brand-paper', state.brandSettings.palette.paper);
  }, [state.brandSettings.palette]);

  const progress = progressPercent(state);
  const days = daysToOpening(state);
  const track = onTrackStatus(state);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm w-full text-left',
      isActive
        ? 'bg-brand text-white font-medium shadow-lg shadow-brand/20'
        : 'hover:bg-white/5 text-white/60'
    );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-brand text-white p-6 flex flex-col gap-8 border-r border-white/10">
        <div className="flex items-center gap-3">
          {state.brandSettings.logoUrl ? (
            <img
              src={state.brandSettings.logoUrl}
              alt="Logo"
              className="w-10 h-10 rounded-full object-cover border border-brand/20"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xl serif">
              {state.brandSettings.salonName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold serif tracking-wide truncate">
              {state.brandSettings.salonName}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[9px] uppercase tracking-wider text-brand-light font-medium">
                Progress
              </p>
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden min-w-[40px]">
                <div
                  className="h-full bg-white transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[9px] font-bold text-white">{progress}%</p>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <div className={cn('w-1.5 h-1.5 rounded-full', trackDotClass(track))} />
              <p className="text-[9px] font-bold text-white/80 uppercase tracking-widest">
                {trackLabel(track)}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2" aria-label="Main">
          <NavLink to="/dashboard" end className={navClass}>
            <TrendingUp size={18} /> Dashboard
          </NavLink>
          <NavLink to="/tasks" className={navClass}>
            <CheckCircle2 size={18} /> Tasks
          </NavLink>
          <NavLink to="/budget" className={navClass}>
            <Wallet size={18} /> Budget Tracker
          </NavLink>
          <NavLink to="/settings" className={navClass}>
            <SettingsIcon size={18} /> Settings
          </NavLink>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Calendar size={14} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-white/40">Opening In</p>
              <p className="text-sm font-medium">{days} Days</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-3">
            <p className="text-[10px] uppercase text-white/40 mb-1">Hammam Status</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-brand">{state.hammamStatus}</span>
              <div className="w-2 h-2 rounded-full bg-brand-light animate-pulse" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-white/20" />
              )}
              <span className="text-[10px] text-white/60 truncate max-w-[80px]">
                {user.displayName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void logOut()}
              className="p-1.5 text-white/40 hover:text-white transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <SyncBanner
          syncStatus={syncStatus}
          message={syncMessage}
          onDismiss={dismissSyncError}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-paper">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
