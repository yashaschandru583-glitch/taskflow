import { Task, TaskStats, User, TaskFilterOptions, AuthResponse } from '../types';

const API_BASE = '/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('taskflow_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      data = {};
    }

    if (!response.ok) {
      const errorMsg = data?.error || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  }

  // --- AUTH ENDPOINTS ---
  public async register(payload: { name: string; email: string; password: string; confirmPassword?: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  public async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  public async updateProfile(payload: { name?: string; avatar?: string; currentPassword?: string; newPassword?: string }): Promise<{ user: User; message: string }> {
    return this.request<{ user: User; message: string }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // --- TASK ENDPOINTS ---
  public async getTasks(filters?: Partial<TaskFilterOptions>): Promise<{ tasks: Task[]; total: number }> {
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
    return this.request<{ tasks: Task[]; total: number }>(`/tasks${qs}`);
  }

  public async getTaskStats(): Promise<TaskStats> {
    return this.request<TaskStats>('/tasks/stats');
  }

  public async getTaskById(id: string): Promise<{ task: Task }> {
    return this.request<{ task: Task }>(`/tasks/${id}`);
  }

  public async createTask(task: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    dueDate: string;
    category?: string;
  }): Promise<{ message: string; task: Task }> {
    return this.request<{ message: string; task: Task }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    });
  }

  public async updateTask(
    id: string,
    updates: Partial<Omit<Task, 'id' | 'userId' | 'createdAt'>>
  ): Promise<{ message: string; task: Task }> {
    return this.request<{ message: string; task: Task }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async updateTaskStatus(id: string, status: string): Promise<{ message: string; task: Task }> {
    return this.request<{ message: string; task: Task }>(`/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  public async deleteTask(id: string): Promise<{ message: string; id: string }> {
    return this.request<{ message: string; id: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  public async seedSampleTasks(): Promise<{ message: string; count: number }> {
    return this.request<{ message: string; count: number }>('/tasks/seed', {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
