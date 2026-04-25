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

router.use(verifyToken);

router.get("/", getAlumni);
router.get("/:id", getAlumnusById);
router.post("/", createAlumnus);
router.put("/:id", updateAlumnus);
router.delete("/:id", deleteAlumnus);

export default router;

