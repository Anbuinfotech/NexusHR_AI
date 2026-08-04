import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Sparkles, ShieldCheck, Users, Lock, Mail, User as UserIcon, AlertCircle } from 'lucide-react';
import { Role } from '../../types';

export const LoginRegister: React.FC = () => {
  const { login, register, quickSwitchRole } = useAuth();
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('admin@enterprise.com');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSentMsg, setResetSentMsg] = useState<string | null>(null);

  // Register state
  const [username, setUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<Role>('EMPLOYEE');
  const [fullName, setFullName] = useState('');
  const [designation, setDesignation] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResetSentMsg(`Password reset instructions have been dispatched to ${forgotEmail || email}. Please check your inbox.`);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSentMsg(null);
    }, 2800);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        username,
        email: regEmail,
        password: regPassword,
        role: regRole,
        fullName,
        designation,
      });
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 backdrop-blur-md">
        {/* Left Hero Section */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 p-8 text-white flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-900/50">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-white">NexusHR <span className="text-amber-400 font-black">AI</span></h1>
                <p className="text-xs text-indigo-300 font-medium">Enterprise HR & Analytics Suite</p>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <div className="flex items-start space-x-3 bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                <Sparkles className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">Gemini AI Analytics</h4>
                  <p className="text-xs text-slate-400">Resume skill parsing & automated performance feedback reports.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                <ShieldCheck className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">JWT Security & RBAC</h4>
                  <p className="text-xs text-slate-400">Role-based access control for Admin, HR Managers, and Employees.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
                <Users className="h-5 w-5 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">Full HR Lifecycle</h4>
                  <p className="text-xs text-slate-400">Attendance, Leave Approvals, Department Budgeting, & Reviews.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Login Preset Buttons */}
          <div className="border-t border-slate-800 pt-4">
            <p className="text-xs font-bold text-indigo-300 mb-2">⚡ Quick Test Accounts (Click to log in):</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="btn-quick-admin"
                type="button"
                onClick={() => quickSwitchRole('ADMIN')}
                className="px-2 py-1.5 rounded-xl text-[11px] font-bold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition transform hover:-translate-y-0.5"
              >
                Admin
              </button>
              <button
                id="btn-quick-hr"
                type="button"
                onClick={() => quickSwitchRole('HR')}
                className="px-2 py-1.5 rounded-xl text-[11px] font-bold bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition transform hover:-translate-y-0.5"
              >
                HR Manager
              </button>
              <button
                id="btn-quick-employee"
                type="button"
                onClick={() => quickSwitchRole('EMPLOYEE')}
                className="px-2 py-1.5 rounded-xl text-[11px] font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition transform hover:-translate-y-0.5"
              >
                Employee
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Section */}
        <div className="p-8 flex flex-col justify-center bg-slate-900">
          <div className="flex border-b border-slate-800 mb-6">
            <button
              id="tab-login"
              onClick={() => {
                setMode('LOGIN');
                setError(null);
              }}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${
                mode === 'LOGIN' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-register"
              onClick={() => {
                setMode('REGISTER');
                setError(null);
              }}
              className={`flex-1 py-3 text-sm font-bold border-b-2 transition ${
                mode === 'REGISTER' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-950/80 border border-red-500/30 text-red-300 text-xs p-3.5 rounded-xl flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'LOGIN' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    id="input-login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                    placeholder="name@enterprise.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    id="input-login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 cursor-pointer text-slate-400 select-none">
                  <input
                    id="checkbox-remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  id="btn-forgot-password"
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setShowForgotModal(true);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition"
                >
                  Forgot password?
                </button>
              </div>

              <button
                id="btn-login-submit"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-indigo-900/40 transform hover:-translate-y-0.5"
              >
                {loading ? 'Authenticating...' : 'Sign In with JWT'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Username</label>
                <div className="relative">
                  <UserIcon className="h-4 w-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    id="input-reg-username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                    placeholder="johndoe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Name</label>
                <input
                  id="input-reg-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Email</label>
                <input
                  id="input-reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                  placeholder="john@enterprise.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <input
                  id="input-reg-password"
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Role</label>
                  <select
                    id="select-reg-role"
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as Role)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="HR">HR Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Designation</label>
                  <input
                    id="input-reg-designation"
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                    placeholder="Java Developer"
                  />
                </div>
              </div>

              <button
                id="btn-register-submit"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-900/40 transform hover:-translate-y-0.5"
              >
                {loading ? 'Creating User...' : 'Register User'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative">
            <h3 className="text-lg font-extrabold text-white mb-2">Reset Work Password</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your registered work email address below to receive a secure password reset link.
            </p>

            {resetSentMsg ? (
              <div className="bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs p-4 rounded-2xl mb-4 leading-relaxed font-semibold">
                {resetSentMsg}
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Work Email</label>
                  <input
                    id="input-forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-600"
                    placeholder="name@enterprise.com"
                  />
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <button
                    id="btn-cancel-forgot-modal"
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-forgot-modal"
                    type="submit"
                    className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-900/40"
                  >
                    Send Reset Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
