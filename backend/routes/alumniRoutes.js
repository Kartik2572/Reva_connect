import express from "express";
import {
  getAlumni,
  getAlumnusById,
  createAlumnus,
  updateAlumnus,
  deleteAlumnus
} from "../controllers/alumniController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAlumni);
router.get("/:id", getAlumnusById);
router.post("/", createAlumnus);
router.put("/:id", verifyToken, updateAlumnus);
router.delete("/:id", verifyToken, deleteAlumnus);

export default router;

