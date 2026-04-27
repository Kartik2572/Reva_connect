import express from "express";
import multer from "multer";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  getEvents,
  getEventsByHost,
  getOtherAlumniHostedEvents,
  getUpcomingAlumniEvents,
  registerForEvent,
  getEventRegistrations,
  getUserRegistrations,
  createEvent,
  updateEvent,
  deleteEvent
} from "../controllers/eventController.js";
import { verifyToken, isAlumni } from "../middleware/authMiddleware.js";
import { validateEvent } from "../middleware/validationMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadDir = join(__dirname, "../uploads");

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const suffix = Date.now();
    const sanitized = file.originalname.replace(/\s+/g, "_");
    cb(null, `${suffix}-${sanitized}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, and PNG attachments are allowed."));
    }
  }
});

const router = express.Router();

router.use(verifyToken);

router.get("/", getEvents);
router.get("/upcoming-alumni", getUpcomingAlumniEvents);
router.get("/other-alumni/:host", getOtherAlumniHostedEvents);
router.post("/register", registerForEvent);
router.get("/user/registrations", getUserRegistrations);
router.post("/", isAlumni, upload.single("attachment"), validateEvent, createEvent);
router.get("/:id/registrations", getEventRegistrations);
router.put("/:id", isAlumni, updateEvent);
router.delete("/:id", isAlumni, deleteEvent);
router.get("/host/:host", getEventsByHost);

export default router;

