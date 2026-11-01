import React from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginRegister from './components/LoginRegister';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import OwnerDashboard from './components/OwnerDashboard';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginRegister />;
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {user.role === 'admin' && <AdminDashboard />}
        {user.role === 'owner' && <OwnerDashboard />}
        {user.role === 'user' && <UserDashboard />}
      </main>
    </div>
  );
}

