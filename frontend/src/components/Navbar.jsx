import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, LogOut, KeyRound, User, Shield, Store } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="badge badge-admin">
            <Shield size={12} /> Administrator
          </span>
        );
      case 'owner':
        return (
          <span className="badge badge-owner">
            <Store size={12} /> Store Owner
          </span>
        );
      default:
        return (
          <span className="badge badge-user">
            <User size={12} /> Normal User
          </span>
        );
    }
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <div className="navbar-brand">
            <div className="brand-logo">
              <Star size={22} fill="#f59e0b" color="#f59e0b" />
            </div>
            <div className="brand-text-wrap">
              <div className="brand-title">
                Store<span>Rating</span>
              </div>
              <div className="brand-subtitle">Platform</div>
            </div>
          </div>

          {user && (
            <div className="navbar-actions">
              <div className="user-profile-pill">
                <div className="user-avatar-badge">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info-text">
                  <span className="user-name-title" title={user.name}>
                    {user.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '2px' }}>
                    {getRoleBadge(user.role)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowPasswordModal(true)}
                  title="Update Password"
                >
                  <KeyRound size={14} />
                  <span>Password</span>
                </button>

                <button
                  type="button"
                  className="btn btn-danger-outline btn-sm"
                  onClick={logout}
                  title="Sign out of account"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </>
  );
}
