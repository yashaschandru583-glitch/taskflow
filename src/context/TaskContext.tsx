import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Task, TaskStats, TaskFilterOptions, ViewMode, TaskStatus } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface TaskContextType {
  tasks: Task[];
  stats: TaskStats | null;
  isLoading: boolean;
  isSyncing: boolean;
  wsConnected: boolean;
  filters: TaskFilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<TaskFilterOptions>>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  // Modals state
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (open: boolean) => void;
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (open: boolean) => void;
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  // CRUD
  fetchTasks: () => Promise<void>;
  createTask: (data: { title: string; description?: string; priority: string; status: string; dueDate: string; category?: string }) => Promise<void>;
  updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  seedDemoTasks: () => Promise<void>;
  openCreateWithStatus?: (status: TaskStatus) => void;
  categories: string[];
}

const defaultStats: TaskStats = {
  total: 0,
  pending: 0,
  inProgress: 0,
  completed: 0,
  overdue: 0,
  completionRate: 0,
  priorityCounts: { High: 0, Medium: 0, Low: 0 },
  categoryCounts: {},
};

const initialFilters: TaskFilterOptions = {
  search: '',
  status: 'All',
  priority: 'All',
  category: 'All',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const { success, error, sync } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(defaultStats);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const [filters, setFilters] = useState<TaskFilterOptions>(initialFilters);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<any>(null);

  // Fetch Tasks with filters
  const fetchTasks = useCallback(async (silent = false) => {
    if (!isAuthenticated) return;
    if (!silent) setIsLoading(true);
    try {
      const [taskRes, statsRes] = await Promise.all([
        api.getTasks(filters),
        api.getTaskStats(),
      ]);
      setTasks(taskRes.tasks);
      setStats(statsRes);
    } catch (err: any) {
      if (!silent) {
        error('Failed to load tasks', err.message);
      }
    } finally {
      if (!silent) setIsLoading(false);
      setIsSyncing(false);
    }
  }, [isAuthenticated, filters, error]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      setTasks([]);
      setStats(defaultStats);
    }
  }, [isAuthenticated, filters, fetchTasks]);

  // Extract unique categories for quick tag filters
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    tasks.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [tasks]);

  // WebSocket Connection Management
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setWsConnected(false);
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    let socket: WebSocket;
    let reconnectTimeout: any;

    const connectWebSocket = () => {
      try {
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          setWsConnected(true);
          // Authenticate WS session
          socket.send(JSON.stringify({ type: 'AUTH', token }));

          // Heartbeat
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ type: 'PING' }));
            }
          }, 20000);
        };

        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'TASK_CREATED') {
              sync('Real-time Update', `Task "${data.payload.title}" was added.`);
              fetchTasks(true);
            } else if (data.type === 'TASK_UPDATED') {
              sync('Real-time Update', `Task "${data.payload.title}" was updated.`);
              fetchTasks(true);
            } else if (data.type === 'TASK_DELETED') {
              sync('Real-time Update', 'A task was deleted.');
              fetchTasks(true);
            }
          } catch (e) {
            // Ignore non-json
          }
        };

        socket.onclose = () => {
          setWsConnected(false);
          if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
          // Reconnect with backoff
          reconnectTimeout = setTimeout(connectWebSocket, 4000);
        };

        socket.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        console.warn('WebSocket connection error, falling back to polling:', err);
        setWsConnected(false);
      }
    };

    connectWebSocket();

    // Fallback polling every 45s
    const pollInterval = setInterval(() => {
      fetchTasks(true);
    }, 45000);

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      clearInterval(pollInterval);
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [isAuthenticated, token, fetchTasks, sync]);

  // CRUD Actions
  const createTask = async (data: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    dueDate: string;
    category?: string;
  }) => {
    setIsSyncing(true);
    try {
      const res = await api.createTask(data);
      success('Task Created', `"${res.task.title}" has been added.`);
      setIsCreateModalOpen(false);
      await fetchTasks(true);
    } catch (err: any) {
      error('Creation Failed', err.message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>) => {
    setIsSyncing(true);
    try {
      const res = await api.updateTask(id, updates);
      if (updates.status === 'Completed') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
        });
      }
      success('Task Updated', `"${res.task.title}" was saved.`);
      setIsEditModalOpen(false);
      if (selectedTask && selectedTask.id === id) {
        setSelectedTask(res.task);
      }
      await fetchTasks(true);
    } catch (err: any) {
      error('Update Failed', err.message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const updateTaskStatus = async (id: string, status: TaskStatus) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status } : t)));
    try {
      if (status === 'Completed') {
        confetti({
          particleCount: 40,
          spread: 50,
          origin: { y: 0.75 },
          colors: ['#3b82f6', '#8b5cf6', '#10b981'],
        });
      }
      const res = await api.updateTaskStatus(id, status);
      success('Status Changed', `Task moved to ${status}`);
      await fetchTasks(true);
    } catch (err: any) {
      error('Failed to change status', err.message);
      await fetchTasks(true);
    }
  };

  const deleteTask = async (id: string) => {
    setIsSyncing(true);
    try {
      await api.deleteTask(id);
      success('Task Deleted', 'Task removed successfully.');
      if (selectedTask?.id === id) {
        setSelectedTask(null);
        setIsDetailModalOpen(false);
        setIsEditModalOpen(false);
      }
      await fetchTasks(true);
    } catch (err: any) {
      error('Delete Failed', err.message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  const seedDemoTasks = async () => {
    setIsSyncing(true);
    try {
      const res = await api.seedSampleTasks();
      success('Sample Data Loaded', `Added sample tasks to your workspace.`);
      await fetchTasks();
    } catch (err: any) {
      error('Failed to seed tasks', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const openCreateWithStatus = (status: TaskStatus) => {
    setSelectedTask({
      id: '',
      userId: user?.id || '',
      title: '',
      description: '',
      priority: 'Medium',
      status,
      dueDate: new Date().toISOString().split('T')[0],
      category: 'Work',
      createdAt: '',
      updatedAt: '',
    });
    setIsCreateModalOpen(true);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        isLoading,
        isSyncing,
        wsConnected,
        filters,
        setFilters,
        viewMode,
        setViewMode,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isEditModalOpen,
        setIsEditModalOpen,
        isDetailModalOpen,
        setIsDetailModalOpen,
        selectedTask,
        setSelectedTask,
        fetchTasks,
        createTask,
        updateTask,
        updateTaskStatus,
        deleteTask,
        seedDemoTasks,
        openCreateWithStatus,
        categories,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
