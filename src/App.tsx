import React, { useState, useEffect, useMemo } from 'react';
import { 
  Palette, 
  Layout, 
  Scissors, 
  Megaphone, 
  Rocket, 
  CheckCircle2, 
  Circle, 
  Clock, 
  TrendingUp, 
  Wallet, 
  Calendar,
  ChevronRight,
  Plus,
  ArrowUpRight,
  Droplets,
  Camera,
  Banknote,
  Check,
  Settings as SettingsIcon,
  LogOut,
  LogIn,
  User as UserIcon,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { INITIAL_DATA } from './constants';
import { AppState, Task, TaskStatus, BudgetItem } from './types';
import { auth, db, signIn, logOut, handleFirestoreError, OperationType } from './firebase';
import { Settings } from './components/Settings';
import { TaskCard } from './components/TaskCard';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Palette: <Palette size={20} />,
  Layout: <Layout size={20} />,
  Scissors: <Scissors size={20} />,
  Megaphone: <Megaphone size={20} />,
  Rocket: <Rocket size={20} />,
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [state, setState] = useState<AppState>(INITIAL_DATA);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'budget' | 'settings'>('dashboard');
  const [tasksSubTab, setTasksSubTab] = useState<'list' | 'timeline'>('list');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(state.modules[0]?.id || null);
  
  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<{ moduleId: string, task: Task } | null>(null);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    dueDate: '',
    estimatedCost: 0,
    actualCost: 0
  });

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudgetTask, setEditingBudgetTask] = useState<{ modId: string, task: Task } | null>(null);
  const [newBudgetTask, setNewBudgetTask] = useState({ title: '', estimatedCost: 0, actualCost: 0 });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const docRef = doc(db, 'users', user.uid, 'data', 'appState');
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        let data = snapshot.data() as AppState;
        let hasChanges = false;
        
        // Migration: Update opening date if it's the old default
        if (data.openingDate === '2026-06-01') {
          data.openingDate = '2026-06-19';
          hasChanges = true;
        }

        // Migration: Update salon name if it's the old default
        if (data.brandSettings.salonName === 'Éclat Salon') {
          data.brandSettings.salonName = 'Elegancia';
          hasChanges = true;
        }

        // Migration: Update Hammam Maghribi Build description if it's the old one
        const interiorModule = data.modules.find(m => m.id === 'interior');
        if (interiorModule) {
          const hammamTask = interiorModule.tasks.find(t => t.id === 'i3');
          if (hammamTask && hammamTask.description === 'Specialized plumbing (steam/drainage), marble/tile selection, heating system, and moisture-proof ventilation.') {
            hammamTask.description = 'Implementation of specialized plumbing for high-pressure steam and rapid drainage. Selection of premium moisture-resistant marble and non-slip tiles. Installation of an underfloor heating system and high-capacity moisture-proof ventilation to prevent mold and ensure guest comfort.';
            hasChanges = true;
          }
        }

        // Migration: Add missing modules from INITIAL_DATA
        INITIAL_DATA.modules.forEach(initialMod => {
          const existingMod = data.modules.find(m => m.id === initialMod.id);
          if (!existingMod) {
            data.modules.push(initialMod);
            hasChanges = true;
          } else {
            // Check for missing tasks within existing modules
            initialMod.tasks.forEach(initialTask => {
              if (!existingMod.tasks.some(t => t.id === initialTask.id)) {
                existingMod.tasks.push(initialTask);
                hasChanges = true;
              }
            });
          }
        });



        if (hasChanges) {
          setIsSyncing(true);
          setDoc(docRef, data).catch(e => handleFirestoreError(e, OperationType.WRITE, docRef.path));
        }

        setIsSyncing(true);
        setState(data);
        setTimeout(() => setIsSyncing(false), 100);
      } else {
        // Initialize with default data if document doesn't exist
        setDoc(docRef, INITIAL_DATA).catch(e => handleFirestoreError(e, OperationType.WRITE, docRef.path));
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, docRef.path);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || isSyncing || isLoading) return;

    const docRef = doc(db, 'users', user.uid, 'data', 'appState');
    const timeoutId = setTimeout(() => {
      setDoc(docRef, state).catch(e => handleFirestoreError(e, OperationType.WRITE, docRef.path));
    }, 1000); // Debounce saves

    return () => clearTimeout(timeoutId);
  }, [state, user, isSyncing, isLoading]);

  useEffect(() => {
    // Apply dynamic colors
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', state.brandSettings.palette.primary);
    root.style.setProperty('--brand-secondary', state.brandSettings.palette.secondary);
    root.style.setProperty('--brand-accent', state.brandSettings.palette.accent);
    root.style.setProperty('--brand-muted', state.brandSettings.palette.muted);
    root.style.setProperty('--brand-paper', state.brandSettings.palette.paper);
  }, [state.brandSettings.palette]);

  // Calculations
  const totalBudget = useMemo(() => 
    state.modules.reduce((acc, mod) => 
      acc + mod.tasks.reduce((iAcc, task) => iAcc + (Number(task.estimatedCost) || 0), 0), 0
    ), [state.modules]);

  const totalSpent = useMemo(() => 
    state.modules.reduce((acc, mod) => 
      acc + mod.tasks.reduce((iAcc, task) => iAcc + (Number(task.actualCost) || 0), 0), 0
    ), [state.modules]);

  const totalTasks = useMemo(() => 
    state.modules.reduce((acc, mod) => acc + mod.tasks.length, 0), [state.modules]);

  const completedTasks = useMemo(() => 
    state.modules.reduce((acc, mod) => 
      acc + mod.tasks.filter(t => t.status === 'done').length, 0
    ), [state.modules]);

  const daysToOpening = useMemo(() => {
    const diff = new Date(state.openingDate).getTime() - new Date().getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [state.openingDate]);

  const toggleTaskStatus = (moduleId: string, taskId: string) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(mod => {
        if (mod.id !== moduleId) return mod;
        return {
          ...mod,
          tasks: mod.tasks.map(task => {
            if (task.id !== taskId) return task;
            const nextStatus: TaskStatus = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in-progress' : 'done';
            return { ...task, status: nextStatus };
          })
        };
      })
    }));
  };

  const updateActual = (modId: string, taskId: string, amount: number) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(mod => {
        if (mod.id !== modId) return mod;
        return {
          ...mod,
          tasks: mod.tasks.map(task => task.id === taskId ? { ...task, actualCost: amount } : task)
        };
      })
    }));
  };

  const updateEstimated = (modId: string, taskId: string, amount: number) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(mod => {
        if (mod.id !== modId) return mod;
        return {
          ...mod,
          tasks: mod.tasks.map(task => task.id === taskId ? { ...task, estimatedCost: amount } : task)
        };
      })
    }));
  };

  const resetTimeline = () => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(mod => {
        const initialMod = INITIAL_DATA.modules.find(m => m.id === mod.id);
        if (!initialMod) return mod;
        return {
          ...mod,
          tasks: mod.tasks.map(task => {
            const initialTask = initialMod.tasks.find(t => t.id === task.id);
            if (!initialTask) return task;
            return { ...task, dueDate: initialTask.dueDate };
          })
        };
      })
    }));
  };

  const handleSaveTask = () => {
    if (!selectedModuleId) return;
    
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(mod => {
        if (mod.id !== selectedModuleId) return mod;
        
        if (editingTask) {
          return {
            ...mod,
            tasks: mod.tasks.map(t => t.id === editingTask.task.id ? { ...t, ...newTask } : t)
          };
        } else {
          const newTaskObj: Task = {
            id: Math.random().toString(36).substr(2, 9),
            title: newTask.title,
            description: newTask.description,
            dueDate: newTask.dueDate,
            estimatedCost: newTask.estimatedCost,
            actualCost: newTask.actualCost,
            status: 'todo'
          };
          return { ...mod, tasks: [...mod.tasks, newTaskObj] };
        }
      })
    }));
    
    setIsTaskModalOpen(false);
    setEditingTask(null);
    setNewTask({ title: '', description: '', dueDate: '', estimatedCost: 0, actualCost: 0 });
  };

  const handleDeleteTask = (moduleId: string, taskId: string) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(mod => {
        if (mod.id !== moduleId) return mod;
        return { ...mod, tasks: mod.tasks.filter(t => t.id !== taskId) };
      })
    }));
  };

  const handleSaveBudgetTask = (modId: string) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(mod => {
        if (mod.id !== modId) return mod;
        
        if (editingBudgetTask && editingBudgetTask.task.id) {
          return {
            ...mod,
            tasks: mod.tasks.map(t => t.id === editingBudgetTask.task.id ? { 
              ...t, 
              title: newBudgetTask.title, 
              estimatedCost: newBudgetTask.estimatedCost, 
              actualCost: newBudgetTask.actualCost
            } : t)
          };
        } else {
          const newTask: Task = {
            id: Math.random().toString(36).substr(2, 9),
            title: newBudgetTask.title,
            status: 'todo',
            estimatedCost: newBudgetTask.estimatedCost,
            actualCost: newBudgetTask.actualCost
          };
          return { ...mod, tasks: [...mod.tasks, newTask] };
        }
      })
    }));
    
    setIsBudgetModalOpen(false);
    setEditingBudgetTask(null);
    setNewBudgetTask({ title: '', estimatedCost: 0, actualCost: 0 });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-brand animate-spin mx-auto" />
          <p className="text-stone-500 font-serif italic">Loading your salon planner...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-stone-100 text-center space-y-8"
        >
          <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center text-white text-4xl font-serif mx-auto shadow-lg shadow-brand/20">
            É
          </div>
          <div>
            <h1 className="text-3xl font-serif text-ink">Éclat Salon Planner</h1>
            <p className="text-stone-500 mt-2">Sign in to manage your salon startup and sync your data to the cloud.</p>
          </div>
          <button 
            onClick={() => signIn()}
            className="w-full flex items-center justify-center gap-3 bg-brand text-white py-4 rounded-2xl font-medium hover:scale-[1.02] transition-all shadow-xl shadow-brand/20"
          >
            <LogIn className="w-5 h-5" />
            Sign in with Google
          </button>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest">Secure Cloud Database Integration</p>
        </motion.div>
      </div>
    );
  }

  const allTasks = state.modules.flatMap(mod => 
    mod.tasks.map(task => ({ ...task, moduleTitle: mod.title, moduleId: mod.id }))
  );

  const sortedTasks = [...allTasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-brand text-white p-6 flex flex-col gap-8 border-r border-white/10">
        <div className="flex items-center gap-3">
          {state.brandSettings.logoUrl ? (
            <img src={state.brandSettings.logoUrl} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-brand/20" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold text-xl serif">
              {state.brandSettings.salonName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold serif tracking-wide truncate">{state.brandSettings.salonName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[9px] uppercase tracking-wider text-brand-light font-medium">Progress</p>
              <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden min-w-[40px]">
                <div 
                  className="h-full bg-white transition-all duration-1000" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[9px] font-bold text-white">{progressPercent}%</p>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-[9px] font-bold text-white/80 uppercase tracking-widest">On Track</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm",
              activeTab === 'dashboard' ? "bg-brand text-white font-medium shadow-lg shadow-brand/20" : "hover:bg-white/5 text-white/60"
            )}
          >
            <TrendingUp size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm",
              activeTab === 'tasks' ? "bg-brand text-white font-medium shadow-lg shadow-brand/20" : "hover:bg-white/5 text-white/60"
            )}
          >
            <CheckCircle2 size={18} /> Tasks
          </button>
          <button 
            onClick={() => setActiveTab('budget')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm",
              activeTab === 'budget' ? "bg-brand text-white font-medium shadow-lg shadow-brand/20" : "hover:bg-white/5 text-white/60"
            )}
          >
            <Wallet size={18} /> Budget Tracker
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm",
              activeTab === 'settings' ? "bg-brand text-white font-medium shadow-lg shadow-brand/20" : "hover:bg-white/5 text-white/60"
            )}
          >
            <SettingsIcon size={18} /> Settings
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <Calendar size={14} />
            </div>
            <div>
              <p className="text-[10px] uppercase text-white/40">Opening In</p>
              <p className="text-sm font-medium">{daysToOpening} Days</p>
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
              <img src={user.photoURL || ''} alt="User" className="w-6 h-6 rounded-full" />
              <span className="text-[10px] text-white/60 truncate max-w-[80px]">{user.displayName}</span>
            </div>
            <button 
              onClick={() => logOut()}
              className="p-1.5 text-white/40 hover:text-brand transition-colors"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 bg-paper">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-4xl serif font-light">Welcome, Founder</h2>
                  <p className="text-ink/50 mt-1">Here's the current state of your salon startup.</p>
                </div>
                <div className="flex gap-2">
                  <div className="px-4 py-2 bg-white border border-brand/5 rounded-lg shadow-sm">
                    <p className="text-[10px] uppercase text-ink/40">Total Budget (Est.)</p>
                    <p className="text-lg font-semibold">{totalBudget.toLocaleString()} <span className="text-xs font-normal">KD</span></p>
                  </div>
                </div>
              </header>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-brand/5 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-brand/10 text-brand rounded-xl">
                      <Wallet size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">Budget Spent</span>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-3xl font-light serif">{totalSpent.toLocaleString()} <span className="text-sm">KD</span></h3>
                    <div className="w-full bg-brand/10 h-1.5 rounded-full mt-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0}%` }}
                        className="h-full bg-brand"
                      />
                    </div>
                    <p className="text-xs text-ink/40 mt-2">{totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% of estimated budget</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-brand/5 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <CheckCircle2 size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">Tasks Progress</span>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-3xl font-light serif">{completedTasks} / {totalTasks}</h3>
                    <div className="w-full bg-brand/10 h-1.5 rounded-full mt-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                    <p className="text-xs text-ink/40 mt-2">{totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0}% completion rate</p>
                  </div>
                </div>

                <div className="bg-brand text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-brand/10 rounded-full blur-3xl" />
                  <div className="flex justify-between items-start relative z-10">
                    <div className="p-3 bg-white/10 text-white rounded-xl">
                      <Clock size={24} />
                    </div>
                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Countdown</span>
                  </div>
                  <div className="mt-6 relative z-10">
                    <h3 className="text-5xl font-light serif text-white">{daysToOpening}</h3>
                    <p className="text-sm text-white/80 mt-1">Days until Grand Opening</p>
                  </div>
                </div>
              </div>

              {/* Charts & Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl border border-brand/5 shadow-sm">
                  <h4 className="text-lg serif mb-6">Budget Allocation</h4>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={state.modules.map(mod => ({
                        name: mod.title,
                        estimated: mod.tasks.reduce((sum, task) => sum + (Number(task.estimatedCost) || 0), 0)
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="estimated" name="Budget" radius={[4, 4, 0, 0]}>
                          {state.modules.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? state.brandSettings.palette.primary : state.brandSettings.palette.secondary} fillOpacity={0.8} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-brand/5 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-lg serif">Recent Tasks</h4>
                    <button onClick={() => setActiveTab('tasks')} className="text-xs text-brand font-medium flex items-center gap-1 hover:underline">
                      View All <ChevronRight size={14} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {allTasks.slice(0, 5).map(task => (
                      <TaskCard 
                        key={task.id}
                        task={task}
                        variant="compact"
                        onToggleStatus={() => toggleTaskStatus(task.moduleId, task.id)}
                        onEdit={() => {
                          setEditingTask({ moduleId: task.moduleId, task });
                          setNewTask({ 
                            title: task.title, 
                            description: task.description || '',
                            dueDate: task.dueDate || '',
                            estimatedCost: task.estimatedCost || 0,
                            actualCost: task.actualCost || 0
                          });
                          setIsTaskModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Library */}
              <div className="bg-white p-8 rounded-2xl border border-brand/5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-lg serif">Content Library</h4>
                  <div className="flex gap-2">
                    <button className="p-2 bg-ink/5 rounded-lg text-ink/40 hover:text-brand transition-colors">
                      <Camera size={16} />
                    </button>
                    <button className="p-2 bg-ink/5 rounded-lg text-ink/40 hover:text-brand transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { title: 'Hammam Teaser', type: 'Video', status: 'Ready' },
                    { title: 'Brand Reveal', type: 'Image', status: 'Draft' },
                    { title: 'Staff Intro', type: 'Video', status: 'Planned' },
                    { title: 'Service Menu', type: 'Image', status: 'Ready' },
                  ].map((content, i) => (
                    <div key={i} className="group relative aspect-square bg-ink/5 rounded-xl overflow-hidden cursor-pointer">
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <p className="text-[10px] text-brand font-bold uppercase tracking-wider">{content.type}</p>
                        <p className="text-xs text-white font-medium">{content.title}</p>
                      </div>
                      <div className="w-full h-full flex items-center justify-center text-ink/10">
                        {content.type === 'Video' ? <Rocket size={32} /> : <Palette size={32} />}
                      </div>
                      <div className={cn(
                        "absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter",
                        content.status === 'Ready' ? "bg-emerald-500 text-white" : "bg-brand text-white"
                      )}>
                        {content.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hammam Special Section */}
              <div className="bg-brand-soft p-8 rounded-3xl border border-brand/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <Droplets size={120} className="text-brand" />
                </div>
                <div className="relative z-10 max-w-2xl">
                  <span className="text-[10px] font-bold text-brand uppercase tracking-[0.3em]">Special Project</span>
                  <h3 className="text-3xl serif mt-2 mb-4">Hammam Maghribi Rituals</h3>
                  <p className="text-ink/60 leading-relaxed mb-6">
                    The Moroccan Hammam is your unique selling point. Ensure the specialized plumbing, moisture-proof ventilation, and marble selection are handled with precision.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/80 backdrop-blur px-4 py-3 rounded-2xl border border-brand/10">
                      <p className="text-[10px] text-ink/40 uppercase">Current Phase</p>
                      <p className="text-sm font-semibold text-brand">{state.hammamStatus}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur px-4 py-3 rounded-2xl border border-brand/10">
                      <p className="text-[10px] text-ink/40 uppercase">Budget Allocation</p>
                      <p className="text-sm font-semibold">8,120 KD</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'tasks' && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-5xl mx-auto"
            >
              <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-4xl serif font-light">Tasks</h2>
                  <p className="text-ink/50 mt-1">Manage the execution of your startup roadmap.</p>
                </div>
                
                <div className="flex bg-ink/5 p-1 rounded-xl">
                  <button 
                    onClick={() => setTasksSubTab('list')}
                    className={cn(
                      "px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                      tasksSubTab === 'list' ? "bg-white text-brand shadow-sm" : "text-ink/40 hover:text-ink/60"
                    )}
                  >
                    List View
                  </button>
                  <button 
                    onClick={() => setTasksSubTab('timeline')}
                    className={cn(
                      "px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                      tasksSubTab === 'timeline' ? "bg-white text-brand shadow-sm" : "text-ink/40 hover:text-ink/60"
                    )}
                  >
                    Timeline
                  </button>
                </div>
              </header>

              <AnimatePresence mode="wait">
                {tasksSubTab === 'list' ? (
                  <motion.div
                    key="list"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="flex flex-wrap gap-3 mb-8">
                {state.modules.map(mod => (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModuleId(mod.id)}
                    className={cn(
                      "p-3 rounded-xl border transition-all text-left flex items-center gap-3 min-w-[160px]",
                      selectedModuleId === mod.id 
                        ? "bg-brand text-white border-brand" 
                        : "bg-white text-ink border-brand/10 hover:border-brand/30"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      selectedModuleId === mod.id ? "bg-white/20 text-white" : "bg-brand/10 text-brand"
                    )}>
                      {React.cloneElement(ICON_MAP[mod.icon] as React.ReactElement, { size: 16 })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-xs truncate">{mod.title}</h4>
                      <p className={cn(
                        "text-[9px] uppercase tracking-wider",
                        selectedModuleId === mod.id ? "text-white/60" : "text-ink/40"
                      )}>
                        {mod.tasks.filter(t => t.status === 'done').length} / {mod.tasks.length}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {selectedModuleId && (
                  <motion.div
                    key={selectedModuleId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-3xl border border-brand/5 shadow-sm p-8"
                  >
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand/10 text-brand rounded-lg">
                          {ICON_MAP[state.modules.find(m => m.id === selectedModuleId)?.icon || 'Palette']}
                        </div>
                        <h3 className="text-2xl serif">{state.modules.find(m => m.id === selectedModuleId)?.title}</h3>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingTask(null);
                          setNewTask({ title: '', description: '', dueDate: '', estimatedCost: 0, actualCost: 0 });
                          setIsTaskModalOpen(true);
                        }}
                        className="p-2 bg-brand text-white rounded-full hover:scale-110 transition-transform shadow-lg shadow-brand/20"
                      >
                        <Plus size={20} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {state.modules.find(m => m.id === selectedModuleId)?.tasks.map(task => (
                        <TaskCard 
                          key={task.id}
                          task={task}
                          variant="list"
                          onToggleStatus={() => toggleTaskStatus(selectedModuleId, task.id)}
                          onEdit={() => {
                            setEditingTask({ moduleId: selectedModuleId, task });
                            setNewTask({ 
                              title: task.title, 
                              description: task.description || '',
                              dueDate: task.dueDate || '',
                              estimatedCost: task.estimatedCost || 0,
                              actualCost: task.actualCost || 0
                            });
                            setIsTaskModalOpen(true);
                          }}
                        />
                      ))}
                    </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl serif">Project Timeline</h3>
                    <p className="text-ink/40 text-xs mt-1">Chronological view of all tasks across modules.</p>
                  </div>
                </div>

                <div className="relative border-l-2 border-[#e0e1e0] ml-4 md:ml-32 space-y-8 pb-12">
                      {sortedTasks.map((task, index) => {
                        const isFirstOfDate = index === 0 || task.dueDate !== sortedTasks[index - 1].dueDate;
                        return (
                          <div key={task.id} className={cn("relative pl-8", isFirstOfDate ? "pt-2" : "")}>
                            {isFirstOfDate && (
                              <>
                                <div className="absolute -left-4 md:-left-32 top-0 md:w-28 text-left md:text-right pr-4 flex items-center h-6">
                                  <p className="text-[10px] font-bold text-brand uppercase tracking-[0.2em] whitespace-nowrap w-full">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Date'}
                                  </p>
                                </div>
                                {/* Date Dash */}
                                <div className="absolute -left-[7px] top-[11px] w-3 h-[1px] bg-brand/40 z-20" />
                              </>
                            )}
                            {/* Timeline Node (The dot on the line) */}
                            <div className={cn(
                              "absolute -left-[11px] top-8 w-5 h-5 rounded-full border-4 border-paper z-10 transition-all duration-500",
                              task.status === 'done' ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : 
                              task.status === 'in-progress' ? "bg-brand-light shadow-lg shadow-brand-light/20 animate-pulse" : "bg-brand/20"
                            )} />

                            <TaskCard 
                              task={task}
                              variant="timeline"
                              showModuleTag
                              showDateTag={false}
                              onToggleStatus={() => toggleTaskStatus(task.moduleId, task.id)}
                              onEdit={() => {
                                setEditingTask({ moduleId: task.moduleId, task });
                                setNewTask({ 
                                  title: task.title, 
                                  description: task.description || '',
                                  dueDate: task.dueDate || '',
                                  estimatedCost: task.estimatedCost || 0,
                                  actualCost: task.actualCost || 0
                                });
                                setIsTaskModalOpen(true);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'budget' && (
            <motion.div 
              key="budget"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="max-w-5xl mx-auto"
            >
              <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-4xl serif font-light">Budget Tracker</h2>
                  <p className="text-ink/50 mt-1">Monitor your capital allocation and actual spending.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-ink/40">Total Spent</p>
                    <p className="text-2xl font-semibold text-brand">{totalSpent.toLocaleString()} <span className="text-xs font-normal">KD</span></p>
                  </div>
                  <div className="w-px h-10 bg-brand/10" />
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-ink/40">Est. Total</p>
                    <p className="text-sm font-medium text-ink/60">{totalBudget.toLocaleString()} KD</p>
                  </div>
                </div>
              </header>

              <div className="space-y-8">
                {state.modules.map(mod => (
                  <div key={mod.id} className="bg-white rounded-3xl border border-brand/5 shadow-sm overflow-hidden">
                    <div className="bg-brand/[0.02] px-8 py-4 border-b border-brand/10 flex items-center justify-between">
                      <h3 className="font-semibold text-ink/80">{mod.title}</h3>
                      <div className="flex items-center gap-4">
                        <p className="text-xs text-ink/40">
                          Total Spent: <span className="font-bold text-ink/80">{mod.tasks.reduce((acc, t) => acc + (Number(t.actualCost) || 0), 0).toLocaleString()} KD</span>
                        </p>
                        <button 
                          onClick={() => {
                            setEditingBudgetTask(null);
                            setNewBudgetTask({ title: '', estimatedCost: 0, actualCost: 0 });
                            setEditingBudgetTask({ modId: mod.id, task: {} as any }); // Hack to pass modId
                            setIsBudgetModalOpen(true);
                          }}
                          className="p-1.5 bg-brand text-white rounded-lg hover:scale-105 transition-transform"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="grid grid-cols-12 gap-4 mb-4 text-[10px] font-bold text-ink/30 uppercase tracking-widest px-4">
                        <div className="col-span-4">Item Name</div>
                        <div className="col-span-4 text-right">Estimate (KD)</div>
                        <div className="col-span-4 text-right">Actual (KD)</div>
                      </div>
                      <div className="space-y-2">
                        {mod.tasks.map(task => (
                          <div key={task.id} className="grid grid-cols-12 gap-4 items-center p-4 rounded-2xl hover:bg-ink/[0.02] transition-colors group">
                            <div className="col-span-4 flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setEditingBudgetTask({ modId: mod.id, task });
                                  setNewBudgetTask({ title: task.title, estimatedCost: task.estimatedCost || 0, actualCost: task.actualCost || 0 });
                                  setIsBudgetModalOpen(true);
                                }}
                                className="p-1 text-ink/10 hover:text-brand transition-colors"
                              >
                                <Layout size={12} />
                              </button>
                              <p className="text-sm font-medium text-ink/80">{task.title}</p>
                            </div>
                            <div className="col-span-4 text-right">
                              <input 
                                type="number"
                                value={Number.isNaN(Number(task.estimatedCost)) ? '' : task.estimatedCost}
                                onChange={(e) => updateEstimated(mod.id, task.id, parseFloat(e.target.value))}
                                placeholder="0"
                                className="w-full text-right bg-transparent border-b border-transparent hover:border-brand/10 focus:border-brand focus:outline-none px-1 py-0.5 text-xs transition-colors"
                              />
                            </div>
                            <div className="col-span-4 flex items-center gap-3 justify-end">
                              <input 
                                type="number"
                                value={Number.isNaN(Number(task.actualCost)) ? '' : task.actualCost}
                                onChange={(e) => updateActual(mod.id, task.id, parseFloat(e.target.value))}
                                placeholder="0"
                                className="w-24 text-right bg-paper border border-brand/5 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand transition-colors"
                              />
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                (Number(task.actualCost) || 0) > (Number(task.estimatedCost) || 0) ? "bg-rose-500" : (Number(task.actualCost) || 0) > 0 ? "bg-emerald-500" : "bg-brand/10"
                              )} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Settings 
                state={state} 
                onUpdate={(updates) => setState(prev => ({ ...prev, ...updates }))} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Task Modal */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl serif mb-6">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">Title</label>
                  <input 
                    type="text"
                    value={newTask.title}
                    onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-paper border border-brand/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                    placeholder="e.g. Finalize Logo"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">Description</label>
                  <textarea 
                    value={newTask.description}
                    onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-paper border border-brand/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand h-24 resize-none"
                    placeholder="Add more details..."
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">Due Date</label>
                  <input 
                    type="date"
                    value={newTask.dueDate}
                    onChange={e => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full bg-paper border border-brand/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">Est. Cost (KD)</label>
                    <input 
                      type="number"
                      value={newTask.estimatedCost || ''}
                      onChange={e => setNewTask(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-paper border border-brand/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">Actual Cost (KD)</label>
                    <input 
                      type="number"
                      value={newTask.actualCost || ''}
                      onChange={e => setNewTask(prev => ({ ...prev, actualCost: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-paper border border-brand/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  {editingTask && (
                    <button 
                      onClick={() => {
                        handleDeleteTask(editingTask.moduleId, editingTask.task.id);
                        setIsTaskModalOpen(false);
                      }}
                      className="flex-1 px-6 py-3 rounded-xl border border-rose-100 text-rose-500 text-sm font-medium hover:bg-rose-50 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                  <button 
                    onClick={handleSaveTask}
                    className="flex-[2] bg-brand text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {editingTask ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Budget Modal */}
      <AnimatePresence>
        {isBudgetModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBudgetModalOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <h3 className="text-2xl serif mb-6">{editingBudgetTask?.task.id ? 'Edit Item' : 'Add Budget Item'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">Item Name</label>
                  <input 
                    type="text"
                    value={newBudgetTask.title}
                    onChange={e => setNewBudgetTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-paper border border-brand/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                    placeholder="e.g. Marble Tiles"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">Estimate (KD)</label>
                  <input 
                    type="number"
                    value={Number.isNaN(Number(newBudgetTask.estimatedCost)) ? '' : newBudgetTask.estimatedCost}
                    onChange={e => setNewBudgetTask(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) }))}
                    className="w-full bg-paper border border-brand/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">Actual (KD)</label>
                  <input 
                    type="number"
                    value={Number.isNaN(Number(newBudgetTask.actualCost)) ? '' : newBudgetTask.actualCost}
                    onChange={e => setNewBudgetTask(prev => ({ ...prev, actualCost: parseFloat(e.target.value) }))}
                    className="w-full bg-paper border border-brand/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => handleSaveBudgetTask(editingBudgetTask!.modId)}
                    className="w-full bg-brand text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    {editingBudgetTask?.task.id ? 'Save Changes' : 'Add Item'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
