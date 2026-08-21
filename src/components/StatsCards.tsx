import React from 'react';
import {
  CheckCircle2,
  Clock,
  Hourglass,
  AlertTriangle,
  ListTodo,
} from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { TaskStatus } from '../types';

interface StatsCardsProps {
  onFilterByStatus?: (status: 'All' | TaskStatus | 'Overdue') => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ onFilterByStatus }) => {
  const { stats, filters, setFilters } = useTasks();

  const handleCardClick = (status: 'All' | TaskStatus | 'Overdue') => {
    setFilters(prev => ({ ...prev, status }));
    if (onFilterByStatus) {
      onFilterByStatus(status);
    }
  };

  const cards = [
    {
      id: 'stat-total',
      label: 'Total Active',
      value: stats?.total ?? 0,
      subtext: `${stats?.completionRate ?? 0}% completed`,
      bgColor: 'bg-indigo-950/40 hover:bg-indigo-950/60',
      labelColor: 'text-indigo-400',
      valueColor: 'text-indigo-100',
      borderColor: 'border-indigo-800/60 hover:border-indigo-700',
      activeRing: 'ring-2 ring-indigo-500 border-indigo-400',
      status: 'All' as const,
      active: filters.status === 'All',
    },
    {
      id: 'stat-pending',
      label: 'Pending',
      value: stats?.pending ?? 0,
      subtext: 'Awaiting start',
      bgColor: 'bg-slate-900 hover:bg-slate-800/80',
      labelColor: 'text-slate-400',
      valueColor: 'text-slate-100',
      borderColor: 'border-slate-800 hover:border-slate-700',
      activeRing: 'ring-2 ring-slate-400 border-slate-400',
      status: 'Pending' as const,
      active: filters.status === 'Pending',
    },
    {
      id: 'stat-in-progress',
      label: 'In Progress',
      value: stats?.inProgress ?? 0,
      subtext: 'Actively ongoing',
      bgColor: 'bg-amber-950/40 hover:bg-amber-950/60',
      labelColor: 'text-amber-400',
      valueColor: 'text-amber-100',
      borderColor: 'border-amber-800/60 hover:border-amber-700',
      activeRing: 'ring-2 ring-amber-500 border-amber-400',
      status: 'In Progress' as const,
      active: filters.status === 'In Progress',
    },
    {
      id: 'stat-completed',
      label: 'Completed',
      value: stats?.completed ?? 0,
      subtext: 'Successfully resolved',
      bgColor: 'bg-emerald-950/40 hover:bg-emerald-950/60',
      labelColor: 'text-emerald-400',
      valueColor: 'text-emerald-100',
      borderColor: 'border-emerald-800/60 hover:border-emerald-700',
      activeRing: 'ring-2 ring-emerald-500 border-emerald-400',
      status: 'Completed' as const,
      active: filters.status === 'Completed',
    },
    {
      id: 'stat-overdue',
      label: 'Overdue',
      value: stats?.overdue ?? 0,
      subtext: (stats?.overdue ?? 0) > 0 ? 'Action required' : 'All on track',
      bgColor: 'bg-rose-950/40 hover:bg-rose-950/60',
      labelColor: 'text-rose-400',
      valueColor: 'text-rose-100',
      borderColor: 'border-rose-800/60 hover:border-rose-700',
      activeRing: 'ring-2 ring-rose-500 border-rose-400',
      status: 'Overdue' as const,
      active: filters.status === 'Overdue',
      highlight: (stats?.overdue ?? 0) > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        return (
          <button
            key={card.id}
            id={card.id}
            onClick={() => handleCardClick(card.status)}
            className={`text-left p-6 rounded-3xl border transition-all duration-150 cursor-pointer ${card.bgColor} ${card.borderColor} ${
              card.active ? `${card.activeRing} shadow-sm` : ''
            }`}
          >
            <p className={`${card.labelColor} font-black uppercase text-[11px] sm:text-xs tracking-widest mb-1 truncate`}>
              {card.label}
            </p>

            <h2 className={`text-4xl sm:text-5xl font-black tracking-tighter ${card.valueColor}`}>
              {card.value}
            </h2>

            <p className="text-xs font-semibold text-slate-400 mt-2 truncate">
              {card.subtext}
            </p>
          </button>
        );
      })}
    </div>
  );
};
