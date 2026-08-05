import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LeaveRequest, LeaveType } from '../../types';
import { CalendarDays, Plus, CheckCircle2, XCircle, Clock, X, AlertCircle } from 'lucide-react';

export const LeaveManagement: React.FC = () => {
  const { user, employee } = useAuth();
  const isEmployee = user?.role === 'EMPLOYEE';
  const canManage = user?.role === 'ADMIN' || user?.role === 'HR';

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Apply Leave Modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('ANNUAL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Approve / Reject Modal (HR)
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [hrComment, setHrComment] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const data = await api.getLeaves();
      setLeaves(data);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [user, employee]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setAlertMsg(null);
    try {
      await api.applyLeave({ leaveType, startDate, endDate, reason });
      setAlertMsg({ type: 'success', text: 'Leave request submitted successfully' });
      setShowApplyModal(false);
      fetchLeaves();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to submit leave request' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: 'APPROVED' | 'REJECTED') => {
    if (!selectedLeave) return;
    setSubmitting(true);
    setAlertMsg(null);
    try {
      await api.updateLeaveStatus(selectedLeave.id, status, hrComment);
      setAlertMsg({ type: 'success', text: `Leave request ${status.toLowerCase()} successfully` });
      setSelectedLeave(null);
      setHrComment('');
      fetchLeaves();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Action failed' });
    } finally {
      setSubmitting(false);
    }
  };

  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2.5 tracking-tight">
            <CalendarDays className="h-6 w-6 text-indigo-400" />
            <span>Leave Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Apply for leave, track quota balances, and review HR approval workflows.
          </p>
        </div>

        <button
          id="btn-apply-leave-modal"
          onClick={() => {
            setStartDate(new Date().toISOString().split('T')[0]);
            setEndDate(new Date().toISOString().split('T')[0]);
            setReason('Vacation time and rest.');
            setShowApplyModal(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-900/40 flex items-center space-x-2 transition self-start sm:self-auto transform hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          <span>Apply for Leave</span>
        </button>
      </div>

      {alertMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border shadow-lg ${
            alertMsg.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' : 'bg-red-950/80 text-red-300 border-red-500/30'
          }`}
        >
          <div className="flex items-center space-x-2">
            {alertMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
            <span className="font-semibold">{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="font-bold text-base">×</button>
        </div>
      )}

      {/* HR Pending Review Banner */}
      {canManage && pendingLeaves.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-300">Attention HR Manager</h4>
              <p className="text-[11px] text-amber-200">There are {pendingLeaves.length} pending leave request(s) awaiting approval.</p>
            </div>
          </div>
        </div>
      )}

      {/* Leave Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800/90 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Leave Applications Log</h3>
          <span className="text-xs text-slate-400 font-medium">{leaves.length} requests</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : leaves.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No leave requests found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="p-4">Employee</th>
                  <th className="p-4">Leave Type</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  {canManage && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-white">{l.employeeName || 'Employee'}</td>
                    <td className="p-4 font-semibold text-indigo-400">{l.leaveType}</td>
                    <td className="p-4 text-slate-300">{l.startDate} to {l.endDate}</td>
                    <td className="p-4 text-slate-300 max-w-xs truncate">{l.reason}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          l.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : l.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="p-4 text-right">
                        {l.status === 'PENDING' ? (
                          <button
                            id={`btn-review-leave-${l.id}`}
                            onClick={() => setSelectedLeave(l)}
                            className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold rounded-xl border border-indigo-500/30 transition"
                          >
                            Review Request
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-medium">Completed</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Apply for Leave</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Leave Type</label>
                <select
                  id="select-leave-type"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ANNUAL">ANNUAL LEAVE</option>
                  <option value="CASUAL">CASUAL LEAVE</option>
                  <option value="SICK">SICK LEAVE</option>
                  <option value="MATERNITY">MATERNITY / PATERNITY</option>
                  <option value="UNPAID">UNPAID LEAVE</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Start Date</label>
                  <input
                    id="input-leave-start"
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">End Date</label>
                  <input
                    id="input-leave-end"
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Reason for Leave</label>
                <textarea
                  id="input-leave-reason"
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Provide reason for leave application..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  id="btn-submit-leave-request"
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-500 shadow-md transition"
                >
                  {submitting ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Request Modal (HR) */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Review Leave Request</h3>
              <button onClick={() => setSelectedLeave(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div>
                <span className="text-slate-400">Applicant:</span>{' '}
                <span className="font-bold text-white">{selectedLeave.employeeName}</span>
              </div>
              <div>
                <span className="text-slate-400">Type & Dates:</span>{' '}
                <span className="font-bold text-indigo-400">
                  {selectedLeave.leaveType} ({selectedLeave.startDate} to {selectedLeave.endDate})
                </span>
              </div>
              <div>
                <span className="text-slate-400">Reason:</span> <p className="mt-1 font-medium text-slate-200">{selectedLeave.reason}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">HR Notes / Decision Comment</label>
              <textarea
                id="input-hr-leave-comment"
                rows={2}
                value={hrComment}
                onChange={(e) => setHrComment(e.target.value)}
                placeholder="Optional comments for employee..."
                className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                id="btn-reject-leave"
                onClick={() => handleUpdateStatus('REJECTED')}
                disabled={submitting}
                className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-xs rounded-xl border border-red-500/30 transition"
              >
                Reject Request
              </button>
              <button
                id="btn-approve-leave"
                onClick={() => handleUpdateStatus('APPROVED')}
                disabled={submitting}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
