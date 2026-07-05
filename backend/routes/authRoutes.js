import express from "express";
import { registerUser, loginUser, updateUserProfile, changePassword, forgotPassword, verifyOtp, resetPassword } from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// PUT /api/auth/profile
router.put("/profile", verifyToken, updateUserProfile);

// PUT /api/auth/change-password
router.put("/change-password", verifyToken, changePassword);

// POST /api/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// POST /api/auth/verify-otp
router.post("/verify-otp", verifyOtp);

// POST /api/auth/reset-password
router.post("/reset-password", resetPassword);

export default router;
