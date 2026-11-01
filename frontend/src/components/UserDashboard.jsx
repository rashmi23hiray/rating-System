import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Star,
  MapPin,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Edit3,
  Check,
  AlertCircle,
  X,
  Sparkles,
  ShoppingBag,
  LayoutGrid,
  List
} from 'lucide-react';
import ThreeDCard from './ThreeDCard';
import ThreeDCanvas from './ThreeDCanvas';

export default function UserDashboard() {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // Default to modern 3D cards grid!
  const [loading, setLoading] = useState(true);

  // Rating modal state
  const [selectedStore, setSelectedStore] = useState(null);
  const [notification, setNotification] = useState(null);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchStores = async () => {
    try {
      const res = await api.getStores({ search, sortBy, sortOrder });
      if (res.success) {
        setStores(res.stores);
      }
    } catch (err) {
      console.error('Fetch stores error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
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
      <ArrowUp size={13} style={{ color: '#0d9488' }} />
    ) : (
      <ArrowDown size={13} style={{ color: '#0d9488' }} />
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {notification && (
        <div className={`floating-toast-alert toast-${notification.type}`}>
          {notification.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* 3D Showcase Banner with interactive particles */}
      <div className="user-showcase-banner" style={{ position: 'relative', overflow: 'hidden' }}>
        <ThreeDCanvas count={25} interactive={true} />

        <div style={{ position: 'relative', zIndex: 5 }}>
          <div className="banner-badge-pill animate-float-3d">
            <Sparkles size={14} color="#fbbf24" /> 3D Interactive Platform
          </div>
          <h1 className="banner-headline">Explore & Review Registered Stores</h1>
          <p className="banner-subtext">
            Experience our interactive 3D store showcase. Search by merchant name or address and submit authentic 1 to 5 star ratings.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="panel-card">
        <div className="panel-toolbar">
          <div className="search-input-wrapper" style={{ maxWidth: 500 }}>
            <Search size={16} className="search-icon-inside" />
            <input
              type="text"
              className="search-field-control"
              placeholder="Search stores by Name or Address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="clear-search-btn" onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              {stores.length} store{stores.length !== 1 ? 's' : ''} found
            </span>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '3px', border: '1px solid #e2e8f0' }}>
              <button
                type="button"
                style={{
                  background: viewMode === 'grid' ? '#fff' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.4rem 0.75rem',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'grid' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  color: viewMode === 'grid' ? '#0d9488' : '#64748b'
                }}
                onClick={() => setViewMode('grid')}
                title="3D Cards Grid View"
              >
                <LayoutGrid size={15} /> 3D Cards
              </button>
              <button
                type="button"
                style={{
                  background: viewMode === 'table' ? '#fff' : 'transparent',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.4rem 0.75rem',
                  cursor: 'pointer',
                  boxShadow: viewMode === 'table' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  color: viewMode === 'table' ? '#0d9488' : '#64748b'
                }}
                onClick={() => setViewMode('table')}
                title="Detailed Table View"
              >
                <List size={15} /> Table
              </button>
            </div>
          </div>
        </div>

        {/* VIEW 1: 3D Cards Grid */}
        {viewMode === 'grid' && (
          <div style={{ padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {stores.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                No stores found matching your search.
              </div>
            ) : (
              stores.map((s) => {
                const hasUserRated = s.userSubmittedRating !== null && s.userSubmittedRating > 0;
                return (
                  <ThreeDCard
                    key={s.id}
                    maxTilt={12}
                    style={{
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '20px',
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '1.25rem',
                      boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.08)',
                      overflow: 'hidden'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <div className="rating-pill-display" style={{ padding: '0.3rem 0.75rem' }}>
                          <Star size={15} fill="#f59e0b" color="#f59e0b" />
                          <span className="rating-number-bold" style={{ fontSize: '0.9rem' }}>
                            {s.overallRating > 0 ? s.overallRating.toFixed(1) : 'No rating'}
                          </span>
                          <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                            ({s.totalRatings})
                          </span>
                        </div>

                        {hasUserRated ? (
                          <div className="rating-user-tag" style={{ fontSize: '0.75rem' }}>
                            <Star size={13} fill="#10b981" color="#10b981" />
                            <span>Your: {s.userSubmittedRating}★</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Unrated</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #ccfbf1 0%, #99f6e4 100%)',
                            color: '#0f766e',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          <ShoppingBag size={20} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                            {s.name}
                          </h3>
                          <div style={{ fontSize: '0.775rem', color: '#64748b' }}>{s.email}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.825rem', color: '#64748b', marginTop: '0.75rem' }}>
                        <MapPin size={15} color="#94a3b8" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{s.address}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`btn threed-interactive-btn ${hasUserRated ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ width: '100%', justifyContent: 'center', padding: '0.7rem' }}
                      onClick={() => setSelectedStore(s)}
                    >
                      {hasUserRated ? (
                        <>
                          <Edit3 size={14} /> Modify Your Rating
                        </>
                      ) : (
                        <>
                          <Star size={14} /> Submit Rating (1-5★)
                        </>
                      )}
                    </button>
                  </ThreeDCard>
                );
              })
            )}
          </div>
        )}

        {/* VIEW 2: Table View */}
        {viewMode === 'table' && (
          <div className="table-responsive-box">
            <table className="modern-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="sortable-th">
                    <div className="th-flex">Store Name {renderSortIcon('name')}</div>
                  </th>
                  <th onClick={() => handleSort('address')} className="sortable-th">
                    <div className="th-flex">Address {renderSortIcon('address')}</div>
                  </th>
                  <th onClick={() => handleSort('overall_rating')} className="sortable-th">
                    <div className="th-flex">Overall Rating {renderSortIcon('overall_rating')}</div>
                  </th>
                  <th onClick={() => handleSort('user_rating')} className="sortable-th">
                    <div className="th-flex">Your Rating {renderSortIcon('user_rating')}</div>
                  </th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3.5rem', color: '#94a3b8' }}>
                      No stores found matching your search.
                    </td>
                  </tr>
                ) : (
                  stores.map((s) => {
                    const hasUserRated = s.userSubmittedRating !== null && s.userSubmittedRating > 0;
                    return (
                      <tr key={s.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div
                              style={{
                                width: 38,
                                height: 38,
                                borderRadius: '10px',
                                background: '#ccfbf1',
                                color: '#0f766e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}
                            >
                              <ShoppingBag size={18} />
                            </div>
                            <div>
                              <div className="font-bold-primary">{s.name}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', maxWidth: 320 }} title={s.address}>
                            <MapPin size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {s.address}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="rating-pill-display">
                            <Star size={15} fill="#f59e0b" color="#f59e0b" />
                            <span className="rating-number-bold">
                              {s.overallRating > 0 ? s.overallRating.toFixed(1) : 'No ratings'}
                            </span>
                            <span style={{ fontSize: '0.725rem', color: '#94a3b8' }}>
                              ({s.totalRatings} reviews)
                            </span>
                          </div>
                        </td>
                        <td>
                          {hasUserRated ? (
                            <div className="rating-user-tag">
                              <Star size={13} fill="#10b981" color="#10b981" />
                              <span>{s.userSubmittedRating} / 5</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Not rated yet</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className={`btn btn-sm ${hasUserRated ? 'btn-secondary' : 'btn-primary'}`}
                            onClick={() => setSelectedStore(s)}
                          >
                            {hasUserRated ? (
                              <>
                                <Edit3 size={13} /> Modify Rating
                              </>
                            ) : (
                              <>
                                <Star size={13} /> Rate Store
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3D Interactive Rate Store Modal */}
      {selectedStore && (
        <RateStoreModal
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
          onSuccess={(isModified, userRating) => {
            setSelectedStore(null);
            fetchStores();
            showToast(
              isModified
                ? `Updated rating to ${userRating} stars for "${selectedStore.name}".`
                : `Submitted ${userRating}-star rating for "${selectedStore.name}".`
            );
          }}
        />
      )}
    </div>
  );
}

// Modal: Rate / Modify Rating with 3D Star Animation
function RateStoreModal({ store, onClose, onSuccess }) {
  const [rating, setRating] = useState(store.userSubmittedRating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const ratingDescriptions = {
    1: '★ 1 Star - Poor Experience',
    2: '★ 2 Stars - Fair / Needs Improvement',
    3: '★ 3 Stars - Good / Average',
    4: '★ 4 Stars - Very Good Experience',
    5: '★ 5 Stars - Outstanding / Excellent'
  };

  const activeRating = hoverRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await api.submitRating(store.id, rating);
      if (res.success) {
        onSuccess(res.isModified, rating);
      } else {
        setError(res.message || 'Failed to submit rating.');
      }
    } catch (err) {
      setError(err.message || 'Failed to submit rating.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-screen-mask" onClick={onClose}>
      <ThreeDCard maxTilt={6} className="modal-box modal-box-rating" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-head-title-group">
            <div className="modal-icon-container animate-spin-3d" style={{ background: '#fef3c7', color: '#d97706' }}>
              <Star size={22} fill="#f59e0b" color="#f59e0b" />
            </div>
            <div>
              <div className="modal-title-bold">
                {store.userSubmittedRating ? 'Modify Your Rating' : 'Rate This Store'}
              </div>
              <div className="modal-title-sub" style={{ maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {store.name}
              </div>
            </div>
          </div>
          <button type="button" className="btn-dismiss-modal" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-content-area" style={{ textAlign: 'center' }}>
            {error && (
              <div className="status-alert alert-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <p style={{ fontSize: '0.95rem', color: '#334155', fontWeight: 600 }}>
              Hover & click stars to select your 3D rating (1–5★):
            </p>

            {/* 3D Interactive Stars */}
            <div className="star-rating-showcase">
              {[1, 2, 3, 4, 5].map((starValue) => {
                const isFilled = starValue <= activeRating;
                return (
                  <button
                    key={starValue}
                    type="button"
                    className="star-interactive-btn"
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(starValue)}
                    title={`${starValue} Stars`}
                  >
                    <Star
                      size={44}
                      fill={isFilled ? '#f59e0b' : 'none'}
                      color={isFilled ? '#f59e0b' : '#cbd5e1'}
                      strokeWidth={1.75}
                      style={{
                        filter: isFilled ? 'drop-shadow(0 4px 10px rgba(245, 158, 11, 0.45))' : 'none'
                      }}
                    />
                  </button>
                );
              })}
            </div>

            <div className="star-score-caption glow-3d-pulse">
              {ratingDescriptions[activeRating]}
            </div>

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '0.9rem 1.15rem',
                marginTop: '0.75rem',
                textAlign: 'left',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Store Location:</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{store.address}</div>
            </div>
          </div>

          <div className="modal-foot">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary threed-interactive-btn" disabled={loading}>
              {loading ? 'Submitting...' : store.userSubmittedRating ? 'Update Rating' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </ThreeDCard>
    </div>
  );
}
