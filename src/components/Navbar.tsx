import React, { useState } from 'react';
import { Plus, Wifi, WifiOff, Menu, User, LogOut, Settings, CheckSquare, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';

interface NavbarProps {
  onToggleMobileSidebar: () => void;
  activePage: string;
  setActivePage: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileSidebar, activePage, setActivePage }) => {
  const { user, logout } = useAuth();
  const { wsConnected, setIsCreateModalOpen, setSelectedTask } = useTasks();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleOpenCreate = () => {
    setSelectedTask(null);
    setIsCreateModalOpen(true);
  };

  return (
    <header id="app-navbar" className="h-20 bg-white border-b border-slate-100 sticky top-0 z-30 px-6 sm:px-10 flex items-center justify-between">
      {/* Left side: Mobile menu toggle & page breadcrumb */}
      <div className="flex items-center gap-4">
        <button
          id="mobile-sidebar-btn"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2.5 text-slate-900 font-bold text-base">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-sm shadow-indigo-200">
            T
          </div>
          <span className="font-extrabold tracking-tight">TaskFlow</span>
          <span className="text-slate-300 font-light">/</span>
          <span className="text-slate-400 font-semibold text-sm capitalize">
            {activePage === 'dashboard' ? 'Overview' : activePage}
          </span>
        </div>
      </div>

      {/* Right side: Real-time status, Add Task CTA & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real-time sync badge */}
        <div
          id="realtime-status-badge"
          title={wsConnected ? 'Connected via real-time WebSocket' : 'Polling for updates'}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
            wsConnected
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-700 border border-amber-200'
          }`}
        >
          {wsConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline uppercase tracking-wider text-[10px]">Live Sync</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline uppercase tracking-wider text-[10px]">Syncing</span>
            </>
          )}
        </div>

        {/* Create Task Button */}
        <button
          id="navbar-create-task-btn"
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full shadow-lg shadow-indigo-200 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            id="user-profile-menu-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-indigo-100 transition-all"
            aria-label="User account menu"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
              />
              <div
                id="user-dropdown-menu"
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-sm text-slate-700"
              >
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{user?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActivePage('settings');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-left hover:bg-slate-50 text-slate-700 font-semibold text-xs"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Account Settings</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    id="dropdown-logout-btn"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-left text-rose-600 hover:bg-rose-50 font-bold text-xs"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
