/**
 * AI HR Management System - Core Type Definitions
 */

export type Role = 'ADMIN' | 'HR' | 'EMPLOYEE';

export interface User {
  id: string;
  username: string;
  email: string;
  role: Role;
  employeeId?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  designation: string;
  departmentId: string;
  departmentName?: string;
  joiningDate: string;
  skills: string[];
  profileImage: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'TERMINATED';
  salary: number;
}

export interface Department {
  id: string;
  departmentName: string;
  description: string;
  managerName: string;
  budget: number;
  employeeCount?: number;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY';

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: AttendanceStatus;
  workHours?: number;
  notes?: string;
}

export type LeaveType = 'CASUAL' | 'SICK' | 'MATERNITY' | 'ANNUAL' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  hrComment?: string;
  createdAt: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName?: string;
  reviewerId: string;
  reviewerName?: string;
  technicalScore: number;
  communicationScore: number;
  teamworkScore: number;
  overallRating: number;
  projectsCompleted: number;
  feedback: string;
  aiStrengths?: string[];
  aiWeaknesses?: string[];
  aiImprovementPlan?: string;
  aiCareerSuggestions?: string;
  reviewDate: string;
}

export interface ResumeAnalysisResult {
  candidateName?: string;
  evaluatedRole: string;
  experienceLevel: string;
  skills: string[];
  missingSkills: string[];
  matchScore: number;
  summary: string;
  suggestions: string[];
}

export interface AiPerformanceAnalysisResult {
  strengths: string[];
  weaknesses: string[];
  improvementPlan: string[];
  careerSuggestions: string[];
  executiveSummary: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  employee?: Employee;
}

export interface DashboardStats {
  totalEmployees: number;
  totalDepartments: number;
  presentToday: number;
  onLeaveToday: number;
  pendingLeavesCount: number;
  avgPerformanceRating: number;
  attendanceRate: number;
  departmentBreakdown: Array<{ name: string; value: number }>;
  attendanceTrend: Array<{ day: string; present: number; late: number; absent: number }>;
}
