import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, ChevronRight, Clock, Droplets, Wallet } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TaskCard } from '../../components/TaskCard';
import { usePlanner } from '../../hooks/usePlanner';
import { SHOW_CONTENT_LIBRARY } from '../../lib/featureFlags';
import { formatKd } from '../../lib/money';
import {
  completedTasks,
  daysToOpening,
  flattenTasks,
  hammamEstimatedBudget,
  totalBudget,
  totalSpent,
  totalTasks,
} from '../../lib/selectors';

export function DashboardView() {
  const navigate = useNavigate();
  const {
    state,
    toggleTaskStatus,
    setEditingTask,
    setNewTask,
    setIsTaskModalOpen,
  } = usePlanner();

  const tb = totalBudget(state);
  const ts = totalSpent(state);
  const tt = totalTasks(state);
  const ct = completedTasks(state);
  const days = daysToOpening(state);
  const hammamEst = hammamEstimatedBudget(state);
  const allTasks = flattenTasks(state);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl serif font-light">Welcome, Founder</h2>
          <p className="text-ink/50 mt-1">Here&apos;s the current state of your salon startup.</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-white border border-brand/5 rounded-lg shadow-sm">
            <p className="text-[10px] uppercase text-ink/40">Total Budget (Est.)</p>
            <p className="text-lg font-semibold">
              {tb.toLocaleString()} <span className="text-xs font-normal">KD</span>
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-brand/5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-brand/10 text-brand rounded-xl">
              <Wallet size={24} />
            </div>
            <span className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">
              Budget Spent
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-3xl font-light serif">
              {ts.toLocaleString()} <span className="text-sm">KD</span>
            </h3>
            <div className="w-full bg-brand/10 h-1.5 rounded-full mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tb > 0 ? (ts / tb) * 100 : 0}%` }}
                className="h-full bg-brand"
              />
            </div>
            <p className="text-xs text-ink/40 mt-2">
              {tb > 0 ? ((ts / tb) * 100).toFixed(1) : 0}% of estimated budget
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand/5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={24} />
            </div>
            <span className="text-[10px] font-bold text-ink/20 uppercase tracking-widest">
              Tasks Progress
            </span>
          </div>
          <div className="mt-6">
            <h3 className="text-3xl font-light serif">
              {ct} / {tt}
            </h3>
            <div className="w-full bg-brand/10 h-1.5 rounded-full mt-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${tt > 0 ? (ct / tt) * 100 : 0}%` }}
                className="h-full bg-emerald-500"
              />
            </div>
            <p className="text-xs text-ink/40 mt-2">
              {tt > 0 ? ((ct / tt) * 100).toFixed(1) : 0}% completion rate
            </p>
          </div>
        </div>

        <div className="bg-brand text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-brand/10 rounded-full blur-3xl" />
          <div className="flex justify-between items-start relative z-10">
            <div className="p-3 bg-white/10 text-white rounded-xl">
              <Clock size={24} />
            </div>
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">
              Countdown
            </span>
          </div>
          <div className="mt-6 relative z-10">
            <h3 className="text-5xl font-light serif text-white">{days}</h3>
            <p className="text-sm text-white/80 mt-1">Days until Grand Opening</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-brand/5 shadow-sm">
          <h4 className="text-lg serif mb-6">Budget Allocation</h4>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={state.modules.map((mod) => ({
                  name: mod.title,
                  estimated: mod.tasks.reduce(
                    (sum, task) => sum + (Number(task.estimatedCost) || 0),
                    0
                  ),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#999' }}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#999' }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="estimated" name="Budget" radius={[4, 4, 0, 0]}>
                  {state.modules.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index % 2 === 0
                          ? state.brandSettings.palette.primary
                          : state.brandSettings.palette.secondary
                      }
                      fillOpacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-brand/5 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg serif">Recent Tasks</h4>
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="text-xs text-brand font-medium flex items-center gap-1 hover:underline"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {allTasks.slice(0, 5).map((task) => (
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
                    actualCost: task.actualCost || 0,
                  });
                  setIsTaskModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {SHOW_CONTENT_LIBRARY && (
        <div className="bg-white p-8 rounded-2xl border border-brand/5 shadow-sm">
          <h4 className="text-lg serif mb-4">Content Library</h4>
          <p className="text-sm text-ink/50">Uploads and asset tracking will appear here.</p>
        </div>
      )}

      {!SHOW_CONTENT_LIBRARY && (
        <div className="bg-white p-6 rounded-2xl border border-dashed border-brand/20 text-center text-sm text-ink/45">
          Content library is coming soon — marketing assets will be manageable here.
        </div>
      )}

      <div className="bg-brand-soft p-8 rounded-3xl border border-brand/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <Droplets size={120} className="text-brand" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] font-bold text-brand uppercase tracking-[0.3em]">
            Special Project
          </span>
          <h3 className="text-3xl serif mt-2 mb-4">Hammam Maghribi Rituals</h3>
          <p className="text-ink/60 leading-relaxed mb-6">
            The Moroccan Hammam is your unique selling point. Ensure the specialized plumbing,
            moisture-proof ventilation, and marble selection are handled with precision.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/80 backdrop-blur px-4 py-3 rounded-2xl border border-brand/10">
              <p className="text-[10px] text-ink/40 uppercase">Current Phase</p>
              <p className="text-sm font-semibold text-brand">{state.hammamStatus}</p>
            </div>
            <div className="bg-white/80 backdrop-blur px-4 py-3 rounded-2xl border border-brand/10">
              <p className="text-[10px] text-ink/40 uppercase">Budget (Est.)</p>
              <p className="text-sm font-semibold">
                {hammamEst > 0 ? formatKd(hammamEst) : 'Add estimates to Hammam tasks'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
