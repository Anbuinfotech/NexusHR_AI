import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginRegister } from './components/auth/LoginRegister';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { EmployeeList } from './components/employees/EmployeeList';
import { DepartmentList } from './components/departments/DepartmentList';
import { AttendanceManagement } from './components/attendance/AttendanceManagement';
import { LeaveManagement } from './components/leaves/LeaveManagement';
import { PerformanceManagement } from './components/performance/PerformanceManagement';
import { ResumeAnalyzer } from './components/ai/ResumeAnalyzer';
import { AiFeedbackGenerator } from './components/ai/AiFeedbackGenerator';
import { SwaggerDocs } from './components/docs/SwaggerDocs';
import { UserManagement } from './components/users/UserManagement';
import { UserProfile } from './components/profile/UserProfile';

const MainContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
          <p className="text-xs font-semibold text-slate-300">Initializing Enterprise HR Platform...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginRegister />;
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black flex flex-col font-sans text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenDocs={() => setActiveTab('api-docs')}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && <DashboardOverview setActiveTab={setActiveTab} />}
          {activeTab === 'employees' && <EmployeeList />}
          {activeTab === 'departments' && <DepartmentList />}
          {activeTab === 'attendance' && <AttendanceManagement />}
          {activeTab === 'leaves' && <LeaveManagement />}
          {activeTab === 'performance' && <PerformanceManagement />}
          {activeTab === 'resume-analyzer' && <ResumeAnalyzer />}
          {activeTab === 'ai-feedback' && <AiFeedbackGenerator />}
          {activeTab === 'api-docs' && <SwaggerDocs />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'profile' && <UserProfile />}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
