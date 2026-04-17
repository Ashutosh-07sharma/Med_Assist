import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const signup = async (name, email, password) =>
  (await api.post("/auth/signup", { name, email, password })).data;
export const login = async (email, password) =>
  (await api.post("/auth/login", { email, password })).data;
export const getCurrentUser = async () => (await api.get("/auth/me")).data;

export const getSessions = async () => (await api.get("/sessions")).data;
export const createSession = async () => (await api.post("/sessions", {})).data;
export const deleteSession = async (id) => api.delete(`/sessions/${id}`);
export const updateSessionTitle = async (id, title) =>
  (await api.patch(`/sessions/${id}`, { title })).data;
export const getMessages = async (sessionId) => (await api.get(`/sessions/${sessionId}/messages`)).data;
export const sendMessage = async (sessionId, message) =>
  (await api.post("/chat", { session_id: sessionId, message })).data;
