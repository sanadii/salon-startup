import type { AppState, Task } from '../types';

export type TaskWithModule = Task & { moduleTitle: string; moduleId: string };

export function totalBudget(state: AppState): number {
  return state.modules.reduce(
    (acc, mod) =>
      acc + mod.tasks.reduce((iAcc, task) => iAcc + (Number(task.estimatedCost) || 0), 0),
    0
  );
}

export function totalSpent(state: AppState): number {
  return state.modules.reduce(
    (acc, mod) =>
      acc + mod.tasks.reduce((iAcc, task) => iAcc + (Number(task.actualCost) || 0), 0),
    0
  );
}

export function totalTasks(state: AppState): number {
  return state.modules.reduce((acc, mod) => acc + mod.tasks.length, 0);
}

export function completedTasks(state: AppState): number {
  return state.modules.reduce(
    (acc, mod) => acc + mod.tasks.filter((t) => t.status === 'done').length,
    0
  );
}

export function daysToOpening(state: AppState): number {
  const diff = new Date(state.openingDate).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function progressPercent(state: AppState): number {
  const tt = totalTasks(state);
  const ct = completedTasks(state);
  return tt > 0 ? Math.round((ct / tt) * 100) : 0;
}

export function flattenTasks(state: AppState): TaskWithModule[] {
  return state.modules.flatMap((mod) =>
    mod.tasks.map((task) => ({
      ...task,
      moduleTitle: mod.title,
      moduleId: mod.id,
    }))
  );
}

export function sortedTasksByDueDate(state: AppState): TaskWithModule[] {
  const all = flattenTasks(state);
  return [...all].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

/** Estimated budget for Hammam build task (i3) + any task with "hammam" in title (case-insensitive). */
export function hammamEstimatedBudget(state: AppState): number {
  const interior = state.modules.find((m) => m.id === 'interior');
  if (!interior) return 0;
  return interior.tasks.reduce((sum, t) => {
    const isHammam =
      t.id === 'i3' || (t.title && t.title.toLowerCase().includes('hammam'));
    if (!isHammam) return sum;
    return sum + (Number(t.estimatedCost) || 0);
  }, 0);
}

export type OnTrackStatus = 'on-track' | 'at-risk' | 'over-budget';

export function onTrackStatus(state: AppState): OnTrackStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueIncomplete = flattenTasks(state).filter((t) => {
    if (t.status === 'done' || !t.dueDate) return false;
    const d = new Date(t.dueDate);
    d.setHours(0, 0, 0, 0);
    return d < today;
  });
  if (overdueIncomplete.length > 0) return 'at-risk';

  const tb = totalBudget(state);
  const ts = totalSpent(state);
  if (tb > 0 && ts > tb * 1.1) return 'over-budget';

  return 'on-track';
}
