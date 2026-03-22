import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './app/AppShell';
import { LoginScreen } from './components/LoginScreen';
import { PlannerModals } from './components/PlannerModals';
import { PlannerProvider } from './contexts/PlannerContext';
import { useAuthUser } from './hooks/useAuthUser';
import { useSupabaseAppState } from './hooks/useSupabaseAppState';

const DashboardView = lazy(() =>
  import('./features/dashboard/DashboardView').then((m) => ({ default: m.DashboardView }))
);
const TasksView = lazy(() =>
  import('./features/tasks/TasksView').then((m) => ({ default: m.TasksView }))
);
const BudgetView = lazy(() =>
  import('./features/budget/BudgetView').then((m) => ({ default: m.BudgetView }))
);
const SettingsView = lazy(() =>
  import('./features/settings/SettingsView').then((m) => ({ default: m.SettingsView }))
);

function RouteFallback() {
  return (
    <div className="flex items-center justify-center min-h-[30vh] text-stone-500 gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-brand" aria-hidden />
      <span className="text-sm font-serif italic">Loading…</span>
    </div>
  );
}

function FullPageLoader() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-10 h-10 text-brand animate-spin mx-auto" aria-hidden />
        <p className="text-stone-500 font-serif italic">Loading your salon planner...</p>
      </div>
    </div>
  );
}

export default function App() {
  const { user, authReady } = useAuthUser();
  const fire = useSupabaseAppState(user);

  if (!authReady) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (fire.isLoading) {
    return <FullPageLoader />;
  }

  return (
    <PlannerProvider
      state={fire.state}
      setState={fire.setState}
      syncStatus={fire.syncStatus}
      syncMessage={fire.syncMessage}
      dismissSyncError={fire.dismissSyncError}
    >
      <BrowserRouter>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route element={<AppShell user={user} />}>
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/tasks" element={<TasksView />} />
              <Route path="/budget" element={<BudgetView />} />
              <Route path="/settings" element={<SettingsView />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
        <PlannerModals />
      </BrowserRouter>
    </PlannerProvider>
  );
}
