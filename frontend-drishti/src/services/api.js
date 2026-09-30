import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 45000,
});

// Interceptor to attach stored JWT token
apiClient.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem('drishti_auth_token');
  if (token) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

export const authApi = {
  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },
  updatePreferences: async (preferences) => {
    const res = await apiClient.put('/auth/preferences', { preferences });
    return res.data;
  }
};

export const scanApi = {
  /**
   * Send image to backend for AI vision analysis
   * @param {File|Blob|string} image - Blob/File or base64 string
   * @param {string} mode - 'general' | 'text' | 'currency' | 'hazard' | 'object'
   * @param {string} prompt - Optional prompt
   */
  createScan: async (image, mode = 'general', prompt = '') => {
    if (typeof image === 'string' && image.startsWith('data:')) {
      const res = await apiClient.post('/scans', {
        imageBase64: image,
        mode,
        prompt,
      });
      return res.data;
    } else {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('mode', mode);
      if (prompt) formData.append('prompt', prompt);

      const res = await apiClient.post('/scans', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    }
  },

  getScans: async (limit = 30) => {
    const res = await apiClient.get(`/scans?limit=${limit}`);
    return res.data;
  },

  deleteScan: async (id) => {
    const res = await apiClient.delete(`/scans/${id}`);
    return res.data;
  }
};

export const aiApi = {
  getStatus: async () => {
    const res = await apiClient.get('/ai/status');
    return res.data;
  },
  updateConfig: async (config) => {
    const res = await apiClient.post('/ai/config', config);
    return res.data;
  }
};
