import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UserCheck, Mail, Phone, MapPin, Briefcase, Calendar, ShieldCheck, CheckCircle, AlertCircle } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, employee, setEmployee } = useAuth();

  const [fullName, setFullName] = useState(employee?.fullName || '');
  const [phone, setPhone] = useState(employee?.phone || '');
  const [address, setAddress] = useState(employee?.address || '');
  const [skillsStr, setSkillsStr] = useState(employee?.skills.join(', ') || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    setSaving(true);
    setMsg(null);
    try {
      const skillsArr = skillsStr.split(',').map((s) => s.trim()).filter(Boolean);
      const updated = await api.updateEmployee(employee.id, {
        fullName,
        phone,
        address,
        skills: skillsArr,
      });
      setEmployee(updated);
      setMsg({ type: 'success', text: 'Profile details saved successfully' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Profile Card */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 backdrop-blur-md">
        <img
          src={employee?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
          alt={user?.username}
          className="h-24 w-24 rounded-2xl object-cover border-4 border-indigo-500/20 shadow-xl"
        />
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">{employee?.fullName || user?.username}</h1>
            <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {user?.role}
            </span>
          </div>
          <p className="text-xs font-bold text-indigo-400 mt-0.5">{employee?.designation || 'Enterprise User'}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-slate-400">
            <span className="flex items-center space-x-1">
              <Mail className="h-3.5 w-3.5 text-slate-500" />
              <span>{user?.email}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Briefcase className="h-3.5 w-3.5 text-slate-500" />
              <span>{employee?.departmentName || 'General'}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>Joined {employee?.joiningDate || '2024-01-01'}</span>
            </span>
          </div>
        </div>
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

      {/* Profile Edit Form */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 backdrop-blur-md">
        <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">Edit Personal & Professional Profile</h3>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Full Name</label>
            <input
              id="input-profile-fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Phone Number</label>
              <input
                id="input-profile-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Office Location / Address</label>
              <input
                id="input-profile-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Technical Skills (Comma separated)</label>
            <input
              id="input-profile-skills"
              type="text"
              value={skillsStr}
              onChange={(e) => setSkillsStr(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              id="btn-save-profile"
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-900/40 transition transform hover:-translate-y-0.5"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
