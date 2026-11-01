import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Check, AlertCircle } from 'lucide-react';

export default function ChangePasswordModal({ onClose }) {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Real-time validations
  const hasLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = hasLength && hasUppercase && hasSpecial && passwordsMatch && currentPassword.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isFormValid) {
      setError('Please fulfill all password requirements.');
      return;
    }

    try {
      setLoading(true);
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setSuccess('Password updated successfully!');
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.message || 'Failed to update password.');
      }
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-screen-mask" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-head-title-group">
            <div className="modal-icon-container">
              <Lock size={20} />
            </div>
            <div>
              <div className="modal-title-bold">Update Account Password</div>
              <div className="modal-title-sub">Change your secure login password</div>
            </div>
          </div>
          <button type="button" className="btn-dismiss-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content-area">
            {error && (
              <div className="status-alert alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="status-alert alert-success">
                <Check size={16} />
                <span>{success}</span>
              </div>
            )}

            <div className="form-field">
              <label className="field-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '0.95rem' }}
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="field-label">New Password</label>
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '0.95rem' }}
                placeholder="Enter new password (8-16 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <div className="req-checklist">
                <div className={`req-item ${hasLength ? 'met' : ''}`}>
                  <div className="req-dot">{hasLength ? '✓' : '•'}</div>
                  <span>8 to 16 characters ({newPassword.length}/16)</span>
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
            </div>

            <div className="form-field">
              <label className="field-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '0.95rem' }}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
                  Passwords do not match
                </span>
              )}
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isFormValid || loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
