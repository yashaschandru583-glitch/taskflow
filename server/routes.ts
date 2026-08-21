import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { AuthRequest, requireAuth, generateToken } from './auth.js';
import { wsManager } from './ws.js';

const router = Router();

// ==========================================
// 1. AUTHENTICATION ROUTES
// ==========================================

// POST /api/auth/register
router.post('/auth/register', async (req, res: Response) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = db.createUser({
      name,
      email,
      passwordHash,
    });

    // Seed a couple starter tasks for new user
    db.seedSampleTasksForUser(user.id);

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/auth/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// POST /api/auth/logout
router.post('/auth/logout', (_req, res: Response) => {
  return res.json({ message: 'Logged out successfully.' });
});

// GET /api/auth/me
router.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      createdAt: user.createdAt,
    },
  });
});

// PUT /api/auth/profile
router.put('/auth/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, avatar, currentPassword, newPassword } = req.body;

    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updates: any = {};
    if (name && name.trim()) {
      updates.name = name.trim();
    }
    if (avatar) {
      updates.avatar = avatar;
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password does not match.' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters.' });
      }
      const salt = await bcrypt.genSalt(10);
      updates.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = db.updateUser(userId, updates);

    return res.json({
      message: 'Profile updated successfully!',
      user: {
        id: updatedUser!.id,
        name: updatedUser!.name,
        email: updatedUser!.email,
        avatar: updatedUser!.avatar,
        createdAt: updatedUser!.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Profile update error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ==========================================
// 2. TASK CRUD ROUTES (PROTECTED)
// ==========================================

// GET /api/tasks/stats
router.get('/tasks/stats', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const tasks = db.getTasksByUserId(userId);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;

    const priorityCounts = { High: 0, Medium: 0, Low: 0 };
    const categoryCounts: Record<string, number> = {};

    tasks.forEach(task => {
      if (task.status === 'Pending') pending++;
      if (task.status === 'In Progress') inProgress++;
      if (task.status === 'Completed') completed++;

      if (task.status !== 'Completed' && task.dueDate && task.dueDate < todayStr) {
        overdue++;
      }

      if (task.priority in priorityCounts) {
        priorityCounts[task.priority]++;
      }

      const cat = task.category || 'General';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const total = tasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return res.json({
      total,
      pending,
      inProgress,
      completed,
      overdue,
      completionRate,
      priorityCounts,
      categoryCounts,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to compute task statistics.' });
  }
});

// GET /api/tasks
router.get('/tasks', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let tasks = db.getTasksByUserId(userId);

    const { search, status, priority, category, sortBy, sortOrder } = req.query;

    const todayStr = new Date().toISOString().split('T')[0];

    // Search filter
    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      tasks = tasks.filter(t => 
        t.title.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (status && status !== 'All') {
      if (status === 'Overdue') {
        tasks = tasks.filter(t => t.status !== 'Completed' && t.dueDate && t.dueDate < todayStr);
      } else {
        tasks = tasks.filter(t => t.status === status);
      }
    }

    // Priority filter
    if (priority && priority !== 'All') {
      tasks = tasks.filter(t => t.priority === priority);
    }

    // Category filter
    if (category && category !== 'All') {
      tasks = tasks.filter(t => t.category.toLowerCase() === (category as string).toLowerCase());
    }

    // Sorting
    const order = sortOrder === 'desc' ? -1 : 1;
    const priorityWeight: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

    tasks.sort((a, b) => {
      if (sortBy === 'priority') {
        const weightA = priorityWeight[a.priority] || 0;
        const weightB = priorityWeight[b.priority] || 0;
        return (weightA - weightB) * order;
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate) * order;
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title) * order;
      }
      // default: createdAt descending
      return (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) * (sortBy === 'createdAt' ? order : 1);
    });

    return res.json({ tasks, total: tasks.length });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
});

// GET /api/tasks/:id
router.get('/tasks/:id', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const task = db.findTaskById(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (task.userId !== userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this task.' });
    }

    return res.json({ task });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch task.' });
  }
});

// POST /api/tasks
router.post('/tasks', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, description, priority, status, dueDate, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }

    const validPriorities = ['Low', 'Medium', 'High'];
    const validStatuses = ['Pending', 'In Progress', 'Completed'];

    const taskPriority = validPriorities.includes(priority) ? priority : 'Medium';
    const taskStatus = validStatuses.includes(status) ? status : 'Pending';

    const newTask = db.createTask({
      userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      priority: taskPriority,
      status: taskStatus,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      category: category && category.trim() ? category.trim() : 'General',
    });

    // Real-time broadcast
    wsManager.broadcastToUser(userId, {
      type: 'TASK_CREATED',
      payload: newTask,
    });

    return res.status(201).json({
      message: 'Task created successfully!',
      task: newTask,
    });
  } catch (err: any) {
    console.error('Error creating task:', err);
    return res.status(500).json({ error: 'Failed to create task.' });
  }
});

// PUT /api/tasks/:id
router.put('/tasks/:id', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.id;
    const { title, description, priority, status, dueDate, category } = req.body;

    const existingTask = db.findTaskById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (existingTask.userId !== userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this task.' });
    }

    const updates: any = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (priority !== undefined) updates.priority = priority;
    if (status !== undefined) updates.status = status;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (category !== undefined) updates.category = category.trim();

    const updatedTask = db.updateTask(taskId, userId, updates);

    // Real-time broadcast
    wsManager.broadcastToUser(userId, {
      type: 'TASK_UPDATED',
      payload: updatedTask,
    });

    return res.json({
      message: 'Task updated successfully!',
      task: updatedTask,
    });
  } catch (err: any) {
    console.error('Error updating task:', err);
    return res.status(500).json({ error: 'Failed to update task.' });
  }
});

// PATCH /api/tasks/:id/status
router.patch('/tasks/:id/status', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.id;
    const { status } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const existingTask = db.findTaskById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (existingTask.userId !== userId) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const updatedTask = db.updateTask(taskId, userId, { status });

    // Real-time broadcast
    wsManager.broadcastToUser(userId, {
      type: 'TASK_UPDATED',
      payload: updatedTask,
    });

    return res.json({
      message: `Task moved to ${status}!`,
      task: updatedTask,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update task status.' });
  }
});

// DELETE /api/tasks/:id
router.delete('/tasks/:id', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const taskId = req.params.id;

    const existingTask = db.findTaskById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    if (existingTask.userId !== userId) {
      return res.status(403).json({ error: 'Access denied. You do not own this task.' });
    }

    const deleted = db.deleteTask(taskId, userId);
    if (!deleted) {
      return res.status(500).json({ error: 'Failed to delete task.' });
    }

    // Real-time broadcast
    wsManager.broadcastToUser(userId, {
      type: 'TASK_DELETED',
      payload: { id: taskId },
    });

    return res.json({
      message: 'Task deleted successfully!',
      id: taskId,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// POST /api/tasks/seed - resets or adds demo tasks for user
router.post('/tasks/seed', requireAuth, (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    db.seedSampleTasksForUser(userId);
    const tasks = db.getTasksByUserId(userId);

    wsManager.broadcastToUser(userId, {
      type: 'TASK_UPDATED',
      payload: tasks,
    });

    return res.json({ message: 'Sample tasks loaded successfully!', count: tasks.length });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to seed sample tasks.' });
  }
});

export default router;
