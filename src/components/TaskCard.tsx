import React from 'react';
import {
  Calendar,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useTasks } from '../context/TaskContext';

interface TaskCardProps {
  task: Task;
  onViewDetails?: (task: Task) => void;
  compact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onViewDetails, compact = false }) => {
  const { updateTaskStatus, deleteTask, setIsEditModalOpen, setSelectedTask, setIsDetailModalOpen } = useTasks();
  const [showMenu, setShowMenu] = React.useState(false);

  // Status & Priority Colors
  const priorityStyles: Record<TaskPriority, { text: string; label: string }> = {
    High: { text: 'text-rose-500', label: 'High Priority' },
    Medium: { text: 'text-amber-500', label: 'Medium Priority' },
    Low: { text: 'text-slate-400', label: 'Low Priority' },
  };

  const statusColors: Record<TaskStatus, { dot: string; text: string }> = {
    Pending: { dot: 'bg-slate-300', text: 'text-slate-600' },
    'In Progress': { dot: 'bg-amber-400', text: 'text-amber-700' },
    Completed: { dot: 'bg-emerald-500', text: 'text-emerald-700' },
  };

  // Due Date Calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = task.status !== 'Completed' && task.dueDate && task.dueDate < todayStr;
  const isDueToday = task.dueDate === todayStr;

  const formatDueDate = (dateStr: string) => {
    if (!dateStr) return 'No date';
    if (dateStr === todayStr) return 'Due today';
    try {
      const date = new Date(dateStr + 'T00:00:00');
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: TaskStatus =
      task.status === 'Completed' ? 'Pending' : task.status === 'Pending' ? 'In Progress' : 'Completed';
    updateTaskStatus(task.id, nextStatus);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedTask(task);
    setIsEditModalOpen(true);
    setShowMenu(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      deleteTask(task.id);
    }
    setShowMenu(false);
  };

  const handleCardClick = () => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
    if (onViewDetails) {
      onViewDetails(task);
    }
  };

  // Category Initial / Avatar color
  const getCatInitials = (cat: string) => {
    if (!cat) return 'TK';
    const words = cat.split(' ');
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return cat.slice(0, 2).toUpperCase();
  };

  return (
    <div
      id={`task-card-${task.id}`}
      onClick={handleCardClick}
      className={`group bg-white rounded-2xl border transition-all duration-150 hover:shadow-md cursor-pointer relative ${
        task.status === 'Completed'
          ? 'border-slate-200/60 bg-slate-50/40 opacity-80'
          : isOverdue
          ? 'border-rose-200 hover:border-rose-300 ring-1 ring-rose-100 shadow-2xs'
          : 'border-slate-100 hover:border-indigo-200 shadow-2xs'
      } ${compact ? 'p-3.5' : 'p-5'}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Avatar Icon & Content */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          {/* Category Avatar Box */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 select-none ${
              task.status === 'Completed'
                ? 'bg-emerald-100 text-emerald-700'
                : isOverdue
                ? 'bg-rose-100 text-rose-700'
                : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            {getCatInitials(task.category || 'Task')}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3
                className={`font-bold text-base leading-snug tracking-tight transition-colors truncate ${
                  task.status === 'Completed'
                    ? 'line-through text-slate-400'
                    : 'text-slate-900 group-hover:text-indigo-600'
                }`}
              >
                {task.title}
              </h3>
            </div>

            <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
              {task.category || 'General Task'} {task.description ? `· ${task.description}` : ''}
            </p>
          </div>
        </div>

        {/* Action Menu button & Toggle */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            id={`toggle-task-${task.id}`}
            onClick={handleStatusToggle}
            className={`p-1 rounded-lg transition-transform active:scale-90 ${
              task.status === 'Completed'
                ? 'text-emerald-500 hover:text-emerald-600'
                : 'text-slate-300 hover:text-indigo-600'
            }`}
            title={`Status: ${task.status}. Click to change.`}
          >
            {task.status === 'Completed' ? (
              <CheckCircle2 className="w-5 h-5 fill-emerald-50" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          <div className="relative">
            <button
              id={`task-menu-btn-${task.id}`}
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label="Task options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-30 text-xs font-bold">
                  <button
                    id={`edit-task-action-${task.id}`}
                    onClick={handleEdit}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 hover:bg-slate-50"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit Task</span>
                  </button>
                  <button
                    id={`delete-task-action-${task.id}`}
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete Task</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: Priority, Due Date & Status */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
        {/* Priority & Category */}
        <div className="flex items-center gap-3">
          <p className={`font-black uppercase tracking-wider text-[11px] ${priorityStyles[task.priority]?.text || 'text-slate-400'}`}>
            {priorityStyles[task.priority]?.label || task.priority}
          </p>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${statusColors[task.status]?.dot || 'bg-slate-400'}`} />
            <span className="font-bold text-slate-600 text-xs">{task.status}</span>
          </div>
        </div>

        {/* Due Date Indicator */}
        <div
          className={`font-semibold text-xs flex items-center gap-1.5 ${
            task.status === 'Completed'
              ? 'text-slate-400'
              : isOverdue
              ? 'text-rose-600 font-bold'
              : isDueToday
              ? 'text-amber-600 font-bold'
              : 'text-slate-600'
          }`}
          title={isOverdue ? 'This task is overdue!' : `Due ${task.dueDate}`}
        >
          {isOverdue ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
          ) : (
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span>{formatDueDate(task.dueDate)}</span>
        </div>
      </div>
    </div>
  );
};
