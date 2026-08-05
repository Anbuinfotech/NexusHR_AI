import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DashboardStats, Attendance, LeaveRequest } from '../../types';
import {
  Users,
  Building,
  UserCheck,
  CalendarDays,
  Award,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  Plus,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
} from 'recharts';

interface DashboardOverviewProps {
  setActiveTab: (tab: string) => void;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#3b82f6', '#10b981'];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ setActiveTab }) => {
  const { user, employee } = useAuth();
  const role = user?.role || 'EMPLOYEE';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [myAttendance, setMyAttendance] = useState<Attendance | null>(null);
  const [myLeaves, setMyLeaves] = useState<LeaveRequest[]>([]);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkMsg, setCheckMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);

      if (employee) {
        const atts = await api.getAttendance({ employeeId: employee.id });
        const today = new Date().toISOString().split('T')[0];
        const todayAtt = atts.find((a) => a.date === today);
        setMyAttendance(todayAtt || null);

        const lvs = await api.getLeaves();
        setMyLeaves(lvs.filter((l) => l.employeeId === employee.id));
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, employee]);

  const handleCheckInToggle = async () => {
    setCheckingIn(true);
    setCheckMsg(null);
    try {
      const res = await api.checkIn();
      setMyAttendance(res.attendance);
      setCheckMsg(res.message);
      fetchDashboardData();
    } catch (err: any) {
      setCheckMsg(err.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bento Welcome Hero Panel */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800/80 backdrop-blur-md">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-indigo-300 text-xs font-bold mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">Enterprise HR Suite</span>
              <span>•</span>
              <span className="capitalize">{role} Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {employee?.fullName || user?.username}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
              {role === 'ADMIN'
                ? 'System Overview: Manage users, department budgets, and enterprise analytics.'
                : role === 'HR'
                ? 'HR Control Center: Manage employee directory, leave approvals, and performance reviews.'
                : 'Employee Hub: Track attendance, manage leaves, explore AI Resume analysis & growth feedback.'}
            </p>
          </div>

          {/* Quick Action Bento Chips */}
          <div className="flex flex-wrap items-center gap-2.5">
            {role === 'EMPLOYEE' && (
              <button
                id="btn-quick-check-in"
                onClick={handleCheckInToggle}
                disabled={checkingIn}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs rounded-2xl shadow-lg shadow-emerald-900/30 text-white flex items-center space-x-2 transition transform hover:-translate-y-0.5"
              >
                <Clock className="h-4 w-4" />
                <span>{myAttendance?.checkInTime ? (myAttendance.checkOutTime ? 'Completed Today' : 'Clock Out') : 'Clock In Now'}</span>
              </button>
            )}

            {(role === 'HR' || role === 'ADMIN') && (
              <button
                id="btn-add-employee-dash"
                onClick={() => setActiveTab('employees')}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 font-bold text-xs rounded-2xl shadow-lg shadow-indigo-900/30 text-white flex items-center space-x-2 transition transform hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                <span>Add Employee</span>
              </button>
            )}

            <button
              id="btn-ai-resume-dash"
              onClick={() => setActiveTab('resume-analyzer')}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 font-bold text-xs rounded-2xl shadow-lg shadow-amber-900/30 text-slate-950 flex items-center space-x-2 transition transform hover:-translate-y-0.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Resume Analyzer</span>
            </button>
          </div>
        </div>
      </div>

      {checkMsg && (
        <div className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs p-4 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span className="font-semibold">{checkMsg}</span>
          </div>
          <button onClick={() => setCheckMsg(null)} className="text-emerald-400 font-bold text-base hover:text-white">×</button>
        </div>
      )}

      {/* Bento Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl shadow-xl hover:border-indigo-500/40 transition duration-300 flex items-center justify-between group">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Workforce</p>
            <h3 className="text-3xl font-black text-white mt-2 tracking-tight">{stats?.totalEmployees || 0}</h3>
            <p className="text-[11px] text-emerald-400 mt-2 flex items-center font-bold">
              <TrendingUp className="h-3 w-3 mr-1" /> Active headcount
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl shadow-xl hover:border-emerald-500/40 transition duration-300 flex items-center justify-between group">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Present Today</p>
            <h3 className="text-3xl font-black text-white mt-2 tracking-tight">{stats?.presentToday || 0}</h3>
            <p className="text-[11px] text-indigo-400 mt-2 font-bold">
              {stats?.attendanceRate}% Attendance Rate
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
            <UserCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl shadow-xl hover:border-amber-500/40 transition duration-300 flex items-center justify-between group">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Pending Leaves</p>
            <h3 className="text-3xl font-black text-white mt-2 tracking-tight">{stats?.pendingLeavesCount || 0}</h3>
            <p className="text-[11px] text-amber-400 mt-2 font-bold">Awaiting HR Review</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
            <CalendarDays className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl shadow-xl hover:border-purple-500/40 transition duration-300 flex items-center justify-between group">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Avg Performance</p>
            <h3 className="text-3xl font-black text-white mt-2 tracking-tight">{stats?.avgPerformanceRating || '4.5'} <span className="text-sm font-normal text-slate-400">/ 5</span></h3>
            <p className="text-[11px] text-purple-400 mt-2 font-bold">Enterprise Rating</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition duration-300">
            <Award className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Bento Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Velocity Trend Bento Box */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800/90 p-6 rounded-3xl shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Weekly Attendance Trend</h3>
              <p className="text-xs text-slate-400 mt-0.5">Daily breakdown: Present, Late, and Absent status</p>
            </div>
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 transition"
            >
              <span>View Logs</span>
              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.attendanceTrend || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px', color: '#cbd5e1' }} />
                <Bar dataKey="present" fill="#6366f1" radius={[6, 6, 0, 0]} name="Present" />
                <Bar dataKey="late" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Late" />
                <Bar dataKey="absent" fill="#ef4444" radius={[6, 6, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Distribution Pie Chart Bento Box */}
        <div className="bg-slate-900/90 border border-slate-800/90 p-6 rounded-3xl shadow-xl flex flex-col justify-between backdrop-blur-md">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight mb-0.5">Department Breakdown</h3>
            <p className="text-xs text-slate-400 mb-4">Employee allocation across teams</p>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.departmentBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(stats?.departmentBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-800">
            {(stats?.departmentBreakdown || []).map((dept, i) => (
              <div key={dept.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                  <span className="text-slate-300 font-medium">{dept.name}</span>
                </div>
                <span className="font-extrabold text-white">{dept.value} emp</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Action Bento Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 border border-slate-800/90 p-6 rounded-3xl shadow-xl hover:border-amber-500/30 transition">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <span>AI HR Suite</span>
            </h3>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
              Gemini 3.6 Flash
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-5 leading-relaxed">
            Leverage server-side generative AI to evaluate resumes, extract missing skills, and auto-generate 30-60-90 day performance appraisals.
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('resume-analyzer')}
              className="px-4 py-2 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 font-bold text-xs rounded-2xl border border-indigo-500/30 transition"
            >
              Resume Analyzer
            </button>
            <button
              onClick={() => setActiveTab('ai-feedback')}
              className="px-4 py-2 bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 font-bold text-xs rounded-2xl border border-purple-500/30 transition"
            >
              Performance Feedback AI
            </button>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 p-6 rounded-3xl shadow-xl hover:border-blue-500/30 transition">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-400" />
              <span>HR Operations</span>
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
              Live Status
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-5 leading-relaxed">
            Manage leaves, post performance reviews, update employee profiles, and review department budgets.
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('leaves')}
              className="px-4 py-2 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 font-bold text-xs rounded-2xl border border-blue-500/30 transition"
            >
              Leave Management
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className="px-4 py-2 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 font-bold text-xs rounded-2xl border border-emerald-500/30 transition"
            >
              Performance Appraisal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
