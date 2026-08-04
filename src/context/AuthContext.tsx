import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Employee, Role } from '../types.js';
import { api, setAuthToken, getAuthToken, clearAuthToken } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  quickSwitchRole: (role: Role) => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshAuth = async () => {
    const existingToken = getAuthToken();
    if (!existingToken) {
      setUser(null);
      setEmployee(null);
      setLoading(false);
      return;
    }

    try {
      const { user: fetchedUser, employee: fetchedEmp } = await api.getMe();
      setUser(fetchedUser);
      setEmployee(fetchedEmp || null);
    } catch (err) {
      console.error('Auth verification failed:', err);
      clearAuthToken();
      setTokenState(null);
      setUser(null);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setAuthToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      setEmployee(res.employee || null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const res = await api.register(userData);
      setAuthToken(res.token);
      setTokenState(res.token);
      setUser(res.user);
      setEmployee(res.employee || null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthToken();
    setTokenState(null);
    setUser(null);
    setEmployee(null);
  };

  const quickSwitchRole = async (targetRole: Role) => {
    let testEmail = 'employee@enterprise.com';
    if (targetRole === 'ADMIN') testEmail = 'admin@enterprise.com';
    if (targetRole === 'HR') testEmail = 'hr@enterprise.com';

    await login(testEmail, 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        token,
        loading,
        login,
        register,
        logout,
        quickSwitchRole,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
