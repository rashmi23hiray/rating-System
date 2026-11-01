const BASE_URL = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('store_rating_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({ success: false, message: 'Invalid response from server' }));
  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }
  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(userData) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  async changePassword(passwords) {
    const res = await fetch(`${BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(passwords)
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async getAdminUsers(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/admin/users?${qs}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async addAdminUser(userData) {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  async getAdminStores(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/admin/stores?${qs}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async addAdminStore(storeData) {
    const res = await fetch(`${BASE_URL}/admin/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(storeData)
    });
    return handleResponse(res);
  },

  // Normal User / Public
  async getStores(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/stores?${qs}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  },

  async submitRating(storeId, rating) {
    const res = await fetch(`${BASE_URL}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ storeId, rating })
    });
    return handleResponse(res);
  },

  // Store Owner
  async getOwnerDashboard(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${BASE_URL}/owner/dashboard?${qs}`, {
      headers: { ...getAuthHeader() }
    });
    return handleResponse(res);
  }
};
