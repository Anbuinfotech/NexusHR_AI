import {
  AuthResponse,
  User,
  Employee,
  Department,
  Attendance,
  LeaveRequest,
  PerformanceReview,
  ResumeAnalysisResult,
  AiPerformanceAnalysisResult,
  DashboardStats,
} from '../types.js';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('jwt_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('jwt_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('jwt_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API Request failed');
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: any) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request<{ user: User; employee?: Employee }>('/auth/me'),

  // Stats
  getDashboardStats: () => request<DashboardStats>('/dashboard/stats'),

  // Users (Admin)
  getUsers: () => request<User[]>('/users'),
  updateUserRole: (userId: string, role: string) =>
    request<User>(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  // Employees
  getEmployees: (params?: { departmentId?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.departmentId) query.append('departmentId', params.departmentId);
    if (params?.search) query.append('search', params.search);
    const qStr = query.toString();
    return request<Employee[]>(`/employees${qStr ? `?${qStr}` : ''}`);
  },

  getEmployeeById: (id: string) => request<Employee>(`/employees/${id}`),

  createEmployee: (data: Partial<Employee>) =>
    request<Employee>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateEmployee: (id: string, data: Partial<Employee>) =>
    request<Employee>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteEmployee: (id: string) =>
    request<{ message: string; deleted: Employee }>(`/employees/${id}`, {
      method: 'DELETE',
    }),

  // Departments
  getDepartments: () => request<Department[]>('/departments'),

  createDepartment: (data: Partial<Department>) =>
    request<Department>('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateDepartment: (id: string, data: Partial<Department>) =>
    request<Department>(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Attendance
  getAttendance: (params?: { employeeId?: string; date?: string }) => {
    const query = new URLSearchParams();
    if (params?.employeeId) query.append('employeeId', params.employeeId);
    if (params?.date) query.append('date', params.date);
    const qStr = query.toString();
    return request<Attendance[]>(`/attendance${qStr ? `?${qStr}` : ''}`);
  },

  checkIn: () =>
    request<{ message: string; attendance: Attendance }>('/attendance/check-in', {
      method: 'POST',
    }),

  // Leaves
  getLeaves: () => request<LeaveRequest[]>('/leaves'),

  applyLeave: (data: { leaveType: string; startDate: string; endDate: string; reason: string }) =>
    request<LeaveRequest>('/leaves', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLeaveStatus: (id: string, status: 'APPROVED' | 'REJECTED', hrComment?: string) =>
    request<LeaveRequest>(`/leaves/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, hrComment }),
    }),

  // Performance Reviews
  getPerformanceReviews: () => request<PerformanceReview[]>('/performance'),

  createPerformanceReview: (data: {
    employeeId: string;
    technicalScore: number;
    communicationScore: number;
    teamworkScore: number;
    projectsCompleted: number;
    feedback: string;
  }) =>
    request<PerformanceReview>('/performance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // AI Features
  analyzeResume: (resumeText: string, targetRole: string, employeeId?: string) =>
    request<ResumeAnalysisResult>('/ai/resume-analyze', {
      method: 'POST',
      body: JSON.stringify({ resumeText, targetRole, employeeId }),
    }),

  generatePerformanceFeedback: (data: {
    employeeId: string;
    technicalScore: number;
    communicationScore: number;
    teamworkScore: number;
    projectsCompleted: number;
    feedback?: string;
  }) =>
    request<AiPerformanceAnalysisResult>('/ai/performance-feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
