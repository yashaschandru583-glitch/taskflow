import React from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  List,
  Columns3,
  X,
  Plus,
  Filter,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { TaskPriority, TaskStatus, ViewMode } from '../types';

interface TaskFiltersProps {
  showViewToggle?: boolean;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({ showViewToggle = true }) => {
  const {
    filters,
    setFilters,
    viewMode,
    setViewMode,
    categories,
    setIsCreateModalOpen,
    setSelectedTask,
  } = useTasks();

  const statusOptions: Array<{ id: 'All' | TaskStatus | 'Overdue'; label: string }> = [
    { id: 'All', label: 'All Tasks' },
    { id: 'Pending', label: 'Pending' },
    { id: 'In Progress', label: 'In Progress' },
    { id: 'Completed', label: 'Completed' },
    { id: 'Overdue', label: 'Overdue' },
  ];

  const priorityOptions: Array<{ id: 'All' | TaskPriority; label: string }> = [
    { id: 'All', label: 'All Priorities' },
    { id: 'High', label: 'High Priority' },
    { id: 'Medium', label: 'Medium Priority' },
    { id: 'Low', label: 'Low Priority' },
  ];

  const sortOptions = [
    { value: 'createdAt-desc', label: 'Newest First', sortBy: 'createdAt', sortOrder: 'desc' },
    { value: 'createdAt-asc', label: 'Oldest First', sortBy: 'createdAt', sortOrder: 'asc' },
    { value: 'dueDate-asc', label: 'Due Soonest', sortBy: 'dueDate', sortOrder: 'asc' },
    { value: 'dueDate-desc', label: 'Due Latest', sortBy: 'dueDate', sortOrder: 'desc' },
    { value: 'priority-desc', label: 'Highest Priority', sortBy: 'priority', sortOrder: 'desc' },
    { value: 'title-asc', label: 'Title (A-Z)', sortBy: 'title', sortOrder: 'asc' },
  ];

  const currentSortValue = `${filters.sortBy}-${filters.sortOrder}`;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = sortOptions.find(opt => opt.value === e.target.value);
    if (selected) {
      setFilters(prev => ({
        ...prev,
        sortBy: selected.sortBy as any,
        sortOrder: selected.sortOrder as any,
      }));
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'All',
      priority: 'All',
      category: 'All',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters =
    filters.search !== '' ||
    filters.status !== 'All' ||
    filters.priority !== 'All' ||
    filters.category !== 'All';

  return (
    <div id="task-filters-bar" className="space-y-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
      {/* Top row: Search input, Sort, View Toggle, Create Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            id="task-search-input"
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
          />
          {filters.search && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Priority dropdown */}
          <div className="relative">
            <select
              id="priority-filter-select"
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-full px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              {priorityOptions.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          {/* Category filter if categories exist */}
          {categories.length > 0 && (
            <div className="relative">
              <select
                id="category-filter-select"
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-full px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="relative">
            <select
              id="task-sort-select"
              value={currentSortValue}
              onChange={handleSortChange}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-full px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle (List vs Kanban) */}
          {showViewToggle && (
            <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60">
              <button
                id="view-mode-list-btn"
                onClick={() => setViewMode('list')}
                title="List View"
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                id="view-mode-kanban-btn"
                onClick={() => setViewMode('kanban')}
                title="Kanban Board View"
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-800'
                }`}
              >
                <Columns3 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Add Task Quick Button */}
          <button
            id="filters-add-task-btn"
            onClick={() => {
              setSelectedTask(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-md shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Status Filter Tabs & Active filter indicator */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          {statusOptions.map((opt) => {
            const isActive = filters.status === opt.id;
            return (
              <button
                key={opt.id}
                id={`status-tab-${opt.id.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => setFilters(prev => ({ ...prev, status: opt.id }))}
                className={`px-4 py-2 rounded-full text-xs font-black tracking-tight transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-800'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {hasActiveFilters && (
          <button
            id="clear-filters-btn"
            onClick={handleClearFilters}
            className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 hover:underline min-w-max ml-2"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
};
