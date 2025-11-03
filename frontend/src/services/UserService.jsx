import axios from "axios";

// Use Vite env for backend URL with sensible fallback
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

// Add JWT Token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("aToken");
    if (token) config.headers["Authorization"] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================================
AUTH APIs
================================ */
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);

/* ================================
PATIENT APIs
================================ */
// Backend exposes: GET /api/patients/profile (current user via Principal)
export const getCurrentPatient = () => api.get("/patients/profile");
// Backend update requires ID path: PUT /api/patients/{id}
export const updateCurrentPatient = (id, data) => api.put(`/patients/${id}`, data);
export const deleteCurrentPatient = () => api.delete("/patients/delete");

/* ================================
DOCTOR APIs (User View)
================================ */
export const getAllDoctors = () => api.get("/doctors");
export const getFeaturedDoctors = () => api.get("/doctors/featured");
export const getDoctorById = (id) => api.get(`/doctors/${id}`);

/* ================================
ADMIN — DOCTOR CRUD
(Admin adding doctors)
================================ */
export const adminAddDoctor = (data) => api.post("/admin/doctors", data);
export const adminUpdateDoctor = (id, data) => api.put(`/admin/doctors/${id}`, data);
export const adminDeleteDoctor = (id) => api.delete(`/admin/doctors/${id}`);
export const adminGetAllDoctors = () => api.get("/admin/doctors");

/* ================================
APPOINTMENTS APIs
================================ */
export const bookAppointment = (data) => api.post("/appointments", data);
export const getMyAppointments = () => api.get("/appointments/me");
export const getMyDoctorAppointments = () => api.get("/appointments/doctor/me");
export const cancelAppointment = (id) => api.put(`/appointments/${id}/cancel`);

/* ================================
ADMIN — APPOINTMENT MANAGEMENT
================================ */
export const getAllAppointments = () => api.get("/admin/appointments");
export const approveAppointment = (id) => api.put(`/admin/appointments/${id}/status`, null, { params: { status: 'APPROVED' } });
export const rejectAppointment = (id) => api.put(`/admin/appointments/${id}/status`, null, { params: { status: 'REJECTED' } });
export const updateAppointmentStatus = (id, status) => api.put(`/appointments/${id}/status`, null, { params: { status } });

/* ================================
ADMIN — USERS
================================ */
export const adminGetAllUsers = () => api.get("/admin/users");

/* ================================
ADMIN — PATIENT APPROVALS
================================ */
export const adminGetPendingPatients = () => api.get("/admin/patients/pending");
export const adminApprovePatient = (id) => api.put(`/admin/patients/${id}/approve`);
