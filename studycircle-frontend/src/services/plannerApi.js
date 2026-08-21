import axios from "axios";

// ✅ Decide base URL depending on environment
const apiBaseUrl =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://127.0.0.1:8000/planner"
    : "https://studycircle-project.onrender.com/planner");

// ✅ Create axios instance
const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

// ✅ Request interceptor: attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor: refresh token if access expires
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh");
        if (!refreshToken) throw new Error("No refresh token");

        // Request new access token
        const res = await axios.post(`${apiBaseUrl}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        localStorage.setItem("access", newAccessToken);

        // Update headers
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // ✅ Clear tokens and redirect to login
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Tasks
export const getTasks = async () => {
  const res = await api.get("/tasks/");
  return res.data;
};

export const createTask = async (task) => {
  const res = await api.post("/tasks/", task);
  return res.data;
};

// ✅ Events
export const getEvents = async () => {
  const res = await api.get("/events/");
  return res.data;
};

export const createEvent = async (event) => {
  const res = await api.post("/events/", event);
  return res.data;
};
