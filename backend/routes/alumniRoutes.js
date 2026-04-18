import express from "express";
import {
  getAlumni,
  createAlumnus,
  updateAlumnus,
  deleteAlumnus
} from "../controllers/alumniController.js";

const router = express.Router();

router.get("/", getAlumni);
router.post("/", createAlumnus);
router.put("/:id", updateAlumnus);
router.delete("/:id", deleteAlumnus);

export default router;

