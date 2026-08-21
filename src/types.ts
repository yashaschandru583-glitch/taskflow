export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string; // YYYY-MM-DD or ISO string
  category: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  overdue: number;
  completionRate: number;
  priorityCounts: {
    High: number;
    Medium: number;
    Low: number;
  };
  categoryCounts: Record<string, number>;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export type ViewMode = 'list' | 'kanban' | 'calendar';

export interface TaskFilterOptions {
  search: string;
  status: 'All' | TaskStatus | 'Overdue';
  priority: 'All' | TaskPriority;
  category: string;
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}

export interface WebSocketMessage {
  type: 'TASK_CREATED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'PING' | 'PONG' | 'CONNECTED';
  userId?: string;
  payload?: any;
  timestamp?: string;
}
