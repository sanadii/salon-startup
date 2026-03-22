import React from 'react';
import { Layout, Calendar, Banknote, CheckCircle2 } from 'lucide-react';
import { Task } from '../types';
import { cn } from '../lib/cn';

interface TaskCardProps {
  task: Task & { moduleTitle?: string; moduleId?: string };
  onEdit: () => void;
  onToggleStatus?: () => void;
  showModuleTag?: boolean;
  showDateTag?: boolean;
  variant?: 'list' | 'timeline' | 'compact';
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onEdit, 
  onToggleStatus, 
  showModuleTag = false, 
  showDateTag = false,
  variant = 'list'
}) => {
  const isCompact = variant === 'compact';
  const isTimeline = variant === 'timeline';
  
  return (
    <div className={cn(
      "group flex items-start gap-4 transition-all duration-300",
      isCompact ? "p-3 rounded-xl hover:bg-ink/[0.02]" : "p-6 rounded-3xl border",
      !isCompact && (
        task.status === 'done' 
          ? "bg-emerald-50/30 border-emerald-100/50 shadow-sm shadow-emerald-500/5" 
          : task.status === 'in-progress'
            ? "bg-brand/5 border-brand/20 shadow-sm shadow-brand/5"
            : "bg-white border-brand/5 shadow-sm hover:border-brand/20 hover:shadow-md hover:shadow-brand/5"
      ),
      isTimeline && "relative"
    )}>
      {/* Status Indicator / Toggle */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus?.();
        }}
        aria-label={`Task status: ${task.status}. Click to change.`}
        aria-pressed={task.status === 'done'}
        className={cn(
          'flex items-center justify-center cursor-pointer transition-all shrink-0',
          isCompact ? 'w-2 h-2 rounded-full mt-2' : 'mt-1 w-6 h-6 rounded-full border-2',
          task.status === 'done'
            ? isCompact
              ? 'bg-emerald-500'
              : 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
            : task.status === 'in-progress'
              ? isCompact
                ? 'bg-brand-light'
                : 'border-brand-light bg-brand-light/10 text-brand-light'
              : isCompact
                ? 'bg-brand/10'
                : 'border-brand/20 group-hover:border-brand/50 bg-white'
        )}
      >
        {!isCompact && task.status === 'done' && <CheckCircle2 size={14} />}
        {!isCompact && task.status === 'in-progress' && (
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        )}
      </button>

      {/* Content Area */}
      <div className="flex-1 min-w-0" onClick={onToggleStatus}>
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          {showModuleTag && task.moduleTitle && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2 py-0.5 rounded-md">
              {task.moduleTitle}
            </span>
          )}
          {!isCompact && (
            <div className={cn(
              "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md",
              task.status === 'done' ? "text-emerald-600 bg-emerald-100/50" : 
              task.status === 'in-progress' ? "text-brand bg-brand/10" : "text-brand/40 bg-brand/5"
            )}>
              {task.status}
            </div>
          )}
          {(showDateTag || (!isCompact && task.dueDate)) && (
            <div className="flex items-center gap-1.5 text-[10px] text-ink/40 font-medium ml-auto sm:ml-0">
              <Calendar size={12} className="opacity-50" />
              <span>{task.dueDate}</span>
            </div>
          )}
        </div>

        <h5 className={cn(
          "font-medium transition-all truncate leading-tight",
          isCompact ? "text-sm text-ink/80" : "text-base",
          !isCompact && task.status === 'done' ? "text-ink/30 line-through" : "text-ink/90"
        )}>
          {task.title}
        </h5>

        {task.description && !isCompact && (
          <p className={cn(
            "text-xs leading-relaxed mt-1 line-clamp-2 transition-colors",
            task.status === 'done' ? "text-ink/20" : "text-ink/50"
          )}>
            {task.description}
          </p>
        )}
        
        {isCompact && task.moduleTitle && (
           <p className="text-[10px] text-ink/40 uppercase tracking-wider mt-0.5">{task.moduleTitle}</p>
        )}
      </div>

      {/* Meta & Actions */}
      <div className="flex items-center gap-4 sm:gap-6 shrink-0 self-center">
        {!isCompact && (
          <div className="hidden sm:flex flex-col items-end gap-1.5">
            {task.actualCost && task.actualCost > 0 ? (
              <div className="flex items-center gap-1.5 font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 text-[10px]">
                <Banknote size={12} />
                <span>{task.actualCost.toLocaleString()} KD</span>
              </div>
            ) : task.estimatedCost && task.estimatedCost > 0 ? (
              <div className="flex items-center gap-1.5 font-medium text-brand/40 bg-brand/5 px-2.5 py-1 rounded-full text-[10px]">
                <Banknote size={12} />
                <span>Est: {task.estimatedCost.toLocaleString()} KD</span>
              </div>
            ) : null}
          </div>
        )}
        
        {!isCompact && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brand/5 text-brand/60 hover:text-brand hover:bg-brand/10 rounded-xl transition-all text-[10px] font-bold uppercase tracking-widest group/edit border border-transparent hover:border-brand/20"
            title="Edit Task"
          >
            <Layout size={14} className="group-hover/edit:scale-110 transition-transform" />
            <span className="hidden xs:inline">Edit</span>
          </button>
        )}
        
        {isCompact && (
           <div className={cn(
            "text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded transition-all opacity-0 group-hover:opacity-100",
            task.status === 'done' ? "text-emerald-600 bg-emerald-100/50" : 
            task.status === 'in-progress' ? "text-brand bg-brand/10" : "text-brand/40 bg-brand/5"
          )}>
            {task.status}
          </div>
        )}
      </div>
    </div>
  );
};
