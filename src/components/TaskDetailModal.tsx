import React from 'react';
import {
  X,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  CheckCircle2,
  Hourglass,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useTasks } from '../context/TaskContext';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, onClose }) => {
  const { selectedTask, updateTaskStatus, deleteTask, setIsEditModalOpen } = useTasks();

  if (!isOpen || !selectedTask) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = selectedTask.status !== 'Completed' && selectedTask.dueDate && selectedTask.dueDate < todayStr;
  const isDueToday = selectedTask.dueDate === todayStr;

  const priorityStyles: Record<TaskPriority, { bg: string; text: string; dot: string }> = {
    High: { bg: 'bg-rose-50 text-rose-700 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' },
    Medium: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    Low: { bg: 'bg-slate-50 text-slate-700 border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' },
  };

  const statusList: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${selectedTask.title}"?`)) {
      await deleteTask(selectedTask.id);
      onClose();
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div
        id="task-details-modal"
        className="relative bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh] font-sans"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-start justify-between gap-3 bg-slate-50/50">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {/* Priority badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  priorityStyles[selectedTask.priority]?.bg
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${priorityStyles[selectedTask.priority]?.dot}`} />
                {selectedTask.priority}
              </span>

              {/* Category */}
              {selectedTask.category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                  <Tag className="w-3 h-3 text-slate-400" />
                  {selectedTask.category}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter leading-snug">
              {selectedTask.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 space-y-6 overflow-y-auto flex-1">
          {/* Status quick switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Status Progression
            </label>
            <div className="grid grid-cols-3 gap-2">
              {statusList.map((st) => {
                const isCurrent = selectedTask.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => updateTaskStatus(selectedTask.id, st)}
                    className={`py-2.5 px-3 rounded-full border text-xs font-bold transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider ${
                      isCurrent
                        ? st === 'Completed'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100'
                          : st === 'In Progress'
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100'
                          : 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-100'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {st === 'In Progress' && <Hourglass className="w-3.5 h-3.5" />}
                    {st === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Description & Notes
            </label>
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap min-h-[90px]">
              {selectedTask.description || (
                <span className="text-slate-400 italic">No additional description provided.</span>
              )}
            </div>
          </div>

          {/* Dates & Timeline info grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Target Deadline</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{selectedTask.dueDate || 'No date'}</span>
              </div>
              {isOverdue && (
                <span className="text-xs font-bold text-rose-600 mt-1 inline-flex items-center gap-1 uppercase tracking-wider">
                  <AlertCircle className="w-3 h-3" /> Overdue
                </span>
              )}
              {isDueToday && (
                <span className="text-xs font-bold text-amber-600 mt-1 inline-flex items-center gap-1 uppercase tracking-wider">
                  <Clock className="w-3 h-3" /> Due today
                </span>
              )}
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase tracking-wider block mb-1">Created Date</span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{formatTimestamp(selectedTask.createdAt)}</span>
              </div>
              {selectedTask.completedAt && (
                <span className="text-xs font-bold text-emerald-600 mt-1 inline-flex items-center gap-1 uppercase tracking-wider">
                  <CheckCircle2 className="w-3 h-3" /> Completed {formatTimestamp(selectedTask.completedAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
          <button
            id="detail-delete-btn"
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-4 py-2 rounded-full text-xs font-bold transition-colors uppercase tracking-wider"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="detail-edit-btn"
              onClick={handleEdit}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md shadow-indigo-100 transition-colors uppercase tracking-wider active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
