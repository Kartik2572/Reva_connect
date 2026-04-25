import express from "express";
import {
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  getJobReferrals,
  createJobReferral,
  getJobApplicationsForStudent,
  createJobApplication,
  getAdminJobReferrals,
  updateJobReferralStatus
} from "../controllers/jobController.js";

import { verifyToken, isAlumni, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// Specific routes first (must come before generic routes)
router.get("/applied/:studentId", getJobApplicationsForStudent); // GET /api/jobs/applied/:studentId
router.post("/apply", createJobApplication);              // POST /api/jobs/apply

// Admin routes for job referrals
router.get("/admin/all", isAdmin, getAdminJobReferrals);            // GET /api/jobs/admin/all
router.put("/admin/:id", isAdmin, updateJobReferralStatus);        // PUT /api/jobs/admin/:id (archive/flag)

// Generic routes for job referrals
router.get("/", getJobReferrals);                         // GET /api/jobs or /api/jobs?studentId=1
router.post("/", isAlumni, createJobReferral);                      // POST /api/jobs (create job referral)

// Legacy job endpoints (basic jobs table - not for job referrals)
router.get("/legacy/all", getJobs);
router.post("/legacy", isAlumni, createJob);
router.put("/legacy/:id", isAlumni, updateJob);
router.delete("/legacy/:id", isAdmin, deleteJob);

export default router;

