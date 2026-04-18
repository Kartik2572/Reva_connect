import express from "express";
import {
  getAdminStats,
  getAdminUsers,
  deleteAdminUser,
  getPendingAlumni,
  updatePendingAlumniStatus,
  getAdminPosts,
  getAdminEvents,
  getAdminActivityLogs,
  createAdminActivityLog,
  deleteAdminPost,
  getUserRegistrationTrends,
  getAlumniByGraduationYear,
  getAlumniByCompany,
  getAlumniByDomain,
  getEventRegistrationTrends,
  getUserRoleDistribution,
  getEventStats
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.delete("/users/:id", deleteAdminUser);
router.get("/pending-alumni", getPendingAlumni);
router.put("/pending-alumni/:id", updatePendingAlumniStatus);
router.get("/posts", getAdminPosts);
router.get("/events", getAdminEvents);
router.get("/activity-logs", getAdminActivityLogs);
router.post("/activity-logs", createAdminActivityLog);
router.delete("/posts/:id", deleteAdminPost);

// Analytics routes
router.get("/analytics/user-registration-trends", getUserRegistrationTrends);
router.get("/analytics/alumni-graduation-year", getAlumniByGraduationYear);
router.get("/analytics/alumni-company", getAlumniByCompany);
router.get("/analytics/alumni-domain", getAlumniByDomain);
router.get("/analytics/event-registration-trends", getEventRegistrationTrends);
router.get("/analytics/user-role-distribution", getUserRoleDistribution);
router.get("/analytics/event-stats", getEventStats);

export default router;

