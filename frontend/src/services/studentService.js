// frontend/src/services/studentService.js
import axios from "axios";

/**
 * Base URL comes from VITE_API_URL.
 * Falls back to localhost ONLY for local dev — never as a production default.
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

/* ---- Response interceptor: normalise error messages ---- */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "Something went wrong. Please try again.";

    if (error.code === "ECONNABORTED") {
      message = "Request timed out. Please check your connection.";
    } else if (error.response) {
      message =
        error.response.data?.message ||
        `Server error (${error.response.status})`;
    } else if (error.request) {
      message =
        "Cannot reach the server. Check that the backend is running and VITE_API_URL is correct.";
    }

    return Promise.reject(new Error(message));
  }
);

/* ---------------- Health ---------------- */
export const checkHealth = async () => {
  const { data } = await api.get("/health");
  return data;
};

/* ---------------- CRUD ---------------- */
export const getAllStudents = async () => {
  const { data } = await api.get("/students");
  return data; // { success, count, data: [...] }
};

export const getStudentById = async (id) => {
  const { data } = await api.get(`/students/${id}`);
  return data;
};

export const createStudent = async (student) => {
  const { data } = await api.post("/students", student);
  return data;
};

export const updateStudent = async (id, student) => {
  const { data } = await api.put(`/students/${id}`, student);
  return data;
};

export const deleteStudent = async (id) => {
  const { data } = await api.delete(`/students/${id}`);
  return data;
};

export default api;