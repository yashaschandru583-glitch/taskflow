import React from 'react';
import {
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Tag,
  ListTodo,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { StatsCards } from '../components/StatsCards';
import { TaskCard } from '../components/TaskCard';
import { TaskStatus } from '../types';

interface DashboardPageProps {
  onNavigateTasks: (status?: 'All' | TaskStatus | 'Overdue') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTasks }) => {
  const { user } = useAuth();
  const { tasks, stats, setIsCreateModalOpen, setSelectedTask, setFilters } = useTasks();

  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate < todayStr);
  const recentTasks = tasks.slice(0, 6);

  const handleOpenCreate = () => {
    setSelectedTask(null);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header - Bold Typography Hero */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-2">
        <div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900">
            Overview
          </h1>
          <p className="text-slate-400 text-base sm:text-lg font-medium ml-1 mt-1">
            {stats && stats.overdue > 0
              ? `You have ${stats.overdue} overdue ${stats.overdue === 1 ? 'task' : 'tasks'} requiring attention.`
              : stats && stats.pending > 0
              ? `You have ${stats.pending} pending tasks ready in your workspace.`
              : `All tasks completed! Organize, prioritize, and track deliverables.`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="dashboard-new-task-btn"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-full text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Overdue Warning Alert if any */}
      {overdueTasks.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-900">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 font-black">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base text-rose-950 tracking-tight">
                {overdueTasks.length} {overdueTasks.length === 1 ? 'Task is Overdue' : 'Tasks are Overdue'}
              </h3>
              <p className="text-xs text-rose-700 font-medium mt-0.5">
                Review and update deadlines to keep your project schedule accurate.
              </p>
            </div>
          </div>

          <button
            id="view-overdue-tasks-btn"
            onClick={() => onNavigateTasks('Overdue')}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all shrink-0 shadow-xs"
          >
            <span>View Overdue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Stats Cards Grid */}
      <section aria-label="Task Statistics">
        <StatsCards onFilterByStatus={(status) => onNavigateTasks(status)} />
      </section>

      {/* Middle Grid: Priority Distribution & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Matrix Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight">Priority Breakdown</h3>
            </div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">{stats?.total || 0} total</span>
          </div>

          <div className="space-y-4 pt-1">
            {/* High Priority */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-rose-600 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> High Priority
                </span>
                <span className="text-slate-900 font-black">{stats?.priorityCounts.High || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-rose-500 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.total ? ((stats.priorityCounts.High / stats.total) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Medium Priority */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-amber-600 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium Priority
                </span>
                <span className="text-slate-900 font-black">{stats?.priorityCounts.Medium || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.total ? ((stats.priorityCounts.Medium / stats.total) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Low Priority */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-slate-500 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-slate-400" /> Low Priority
                </span>
                <span className="text-slate-900 font-black">{stats?.priorityCounts.Low || 0}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-slate-400 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats?.total ? ((stats.priorityCounts.Low / stats.total) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                <Tag className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base tracking-tight">Categories & Tags</h3>
            </div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {Object.keys(stats?.categoryCounts || {}).length} tags
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {stats && Object.keys(stats.categoryCounts).length > 0 ? (
              Object.entries(stats.categoryCounts).map(([cat, count]) => (
                <button
                  key={cat}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, category: cat }));
                    onNavigateTasks();
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 rounded-full text-xs font-bold text-slate-700 transition-colors"
                >
                  <span>{cat}</span>
                  <span className="px-2 py-0.5 bg-slate-200/70 rounded-full text-[10px] text-slate-700 font-black">
                    {count}
                  </span>
                </button>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium italic">No categories tracked yet.</p>
            )}
          </div>
        </div>

        {/* Productivity Summary Card */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Productivity Progress</span>
            </div>
            <h4 className="font-black text-3xl sm:text-4xl text-white tracking-tight">
              {stats?.completionRate || 0}% Done
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed font-medium">
              {stats && stats.completionRate > 70
                ? 'High velocity! You are completing tasks well within estimated deadlines.'
                : 'Prioritize urgent and high-impact tasks to boost overall workspace momentum.'}
            </p>
          </div>

          <div className="pt-5 mt-5 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => onNavigateTasks()}
              className="text-xs text-indigo-300 hover:text-white font-bold flex items-center gap-1"
            >
              <span>View all tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleOpenCreate}
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full font-bold shadow-xs transition-colors"
            >
              + Quick Add
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Tasks Spotlight */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">Recent Tasks</h2>
            <p className="text-xs text-slate-400 font-medium">Active work items in your workspace</p>
          </div>

          <button
            onClick={() => onNavigateTasks()}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1 hover:underline"
          >
            <span>View all ({tasks.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentTasks.length === 0 ? (
          <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 p-8">
            <p className="text-sm font-semibold">No tasks found.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-2 text-xs text-indigo-600 font-bold hover:underline"
            >
              Create your first task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
