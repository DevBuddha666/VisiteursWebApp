import axios from 'axios';

/**
 * Instance Axios configurée pour l'API EFET AGADIR.
 * Gère automatiquement les tokens JWT et le rafraîchissement.
 */
const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Intercepteur de requête : ajouter le token ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Intercepteur de réponse : rafraîchir le token si expiré ──
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.code === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        if (data.success) {
          localStorage.setItem('accessToken', data.data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('admin');
        window.location.href = '/admin/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════
// Services API
// ═══════════════════════════════════════════════════════════════

// ── Auth ──
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/password', { currentPassword, newPassword }),
};

// ── Orientateurs ──
export const orientateurService = {
  verify: (code) => api.get(`/orientateurs/verify/${code}`),
  getAll: (params) => api.get('/orientateurs', { params }),
  create: (data) => api.post('/orientateurs', data),
  update: (id, data) => api.put(`/orientateurs/${id}`, data),
  delete: (id) => api.delete(`/orientateurs/${id}`),
  getQRCode: (id) => api.get(`/orientateurs/${id}/qrcode`, { responseType: 'blob' }),
  getQRCodeData: (id) => api.get(`/orientateurs/${id}/qrcode-data`),
  getStats: (id) => api.get(`/orientateurs/${id}/stats`),
};

// ── Visiteurs ──
export const visiteurService = {
  create: (data) => api.post('/visiteurs', data),
  getAll: (params) => api.get('/visiteurs', { params }),
  getById: (id) => api.get(`/visiteurs/${id}`),
  export: (params) => api.get('/visiteurs/export', { params, responseType: 'blob' }),
};

// ── Formations ──
export const formationService = {
  getAll: () => api.get('/formations'),
  create: (data) => api.post('/formations', data),
  update: (id, data) => api.put(`/formations/${id}`, data),
  delete: (id) => api.delete(`/formations/${id}`),
};

// ── Sources de connaissance ──
export const sourceService = {
  getAll: () => api.get('/sources'),
  create: (data) => api.post('/sources', data),
  update: (id, data) => api.put(`/sources/${id}`, data),
  delete: (id) => api.delete(`/sources/${id}`),
};

// ── Statistiques ──
export const statsService = {
  getOverview: () => api.get('/stats/overview'),
  getOrientateursStats: () => api.get('/stats/orientateurs'),
};

export default api;
