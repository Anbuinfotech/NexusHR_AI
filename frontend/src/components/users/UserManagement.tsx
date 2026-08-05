import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { User, Role } from '../../types';
import { ShieldCheck, Users, Mail, UserCheck, AlertCircle, CheckCircle } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setAlertMsg(null);
    try {
      await api.updateUserRole(userId, newRole);
      setAlertMsg({ type: 'success', text: 'User security role updated successfully' });
      fetchUsers();
    } catch (err: any) {
      setAlertMsg({ type: 'error', text: err.message || 'Failed to update role' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center space-x-2.5 tracking-tight">
            <ShieldCheck className="h-6 w-6 text-purple-400" />
            <span>RBAC User & Role Administration</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage authentication accounts, Spring Security role permissions (ADMIN, HR, EMPLOYEE), and user credentials.
          </p>
        </div>
      </div>

      {alertMsg && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between border shadow-lg ${
            alertMsg.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30' : 'bg-red-950/80 text-red-300 border-red-500/30'
          }`}
        >
          <div className="flex items-center space-x-2">
            {alertMsg.type === 'success' ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
            <span className="font-semibold">{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="font-bold text-base">×</button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-md">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Registered Authentication Accounts</h3>
          <span className="text-xs text-slate-400">{users.length} registered users</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">User</th>
                  <th className="p-4">Email Address</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">RBAC Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-white">{u.username}</td>
                    <td className="p-4 text-slate-300">{u.email}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-0.5 rounded-full text-[10px] font-bold border ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                            : u.role === 'HR'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      {isAdmin ? (
                        <select
                          id={`select-role-user-${u.id}`}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                          className="px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white font-semibold"
                        >
                          <option value="EMPLOYEE">EMPLOYEE</option>
                          <option value="HR">HR MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      ) : (
                        <span className="text-[10px] text-slate-500 font-semibold">ReadOnly</span>
                      )}
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
