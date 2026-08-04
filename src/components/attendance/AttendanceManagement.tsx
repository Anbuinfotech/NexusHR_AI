import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Attendance } from '../../types';
import { CalendarCheck, Clock, CheckCircle, AlertCircle, Calendar, UserCheck, Search } from 'lucide-react';

export const AttendanceManagement: React.FC = () => {
  const { user, employee } = useAuth();
  const isEmployee = user?.role === 'EMPLOYEE';

  const [attendanceLogs, setAttendanceLogs] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [myTodayAtt, setMyTodayAtt] = useState<Attendance | null>(null);

  const [checkingIn, setCheckingIn] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const data = await api.getAttendance();
      setAttendanceLogs(data);

      const todayStr = new Date().toISOString().split('T')[0];
      if (employee) {
        const todayRec = data.find((a) => a.date === todayStr && a.employeeId === employee.id);
        setMyTodayAtt(todayRec || null);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [user, employee]);

  const handleCheckInToggle = async () => {
    setCheckingIn(true);
    setMsg(null);
    try {
      const res = await api.checkIn();
      setMyTodayAtt(res.attendance);
      setMsg({ type: 'success', text: res.message });
      fetchAttendance();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Check-in failed' });
    } finally {
      setCheckingIn(false);
    }
  };

  // Calculations
  const totalDays = attendanceLogs.length || 1;
  const presentDays = attendanceLogs.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendancePercentage = Math.round((presentDays / totalDays) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2.5 tracking-tight">
            <CalendarCheck className="h-6 w-6 text-indigo-400" />
            <span>Attendance & Check-In</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time arrival tracking, monthly attendance percentage calculations, and check-in/out logging.
          </p>
        </div>

        {/* Self Check-in Widget */}
        <button
          id="btn-attendance-check-in"
          onClick={handleCheckInToggle}
          disabled={checkingIn}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-900/40 flex items-center space-x-2 transition self-start sm:self-auto transform hover:-translate-y-0.5"
        >
          <Clock className="h-4 w-4" />
          <span>
            {myTodayAtt?.checkInTime
              ? myTodayAtt.checkOutTime
                ? 'Attendance Complete for Today'
                : 'Clock Out Now'
              : 'Clock In Now'}
          </span>
        </button>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border shadow-lg ${
            msg.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' : 'bg-red-950/80 text-red-300 border-red-500/30'
          }`}
        >
          <div className="flex items-center space-x-2">
            {msg.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
            <span className="font-semibold">{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)} className="font-bold text-base">×</button>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Today's Status</p>
            <h3 className="text-lg font-bold text-white mt-1">
              {myTodayAtt ? (
                <span className="text-emerald-400">{myTodayAtt.status} ({myTodayAtt.checkInTime})</span>
              ) : (
                <span className="text-amber-400">Not Checked In</span>
              )}
            </h3>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Monthly Attendance Rate</p>
            <h3 className="text-2xl font-black text-white mt-1 tracking-tight">{attendancePercentage}%</h3>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-xs">
            {attendancePercentage}%
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Records</p>
            <h3 className="text-2xl font-black text-white mt-1 tracking-tight">{attendanceLogs.length}</h3>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800/90 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Attendance Log & History</h3>
          <span className="text-xs text-slate-400 font-medium">{attendanceLogs.length} entries</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Check-In Time</th>
                  <th className="p-4">Check-Out Time</th>
                  <th className="p-4">Work Hours</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {attendanceLogs.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-white">{att.employeeName || 'Employee'}</td>
                    <td className="p-4 text-slate-300">{att.date}</td>
                    <td className="p-4 font-semibold text-emerald-400">{att.checkInTime}</td>
                    <td className="p-4 font-semibold text-indigo-400">{att.checkOutTime || 'Active'}</td>
                    <td className="p-4 text-slate-300 font-medium">{att.workHours ? `${att.workHours} hrs` : '-'}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          att.status === 'PRESENT'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : att.status === 'LATE'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {att.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
