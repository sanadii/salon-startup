import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { TaskCard } from '../../components/TaskCard';
import { usePlanner } from '../../hooks/usePlanner';
import { cn } from '../../lib/cn';
import { ModuleIcon } from '../../lib/moduleIcons';
import { sortedTasksByDueDate } from '../../lib/selectors';

export function TasksView() {
  const {
    state,
    selectedModuleId,
    setSelectedModuleId,
    tasksSubTab,
    setTasksSubTab,
    toggleTaskStatus,
    setEditingTask,
    setNewTask,
    setIsTaskModalOpen,
  } = usePlanner();

  const sortedTasks = sortedTasksByDueDate(state);
  const selectedMod = state.modules.find((m) => m.id === selectedModuleId);

  return (
    <motion.div
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
            type="button"
            onClick={() => setTasksSubTab('list')}
            className={cn(
              'px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all',
              tasksSubTab === 'list'
                ? 'bg-white text-brand shadow-sm'
                : 'text-ink/40 hover:text-ink/60'
            )}
          >
            List View
          </button>
          <button
            type="button"
            onClick={() => setTasksSubTab('timeline')}
            className={cn(
              'px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all',
              tasksSubTab === 'timeline'
                ? 'bg-white text-brand shadow-sm'
                : 'text-ink/40 hover:text-ink/60'
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
              {state.modules.map((mod) => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => setSelectedModuleId(mod.id)}
                  className={cn(
                    'p-3 rounded-xl border transition-all text-left flex items-center gap-3 min-w-[160px]',
                    selectedModuleId === mod.id
                      ? 'bg-brand text-white border-brand'
                      : 'bg-white text-ink border-brand/10 hover:border-brand/30'
                  )}
                >
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      selectedModuleId === mod.id
                        ? 'bg-white/20 text-white'
                        : 'bg-brand/10 text-brand'
                    )}
                  >
                    <ModuleIcon name={mod.icon} size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs truncate">{mod.title}</h4>
                    <p
                      className={cn(
                        'text-[9px] uppercase tracking-wider',
                        selectedModuleId === mod.id ? 'text-white/60' : 'text-ink/40'
                      )}
                    >
                      {mod.tasks.filter((t) => t.status === 'done').length} / {mod.tasks.length}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {selectedModuleId && selectedMod && (
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
                        <ModuleIcon name={selectedMod.icon} size={20} />
                      </div>
                      <h3 className="text-2xl serif">{selectedMod.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTask(null);
                        setNewTask({
                          title: '',
                          description: '',
                          dueDate: '',
                          estimatedCost: 0,
                          actualCost: 0,
                        });
                        setIsTaskModalOpen(true);
                      }}
                      className="p-2 bg-brand text-white rounded-full hover:scale-110 transition-transform shadow-lg shadow-brand/20"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedMod.tasks.map((task) => (
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
                            actualCost: task.actualCost || 0,
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
                <p className="text-ink/40 text-xs mt-1">
                  Chronological view of all tasks across modules.
                </p>
              </div>
            </div>

            <div className="relative border-l-2 border-[#e0e1e0] ml-4 md:ml-32 space-y-8 pb-12">
              {sortedTasks.map((task, index) => {
                const isFirstOfDate =
                  index === 0 || task.dueDate !== sortedTasks[index - 1].dueDate;
                return (
                  <div
                    key={task.id}
                    className={cn('relative pl-8', isFirstOfDate ? 'pt-2' : '')}
                  >
                    {isFirstOfDate && (
                      <>
                        <div className="absolute -left-4 md:-left-32 top-0 md:w-28 text-left md:text-right pr-4 flex items-center h-6">
                          <p className="text-[10px] font-bold text-brand uppercase tracking-[0.2em] whitespace-nowrap w-full">
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })
                              : 'No Date'}
                          </p>
                        </div>
                        <div className="absolute -left-[7px] top-[11px] w-3 h-[1px] bg-brand/40 z-20" />
                      </>
                    )}
                    <div
                      className={cn(
                        'absolute -left-[11px] top-8 w-5 h-5 rounded-full border-4 border-paper z-10 transition-all duration-500',
                        task.status === 'done'
                          ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20'
                          : task.status === 'in-progress'
                            ? 'bg-brand-light shadow-lg shadow-brand-light/20 animate-pulse'
                            : 'bg-brand/20'
                      )}
                    />

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
                          actualCost: task.actualCost || 0,
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
  );
}
