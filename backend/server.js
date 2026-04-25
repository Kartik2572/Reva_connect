import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import alumniRoutes from "./routes/alumniRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import mentorshipRoutes from "./routes/mentorshipRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import connectionRoutes from "./routes/connectionRoutes.js";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Basic middleware configuration
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // to allow images/uploads across origins

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // Limit each IP to 150 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests, please try again later." }
});
app.use("/api", apiLimiter);

app.use("/uploads", express.static(join(__dirname, "uploads")));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "RevaConnect API" });
});

// Mount feature routes
app.use("/api/auth", authRoutes);
app.use("/api/alumni", alumniRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/connections", connectionRoutes);

// 404 handler for unknown API routes
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`RevaConnect API running on http://localhost:${PORT}`);
});

