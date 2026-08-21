import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { TaskModal } from './components/TaskModal';
import { TaskDetailModal } from './components/TaskDetailModal';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { TasksPage } from './pages/TasksPage';
import { SettingsPage } from './pages/SettingsPage';
import { TaskStatus } from './types';

function AuthenticatedApp() {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedTask,
    setFilters,
  } = useTasks();

  const handleNavigateTasks = (statusFilter?: 'All' | TaskStatus | 'Overdue') => {
    if (statusFilter) {
      setFilters(prev => ({ ...prev, status: statusFilter }));
    }
    setActivePage('tasks');
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans antialiased">
      {/* Persistent / Mobile Responsive Sidebar */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* Scrollable Page Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activePage === 'dashboard' && (
            <DashboardPage onNavigateTasks={handleNavigateTasks} />
          )}
          {activePage === 'tasks' && <TasksPage />}
          {activePage === 'settings' && <SettingsPage />}
        </main>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        isEdit={false}
      />
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        isEdit={true}
        taskToEdit={selectedTask}
      />
      <TaskDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </div>
  );
}

function MainContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'landing' | 'login' | 'register'>('landing');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold tracking-tight text-slate-700">Loading TaskFlow...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <TaskProvider>
        <AuthenticatedApp />
      </TaskProvider>
    );
  }

  if (authView === 'login') {
    return (
      <LoginPage
        onNavigateRegister={() => setAuthView('register')}
        onNavigateLanding={() => setAuthView('landing')}
      />
    );
  }

  if (authView === 'register') {
    return (
      <RegisterPage
        onNavigateLogin={() => setAuthView('login')}
        onNavigateLanding={() => setAuthView('landing')}
      />
    );
  }

  return (
    <LandingPage
      onNavigateLogin={() => setAuthView('login')}
      onNavigateRegister={() => setAuthView('register')}
    />
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ToastProvider>
  );
}
