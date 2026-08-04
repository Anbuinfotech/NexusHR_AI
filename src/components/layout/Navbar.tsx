import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  LogOut,
  User as UserIcon,
  ChevronDown,
  BookOpen,
  Sparkles,
  Menu,
} from 'lucide-react';
import { Role } from '../../types';

interface NavbarProps {
  onOpenDocs: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenDocs, activeTab, setActiveTab, onToggleSidebar }) => {
  const { user, employee, logout, quickSwitchRole } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  const handleRoleSwitch = async (targetRole: Role) => {
    setSwitching(true);
    try {
      await quickSwitchRole(targetRole);
      setActiveTab('dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setSwitching(false);
    }
  };

  const roleColor =
    user?.role === 'ADMIN'
      ? 'bg-purple-900/60 text-purple-300 border-purple-500/40'
      : user?.role === 'HR'
      ? 'bg-blue-900/60 text-blue-300 border-blue-500/40'
      : 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40';

  return (
    <header id="main-navbar" className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Logo + Mobile Sidebar Toggle */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              id="btn-toggle-mobile-sidebar"
              onClick={onToggleSidebar}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition"
              title="Toggle Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-white text-lg tracking-tight">NexusHR <span className="text-amber-400 font-black">AI</span></span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hidden sm:inline-block">
                ENTERPRISE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden md:block">AI-Powered Employee & HR Analytics Platform</p>
          </div>
        </div>

        {/* Center: Quick Demo Role Switcher */}
        <div className="hidden md:flex items-center bg-slate-950/80 p-1 rounded-2xl border border-slate-800 text-xs font-medium shadow-inner">
          <span className="text-slate-400 px-2.5 flex items-center space-x-1.5 text-[11px]">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Role Switcher:</span>
          </span>
          <button
            id="switch-role-admin"
            disabled={switching}
            onClick={() => handleRoleSwitch('ADMIN')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              user?.role === 'ADMIN'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50 ring-1 ring-purple-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Admin
          </button>
          <button
            id="switch-role-hr"
            disabled={switching}
            onClick={() => handleRoleSwitch('HR')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              user?.role === 'HR'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50 ring-1 ring-blue-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            HR Manager
          </button>
          <button
            id="switch-role-employee"
            disabled={switching}
            onClick={() => handleRoleSwitch('EMPLOYEE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              user?.role === 'EMPLOYEE'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/50 ring-1 ring-emerald-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            Employee
          </button>
        </div>

        {/* Right Section: Docs + Profile */}
        <div className="flex items-center space-x-3">
          <button
            id="btn-open-swagger-docs"
            onClick={onOpenDocs}
            className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl text-indigo-300 bg-indigo-950/60 border border-indigo-800/60 hover:bg-indigo-900/80 hover:text-white transition shadow-sm"
            title="Interactive Swagger OpenAPI Specs"
          >
            <BookOpen className="h-4 w-4 text-indigo-400" />
            <span className="hidden sm:inline">Swagger Specs</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              id="user-profile-menu-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2.5 p-1.5 px-2 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 transition"
            >
              <img
                src={employee?.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user?.username}
                className="h-8 w-8 rounded-xl object-cover ring-1 ring-white/20"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white leading-none">{employee?.fullName || user?.username}</div>
                <div className="text-[10px] text-slate-400 capitalize">{user?.role}</div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {dropdownOpen && (
              <div
                id="user-profile-dropdown"
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-sm backdrop-blur-xl"
              >
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                  <p className="text-xs font-bold text-white truncate">{user?.email}</p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleColor}`}>
                    Role: {user?.role}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center space-x-2 text-xs font-semibold"
                  >
                    <UserIcon className="h-4 w-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>
                </div>

                <div className="border-t border-slate-800 pt-1">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center space-x-2 text-xs font-semibold"
                  >
                    <LogOut className="h-4 w-4 text-red-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
