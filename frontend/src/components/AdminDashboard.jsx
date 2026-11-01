import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Users,
  Store,
  Star,
  PlusCircle,
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  Check,
  X,
  AlertCircle,
  MapPin,
  Mail,
  UserCheck
} from 'lucide-react';
import ThreeDCard from './ThreeDCard';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0, roleBreakdown: [] });
  const [activeTab, setActiveTab] = useState('stores'); // 'stores' or 'users'

  // Stores table state
  const [stores, setStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('id');
  const [storeSortOrder, setStoreSortOrder] = useState('desc');

  // Users table state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSortBy, setUserSortBy] = useState('id');
  const [userSortOrder, setUserSortOrder] = useState('desc');

  // Modals state
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Notification state
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchStats = async () => {
    try {
      const res = await api.getAdminStats();
      if (res.success) setStats(res.stats);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStores = async () => {
    try {
      const params = {
        name: storeSearch,
        sortBy: storeSortBy,
        sortOrder: storeSortOrder
      };
      const res = await api.getAdminStores(params);
      if (res.success) setStores(res.stores);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = {
        name: userSearch,
        role: userRoleFilter,
        sortBy: userSortBy,
        sortOrder: userSortOrder
      };
      const res = await api.getAdminUsers(params);
      if (res.success) setUsers(res.users);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    Promise.all([fetchStats(), fetchStores(), fetchUsers()]);
  }, []);

  useEffect(() => {
    fetchStores();
  }, [storeSearch, storeSortBy, storeSortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [userSearch, userRoleFilter, userSortBy, userSortOrder]);

  const handleStoreSort = (field) => {
    if (storeSortBy === field) {
      setStoreSortOrder(storeSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('asc');
    }
  };

  const handleUserSort = (field) => {
    if (userSortBy === field) {
      setUserSortOrder(userSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setUserSortBy(field);
      setUserSortOrder('asc');
    }
  };

  const renderSortIcon = (currentSortBy, field, currentOrder) => {
    if (currentSortBy !== field) return <ArrowUpDown size={13} style={{ color: '#94a3b8' }} />;
    return currentOrder === 'asc' ? (
      <ArrowUp size={13} style={{ color: '#0d9488' }} />
    ) : (
      <ArrowDown size={13} style={{ color: '#0d9488' }} />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Toast Alert */}
      {notification && (
        <div className={`floating-toast-alert toast-${notification.type}`}>
          {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Hero Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            System Administrator Overview
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
            Monitor real-time metrics, manage registered stores, and maintain user access.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddStoreModal(true)}
          >
            <PlusCircle size={16} /> Add New Store
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setShowAddUserModal(true)}
          >
            <PlusCircle size={16} /> Add New User
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="metrics-row">
        <ThreeDCard maxTilt={10} className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#ccfbf1', color: '#0f766e' }}>
            <Users size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-heading">Total Platform Users</span>
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="role-chips-list">
              {stats.roleBreakdown.map((r) => (
                <span key={r.role} className="role-chip">
                  {r.role}: {r.count}
                </span>
              ))}
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard maxTilt={10} className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <Store size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-heading">Registered Stores</span>
            <div className="stat-number">{stats.totalStores}</div>
            <span className="stat-description">Active merchant venues</span>
          </div>
        </ThreeDCard>

        <ThreeDCard maxTilt={10} className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Star size={26} fill="#f59e0b" color="#f59e0b" />
          </div>
          <div className="stat-content">
            <span className="stat-heading">Ratings Submitted</span>
            <div className="stat-number">{stats.totalRatings}</div>
            <span className="stat-description">User reviews (1-5 range)</span>
          </div>
        </ThreeDCard>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          className="btn"
          style={{
            background: activeTab === 'stores' ? '#f0fdfa' : 'transparent',
            color: activeTab === 'stores' ? '#0d9488' : '#64748b',
            fontWeight: 700
          }}
          onClick={() => setActiveTab('stores')}
        >
          <Store size={16} /> Stores Directory ({stores.length})
        </button>
        <button
          type="button"
          className="btn"
          style={{
            background: activeTab === 'users' ? '#f0fdfa' : 'transparent',
            color: activeTab === 'users' ? '#0d9488' : '#64748b',
            fontWeight: 700
          }}
          onClick={() => setActiveTab('users')}
        >
          <Users size={16} /> Users Management ({users.length})
        </button>
      </div>

      {/* TAB 1: Stores Management */}
      {activeTab === 'stores' && (
        <div className="panel-card">
          <div className="panel-toolbar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-field-control"
                placeholder="Search stores by Name, Email, Address..."
                value={storeSearch}
                onChange={(e) => setStoreSearch(e.target.value)}
              />
              {storeSearch && (
                <button type="button" className="clear-search-btn" onClick={() => setStoreSearch('')}>
                  <X size={14} />
                </button>
              )}
            </div>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              Showing {stores.length} stores
            </span>
          </div>

          <div className="table-responsive-box">
            <table className="modern-table">
              <thead>
                <tr>
                  <th onClick={() => handleStoreSort('id')} className="sortable-th">
                    <div className="th-flex">ID {renderSortIcon(storeSortBy, 'id', storeSortOrder)}</div>
                  </th>
                  <th onClick={() => handleStoreSort('name')} className="sortable-th">
                    <div className="th-flex">Store Name {renderSortIcon(storeSortBy, 'name', storeSortOrder)}</div>
                  </th>
                  <th onClick={() => handleStoreSort('email')} className="sortable-th">
                    <div className="th-flex">Store Email {renderSortIcon(storeSortBy, 'email', storeSortOrder)}</div>
                  </th>
                  <th onClick={() => handleStoreSort('address')} className="sortable-th">
                    <div className="th-flex">Address {renderSortIcon(storeSortBy, 'address', storeSortOrder)}</div>
                  </th>
                  <th onClick={() => handleStoreSort('rating')} className="sortable-th">
                    <div className="th-flex">Overall Rating {renderSortIcon(storeSortBy, 'rating', storeSortOrder)}</div>
                  </th>
                  <th>Assigned Owner</th>
                </tr>
              </thead>
              <tbody>
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No stores found matching your search.
                    </td>
                  </tr>
                ) : (
                  stores.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>#{s.id}</td>
                      <td className="font-bold-primary">{s.name}</td>
                      <td>{s.email}</td>
                      <td style={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={s.address}>
                        {s.address}
                      </td>
                      <td>
                        <div className="rating-pill-display">
                          <Star size={14} fill="#f59e0b" color="#f59e0b" />
                          <span className="rating-number-bold">
                            {s.rating > 0 ? s.rating.toFixed(1) : 'N/A'}
                          </span>
                          <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                            ({s.totalRatings} reviews)
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>
                          {s.ownerName}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeTab === 'users' && (
        <div className="panel-card">
          <div className="panel-toolbar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon-inside" />
              <input
                type="text"
                className="search-field-control"
                placeholder="Search users by Name, Email, Address..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
              {userSearch && (
                <button type="button" className="clear-search-btn" onClick={() => setUserSearch('')}>
                  <X size={14} />
                </button>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Filter size={15} color="#64748b" />
              <select
                style={{
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  background: '#fff',
                  fontWeight: 600,
                  color: '#0f172a'
                }}
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="all">All User Roles</option>
                <option value="user">Normal Users Only</option>
                <option value="owner">Store Owners Only</option>
                <option value="admin">Administrators Only</option>
              </select>
            </div>
          </div>

          <div className="table-responsive-box">
            <table className="modern-table">
              <thead>
                <tr>
                  <th onClick={() => handleUserSort('id')} className="sortable-th">
                    <div className="th-flex">ID {renderSortIcon(userSortBy, 'id', userSortOrder)}</div>
                  </th>
                  <th onClick={() => handleUserSort('name')} className="sortable-th">
                    <div className="th-flex">Full Name {renderSortIcon(userSortBy, 'name', userSortOrder)}</div>
                  </th>
                  <th onClick={() => handleUserSort('email')} className="sortable-th">
                    <div className="th-flex">Email Address {renderSortIcon(userSortBy, 'email', userSortOrder)}</div>
                  </th>
                  <th onClick={() => handleUserSort('address')} className="sortable-th">
                    <div className="th-flex">Address {renderSortIcon(userSortBy, 'address', userSortOrder)}</div>
                  </th>
                  <th onClick={() => handleUserSort('role')} className="sortable-th">
                    <div className="th-flex">Role {renderSortIcon(userSortBy, 'role', userSortOrder)}</div>
                  </th>
                  <th onClick={() => handleUserSort('rating')} className="sortable-th">
                    <div className="th-flex">Store Owner Rating {renderSortIcon(userSortBy, 'rating', userSortOrder)}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No users found matching your search.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontFamily: 'monospace', color: '#94a3b8' }}>#{u.id}</td>
                      <td className="font-bold-primary">{u.name}</td>
                      <td>{u.email}</td>
                      <td style={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={u.address}>
                        {u.address}
                      </td>
                      <td>
                        {u.role === 'admin' && <span className="badge badge-admin">Admin</span>}
                        {u.role === 'owner' && <span className="badge badge-owner">Store Owner</span>}
                        {u.role === 'user' && <span className="badge badge-user">Normal User</span>}
                      </td>
                      <td>
                        {u.role === 'owner' ? (
                          <div className="rating-pill-display">
                            <Star size={14} fill="#f59e0b" color="#f59e0b" />
                            <span className="rating-number-bold">
                              {u.rating && u.rating > 0 ? u.rating.toFixed(1) : 'No reviews'}
                            </span>
                            {u.storeName && (
                              <span style={{ fontSize: '0.725rem', color: '#64748b' }}>({u.storeName})</span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Store Modal */}
      {showAddStoreModal && (
        <AddStoreModal
          users={users}
          onClose={() => setShowAddStoreModal(false)}
          onSuccess={() => {
            setShowAddStoreModal(false);
            fetchStores();
            fetchStats();
            showToast('New store created successfully!');
          }}
        />
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          onClose={() => setShowAddUserModal(false)}
          onSuccess={() => {
            setShowAddUserModal(false);
            fetchUsers();
            fetchStats();
            showToast('New user created successfully!');
          }}
        />
      )}
    </div>
  );
}

// Modal: Add Store
function AddStoreModal({ users, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const availableOwners = users.filter((u) => u.role === 'owner');

  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isNameValid || !isEmailValid || !isAddressValid) {
      setError('Please fulfill all validation rules (Name 20-60 chars, Address max 400 chars).');
      return;
    }

    try {
      setLoading(true);
      const res = await api.addAdminStore({
        name,
        email,
        address,
        ownerId: ownerId ? Number(ownerId) : null
      });
      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Failed to add store');
      }
    } catch (err) {
      setError(err.message || 'Failed to add store');
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
              <Store size={20} />
            </div>
            <div>
              <div className="modal-title-bold">Add New Store</div>
              <div className="modal-title-sub">Register a new store into the rating platform</div>
            </div>
          </div>
          <button type="button" className="btn-dismiss-modal" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content-area">
            {error && (
              <div className="status-alert alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-field">
              <div className="field-header">
                <label className="field-label">Store Name</label>
                <span className={`char-counter-badge ${isNameValid ? 'badge-valid' : 'badge-err'}`}>
                  {name.trim().length}/60 chars (Min 20)
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '0.95rem' }}
                placeholder="Enter store name (20 to 60 characters)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="field-label">Store Email</label>
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: '0.95rem' }}
                placeholder="store@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <div className="field-header">
                <label className="field-label">Store Address</label>
                <span className={`char-counter-badge ${address.length > 400 ? 'badge-err' : 'badge-valid'}`}>
                  {address.length}/400 chars
                </span>
              </div>
              <textarea
                className="form-control form-control-textarea"
                placeholder="Enter full physical address (max 400 characters)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="field-label">Assign Store Owner (Optional)</label>
              <select
                className="form-control"
                style={{ paddingLeft: '0.95rem' }}
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
              >
                <option value="">-- No Owner Assigned (Can assign later) --</option>
                {availableOwners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} ({o.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!isNameValid || !isEmailValid || !isAddressValid || loading}>
              {loading ? 'Creating...' : 'Create Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Modal: Add User
function AddUserModal({ onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isNameValid = name.trim().length >= 20 && name.trim().length <= 60;
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
  const isAddressValid = address.trim().length > 0 && address.trim().length <= 400;
  const isPassLen = password.length >= 8 && password.length <= 16;
  const hasUpper = /[A-Z]/.test(password);
  const hasSpec = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = isPassLen && hasUpper && hasSpec;

  const isValid = isNameValid && isEmailValid && isAddressValid && isPasswordValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValid) {
      setError('Please fulfill all validation rules.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.addAdminUser({ name, email, password, address, role });
      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Failed to add user');
      }
    } catch (err) {
      setError(err.message || 'Failed to add user');
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
              <Users size={20} />
            </div>
            <div>
              <div className="modal-title-bold">Add New User</div>
              <div className="modal-title-sub">Create a normal user, store owner, or administrator</div>
            </div>
          </div>
          <button type="button" className="btn-dismiss-modal" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content-area">
            {error && (
              <div className="status-alert alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-field">
              <label className="field-label">Assigned Role</label>
              <select
                className="form-control"
                style={{ paddingLeft: '0.95rem' }}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="user">Normal User (Can browse & rate stores)</option>
                <option value="owner">Store Owner (Manages assigned store ratings)</option>
                <option value="admin">System Administrator (Full access)</option>
              </select>
            </div>

            <div className="form-field">
              <div className="field-header">
                <label className="field-label">Full Name</label>
                <span className={`char-counter-badge ${isNameValid ? 'badge-valid' : 'badge-err'}`}>
                  {name.trim().length}/60 chars (Min 20)
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '0.95rem' }}
                placeholder="Enter full name (20 to 60 characters)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="field-label">Email Address</label>
              <input
                type="email"
                className="form-control"
                style={{ paddingLeft: '0.95rem' }}
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <div className="field-header">
                <label className="field-label">Physical Address</label>
                <span className={`char-counter-badge ${address.length > 400 ? 'badge-err' : 'badge-valid'}`}>
                  {address.length}/400 chars
                </span>
              </div>
              <textarea
                className="form-control form-control-textarea"
                placeholder="Enter address (max 400 characters)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label className="field-label">Password</label>
              <input
                type="password"
                className="form-control"
                style={{ paddingLeft: '0.95rem' }}
                placeholder="Enter password (8 to 16 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="req-checklist">
                <div className={`req-item ${isPassLen ? 'met' : ''}`}>
                  <div className="req-dot">{isPassLen ? '✓' : '•'}</div>
                  <span>8 to 16 characters ({password.length}/16)</span>
                </div>
                <div className={`req-item ${hasUpper ? 'met' : ''}`}>
                  <div className="req-dot">{hasUpper ? '✓' : '•'}</div>
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`req-item ${hasSpec ? 'met' : ''}`}>
                  <div className="req-dot">{hasSpec ? '✓' : '•'}</div>
                  <span>At least one special character (!@#$%^&*)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!isValid || loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
