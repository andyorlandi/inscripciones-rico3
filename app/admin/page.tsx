'use client';

import { useState, useEffect } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check if already authenticated in session
    const savedPassword = sessionStorage.getItem('admin_password');
    if (savedPassword) {
      setPassword(savedPassword);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (pwd: string) => {
    setPassword(pwd);
    sessionStorage.setItem('admin_password', pwd);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setPassword('');
    sessionStorage.removeItem('admin_password');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <AdminDashboard password={password} onLogout={handleLogout} />;
}
