import express from "express";
import { registerUser, loginUser, updateUserProfile } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// PUT /api/auth/profile
router.put("/profile", verifyToken, updateUserProfile);

export default router;
