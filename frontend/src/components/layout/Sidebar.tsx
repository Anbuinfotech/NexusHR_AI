import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building,
  CalendarCheck,
  CalendarDays,
  Award,
  FileText,
  Sparkles,
  UserCog,
  BookOpen,
  User as UserIcon,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user } = useAuth();
  const role = user?.role || 'EMPLOYEE';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'HR', 'EMPLOYEE'],
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: UserIcon,
      roles: ['ADMIN', 'HR', 'EMPLOYEE'],
    },
    {
      id: 'employees',
      label: 'Employee Directory',
      icon: Users,
      roles: ['ADMIN', 'HR'],
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building,
      roles: ['ADMIN', 'HR'],
    },
    {
      id: 'attendance',
      label: 'Attendance & Check-In',
      icon: CalendarCheck,
      roles: ['ADMIN', 'HR', 'EMPLOYEE'],
    },
    {
      id: 'leaves',
      label: role === 'EMPLOYEE' ? 'My Leave Requests' : 'Leave Approvals',
      icon: CalendarDays,
      roles: ['ADMIN', 'HR', 'EMPLOYEE'],
    },
    {
      id: 'performance',
      label: role === 'EMPLOYEE' ? 'Performance & Growth' : 'Performance Reviews',
      icon: Award,
      roles: ['ADMIN', 'HR', 'EMPLOYEE'],
    },
    {
      id: 'resume-analyzer',
      label: 'AI Resume Analyzer',
      icon: FileText,
      roles: ['ADMIN', 'HR', 'EMPLOYEE'],
      isAi: true,
    },
    {
      id: 'ai-feedback',
      label: 'AI Performance Feedback',
      icon: Sparkles,
      roles: ['ADMIN', 'HR', 'EMPLOYEE'],
      isAi: true,
    },
    {
      id: 'users',
      label: 'User Access Control',
      icon: UserCog,
      roles: ['ADMIN'],
    },
    {
      id: 'api-docs',
      label: 'Swagger OpenAPI Specs',
      icon: BookOpen,
      roles: ['ADMIN', 'HR', 'EMPLOYEE'],
    },
  ];

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      <aside
        id="main-sidebar"
        className={`w-64 bg-slate-900/95 backdrop-blur-md text-slate-300 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between border-r border-slate-800/80 shrink-0 fixed lg:static top-16 left-0 bottom-0 z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          <div>
            <div className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-3">
              Main Navigation ({role})
            </div>
            <nav className="space-y-1.5">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-white' : item.isAi ? 'text-amber-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.isAi && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                        AI
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

      {/* Role Card Banner */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5 text-xs space-y-2 shadow-inner">
        <div className="flex items-center justify-between text-slate-200 font-bold">
          <span className="text-[11px] uppercase tracking-wider text-slate-400">Active Session</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              role === 'ADMIN'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : role === 'HR'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {role}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          {role === 'ADMIN'
            ? 'Full privileges: User Management, Departments, All Analytics'
            : role === 'HR'
            ? 'HR privileges: Manage Employees, Approve Leaves, Performance Reviews'
            : 'Employee privileges: Self-service Attendance, Leaves, Profile & AI Tools'}
        </p>
      </div>
    </aside>
  </>
);
};
