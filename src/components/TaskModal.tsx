import React, { useState, useEffect } from 'react';
import { X, Calendar, Tag, AlertCircle, Trash2, CheckSquare, Sparkles } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { useTasks } from '../context/TaskContext';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEdit?: boolean;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  isEdit = false,
  taskToEdit = null,
}) => {
  const { createTask, updateTask, deleteTask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Work');
  const [customCategory, setCustomCategory] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultCategories = ['Work', 'Development', 'Design', 'Marketing', 'Management', 'Personal', 'Urgent'];

  // Initialize or reset form values
  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      if (isEdit && taskToEdit) {
        setTitle(taskToEdit.title || '');
        setDescription(taskToEdit.description || '');
        setPriority(taskToEdit.priority || 'Medium');
        setStatus(taskToEdit.status || 'Pending');
        setDueDate(taskToEdit.dueDate || new Date().toISOString().split('T')[0]);
        if (defaultCategories.includes(taskToEdit.category)) {
          setCategory(taskToEdit.category);
          setCustomCategory('');
        } else {
          setCategory('Custom');
          setCustomCategory(taskToEdit.category || '');
        }
      } else {
        setTitle('');
        setDescription('');
        setPriority('Medium');
        setStatus(taskToEdit?.status || 'Pending');
        const today = new Date().toISOString().split('T')[0];
        setDueDate(today);
        setCategory('Work');
        setCustomCategory('');
      }
    }
  }, [isOpen, isEdit, taskToEdit]);

  if (!isOpen) return null;

  const handleQuickDate = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a task title.');
      return;
    }

    const finalCategory = category === 'Custom' ? (customCategory.trim() || 'General') : category;

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (isEdit && taskToEdit) {
        await updateTask(taskToEdit.id, {
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          dueDate,
          category: finalCategory,
        });
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim(),
          priority,
          status,
          dueDate,
          category: finalCategory,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (isEdit && taskToEdit) {
      if (window.confirm(`Are you sure you want to delete "${taskToEdit.title}"?`)) {
        await deleteTask(taskToEdit.id);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Card */}
      <div
        id="task-form-modal"
        className="relative bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 w-full max-w-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col font-sans"
      >
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-xl text-white tracking-tight">
                {isEdit ? 'Edit Task' : 'New Task'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {isEdit ? 'Update task details and timeline' : 'Add deliverables to your workspace'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-5 flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-800/60 rounded-2xl text-rose-300 text-xs flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Title input */}
          <div>
            <label htmlFor="task-title-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              placeholder="e.g. Design sprint planning documentation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-full text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            />
          </div>

          {/* Description input */}
          <div>
            <label htmlFor="task-description-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Description <span className="text-slate-500 font-normal lowercase">(optional)</span>
            </label>
            <textarea
              id="task-description-input"
              rows={3}
              placeholder="Add context, acceptance criteria, or quick notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none leading-relaxed font-medium"
            />
          </div>

          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Low', 'Medium', 'High'] as TaskPriority[]).map((lvl) => {
                const isSelected = priority === lvl;
                const colors = {
                  Low: isSelected ? 'bg-slate-800 text-white border-slate-600 shadow-md' : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800',
                  Medium: isSelected ? 'bg-amber-600 text-white border-amber-500 shadow-md' : 'bg-amber-950/30 text-amber-300 border-amber-800/60 hover:bg-amber-950/50',
                  High: isSelected ? 'bg-rose-600 text-white border-rose-500 shadow-md' : 'bg-rose-950/30 text-rose-300 border-rose-800/60 hover:bg-rose-950/50',
                };

                return (
                  <button
                    key={lvl}
                    type="button"
                    id={`priority-btn-${lvl.toLowerCase()}`}
                    onClick={() => setPriority(lvl)}
                    className={`py-2.5 px-3 rounded-full border text-xs font-bold transition-all flex items-center justify-center gap-1.5 uppercase tracking-wider ${colors[lvl]}`}
                  >
                    <span>{lvl}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status & Due Date Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status Select */}
            <div>
              <label htmlFor="task-status-select" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Current Status
              </label>
              <select
                id="task-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-full text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-medium"
              >
                <option value="Pending" className="bg-slate-900 text-white">Pending</option>
                <option value="In Progress" className="bg-slate-900 text-white">In Progress</option>
                <option value="Completed" className="bg-slate-900 text-white">Completed</option>
              </select>
            </div>

            {/* Due Date Input */}
            <div>
              <label htmlFor="task-duedate-input" className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Due Date
              </label>
              <input
                id="task-duedate-input"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer font-medium"
              />
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500 font-bold mr-1 uppercase tracking-wider">Quick:</span>
            <button
              type="button"
              onClick={() => handleQuickDate(0)}
              className="px-3 py-1 rounded-full text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate(1)}
              className="px-3 py-1 rounded-full text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate(3)}
              className="px-3 py-1 rounded-full text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              +3 Days
            </button>
            <button
              type="button"
              onClick={() => handleQuickDate(7)}
              className="px-3 py-1 rounded-full text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
            >
              Next Week
            </button>
          </div>

          {/* Category / Tag */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Category / Tag
            </label>
            <div className="flex items-center gap-1.5 flex-wrap mb-2">
              {defaultCategories.map((cat) => {
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    id={`cat-chip-${cat.toLowerCase()}`}
                    onClick={() => {
                      setCategory(cat);
                      setCustomCategory('');
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setCategory('Custom')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  category === 'Custom'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                + Custom Tag
              </button>
            </div>

            {category === 'Custom' && (
              <input
                id="custom-category-input"
                type="text"
                placeholder="Enter custom category name..."
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-full text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium placeholder:text-slate-500"
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {isEdit && taskToEdit ? (
              <button
                type="button"
                id="modal-delete-task-btn"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-4 py-2 rounded-full text-xs font-bold transition-colors uppercase tracking-wider"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-white rounded-full transition-colors uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="modal-submit-task-btn"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 uppercase tracking-wider active:scale-95"
              >
                {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
