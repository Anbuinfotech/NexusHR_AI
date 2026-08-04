import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { users, userPasswords, employees, departments, attendanceRecords, leaveRequests, performanceReviews } from './server/db.js';
import { generateToken, authenticateToken, requireRoles, AuthenticatedRequest } from './server/auth.js';
import { analyzeResume, generatePerformanceFeedback } from './server/gemini.js';
import { swaggerSpec } from './server/swagger.js';
import { User, Employee, Department, Attendance, LeaveRequest, PerformanceReview } from './src/types.js';




async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  // ==========================================
  // AUTHENTICATION APIS
  // ==========================================

  // Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordHash = userPasswords.get(user.id);
    if (!passwordHash || !bcrypt.compareSync(password, passwordHash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    const employee = employees.find((e) => e.id === user.employeeId || e.email.toLowerCase() === user.email.toLowerCase());

    return res.json({
      token,
      user,
      employee,
    });
  });

  // Register
  app.post('/api/auth/register', (req, res) => {
    const { username, email, password, role, fullName, designation, departmentId } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userId = `usr-${Date.now()}`;
    const empId = `emp-${Date.now()}`;
    const userRole = (role || 'EMPLOYEE').toUpperCase() as any;

    const newEmp: Employee = {
      id: empId,
      userId,
      fullName: fullName || username,
      email,
      phone: '+1 (555) 000-1122',
      address: 'San Francisco, CA',
      designation: designation || (userRole === 'ADMIN' ? 'Administrator' : userRole === 'HR' ? 'HR Specialist' : 'Software Engineer'),
      departmentId: departmentId || 'dept-1',
      departmentName: departments.find((d) => d.id === departmentId)?.departmentName || 'Engineering',
      joiningDate: new Date().toISOString().split('T')[0],
      skills: ['Java', 'Spring Boot', 'TypeScript'],
      profileImage: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      salary: 110000,
    };

    const newUser: User = {
      id: userId,
      username,
      email,
      role: userRole,
      employeeId: empId,
      createdAt: new Date().toISOString(),
    };

    const hash = bcrypt.hashSync(password, 10);
    users.push(newUser);
    employees.push(newEmp);
    userPasswords.set(userId, hash);

    const token = generateToken(newUser);
    return res.status(201).json({
      token,
      user: newUser,
      employee: newEmp,
    });
  });

  // Get current user info
  app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const employee = employees.find((e) => e.id === user.employeeId || e.email.toLowerCase() === user.email.toLowerCase());
    return res.json({ user, employee });
  });

  // ==========================================
  // DASHBOARD ANALYTICS APIS
  // ==========================================
  app.get('/api/dashboard/stats', authenticateToken, (req: AuthenticatedRequest, res) => {
    const totalEmployees = employees.length;
    const totalDepartments = departments.length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceRecords.filter((a) => a.date === today);
    const presentToday = todayAttendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
    const onLeaveToday = leaveRequests.filter(
      (l) => l.status === 'APPROVED' && l.startDate <= today && l.endDate >= today
    ).length;
    
    const pendingLeavesCount = leaveRequests.filter((l) => l.status === 'PENDING').length;
    
    const sumRating = performanceReviews.reduce((acc, r) => acc + r.overallRating, 0);
    const avgRating = performanceReviews.length > 0 ? Number((sumRating / performanceReviews.length).toFixed(1)) : 0;
    
    const attendanceRate = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 100;

    const departmentBreakdown = departments.map((d) => ({
      name: d.departmentName,
      value: employees.filter((e) => e.departmentId === d.id).length,
    }));

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const attendanceTrend = days.map((day, idx) => {
      const p = Math.max(0, Math.round(totalEmployees * (0.85 + (idx % 3) * 0.03)));
      const l = Math.max(0, Math.round(totalEmployees * 0.08));
      const ab = Math.max(0, totalEmployees - p - l);
      return { day, present: p, late: l, absent: ab };
    });

    return res.json({
      totalEmployees,
      totalDepartments,
      presentToday,
      onLeaveToday,
      pendingLeavesCount,
      avgPerformanceRating: avgRating,
      attendanceRate,
      departmentBreakdown,
      attendanceTrend,
    });
  });

  // ==========================================
  // ADMIN & USER MANAGEMENT APIS
  // ==========================================
  app.get('/api/users', authenticateToken, requireRoles(['ADMIN']), (req, res) => {
    return res.json(users);
  });

  app.put('/api/users/:id/role', authenticateToken, requireRoles(['ADMIN']), (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    const user = users.find((u) => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.role = role;
    return res.json(user);
  });

  // ==========================================
  // EMPLOYEE APIS
  // ==========================================
  app.get('/api/employees', authenticateToken, (req, res) => {
    const { departmentId, search } = req.query;
    let result = [...employees];

    if (departmentId) {
      result = result.filter((e) => e.departmentId === departmentId);
    }

    if (search) {
      const q = (search as string).toLowerCase();
      result = result.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.skills.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Populate department names
    result = result.map((e) => ({
      ...e,
      departmentName: departments.find((d) => d.id === e.departmentId)?.departmentName || 'General',
    }));

    return res.json(result);
  });

  app.get('/api/employees/:id', authenticateToken, (req, res) => {
    const emp = employees.find((e) => e.id === req.params.id);
    if (!emp) return res.status(404).json({ error: 'Employee not found' });
    
    const dept = departments.find((d) => d.id === emp.departmentId);
    return res.json({ ...emp, departmentName: dept?.departmentName || 'General' });
  });

  app.post('/api/employees', authenticateToken, requireRoles(['ADMIN', 'HR']), (req, res) => {
    const { fullName, email, phone, address, designation, departmentId, skills, salary, profileImage } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    const newEmp: Employee = {
      id: `emp-${Date.now()}`,
      fullName,
      email,
      phone: phone || '+1 (555) 000-0000',
      address: address || 'Remote',
      designation: designation || 'Software Engineer',
      departmentId: departmentId || 'dept-1',
      departmentName: departments.find((d) => d.id === departmentId)?.departmentName || 'Engineering',
      joiningDate: new Date().toISOString().split('T')[0],
      skills: Array.isArray(skills) ? skills : skills ? skills.split(',').map((s: string) => s.trim()) : ['Java'],
      profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      salary: Number(salary) || 95000,
    };

    employees.push(newEmp);
    return res.status(201).json(newEmp);
  });

  app.put('/api/employees/:id', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { id } = req.params;
    const empIndex = employees.findIndex((e) => e.id === id);

    if (empIndex === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Role check: HR/Admin or editing own profile
    const currentEmp = employees[empIndex];
    if (req.user?.role !== 'ADMIN' && req.user?.role !== 'HR' && req.user?.employeeId !== id && req.user?.email !== currentEmp.email) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own profile' });
    }

    const updated = {
      ...employees[empIndex],
      ...req.body,
      departmentName: req.body.departmentId ? departments.find((d) => d.id === req.body.departmentId)?.departmentName : employees[empIndex].departmentName,
    };

    employees[empIndex] = updated;
    return res.json(updated);
  });

  app.delete('/api/employees/:id', authenticateToken, requireRoles(['ADMIN', 'HR']), (req, res) => {
    const { id } = req.params;
    const index = employees.findIndex((e) => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const deleted = employees.splice(index, 1)[0];
    return res.json({ message: 'Employee deleted successfully', deleted });
  });

  // ==========================================
  // DEPARTMENT APIS
  // ==========================================
  app.get('/api/departments', authenticateToken, (req, res) => {
    const depts = departments.map((d) => ({
      ...d,
      employeeCount: employees.filter((e) => e.departmentId === d.id).length,
    }));
    return res.json(depts);
  });

  app.post('/api/departments', authenticateToken, requireRoles(['ADMIN']), (req, res) => {
    const { departmentName, description, managerName, budget } = req.body;
    if (!departmentName) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const newDept: Department = {
      id: `dept-${Date.now()}`,
      departmentName,
      description: description || '',
      managerName: managerName || 'Unassigned',
      budget: Number(budget) || 250000,
    };

    departments.push(newDept);
    return res.status(201).json(newDept);
  });

  app.put('/api/departments/:id', authenticateToken, requireRoles(['ADMIN']), (req, res) => {
    const { id } = req.params;
    const idx = departments.findIndex((d) => d.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Department not found' });

    departments[idx] = { ...departments[idx], ...req.body };
    return res.json(departments[idx]);
  });

  // ==========================================
  // ATTENDANCE APIS
  // ==========================================
  app.get('/api/attendance', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { employeeId, date } = req.query;
    let result = [...attendanceRecords];

    // Employees can only view their own attendance unless HR/Admin
    if (req.user?.role === 'EMPLOYEE') {
      const myEmp = employees.find((e) => e.email === req.user?.email || e.id === req.user?.employeeId);
      if (myEmp) {
        result = result.filter((a) => a.employeeId === myEmp.id);
      }
    } else if (employeeId) {
      result = result.filter((a) => a.employeeId === employeeId);
    }

    if (date) {
      result = result.filter((a) => a.date === date);
    }

    // Attach employee names
    result = result.map((a) => ({
      ...a,
      employeeName: employees.find((e) => e.id === a.employeeId)?.fullName || 'Employee',
    }));

    return res.json(result);
  });

  app.post('/api/attendance/check-in', authenticateToken, (req: AuthenticatedRequest, res) => {
    const user = req.user!;
    const emp = employees.find((e) => e.email === user.email || e.id === user.employeeId);
    
    if (!emp) {
      return res.status(404).json({ error: 'Employee record not found for user' });
    }

    const today = new Date().toISOString().split('T')[0];
    const existing = attendanceRecords.find((a) => a.employeeId === emp.id && a.date === today);

    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (existing) {
      if (!existing.checkOutTime) {
        existing.checkOutTime = nowTime;
        existing.workHours = 8.5;
        return res.json({ message: 'Checked out successfully', attendance: existing });
      } else {
        return res.status(400).json({ error: 'Already completed attendance for today' });
      }
    }

    const currentHour = new Date().getHours();
    const status: any = currentHour >= 10 ? 'LATE' : 'PRESENT';

    const newAtt: Attendance = {
      id: `att-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      date: today,
      checkInTime: nowTime,
      status,
    };

    attendanceRecords.unshift(newAtt);
    return res.status(201).json({ message: 'Checked in successfully', attendance: newAtt });
  });

  // ==========================================
  // LEAVE APIS
  // ==========================================
  app.get('/api/leaves', authenticateToken, (req: AuthenticatedRequest, res) => {
    let result = [...leaveRequests];

    if (req.user?.role === 'EMPLOYEE') {
      const myEmp = employees.find((e) => e.email === req.user?.email || e.id === req.user?.employeeId);
      if (myEmp) {
        result = result.filter((l) => l.employeeId === myEmp.id);
      }
    }

    result = result.map((l) => ({
      ...l,
      employeeName: employees.find((e) => e.id === l.employeeId)?.fullName || 'Employee',
    }));

    return res.json(result);
  });

  app.post('/api/leaves', authenticateToken, (req: AuthenticatedRequest, res) => {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'Start date, end date, and reason are required' });
    }

    const user = req.user!;
    const emp = employees.find((e) => e.email === user.email || e.id === user.employeeId);

    if (!emp) {
      return res.status(404).json({ error: 'Employee record not found' });
    }

    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: emp.id,
      employeeName: emp.fullName,
      leaveType: leaveType || 'ANNUAL',
      startDate,
      endDate,
      reason,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    leaveRequests.unshift(newLeave);
    return res.status(201).json(newLeave);
  });

  app.put('/api/leaves/:id/status', authenticateToken, requireRoles(['ADMIN', 'HR']), (req, res) => {
    const { id } = req.params;
    const { status, hrComment } = req.body;

    const leave = leaveRequests.find((l) => l.id === id);
    if (!leave) return res.status(404).json({ error: 'Leave request not found' });

    leave.status = status;
    if (hrComment) leave.hrComment = hrComment;

    return res.json(leave);
  });

  // ==========================================
  // PERFORMANCE REVIEW APIS
  // ==========================================
  app.get('/api/performance', authenticateToken, (req: AuthenticatedRequest, res) => {
    let result = [...performanceReviews];

    if (req.user?.role === 'EMPLOYEE') {
      const myEmp = employees.find((e) => e.email === req.user?.email || e.id === req.user?.employeeId);
      if (myEmp) {
        result = result.filter((r) => r.employeeId === myEmp.id);
      }
    }

    result = result.map((r) => ({
      ...r,
      employeeName: employees.find((e) => e.id === r.employeeId)?.fullName || 'Employee',
      reviewerName: employees.find((e) => e.id === r.reviewerId)?.fullName || 'HR Manager',
    }));

    return res.json(result);
  });

  app.post('/api/performance', authenticateToken, requireRoles(['ADMIN', 'HR']), (req: AuthenticatedRequest, res) => {
    const { employeeId, technicalScore, communicationScore, teamworkScore, projectsCompleted, feedback } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: 'Employee ID is required' });
    }

    const tech = Number(technicalScore) || 8;
    const comm = Number(communicationScore) || 8;
    const team = Number(teamworkScore) || 8;
    const overall = Number(((tech + comm + team) / 6).toFixed(1));

    const reviewer = employees.find((e) => e.email === req.user?.email || e.id === req.user?.employeeId);

    const newReview: PerformanceReview = {
      id: `rev-${Date.now()}`,
      employeeId,
      reviewerId: reviewer?.id || 'emp-2',
      technicalScore: tech,
      communicationScore: comm,
      teamworkScore: team,
      overallRating: Math.min(overall, 5.0),
      projectsCompleted: Number(projectsCompleted) || 5,
      feedback: feedback || 'Solid performance across key objectives.',
      reviewDate: new Date().toISOString().split('T')[0],
    };

    performanceReviews.unshift(newReview);
    return res.status(201).json(newReview);
  });

  // ==========================================
  // AI INTEGRATION APIS (GEMINI 3.6 FLASH)
  // ==========================================
  app.post('/api/ai/resume-analyze', authenticateToken, async (req, res) => {
    const { resumeText, targetRole } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: 'Resume text is required for AI analysis' });
    }

    try {
      const result = await analyzeResume(resumeText, targetRole || 'Senior Software Engineer');
      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to analyze resume' });
    }
  });

  app.post('/api/ai/performance-feedback', authenticateToken, async (req, res) => {
    const { employeeId, technicalScore, communicationScore, teamworkScore, projectsCompleted, feedback } = req.body;

    const emp = employees.find((e) => e.id === employeeId) || { fullName: 'Team Member', designation: 'Engineer' };

    try {
      const result = await generatePerformanceFeedback({
        employeeName: emp.fullName,
        designation: emp.designation,
        technicalScore: Number(technicalScore) || 8,
        communicationScore: Number(communicationScore) || 7,
        teamworkScore: Number(teamworkScore) || 8,
        projectsCompleted: Number(projectsCompleted) || 5,
        existingFeedback: feedback,
      });

      return res.json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to generate AI performance feedback' });
    }
  });

  // ==========================================
  // API DOCUMENTATION (SWAGGER)
  // ==========================================
  app.get('/api/docs/openapi.json', (req, res) => {
    return res.json(swaggerSpec);
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
