import { Task, TaskStats, User, TaskFilterOptions, AuthResponse } from '../types';

const API_BASE = '/api';

// Fallback seed tasks for static/offline deployment
const DEFAULT_FALLBACK_TASKS: Task[] = [
  {
    id: 'task-fallback-1',
    userId: 'demo-user',
    title: 'Review Q3 Project Milestones',
    description: 'Coordinate with design and engineering leads to align on deliverables.',
    priority: 'High',
    status: 'In Progress',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    category: 'Work',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-fallback-2',
    userId: 'demo-user',
    title: 'Prepare Board Presentation Deck',
    description: 'Include core product engagement metrics and upcoming feature rollout roadmap.',
    priority: 'High',
    status: 'Pending',
    dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    category: 'Management',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-fallback-3',
    userId: 'demo-user',
    title: 'Audit Security Credentials & Tokens',
    description: 'Ensure all team members have multi-factor authentication enabled.',
    priority: 'Medium',
    status: 'Completed',
    dueDate: new Date().toISOString().split('T')[0],
    category: 'Security',
    completedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-fallback-4',
    userId: 'demo-user',
    title: 'Plan Weekly Team Sync & Retro',
    description: 'Organize agenda for Friday retrospective and sprint planning.',
    priority: 'Low',
    status: 'Pending',
    dueDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    category: 'Personal',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

class ApiService {
  private isServerAvailable: boolean | null = null;

  private getToken(): string | null {
    return localStorage.getItem('taskflow_token');
  }

  // Helper to get local tasks
  private getLocalTasks(): Task[] {
    const data = localStorage.getItem('taskflow_static_tasks');
    if (!data) {
      localStorage.setItem('taskflow_static_tasks', JSON.stringify(DEFAULT_FALLBACK_TASKS));
      return DEFAULT_FALLBACK_TASKS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return DEFAULT_FALLBACK_TASKS;
    }
  }

  private saveLocalTasks(tasks: Task[]): void {
    localStorage.setItem('taskflow_static_tasks', JSON.stringify(tasks));
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (this.isServerAvailable === false) {
      throw new Error('SERVER_OFFLINE');
    }

    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      // Check if response is HTML (often returned as 404 fallback on static hosts)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        this.isServerAvailable = false;
        throw new Error('SERVER_OFFLINE');
      }

      let data: any;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        if (response.status === 404 && endpoint.startsWith('/tasks')) {
          this.isServerAvailable = false;
          throw new Error('SERVER_OFFLINE');
        }
        const errorMsg = data?.error || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      this.isServerAvailable = true;
      return data as T;
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE' || err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
        this.isServerAvailable = false;
        throw new Error('SERVER_OFFLINE');
      }
      throw err;
    }
  }

  // --- AUTH ENDPOINTS WITH FALLBACK ---
  public async register(payload: { name: string; email: string; password: string; confirmPassword?: string }): Promise<AuthResponse> {
    try {
      return await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE') {
        const dummyUser: User = {
          id: 'user-' + Date.now(),
          name: payload.name,
          email: payload.email,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(payload.name)}`,
          createdAt: new Date().toISOString(),
        };
        const token = 'static-token-' + Date.now();
        localStorage.setItem('taskflow_static_user', JSON.stringify(dummyUser));
        return { message: 'Account created', token, user: dummyUser };
      }
      throw err;
    }
  }

  public async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    try {
      return await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE') {
        const savedUserStr = localStorage.getItem('taskflow_static_user');
        const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;
        const user: User = savedUser && savedUser.email === payload.email ? savedUser : {
          id: 'demo-user-1',
          name: payload.email.split('@')[0] || 'Alex Morgan',
          email: payload.email,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
        };
        const token = 'static-token-demo';
        localStorage.setItem('taskflow_static_user', JSON.stringify(user));
        return { message: 'Signed in successfully', token, user };
      }
      throw err;
    }
  }

  public async logout(): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/auth/logout', { method: 'POST' });
    } catch {
      return { message: 'Logged out' };
    }
  }

  public async getCurrentUser(): Promise<{ user: User }> {
    try {
      return await this.request<{ user: User }>('/auth/me');
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE') {
        const savedUserStr = localStorage.getItem('taskflow_static_user') || localStorage.getItem('taskflow_user');
        if (savedUserStr) {
          return { user: JSON.parse(savedUserStr) };
        }
        const defaultUser: User = {
          id: 'demo-user-1',
          name: 'Alex Morgan',
          email: 'alex@example.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
        };
        return { user: defaultUser };
      }
      throw err;
    }
  }

  public async updateProfile(payload: { name?: string; avatar?: string; currentPassword?: string; newPassword?: string }): Promise<{ user: User; message: string }> {
    try {
      return await this.request<{ user: User; message: string }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE') {
        const current = (await this.getCurrentUser()).user;
        const updated: User = {
          ...current,
          name: payload.name || current.name,
          avatar: payload.avatar || current.avatar,
        };
        localStorage.setItem('taskflow_static_user', JSON.stringify(updated));
        return { user: updated, message: 'Profile updated' };
      }
      throw err;
    }
  }

  // --- TASK ENDPOINTS WITH FALLBACK ---
  public async getTasks(filters?: Partial<TaskFilterOptions>): Promise<{ tasks: Task[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        if (filters.search) params.append('search', filters.search);
        if (filters.status && filters.status !== 'All') params.append('status', filters.status);
        if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
        if (filters.category && filters.category !== 'All') params.append('category', filters.category);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      }

      const qs = params.toString() ? `?${params.toString()}` : '';
      return await this.request<{ tasks: Task[]; total: number }>(`/tasks${qs}`);
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE') {
        let tasks = this.getLocalTasks();
        const todayStr = new Date().toISOString().split('T')[0];

        if (filters) {
          if (filters.search) {
            const s = filters.search.toLowerCase();
            tasks = tasks.filter(t => t.title.toLowerCase().includes(s) || (t.description && t.description.toLowerCase().includes(s)));
          }
          if (filters.status && filters.status !== 'All') {
            if (filters.status === 'Overdue') {
              tasks = tasks.filter(t => t.dueDate < todayStr && t.status !== 'Completed');
            } else {
              tasks = tasks.filter(t => t.status === filters.status);
            }
          }
          if (filters.priority && filters.priority !== 'All') {
            tasks = tasks.filter(t => t.priority === filters.priority);
          }
          if (filters.category && filters.category !== 'All') {
            tasks = tasks.filter(t => t.category === filters.category);
          }
        }

        return { tasks, total: tasks.length };
      }
      throw err;
    }
  }

  public async getTaskStats(): Promise<TaskStats> {
    try {
      return await this.request<TaskStats>('/tasks/stats');
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE') {
        const tasks = this.getLocalTasks();
        const todayStr = new Date().toISOString().split('T')[0];

        let pending = 0;
        let inProgress = 0;
        let completed = 0;
        let overdue = 0;
        const priorityCounts: { High: number; Medium: number; Low: number } = { High: 0, Medium: 0, Low: 0 };
        const categoryCounts: Record<string, number> = {};

        tasks.forEach(t => {
          if (t.status === 'Pending') pending++;
          if (t.status === 'In Progress') inProgress++;
          if (t.status === 'Completed') completed++;
          if (t.dueDate < todayStr && t.status !== 'Completed') overdue++;
          if (t.priority in priorityCounts) priorityCounts[t.priority as keyof typeof priorityCounts]++;
          if (t.category) {
            categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
          }
        });

        const total = tasks.length;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
          total,
          pending,
          inProgress,
          completed,
          overdue,
          completionRate,
          priorityCounts,
          categoryCounts,
        };
      }
      throw err;
    }
  }

  public async getTaskById(id: string): Promise<{ task: Task }> {
    try {
      return await this.request<{ task: Task }>(`/tasks/${id}`);
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE') {
        const tasks = this.getLocalTasks();
        const task = tasks.find(t => t.id === id);
        if (!task) throw new Error('Task not found');
        return { task };
      }
      throw err;
    }
  }

  public async createTask(task: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    dueDate: string;
    category?: string;
  }): Promise<{ message: string; task: Task }> {
    try {
      return await this.request<{ message: string; task: Task }>('/tasks', {
        method: 'POST',
        body: JSON.stringify(task),
      });
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE') {
        const tasks = this.getLocalTasks();
        const newTask: Task = {
          id: 'task-' + Date.now(),
          userId: 'demo-user',
          title: task.title,
          description: task.description || '',
          priority: task.priority as any,
          status: task.status as any,
          dueDate: task.dueDate,
          category: task.category || 'General',
          completedAt: task.status === 'Completed' ? new Date().toISOString() : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        tasks.unshift(newTask);
        this.saveLocalTasks(tasks);
        return { message: 'Task created', task: newTask };
      }
      throw err;
    }
  }

  public async updateTask(
    id: string,
    updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>
  ): Promise<{ message: string; task: Task }> {
    try {
      return await this.request<{ message: string; task: Task }>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE') {
        const tasks = this.getLocalTasks();
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) throw new Error('Task not found');

        const updated: Task = {
          ...tasks[index],
          ...updates,
          completedAt: updates.status === 'Completed' ? new Date().toISOString() : (updates.status ? undefined : tasks[index].completedAt),
          updatedAt: new Date().toISOString(),
        };
        tasks[index] = updated;
        this.saveLocalTasks(tasks);
        return { message: 'Task updated', task: updated };
      }
      throw err;
    }
  }

  public async updateTaskStatus(id: string, status: string): Promise<{ message: string; task: Task }> {
    try {
      return await this.request<{ message: string; task: Task }>(`/tasks/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE') {
        return this.updateTask(id, { status: status as any });
      }
      throw err;
    }
  }

  public async deleteTask(id: string): Promise<{ message: string; id: string }> {
    try {
      return await this.request<{ message: string; id: string }>(`/tasks/${id}`, {
        method: 'DELETE',
      });
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE') {
        const tasks = this.getLocalTasks();
        const filtered = tasks.filter(t => t.id !== id);
        this.saveLocalTasks(filtered);
        return { message: 'Task deleted', id };
      }
      throw err;
    }
  }

  public async seedSampleTasks(): Promise<{ message: string; count: number }> {
    try {
      return await this.request<{ message: string; count: number }>('/tasks/seed', {
        method: 'POST',
      });
    } catch (err: any) {
      if (err.message === 'SERVER_OFFLINE') {
        this.saveLocalTasks(DEFAULT_FALLBACK_TASKS);
        return { message: 'Tasks seeded', count: DEFAULT_FALLBACK_TASKS.length };
      }
      throw err;
    }
  }
}

export const api = new ApiService();

