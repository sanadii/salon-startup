import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { INITIAL_DATA } from '../constants';
import type { AppState, Task, TaskStatus } from '../types';
import type { SyncStatus } from '../hooks/useSupabaseAppState';

type NewTaskForm = {
  title: string;
  description: string;
  dueDate: string;
  estimatedCost: number;
  actualCost: number;
};

type BudgetTaskTarget =
  | { modId: string; task: Task }
  | { modId: string; task: null }; // create new in module

export type PlannerContextValue = {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  syncStatus: SyncStatus;
  syncMessage: string | null;
  dismissSyncError: () => void;
  selectedModuleId: string | null;
  setSelectedModuleId: (id: string | null) => void;
  tasksSubTab: 'list' | 'timeline';
  setTasksSubTab: (t: 'list' | 'timeline') => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (v: boolean) => void;
  editingTask: { moduleId: string; task: Task } | null;
  setEditingTask: (v: { moduleId: string; task: Task } | null) => void;
  newTask: NewTaskForm;
  setNewTask: React.Dispatch<React.SetStateAction<NewTaskForm>>;
  isBudgetModalOpen: boolean;
  setIsBudgetModalOpen: (v: boolean) => void;
  editingBudgetTask: BudgetTaskTarget | null;
  setEditingBudgetTask: (v: BudgetTaskTarget | null) => void;
  newBudgetTask: { title: string; estimatedCost: number; actualCost: number };
  setNewBudgetTask: React.Dispatch<
    React.SetStateAction<{ title: string; estimatedCost: number; actualCost: number }>
  >;
  toggleTaskStatus: (moduleId: string, taskId: string) => void;
  updateActual: (modId: string, taskId: string, amount: number) => void;
  updateEstimated: (modId: string, taskId: string, amount: number) => void;
  resetTimeline: () => void;
  handleSaveTask: () => void;
  handleDeleteTask: (moduleId: string, taskId: string) => void;
  handleSaveBudgetTask: (modId: string) => void;
  openCreateBudgetItem: (modId: string) => void;
};

export const PlannerContext = createContext<PlannerContextValue | null>(null);

export function PlannerProvider({
  children,
  state,
  setState,
  syncStatus,
  syncMessage,
  dismissSyncError,
}: {
  children: React.ReactNode;
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  syncStatus: SyncStatus;
  syncMessage: string | null;
  dismissSyncError: () => void;
}) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    state.modules[0]?.id ?? null
  );
  const [tasksSubTab, setTasksSubTab] = useState<'list' | 'timeline'>('list');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{ moduleId: string; task: Task } | null>(null);
  const [newTask, setNewTask] = useState<NewTaskForm>({
    title: '',
    description: '',
    dueDate: '',
    estimatedCost: 0,
    actualCost: 0,
  });
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudgetTask, setEditingBudgetTask] = useState<BudgetTaskTarget | null>(null);
  const [newBudgetTask, setNewBudgetTask] = useState({
    title: '',
    estimatedCost: 0,
    actualCost: 0,
  });

  useEffect(() => {
    if (
      selectedModuleId &&
      !state.modules.some((m) => m.id === selectedModuleId)
    ) {
      setSelectedModuleId(state.modules[0]?.id ?? null);
    }
  }, [state.modules, selectedModuleId]);

  const toggleTaskStatus = useCallback((moduleId: string, taskId: string) => {
    setState((prev) => ({
      ...prev,
      modules: prev.modules.map((mod) => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          tasks: mod.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const nextStatus: TaskStatus =
              task.status === 'done'
                ? 'todo'
                : task.status === 'todo'
                  ? 'in-progress'
                  : 'done';
            return { ...task, status: nextStatus };
          }),
        };
      }),
    }));
  }, [setState]);

  const updateActual = useCallback(
    (modId: string, taskId: string, amount: number) => {
      setState((prev) => ({
        ...prev,
        modules: prev.modules.map((mod) => {
          if (mod.id !== modId) return mod;
          return {
            ...mod,
            tasks: mod.tasks.map((task) =>
              task.id === taskId ? { ...task, actualCost: amount } : task
            ),
          };
        }),
      }));
    },
    [setState]
  );

  const updateEstimated = useCallback(
    (modId: string, taskId: string, amount: number) => {
      setState((prev) => ({
        ...prev,
        modules: prev.modules.map((mod) => {
          if (mod.id !== modId) return mod;
          return {
            ...mod,
            tasks: mod.tasks.map((task) =>
              task.id === taskId ? { ...task, estimatedCost: amount } : task
            ),
          };
        }),
      }));
    },
    [setState]
  );

  const resetTimeline = useCallback(() => {
    setState((prev) => ({
      ...prev,
      modules: prev.modules.map((mod) => {
        const initialMod = INITIAL_DATA.modules.find((m) => m.id === mod.id);
        if (!initialMod) return mod;
        return {
          ...mod,
          tasks: mod.tasks.map((task) => {
            const initialTask = initialMod.tasks.find((t) => t.id === task.id);
            if (!initialTask) return task;
            return { ...task, dueDate: initialTask.dueDate };
          }),
        };
      }),
    }));
  }, [setState]);

  const handleSaveTask = useCallback(() => {
    if (!selectedModuleId) return;
    setState((prev) => ({
      ...prev,
      modules: prev.modules.map((mod) => {
        if (mod.id !== selectedModuleId) return mod;
        if (editingTask) {
          return {
            ...mod,
            tasks: mod.tasks.map((t) =>
              t.id === editingTask.task.id ? { ...t, ...newTask } : t
            ),
          };
        }
        const newTaskObj: Task = {
          id: Math.random().toString(36).slice(2, 11),
          title: newTask.title,
          description: newTask.description,
          dueDate: newTask.dueDate,
          estimatedCost: newTask.estimatedCost,
          actualCost: newTask.actualCost,
          status: 'todo',
        };
        return { ...mod, tasks: [...mod.tasks, newTaskObj] };
      }),
    }));
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setNewTask({
      title: '',
      description: '',
      dueDate: '',
      estimatedCost: 0,
      actualCost: 0,
    });
  }, [selectedModuleId, editingTask, newTask, setState]);

  const handleDeleteTask = useCallback(
    (moduleId: string, taskId: string) => {
      setState((prev) => ({
        ...prev,
        modules: prev.modules.map((mod) => {
          if (mod.id !== moduleId) return mod;
          return { ...mod, tasks: mod.tasks.filter((t) => t.id !== taskId) };
        }),
      }));
    },
    [setState]
  );

  const handleSaveBudgetTask = useCallback(
    (modId: string) => {
      setState((prev) => ({
        ...prev,
        modules: prev.modules.map((mod) => {
          if (mod.id !== modId) return mod;
          if (editingBudgetTask?.task) {
            return {
              ...mod,
              tasks: mod.tasks.map((t) =>
                t.id === editingBudgetTask.task!.id
                  ? {
                      ...t,
                      title: newBudgetTask.title,
                      estimatedCost: newBudgetTask.estimatedCost,
                      actualCost: newBudgetTask.actualCost,
                    }
                  : t
              ),
            };
          }
          const task: Task = {
            id: Math.random().toString(36).slice(2, 11),
            title: newBudgetTask.title,
            status: 'todo',
            estimatedCost: newBudgetTask.estimatedCost,
            actualCost: newBudgetTask.actualCost,
          };
          return { ...mod, tasks: [...mod.tasks, task] };
        }),
      }));
      setIsBudgetModalOpen(false);
      setEditingBudgetTask(null);
      setNewBudgetTask({ title: '', estimatedCost: 0, actualCost: 0 });
    },
    [editingBudgetTask, newBudgetTask, setState]
  );

  const openCreateBudgetItem = useCallback((modId: string) => {
    setNewBudgetTask({ title: '', estimatedCost: 0, actualCost: 0 });
    setEditingBudgetTask({ modId, task: null });
    setIsBudgetModalOpen(true);
  }, []);

  const value = useMemo<PlannerContextValue>(
    () => ({
      state,
      setState,
      syncStatus,
      syncMessage,
      dismissSyncError,
      selectedModuleId,
      setSelectedModuleId,
      tasksSubTab,
      setTasksSubTab,
      isTaskModalOpen,
      setIsTaskModalOpen,
      editingTask,
      setEditingTask,
      newTask,
      setNewTask,
      isBudgetModalOpen,
      setIsBudgetModalOpen,
      editingBudgetTask,
      setEditingBudgetTask,
      newBudgetTask,
      setNewBudgetTask,
      toggleTaskStatus,
      updateActual,
      updateEstimated,
      resetTimeline,
      handleSaveTask,
      handleDeleteTask,
      handleSaveBudgetTask,
      openCreateBudgetItem,
    }),
    [
      state,
      setState,
      syncStatus,
      syncMessage,
      dismissSyncError,
      selectedModuleId,
      tasksSubTab,
      isTaskModalOpen,
      editingTask,
      newTask,
      isBudgetModalOpen,
      editingBudgetTask,
      newBudgetTask,
      toggleTaskStatus,
      updateActual,
      updateEstimated,
      resetTimeline,
      handleSaveTask,
      handleDeleteTask,
      handleSaveBudgetTask,
      openCreateBudgetItem,
    ]
  );

  return (
    <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>
  );
}
