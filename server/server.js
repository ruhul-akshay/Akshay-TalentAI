import express from "express";
import cors from "cors";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import fs from "fs";
import { config } from "./config/environment.js";
import connectDB from "./config/database.js";

// Import routes
import authRoutes from "./routes/auth.js";
import jobSeekerRoutes from "./routes/jobSeeker.js";
import jobRoutes from "./routes/jobs.js";
import candidatesRoutes from "./routes/candidates.js";
import interviewRoutes from "./routes/interview.js";
import adminRoutes from "./routes/admin.js";
import systemRoutes from "./routes/system.js";
import dashboardRoutes from "./routes/dashboard.js";
import analyzeRoutes from "./routes/analyze.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files from uploads directory
const uploadsPath = path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));

// Ensure upload directories exist
const uploadDirs = [
  uploadsPath,
  path.join(uploadsPath, "resumes"),
  path.join(uploadsPath, "profile-pictures"),
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/candidates", candidatesRoutes);
app.use("/api/job-seeker", jobSeekerRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);
app.use("/api/analyze", analyzeRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ message: "ATS Backend API is running", version: "1.1.0" });
});

// Error handling middleware

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.originalUrl,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
