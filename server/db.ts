import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskRecord {
  id: string;
  userId: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  dueDate: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

interface DatabaseSchema {
  users: UserRecord[];
  tasks: TaskRecord[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'database.json');

class DatabaseService {
  private data: DatabaseSchema = { users: [], tasks: [] };
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.seedInitialData();
        this.persist();
      }
      this.initialized = true;
    } catch (err) {
      console.error('Error initializing database file:', err);
      this.seedInitialData();
    }
  }

  private seedInitialData() {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('password123', salt);
    const now = new Date().toISOString();
    const demoUserId = 'usr_demo_101';

    const demoUser: UserRecord = {
      id: demoUserId,
      name: 'Alex Morgan',
      email: 'demo@taskflow.com',
      passwordHash: demoPasswordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: now,
      updatedAt: now,
    };

    // Calculate dates relative to today
    const today = new Date();
    const formatDate = (daysOffset: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + daysOffset);
      return d.toISOString().split('T')[0];
    };

    const initialTasks: TaskRecord[] = [
      {
        id: 'tsk_101',
        userId: demoUserId,
        title: 'Design high-fidelity dashboard wireframes',
        description: 'Complete UI component specs in Figma for task analytics, filters, and priority matrices.',
        priority: 'High',
        status: 'In Progress',
        dueDate: formatDate(1),
        category: 'Design',
        createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
        updatedAt: now,
      },
      {
        id: 'tsk_102',
        userId: demoUserId,
        title: 'Implement WebSocket real-time event sync',
        description: 'Connect client WebSocket listeners for live task creation, modification, and instant notifications.',
        priority: 'High',
        status: 'Completed',
        dueDate: formatDate(-1),
        category: 'Development',
        createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
        updatedAt: now,
        completedAt: now,
      },
      {
        id: 'tsk_103',
        userId: demoUserId,
        title: 'Quarterly team roadmap presentation',
        description: 'Synthesize Q3 deliverables, team resource allocation, and key performance milestones for leadership review.',
        priority: 'Medium',
        status: 'Pending',
        dueDate: formatDate(4),
        category: 'Management',
        createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
        updatedAt: now,
      },
      {
        id: 'tsk_104',
        userId: demoUserId,
        title: 'Optimize API query response times',
        description: 'Audit task search indexes and implement pagination and response caching for large task sets.',
        priority: 'Medium',
        status: 'In Progress',
        dueDate: formatDate(2),
        category: 'Development',
        createdAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
        updatedAt: now,
      },
      {
        id: 'tsk_105',
        userId: demoUserId,
        title: 'Review user security & auth validation',
        description: 'Conduct token expiration audits, check bcrypt work factors, and verify authorization boundaries.',
        priority: 'High',
        status: 'Pending',
        dueDate: formatDate(0),
        category: 'Security',
        createdAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
        updatedAt: now,
      },
      {
        id: 'tsk_106',
        userId: demoUserId,
        title: 'Update branding guidelines and typography',
        description: 'Export brand color tokens and typography scale into Tailwind configuration.',
        priority: 'Low',
        status: 'Completed',
        dueDate: formatDate(-3),
        category: 'Design',
        createdAt: new Date(Date.now() - 3600 * 1000 * 96).toISOString(),
        updatedAt: now,
        completedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
      },
      {
        id: 'tsk_107',
        userId: demoUserId,
        title: 'Renew cloud hosting certificates',
        description: 'Verify SSL/TLS auto-renewal rules and domain ingress health checks.',
        priority: 'Low',
        status: 'Pending',
        dueDate: formatDate(7),
        category: 'Operations',
        createdAt: new Date().toISOString(),
        updatedAt: now,
      },
    ];

    this.data = {
      users: [demoUser],
      tasks: initialTasks,
    };
  }

  private persist() {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist database file:', err);
    }
  }

  // --- USER METHODS ---
  public findUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: { name: string; email: string; passwordHash: string; avatar?: string }): UserRecord {
    const now = new Date().toISOString();
    const newUser: UserRecord = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      passwordHash: userData.passwordHash,
      avatar: userData.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
      createdAt: now,
      updatedAt: now,
    };

    this.data.users.push(newUser);
    this.persist();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<Omit<UserRecord, 'id' | 'createdAt'>>): UserRecord | null {
    const userIndex = this.data.users.findIndex(u => u.id === id);
    if (userIndex === -1) return null;

    this.data.users[userIndex] = {
      ...this.data.users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.persist();
    return this.data.users[userIndex];
  }

  // --- TASK METHODS ---
  public getTasksByUserId(userId: string): TaskRecord[] {
    return this.data.tasks.filter(t => t.userId === userId);
  }

  public findTaskById(id: string): TaskRecord | undefined {
    return this.data.tasks.find(t => t.id === id);
  }

  public createTask(taskData: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>): TaskRecord {
    const now = new Date().toISOString();
    const newTask: TaskRecord = {
      ...taskData,
      id: 'tsk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: now,
      updatedAt: now,
      completedAt: taskData.status === 'Completed' ? now : null,
    };

    this.data.tasks.push(newTask);
    this.persist();
    return newTask;
  }

  public updateTask(id: string, userId: string, updates: Partial<Omit<TaskRecord, 'id' | 'userId' | 'createdAt'>>): TaskRecord | null {
    const taskIndex = this.data.tasks.findIndex(t => t.id === id && t.userId === userId);
    if (taskIndex === -1) return null;

    const existing = this.data.tasks[taskIndex];
    const isNowCompleted = updates.status === 'Completed' && existing.status !== 'Completed';
    const isUncompleted = updates.status && updates.status !== 'Completed' && existing.status === 'Completed';

    const updatedTask: TaskRecord = {
      ...existing,
      ...updates,
      completedAt: isNowCompleted ? new Date().toISOString() : isUncompleted ? null : existing.completedAt,
      updatedAt: new Date().toISOString(),
    };

    this.data.tasks[taskIndex] = updatedTask;
    this.persist();
    return updatedTask;
  }

  public deleteTask(id: string, userId: string): boolean {
    const initialLen = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(t => !(t.id === id && t.userId === userId));
    const deleted = this.data.tasks.length < initialLen;
    if (deleted) {
      this.persist();
    }
    return deleted;
  }

  public seedSampleTasksForUser(userId: string) {
    const today = new Date();
    const formatDate = (offset: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return d.toISOString().split('T')[0];
    };

    const samples: Omit<TaskRecord, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        userId,
        title: 'Review team weekly sprint deliverables',
        description: 'Go over sprint backlog items, pull requests, and assign priority tags.',
        priority: 'High',
        status: 'Pending',
        dueDate: formatDate(1),
        category: 'Management',
      },
      {
        userId,
        title: 'Prepare marketing launch assets',
        description: 'Finalize banner graphics, landing page copy, and email announcement templates.',
        priority: 'Medium',
        status: 'In Progress',
        dueDate: formatDate(3),
        category: 'Marketing',
      },
      {
        userId,
        title: 'Refactor user profile settings form',
        description: 'Add validation for password reset and avatar change feedback.',
        priority: 'Low',
        status: 'Completed',
        dueDate: formatDate(-1),
        category: 'Development',
        completedAt: new Date().toISOString(),
      },
    ];

    samples.forEach(sample => {
      this.createTask(sample);
    });
  }
}

export const db = new DatabaseService();
