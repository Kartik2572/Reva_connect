import express from "express";
import { createMentorshipRequest, getMentorshipRequests, getMentorshipRequestsForStudent, getMentorshipRequestsForAlumnus, updateMentorshipRequest, deleteMentorshipRequest } from "../controllers/mentorshipController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(verifyToken);

// POST /api/mentorship/request
router.post("/request", createMentorshipRequest);

// GET /api/mentorship
router.get("/", getMentorshipRequests);

// GET /api/mentorship/student/:studentId
router.get("/student/:studentId", getMentorshipRequestsForStudent);

// GET /api/mentorship/alumnus/:alumnusId
router.get("/alumnus/:alumnusId", getMentorshipRequestsForAlumnus);

// PUT /api/mentorship/:id
router.put("/:id", updateMentorshipRequest);

// DELETE /api/mentorship/:id
router.delete("/:id", deleteMentorshipRequest);

export default router;

