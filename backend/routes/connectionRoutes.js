import express from "express";
import {
  getAllStudents,
  getConnectionStatus,
  getMyConnections,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getPendingRequests
} from "../controllers/connectionController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/connections/students - Get all students (for connection suggestions)
router.get("/students", verifyToken, getAllStudents);

// GET /api/connections/status/:userId - Get connection status with a specific user
router.get("/status/:userId", verifyToken, getConnectionStatus);

// GET /api/connections/my - Get all connections for current user
router.get("/my", verifyToken, getMyConnections);

// GET /api/connections/pending - Get pending connection requests
router.get("/pending", verifyToken, getPendingRequests);

// POST /api/connections - Send a connection request
router.post("/", verifyToken, sendConnectionRequest);

// PUT /api/connections/accept/:connectionId - Accept a connection request
router.put("/accept/:connectionId", verifyToken, acceptConnectionRequest);

// PUT /api/connections/reject/:connectionId - Reject a connection request
router.put("/reject/:connectionId", verifyToken, rejectConnectionRequest);

export default router;