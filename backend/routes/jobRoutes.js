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

const router = express.Router();

// Specific routes first (must come before generic routes)
router.get("/applied/:studentId", getJobApplicationsForStudent); // GET /api/jobs/applied/:studentId
router.post("/apply", createJobApplication);              // POST /api/jobs/apply

// Admin routes for job referrals
router.get("/admin/all", getAdminJobReferrals);            // GET /api/jobs/admin/all
router.put("/admin/:id", updateJobReferralStatus);        // PUT /api/jobs/admin/:id (archive/flag)

// Generic routes for job referrals
router.get("/", getJobReferrals);                         // GET /api/jobs or /api/jobs?studentId=1
router.post("/", createJobReferral);                      // POST /api/jobs (create job referral)

// Legacy job endpoints (basic jobs table - not for job referrals)
router.get("/legacy/all", getJobs);
router.post("/legacy", createJob);
router.put("/legacy/:id", updateJob);
router.delete("/legacy/:id", deleteJob);

export default router;

