import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Store,
  Star,
  Users,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  MapPin,
  Mail,
  AlertCircle,
  X,
  TrendingUp,
  Award
} from 'lucide-react';
import ThreeDCard from './ThreeDCard';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.getOwnerDashboard({ search, sortBy, sortOrder });
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Owner dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [search, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown size={13} style={{ color: '#94a3b8' }} />;
    return sortOrder === 'asc' ? (
      <ArrowUp size={13} style={{ color: '#4f46e5' }} />
    ) : (
      <ArrowDown size={13} style={{ color: '#4f46e5' }} />
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
        Loading store dashboard metrics...
      </div>
    );
  }

  if (!data || !data.hasStore) {
    return (
      <div className="panel-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
        <Store size={48} color="#94a3b8" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>No Store Assigned</h2>
        <p style={{ color: '#64748b', maxWidth: 450, margin: '0.5rem auto 0 auto' }}>
          Your store owner account is not currently linked to any active store. Please contact a system administrator to assign your store.
        </p>
      </div>
    );
  }

  const { store, ratingsBreakdown = [], raters = [] } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Store Banner */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              border: '1.5px solid #fcd34d',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)'
            }}
          >
            <Store size={34} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
              <span className="badge badge-owner">Your Merchant Store</span>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Award size={13} /> Active Listing
              </span>
            </div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {store.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginTop: '6px', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                <Mail size={14} color="#94a3b8" /> {store.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                <MapPin size={14} color="#94a3b8" /> {store.address}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="metrics-row">
        <ThreeDCard maxTilt={10} className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#fef3c7', color: '#d97706' }}>
            <Star size={26} fill="#f59e0b" color="#f59e0b" />
          </div>
          <div className="stat-content">
            <span className="stat-heading">Average Store Rating</span>
            <div className="stat-number">
              {store.averageRating > 0 ? store.averageRating.toFixed(2) : '0.00'}
              <span style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 500 }}> / 5.0</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '4px' }}>
              {[1, 2, 3, 4, 5].map((starVal) => (
                <Star
                  key={starVal}
                  size={15}
                  fill={starVal <= Math.round(store.averageRating) ? '#f59e0b' : 'none'}
                  color={starVal <= Math.round(store.averageRating) ? '#f59e0b' : '#cbd5e1'}
                />
              ))}
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginLeft: '6px' }}>
                Overall Score
              </span>
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard maxTilt={10} className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#e0e7ff', color: '#4338ca' }}>
            <Users size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-heading">Total Reviews Received</span>
            <div className="stat-number">{store.totalRatings}</div>
            <span className="stat-description">Distinct customer ratings submitted</span>
          </div>
        </ThreeDCard>

        <ThreeDCard maxTilt={10} className="stat-card-modern">
          <div className="stat-icon-wrapper" style={{ background: '#dcfce7', color: '#15803d' }}>
            <TrendingUp size={26} />
          </div>
          <div className="stat-content">
            <span className="stat-heading">Rating Breakdown</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              {[5, 4, 3, 2, 1].map((sVal) => {
                const found = ratingsBreakdown.find((b) => Number(b.rating) === sVal);
                const count = found ? Number(found.count) : 0;
                const pct = store.totalRatings > 0 ? (count / store.totalRatings) * 100 : 0;
                return (
                  <div key={sVal} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}>
                    <span style={{ width: '22px', fontWeight: 700, color: '#64748b' }}>{sVal}★</span>
                    <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#f59e0b', borderRadius: '3px' }} />
                    </div>
                    <span style={{ width: '20px', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </ThreeDCard>
      </div>

      {/* Raters Table */}
      <div className="panel-card">
        <div className="panel-toolbar">
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Customer Reviews & Ratings
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
              Review list of all users who submitted ratings for your store
            </p>
          </div>

          <div className="search-input-wrapper">
            <Search size={16} className="search-icon-inside" />
            <input
              type="text"
              className="search-field-control"
              placeholder="Search by customer name, email, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="clear-search-btn" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="table-responsive-box">
          <table className="modern-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('name')} className="sortable-th">
                  <div className="th-flex">Customer Name {renderSortIcon('name')}</div>
                </th>
                <th onClick={() => handleSort('email')} className="sortable-th">
                  <div className="th-flex">Email Address {renderSortIcon('email')}</div>
                </th>
                <th onClick={() => handleSort('address')} className="sortable-th">
                  <div className="th-flex">Address {renderSortIcon('address')}</div>
                </th>
                <th onClick={() => handleSort('rating')} className="sortable-th">
                  <div className="th-flex">Rating Submitted {renderSortIcon('rating')}</div>
                </th>
                <th onClick={() => handleSort('date')} className="sortable-th">
                  <div className="th-flex">Review Date {renderSortIcon('date')}</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {raters.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                    No customer reviews found matching your search.
                  </td>
                </tr>
              ) : (
                raters.map((r) => (
                  <tr key={r.ratingId}>
                    <td className="font-bold-primary">{r.user.name}</td>
                    <td>{r.user.email}</td>
                    <td style={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.user.address}>
                      {r.user.address}
                    </td>
                    <td>
                      <div className="rating-pill-display">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map((val) => (
                            <Star
                              key={val}
                              size={13}
                              fill={val <= r.rating ? '#f59e0b' : 'none'}
                              color={val <= r.rating ? '#f59e0b' : '#cbd5e1'}
                            />
                          ))}
                        </div>
                        <span className="rating-number-bold" style={{ marginLeft: '4px' }}>
                          {r.rating} / 5
                        </span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                      {new Date(r.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
