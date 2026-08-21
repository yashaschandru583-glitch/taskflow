import React from 'react';
import { Plus, ListTodo, Columns3, CheckCircle2, Inbox } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { TaskFilters } from '../components/TaskFilters';
import { TaskCard } from '../components/TaskCard';
import { KanbanBoard } from '../components/KanbanBoard';

export const TasksPage: React.FC = () => {
  const { tasks, viewMode, isLoading, setIsCreateModalOpen, setSelectedTask, filters } = useTasks();

  const handleOpenCreate = () => {
    setSelectedTask(null);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900">
            Tasks
          </h1>
          <p className="text-slate-400 text-base sm:text-lg font-medium ml-1 mt-1">
            Organize, prioritize, and manage all your workspace deliverables.
          </p>
        </div>

        <button
          id="tasks-page-create-btn"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-full shadow-lg shadow-indigo-200 transition-all self-start md:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <TaskFilters showViewToggle={true} />

      {/* Main View: List or Kanban */}
      {viewMode === 'kanban' ? (
        <KanbanBoard />
      ) : (
        <div id="tasks-list-container" className="space-y-4">
          {isLoading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="w-9 h-9 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 border border-slate-200/80 text-center shadow-xs">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 font-black">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-1 tracking-tight">No tasks found</h3>
              <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto mb-6 leading-relaxed font-medium">
                {filters.search || filters.status !== 'All' || filters.priority !== 'All' || filters.category !== 'All'
                  ? 'Try adjusting your filters or search terms to find what you are looking for.'
                  : 'Start organizing by creating your first task today.'}
              </p>
              <button
                onClick={handleOpenCreate}
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-full shadow-md shadow-indigo-100 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Task</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
