import { motion } from 'motion/react';
import { Settings } from '../../components/Settings';
import { usePlanner } from '../../hooks/usePlanner';

export function SettingsView() {
  const { state, setState, resetTimeline } = usePlanner();

  const onExportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salon-planner-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Settings
        state={state}
        onUpdate={(updates) => setState((prev) => ({ ...prev, ...updates }))}
        onResetTimeline={resetTimeline}
        onExportJson={onExportJson}
      />
    </motion.div>
  );
}
