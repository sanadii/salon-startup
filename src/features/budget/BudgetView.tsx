import { motion } from 'motion/react';
import { Layout, Plus } from 'lucide-react';
import { usePlanner } from '../../hooks/usePlanner';
import { cn } from '../../lib/cn';
import { totalBudget, totalSpent } from '../../lib/selectors';

export function BudgetView() {
  const {
    state,
    updateActual,
    updateEstimated,
    setEditingBudgetTask,
    setNewBudgetTask,
    setIsBudgetModalOpen,
    openCreateBudgetItem,
  } = usePlanner();

  const tb = totalBudget(state);
  const ts = totalSpent(state);

  return (
    <motion.div
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
            <p className="text-2xl font-semibold text-brand">
              {ts.toLocaleString()} <span className="text-xs font-normal">KD</span>
            </p>
          </div>
          <div className="w-px h-10 bg-brand/10" />
          <div className="text-right">
            <p className="text-[10px] uppercase text-ink/40">Est. Total</p>
            <p className="text-sm font-medium text-ink/60">{tb.toLocaleString()} KD</p>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        {state.modules.map((mod) => (
          <div
            key={mod.id}
            className="bg-white rounded-3xl border border-brand/5 shadow-sm overflow-hidden"
          >
            <div className="bg-brand/[0.02] px-8 py-4 border-b border-brand/10 flex items-center justify-between">
              <h3 className="font-semibold text-ink/80">{mod.title}</h3>
              <div className="flex items-center gap-4">
                <p className="text-xs text-ink/40">
                  Total Spent:{' '}
                  <span className="font-bold text-ink/80">
                    {mod.tasks
                      .reduce((acc, t) => acc + (Number(t.actualCost) || 0), 0)
                      .toLocaleString()}{' '}
                    KD
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => openCreateBudgetItem(mod.id)}
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
                {mod.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="grid grid-cols-12 gap-4 items-center p-4 rounded-2xl hover:bg-ink/[0.02] transition-colors group"
                  >
                    <div className="col-span-4 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingBudgetTask({ modId: mod.id, task });
                          setNewBudgetTask({
                            title: task.title,
                            estimatedCost: task.estimatedCost || 0,
                            actualCost: task.actualCost || 0,
                          });
                          setIsBudgetModalOpen(true);
                        }}
                        className="p-1 text-ink/10 hover:text-brand transition-colors"
                        aria-label={`Edit ${task.title}`}
                      >
                        <Layout size={12} />
                      </button>
                      <p className="text-sm font-medium text-ink/80">{task.title}</p>
                    </div>
                    <div className="col-span-4 text-right">
                      <input
                        type="number"
                        value={
                          Number.isNaN(Number(task.estimatedCost)) ? '' : task.estimatedCost
                        }
                        onChange={(e) =>
                          updateEstimated(mod.id, task.id, parseFloat(e.target.value))
                        }
                        placeholder="0"
                        className="w-full text-right bg-transparent border-b border-transparent hover:border-brand/10 focus:border-brand focus:outline-none px-1 py-0.5 text-xs transition-colors"
                      />
                    </div>
                    <div className="col-span-4 flex items-center gap-3 justify-end">
                      <input
                        type="number"
                        value={Number.isNaN(Number(task.actualCost)) ? '' : task.actualCost}
                        onChange={(e) =>
                          updateActual(mod.id, task.id, parseFloat(e.target.value))
                        }
                        placeholder="0"
                        className="w-24 text-right bg-paper border border-brand/5 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-brand transition-colors"
                      />
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full',
                          (Number(task.actualCost) || 0) > (Number(task.estimatedCost) || 0)
                            ? 'bg-rose-500'
                            : (Number(task.actualCost) || 0) > 0
                              ? 'bg-emerald-500'
                              : 'bg-brand/10'
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
