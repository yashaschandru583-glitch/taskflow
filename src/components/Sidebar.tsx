import React from 'react';
import {
  LayoutDashboard,
  CheckSquare,
  Columns3,
  Settings,
  LogOut,
  AlertCircle,
  Clock,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const { stats, setIsCreateModalOpen, setSelectedTask, setViewMode } = useTasks();

  const handleNavClick = (pageId: string, view?: 'list' | 'kanban') => {
    setActivePage(pageId);
    if (view) {
      setViewMode(view);
    }
    onCloseMobile();
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'tasks',
      label: 'All Tasks',
      icon: CheckSquare,
      badge: stats?.total ? stats.total.toString() : '0',
      badgeColor: 'bg-slate-100 text-slate-600',
    },
    {
      id: 'kanban',
      label: 'Kanban Board',
      icon: Columns3,
      badge: stats?.pending ? `${stats.pending} pending` : null,
      badgeColor: 'bg-blue-50 text-blue-700',
      view: 'kanban' as const,
    },
    {
      id: 'settings',
      label: 'Settings & Profile',
      icon: Settings,
      badge: null,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
      {/* Brand Header */}
      <div className="p-6 sm:p-8 pb-6 border-b border-slate-200/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-200">
              T
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">TaskFlow</span>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-4 pb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
          Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activePage === item.id || (item.id === 'kanban' && activePage === 'tasks' && item.view);

          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => handleNavClick(item.id === 'kanban' ? 'tasks' : item.id, item.view)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-white border border-slate-200 text-indigo-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Overdue Warning Alert in Sidebar if any exist */}
        {stats && stats.overdue > 0 && (
          <div className="pt-3">
            <button
              onClick={() => handleNavClick('tasks')}
              className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl p-3.5 text-left transition-all group"
            >
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs mb-1">
                <AlertCircle className="w-4 h-4 text-rose-500 animate-pulse" />
                <span className="uppercase tracking-wider">Action Needed</span>
              </div>
              <p className="text-xs text-rose-700 font-medium">
                You have <strong className="font-black text-rose-900">{stats.overdue}</strong> overdue {stats.overdue === 1 ? 'task' : 'tasks'}.
              </p>
            </button>
          </div>
        )}
      </div>

      {/* User Footer Profile */}
      <div className="p-6 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3 mb-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm text-slate-900 truncate leading-tight">{user?.name || 'User'}</p>
            <p className="text-xs text-slate-400 font-medium truncate">{user?.email}</p>
          </div>
        </div>

        <button
          id="sidebar-logout-btn"
          onClick={logout}
          className="w-full py-1.5 text-xs text-slate-500 hover:text-rose-600 transition-colors text-left font-bold flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Persistent) */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
