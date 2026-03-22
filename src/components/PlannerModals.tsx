import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlanner } from '../hooks/usePlanner';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

export function PlannerModals() {
  const {
    isTaskModalOpen,
    setIsTaskModalOpen,
    editingTask,
    newTask,
    setNewTask,
    handleSaveTask,
    handleDeleteTask,
    isBudgetModalOpen,
    setIsBudgetModalOpen,
    editingBudgetTask,
    newBudgetTask,
    setNewBudgetTask,
    handleSaveBudgetTask,
  } = usePlanner();

  const taskPanelRef = useRef<HTMLDivElement>(null);
  const budgetPanelRef = useRef<HTMLDivElement>(null);

  useModalAccessibility(isTaskModalOpen, () => setIsTaskModalOpen(false), taskPanelRef);
  useModalAccessibility(isBudgetModalOpen, () => setIsBudgetModalOpen(false), budgetPanelRef);

  return (
    <>
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              ref={taskPanelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="task-modal-title"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <h3 id="task-modal-title" className="text-2xl serif mb-6">
                {editingTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-paper border border-brand/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                    placeholder="e.g. Finalize Logo"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full bg-paper border border-brand/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand h-24 resize-none"
                    placeholder="Add more details..."
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full bg-paper border border-brand/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">
                      Est. Cost (KD)
                    </label>
                    <input
                      type="number"
                      value={newTask.estimatedCost || ''}
                      onChange={(e) =>
                        setNewTask((prev) => ({
                          ...prev,
                          estimatedCost: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-paper border border-brand/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">
                      Actual Cost (KD)
                    </label>
                    <input
                      type="number"
                      value={newTask.actualCost || ''}
                      onChange={(e) =>
                        setNewTask((prev) => ({
                          ...prev,
                          actualCost: parseFloat(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-paper border border-brand/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  {editingTask && (
                    <button
                      type="button"
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
                    type="button"
                    onClick={handleSaveTask}
                    disabled={!newTask.title.trim()}
                    className="flex-[2] bg-brand text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {editingTask ? 'Save Changes' : 'Create Task'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isBudgetModalOpen && editingBudgetTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBudgetModalOpen(false)}
              className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
              aria-hidden
            />
            <motion.div
              ref={budgetPanelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="budget-modal-title"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl"
            >
              <h3 id="budget-modal-title" className="text-2xl serif mb-6">
                {editingBudgetTask.task ? 'Edit Item' : 'Add Budget Item'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">
                    Item Name
                  </label>
                  <input
                    type="text"
                    value={newBudgetTask.title}
                    onChange={(e) =>
                      setNewBudgetTask((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="w-full bg-paper border border-brand/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                    placeholder="e.g. Marble Tiles"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">
                    Estimate (KD)
                  </label>
                  <input
                    type="number"
                    value={
                      Number.isNaN(Number(newBudgetTask.estimatedCost))
                        ? ''
                        : newBudgetTask.estimatedCost
                    }
                    onChange={(e) =>
                      setNewBudgetTask((prev) => ({
                        ...prev,
                        estimatedCost: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full bg-paper border border-brand/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-ink/40 mb-1 block">
                    Actual (KD)
                  </label>
                  <input
                    type="number"
                    value={
                      Number.isNaN(Number(newBudgetTask.actualCost))
                        ? ''
                        : newBudgetTask.actualCost
                    }
                    onChange={(e) =>
                      setNewBudgetTask((prev) => ({
                        ...prev,
                        actualCost: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full bg-paper border border-brand/5 rounded-xl px-4 py-3 focus:outline-none focus:border-brand"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => handleSaveBudgetTask(editingBudgetTask.modId)}
                    disabled={!newBudgetTask.title.trim()}
                    className="w-full bg-brand text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {editingBudgetTask.task ? 'Save Changes' : 'Add Item'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
