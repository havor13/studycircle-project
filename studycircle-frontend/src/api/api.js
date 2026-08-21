import axios from 'axios';

// ✅ Decide base URL depending on environment
const apiBaseUrl =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:8000/api'
    : 'https://studycircle-project.onrender.com/api');

// ✅ Helper functions for tokens
const getAccessToken = () => localStorage.getItem('access');
const getRefreshToken = () => localStorage.getItem('refresh');
const saveAccessToken = (token) => localStorage.setItem('access', token);
const clearTokens = () => {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('username');
};

// ✅ Create axios instance
const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

// ✅ Attach access token from localStorage if available
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle expired tokens automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        // Request new access token
        const res = await axios.post(`${apiBaseUrl}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        saveAccessToken(newAccessToken);

        // Update headers
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Global Search helper function
export const searchApi = async (query) => {
  try {
    const res = await api.get('search/', { params: { q: query } });
    return res.data;
  } catch (err) {
    console.error('Search API failed:', err.response?.data || err.message);
    throw err;
  }
};

// ✅ Recommendations helper function
export const recommendationsApi = async () => {
  try {
    const res = await api.get('recommendations/');
    return res.data;
  } catch (err) {
    console.error('Recommendations API failed:', err.response?.data || err.message);
    throw err;
  }
};

// ✅ Local (thread-specific) search helper function
export const threadSearchApi = async (threadId, query) => {
  try {
    const res = await api.get(`threads/${threadId}/search/`, { params: { q: query } });
    return res.data;
  } catch (err) {
    console.error('Thread search API failed:', err.response?.data || err.message);
    throw err;
  }
};

export default api;
