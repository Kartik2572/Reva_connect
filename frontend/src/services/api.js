import axios from "axios";

// Configure a single Axios instance for the app
const api = axios.create({
  baseURL: "http://localhost:5000/api"
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const registerUser = (payload) => api.post("/auth/register", payload);
export const loginUser = (payload) => api.post("/auth/login", payload);

export const fetchAlumni = (params) => api.get("/alumni", { params });

export const fetchJobs = () => api.get("/jobs");

export const fetchJobReferrals = (studentId) =>
  api.get("/jobs", {
    params: studentId != null && studentId !== "" ? { studentId } : {}
  });

export const createJobReferral = (payload) => api.post("/jobs", payload);

export const fetchJobApplicationsForStudent = (studentId) =>
  api.get(`/jobs/applied/${studentId}`);

export const createJobApplication = (payload) => api.post("/jobs/apply", payload);

export const fetchEvents = () => api.get("/events");

export const fetchUpcomingAlumniEvents = () => api.get("/events/upcoming-alumni");

export const registerForEvent = (payload) => api.post("/events/register", payload);

export const fetchUserRegistrations = () => api.get("/events/user/registrations");

export const fetchEventRegistrations = (eventId) => api.get(`/events/${eventId}/registrations`);

export const fetchEventsByHost = (host) =>
  api.get(`/events/host/${encodeURIComponent(host)}`);

export const fetchAlumnusById = (id) => api.get(`/alumni/${id}`);
export const updateAlumnusProfile = (id, payload) => api.put(`/alumni/${id}`, payload);

export const updateUserProfile = (payload) => api.put("/auth/profile", payload);

export const fetchOtherAlumniHostedEvents = (host) =>
  api.get(`/events/other-alumni/${encodeURIComponent(host)}`);

// Admin analytics APIs
export const fetchUserRegistrationTrends = () => api.get("/admin/analytics/user-registration-trends");
export const fetchAlumniByGraduationYear = () => api.get("/admin/analytics/alumni-graduation-year");
export const fetchAlumniByCompany = () => api.get("/admin/analytics/alumni-company");
export const fetchAlumniByDomain = () => api.get("/admin/analytics/alumni-domain");
export const fetchEventRegistrationTrends = () => api.get("/admin/analytics/event-registration-trends");
export const fetchUserRoleDistribution = () => api.get("/admin/analytics/user-role-distribution");
export const fetchEventStats = () => api.get("/admin/analytics/event-stats");

export const createEvent = (payload) => api.post("/events", payload);

export const updateEvent = (id, payload) => api.put(`/events/${id}`, payload);

export const deleteEvent = (id, config) => api.delete(`/events/${id}`, config);

export const fetchPosts = () => api.get("/posts");

export const createPost = (payload) => api.post("/posts", payload);

export const fetchPostsByAuthor = (author) => api.get(`/posts/author/${author}`);

export const submitMentorshipRequest = (payload) =>
  api.post("/mentorship/request", payload);

export const fetchMentorshipRequestsForStudent = (studentId) =>
  api.get(`/mentorship/student/${studentId}`);

export const fetchMentorshipRequestsForAlumnus = (alumnusId) =>
  api.get(`/mentorship/alumnus/${encodeURIComponent(alumnusId)}`);

export const updateMentorshipRequest = (id, payload) =>
  api.put(`/mentorship/${id}`, payload);

export const fetchAllMentorshipRequests = () => api.get("/mentorship");

// Admin-specific helpers
export const fetchAdminStats = () => api.get("/admin/stats");
export const fetchAdminUsers = () => api.get("/admin/users");
export const deleteAdminUser = (id, payload) => api.delete(`/admin/users/${id}`, { data: payload });
export const fetchAdminPendingAlumni = () => api.get("/admin/pending-alumni");
export const updateAdminPendingAlumniStatus = (id, action = "approve", adminName) => api.put(`/admin/pending-alumni/${id}`, { action, adminName });
export const fetchAdminPosts = () => api.get("/admin/posts");
export const fetchAdminEvents = () => api.get("/admin/events");
export const fetchAdminActivityLogs = (params) => api.get("/admin/activity-logs", { params });
export const createAdminActivityLog = (payload) => api.post("/admin/activity-logs", payload);
export const deleteAdminPost = (id, payload) => api.delete(`/admin/posts/${id}`, { data: payload });

export default api;

