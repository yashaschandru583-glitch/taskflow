import React from 'react';
import {
  CheckSquare,
  Zap,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  Columns3,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateRegister,
}) => {
  const { loginAsDemo, isLoading } = useAuth();

  const handleDemoClick = async () => {
    try {
      await loginAsDemo();
    } catch (e) {
      onNavigateLogin();
    }
  };

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Sync Engine',
      description: 'Instant WebSocket synchronization across all tabs and team sessions with zero delay.',
      gradient: 'from-amber-400 to-orange-500',
    },
    {
      icon: Columns3,
      title: 'List & Kanban Workflows',
      description: 'Switch between structured lists and visual Kanban boards tailored to your focus state.',
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      icon: TrendingUp,
      title: 'Priority & Deadline Analytics',
      description: 'Stay ahead of crunch periods with intelligent overdue tracking and completion rates.',
      gradient: 'from-emerald-400 to-teal-600',
    },
    {
      icon: Shield,
      title: 'Encrypted & Private',
      description: 'Enterprise-grade bcrypt password hashing and token-based protected endpoints.',
      gradient: 'from-purple-500 to-indigo-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="font-black text-2xl tracking-tighter text-white">TaskFlow</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="landing-login-btn"
            onClick={onNavigateLogin}
            className="text-xs font-bold text-slate-300 hover:text-white px-5 py-2.5 rounded-full hover:bg-slate-900 transition-colors uppercase tracking-wider"
          >
            Sign In
          </button>
          <button
            id="landing-register-btn"
            onClick={onNavigateRegister}
            className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-full shadow-lg shadow-indigo-500/20 transition-all uppercase tracking-wider active:scale-95"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-20">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Task Management Simplified</span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-tight">
            Stay organized. <br />
            <span className="text-indigo-400">Get things done.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            A high-performance workspace for your daily deliverables. Track deadlines, prioritize with agility, view interactive Kanban boards, and stay in sync effortlessly.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              id="hero-get-started-btn"
              onClick={onNavigateRegister}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-full shadow-xl shadow-indigo-500/20 transition-all text-sm group active:scale-95"
            >
              <span>Start Free Today</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              id="hero-demo-btn"
              onClick={handleDemoClick}
              disabled={isLoading}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-full border border-slate-800 shadow-xs transition-all text-sm active:scale-95"
            >
              <Zap className="w-4 h-4 text-indigo-400" />
              <span>{isLoading ? 'Loading Demo...' : 'Explore Demo Workspace'}</span>
            </button>
          </div>
        </div>

        {/* Live Workspace Preview Card */}
        <div className="mt-16 max-w-5xl mx-auto w-full">
          <div className="relative rounded-3xl bg-slate-900 p-6 sm:p-8 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Window bar mockup */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-slate-500 font-mono font-bold ml-2">app.taskflow.com</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 bg-indigo-950/80 px-3 py-1 rounded-full border border-indigo-800/60">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>Live Workspace</span>
              </div>
            </div>

            {/* Mockup Dashboard content */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Tasks</span>
                <p className="text-3xl font-black text-white mt-1">12</p>
              </div>
              <div className="p-4 bg-amber-950/30 border border-amber-800/40 rounded-2xl">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">In Progress</span>
                <p className="text-3xl font-black text-white mt-1">4</p>
              </div>
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 rounded-2xl">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Completed</span>
                <p className="text-3xl font-black text-white mt-1">7</p>
              </div>
              <div className="p-4 bg-indigo-950/30 border border-indigo-800/40 rounded-2xl">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Velocity</span>
                <p className="text-3xl font-black text-white mt-1">75%</p>
              </div>
            </div>

            {/* Mockup tasks preview */}
            <div className="space-y-3">
              <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-black text-xs">
                    MKT
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Launch Q3 Product Release Campaign</p>
                    <p className="text-xs text-slate-400 font-medium">Marketing • Due Tomorrow</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800/60">High</span>
              </div>
              <div className="p-4 bg-slate-800/80 border border-slate-700/80 rounded-2xl flex items-center justify-between opacity-75">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-black text-xs">
                    SEC
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 line-through">Security Token Expiration Audit</p>
                    <p className="text-xs text-slate-500 font-medium">Security • Completed</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">Done</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-28">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">
              Engineered for Focus
            </h2>
            <p className="text-sm text-slate-400 font-medium mt-2">
              Everything you need to prioritize, execute, and deliver results on time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xs hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-indigo-400 flex items-center justify-center font-black mb-6">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg tracking-tight mb-2">{f.title}</h3>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{f.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 bg-slate-950 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-black text-white text-sm">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            <span>TaskFlow</span>
          </div>
          <p className="font-medium">© {new Date().getFullYear()} TaskFlow Workspace. All rights reserved.</p>
          <div className="flex items-center gap-6 font-bold text-slate-400">
            <span className="hover:text-white cursor-pointer">Privacy</span>
            <span className="hover:text-white cursor-pointer">Terms</span>
            <span className="hover:text-white cursor-pointer">Security</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
