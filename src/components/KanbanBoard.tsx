import React from 'react';
import { Plus, Clock, Hourglass, CheckCircle2, ChevronRight, ChevronLeft } from 'lucide-react';
import { Task, TaskStatus } from '../types';
import { useTasks } from '../context/TaskContext';
import { TaskCard } from './TaskCard';

export const KanbanBoard: React.FC = () => {
  const { tasks, updateTaskStatus, openCreateWithStatus } = useTasks();

  const columns: Array<{
    id: TaskStatus;
    title: string;
    icon: typeof Clock;
    badgeBg: string;
    badgeText: string;
    borderTop: string;
  }> = [
    {
      id: 'Pending',
      title: 'Pending',
      icon: Clock,
      badgeBg: 'bg-amber-950/80 border border-amber-800/60',
      badgeText: 'text-amber-300',
      borderTop: 'border-t-amber-500',
    },
    {
      id: 'In Progress',
      title: 'In Progress',
      icon: Hourglass,
      badgeBg: 'bg-indigo-950/80 border border-indigo-800/60',
      badgeText: 'text-indigo-300',
      borderTop: 'border-t-indigo-500',
    },
    {
      id: 'Completed',
      title: 'Completed',
      icon: CheckCircle2,
      badgeBg: 'bg-emerald-950/80 border border-emerald-800/60',
      badgeText: 'text-emerald-300',
      borderTop: 'border-t-emerald-500',
    },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateTaskStatus(taskId, targetStatus);
    }
  };

  return (
    <div id="kanban-board-container" className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 items-start font-sans">
      {columns.map((col) => {
        const Icon = col.icon;
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            id={`kanban-col-${col.id.toLowerCase().replace(/\s+/g, '-')}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
            className={`bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-xs flex flex-col min-h-[550px] transition-colors`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center">
                  <Icon className={`w-4 h-4 ${col.badgeText}`} />
                </div>
                <h3 className="font-black text-white text-base tracking-tight">{col.title}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${col.badgeBg} ${col.badgeText}`}>
                  {colTasks.length}
                </span>
              </div>

              <button
                id={`add-task-col-${col.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => openCreateWithStatus && openCreateWithStatus(col.id)}
                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-full transition-all"
                title={`Add task to ${col.title}`}
                aria-label={`Add task to ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Task list container */}
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
              {colTasks.length === 0 ? (
                <div className="h-44 border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 text-center p-6 bg-slate-950/40">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No tasks in {col.title}</p>
                  <button
                    onClick={() => openCreateWithStatus && openCreateWithStatus(col.id)}
                    className="mt-3 text-xs text-indigo-400 hover:underline font-bold flex items-center gap-1 uppercase tracking-wider"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Task
                  </button>
                </div>
              ) : (
                colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', task.id);
                    }}
                    className="transition-transform active:cursor-grabbing"
                  >
                    <TaskCard task={task} compact />
                  </div>
                ))
              )}
            </div>

            {/* Bottom Add Shortcut */}
            <button
              onClick={() => openCreateWithStatus && openCreateWithStatus(col.id)}
              className="mt-4 w-full py-2.5 border border-dashed border-slate-800 hover:border-indigo-500/60 hover:bg-slate-800/60 rounded-full text-xs font-bold text-slate-400 hover:text-indigo-300 flex items-center justify-center gap-2 transition-all uppercase tracking-wider active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              <span>Add deliverable</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
