import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, Mail, Lock, User, MapPin, Check, AlertCircle, ArrowRight, Shield, Store, Sparkles } from 'lucide-react';
import ThreeDCanvas from './ThreeDCanvas';
import ThreeDCard from './ThreeDCard';

export default function LoginRegister() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Live registration validations
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const nameLength = name.trim().length;
  const isNameLengthValid = nameLength >= 20 && nameLength <= 60;
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  
  const isPasswordLengthValid = password.length >= 8 && password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = isPasswordLengthValid && hasUppercase && hasSpecial;

  const canSubmitRegister = isNameLengthValid && isEmailValid && isAddressValid && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      if (isLogin) {
        await login(email, password);
      } else {
        if (!canSubmitRegister) {
          setError('Please satisfy all form validation criteria.');
          setLoading(false);
          return;
        }
        await register({ name, email, password, address });
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setIsLogin(true);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="auth-wrapper">
      {/* 3D Animated Background Canvas */}
      <ThreeDCanvas count={45} interactive={true} />

      <ThreeDCard maxTilt={8} className="auth-card threed-card-pop" style={{ zIndex: 10 }}>
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo-badge animate-float-3d glow-3d-pulse">
            <Star size={30} fill="#f59e0b" color="#f59e0b" />
          </div>
          <h2 className="auth-title">
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="auth-subtitle">
            {isLogin
              ? 'Sign in to access your role-based dashboard'
              : 'Register as a normal user to review & rate stores'}
          </p>
        </div>

        {/* 1-Click Demo Accounts */}
        <div className="demo-accounts-panel">
          <div className="demo-panel-header">
            <span className="demo-title-text">⚡ 1-Click Demo Logins:</span>
            <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 700 }}>Ready to test</span>
          </div>
          <div className="demo-buttons-row">
            <button
              type="button"
              className="btn-demo-pill demo-admin-pill"
              onClick={() => fillDemo('admin@storerating.com', 'Admin@1234')}
            >
              <Shield size={13} /> Admin
            </button>
            <button
              type="button"
              className="btn-demo-pill demo-owner-pill"
              onClick={() => fillDemo('martinez@freshmart.com', 'Owner@1234')}
            >
              <Store size={13} /> Owner
            </button>
            <button
              type="button"
              className="btn-demo-pill demo-user-pill"
              onClick={() => fillDemo('samantha.robinson@example.com', 'User@1234')}
            >
              <User size={13} /> User
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="auth-segmented-control">
          <button
            type="button"
            className={`segment-btn ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`segment-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="status-alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-fields">
          {/* Sign Up Specific Fields */}
          {!isLogin && (
            <>
              <div className="form-field">
                <div className="field-header">
                  <label className="field-label">Full Name</label>
                  <span
                    className={`char-counter-badge ${
                      isNameLengthValid ? 'badge-valid' : nameLength > 0 ? 'badge-warn' : 'badge-err'
                    }`}
                  >
                    {nameLength}/60 chars (Min 20)
                  </span>
                </div>
                <div className="field-input-box">
                  <User className="field-icon" size={17} />
                  <input
                    type="text"
                    className={`form-control ${name && !isNameLengthValid ? 'control-error' : ''}`}
                    placeholder="Enter full name (20 to 60 characters)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <div className="field-header">
                  <label className="field-label">Physical Address</label>
                  <span
                    className={`char-counter-badge ${
                      address.length > 400 ? 'badge-err' : address.length > 0 ? 'badge-valid' : 'badge-warn'
                    }`}
                  >
                    {address.length}/400 chars
                  </span>
                </div>
                <div className="field-input-box">
                  <textarea
                    className="form-control form-control-textarea"
                    placeholder="Enter full physical address (max 400 characters)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="form-field">
            <label className="field-label">Email Address</label>
            <div className="field-input-box">
              <Mail className="field-icon" size={17} />
              <input
                type="email"
                className="form-control"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-field">
            <label className="field-label">Password</label>
            <div className="field-input-box">
              <Lock className="field-icon" size={17} />
              <input
                type="password"
                className="form-control"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Live Password Checklist for Signup */}
            {!isLogin && (
              <div className="req-checklist">
                <div className={`req-item ${isPasswordLengthValid ? 'met' : ''}`}>
                  <div className="req-dot">{isPasswordLengthValid ? '✓' : '•'}</div>
                  <span>8 to 16 characters ({password.length}/16)</span>
                </div>
                <div className={`req-item ${hasUppercase ? 'met' : ''}`}>
                  <div className="req-dot">{hasUppercase ? '✓' : '•'}</div>
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`req-item ${hasSpecial ? 'met' : ''}`}>
                  <div className="req-dot">{hasSpecial ? '✓' : '•'}</div>
                  <span>At least one special character (!@#$%^&*)</span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block threed-interactive-btn"
            disabled={loading || (!isLogin && !canSubmitRegister)}
            style={{ marginTop: '0.5rem', padding: '0.75rem' }}
          >
            {loading ? (
              'Authenticating...'
            ) : isLogin ? (
              <>Sign In to Platform <ArrowRight size={16} /></>
            ) : (
              <>Create Free Account <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
          {isLogin ? (
            <p>
              Don't have an account yet?{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => { setIsLogin(false); setError(''); }}
              >
                Sign up as normal user
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => { setIsLogin(true); setError(''); }}
              >
                Sign in to your account
              </button>
            </p>
          )}
        </div>
      </ThreeDCard>
    </div>
  );
}
