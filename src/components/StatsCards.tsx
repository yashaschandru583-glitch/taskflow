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
      bgColor: 'bg-indigo-50 hover:bg-indigo-100/70',
      labelColor: 'text-indigo-600',
      valueColor: 'text-indigo-900',
      borderColor: 'border-indigo-100 hover:border-indigo-200',
      activeRing: 'ring-2 ring-indigo-500 border-indigo-400',
      status: 'All' as const,
      active: filters.status === 'All',
    },
    {
      id: 'stat-pending',
      label: 'Pending',
      value: stats?.pending ?? 0,
      subtext: 'Awaiting start',
      bgColor: 'bg-slate-100/70 hover:bg-slate-200/60',
      labelColor: 'text-slate-600',
      valueColor: 'text-slate-900',
      borderColor: 'border-slate-200 hover:border-slate-300',
      activeRing: 'ring-2 ring-slate-800 border-slate-600',
      status: 'Pending' as const,
      active: filters.status === 'Pending',
    },
    {
      id: 'stat-in-progress',
      label: 'In Progress',
      value: stats?.inProgress ?? 0,
      subtext: 'Actively ongoing',
      bgColor: 'bg-amber-50 hover:bg-amber-100/70',
      labelColor: 'text-amber-600',
      valueColor: 'text-amber-900',
      borderColor: 'border-amber-100 hover:border-amber-200',
      activeRing: 'ring-2 ring-amber-500 border-amber-400',
      status: 'In Progress' as const,
      active: filters.status === 'In Progress',
    },
    {
      id: 'stat-completed',
      label: 'Completed',
      value: stats?.completed ?? 0,
      subtext: 'Successfully resolved',
      bgColor: 'bg-emerald-50 hover:bg-emerald-100/70',
      labelColor: 'text-emerald-600',
      valueColor: 'text-emerald-900',
      borderColor: 'border-emerald-100 hover:border-emerald-200',
      activeRing: 'ring-2 ring-emerald-500 border-emerald-400',
      status: 'Completed' as const,
      active: filters.status === 'Completed',
    },
    {
      id: 'stat-overdue',
      label: 'Overdue',
      value: stats?.overdue ?? 0,
      subtext: (stats?.overdue ?? 0) > 0 ? 'Action required' : 'All on track',
      bgColor: 'bg-rose-50 hover:bg-rose-100/70',
      labelColor: 'text-rose-600',
      valueColor: 'text-rose-900',
      borderColor: 'border-rose-100 hover:border-rose-200',
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
