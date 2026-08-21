import React, { useState } from 'react';
import {
  User,
  Mail,
  Lock,
  Download,
  Database,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Save,
  Shield,
  Wifi,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  const { tasks, stats, seedDemoTasks, wsConnected } = useTasks();
  const { success, error } = useToast();

  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [activeAvatar, setActiveAvatar] = useState(user?.avatar || '');

  const avatarOptions = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
  ];

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      error('Validation Error', 'Name cannot be empty.');
      return;
    }

    if (newPassword) {
      if (!currentPassword) {
        error('Password Error', 'Please enter your current password to set a new password.');
        return;
      }
      if (newPassword.length < 6) {
        error('Password Error', 'New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        error('Password Error', 'New passwords do not match.');
        return;
      }
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        avatar: activeAvatar,
        ...(newPassword ? { currentPassword, newPassword } : {}),
      });
      success('Profile Updated', 'Your profile details have been saved successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      error('Update Failed', err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(tasks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `taskflow-export-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    success('Export Completed', 'Exported tasks as JSON.');
  };

  const handleExportCSV = () => {
    if (tasks.length === 0) {
      error('Export Error', 'No tasks to export.');
      return;
    }

    const headers = ['id', 'title', 'description', 'priority', 'status', 'dueDate', 'category', 'createdAt'];
    const csvRows = [
      headers.join(','),
      ...tasks.map(t =>
        [
          `"${t.id}"`,
          `"${(t.title || '').replace(/"/g, '""')}"`,
          `"${(t.description || '').replace(/"/g, '""')}"`,
          `"${t.priority}"`,
          `"${t.status}"`,
          `"${t.dueDate}"`,
          `"${t.category}"`,
          `"${t.createdAt}"`,
        ].join(',')
      ),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvRows.join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `taskflow-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    success('Export Completed', 'Exported tasks as CSV.');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter text-slate-900">
          Settings
        </h1>
        <p className="text-slate-400 text-base sm:text-lg font-medium ml-1 mt-1">
          Manage your personal profile, security credentials, and workspace preferences.
        </p>
      </div>

      {/* Main Profile Settings Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">Profile Information</h2>
            <p className="text-xs text-slate-400 font-medium">Update your display avatar and personal name</p>
          </div>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-6">
          {/* Avatar selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
              Avatar Selection
            </label>
            <div className="flex items-center gap-3 flex-wrap">
              {avatarOptions.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveAvatar(url)}
                  className={`w-14 h-14 rounded-2xl overflow-hidden border-2 transition-all p-0.5 ${
                    activeAvatar === url
                      ? 'border-indigo-600 ring-2 ring-indigo-200 shadow-md scale-105'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img
                    src={url}
                    alt={`Avatar ${idx}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="settings-name-input" className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Full Name
              </label>
              <input
                id="settings-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Email Address <span className="text-slate-400 font-normal lowercase">(read-only)</span>
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-full text-sm text-slate-500 cursor-not-allowed font-medium"
              />
            </div>
          </div>

          {/* Change Password Section */}
          <div className="pt-5 border-t border-slate-100 space-y-4">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Change Password</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">New Password</label>
                <input
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Confirm Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="save-profile-btn"
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-3 rounded-full shadow-md shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Workspace Tools & Data Export */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Data Export */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Export Task Data</h3>
              <p className="text-xs text-slate-400 font-medium">Download your workspace records</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              id="export-json-btn"
              onClick={handleExportJSON}
              className="flex-1 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-700 transition-colors text-center"
            >
              Export JSON
            </button>
            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="flex-1 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-full text-xs font-bold text-slate-700 transition-colors text-center"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Workspace Starter Seed */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 tracking-tight">Sample Data</h3>
              <p className="text-xs text-slate-400 font-medium">Load starter demo tasks</p>
            </div>
          </div>

          <div className="pt-1">
            <button
              id="seed-tasks-btn"
              onClick={() => seedDemoTasks()}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 rounded-full text-xs font-bold text-slate-700 transition-colors"
            >
              Load Sample Tasks
            </button>
          </div>
        </div>
      </div>

      {/* Logout Action Bar */}
      <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-base text-rose-950 tracking-tight">Sign Out</h3>
          <p className="text-xs text-rose-700 font-medium mt-0.5">End your current session on this device securely.</p>
        </div>
        <button
          id="settings-logout-btn"
          onClick={logout}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-6 py-2.5 rounded-full transition-all shadow-xs self-start sm:self-auto active:scale-95"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
