
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { GeminiService } from '../services/geminiService.js';
import { config } from '../config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Multer configuration for this router
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Health check
router.get("/health", (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: config.app.environment,
    database: dbStatus,
  });
});

// System status
router.get("/status", (req, res) => {
  try {
    const apiKeyStatus = GeminiService.getApiKeyStatus();
    const envStatus = GeminiService.validateEnvironment();
    const serviceHealth = GeminiService.getServiceHealth();

    res.json({
      success: true,
      data: {
        apiKey: apiKeyStatus,
        environment: envStatus,
        service: serviceHealth,
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: config.app.version,
          environment: config.app.environment,
        },
        database: {
          status: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
          name: mongoose.connection.name,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Test Gemini
router.post("/test-gemini", async (req, res) => {
  try {
    const testText = "This is a test resume with JavaScript and React skills.";
    const testJob = "We are looking for a frontend developer with React experience.";
    const result = await GeminiService.analyzeResume(testText, testJob);
    res.json({
      success: true,
      message: "Gemini API is working correctly",
      testResult: {
        matchPercentage: result.matchPercentage,
        status: "operational",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Gemini API test failed", error: error.message });
  }
});

// Analyze resumes (Compatible with FormData)
router.post("/analyze", upload.array("resumes"), async (req, res) => {
  try {
    const { jobDescription } = req.body;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No resume files uploaded" });
    }
    if (!jobDescription || jobDescription.trim() === "") {
      return res.status(400).json({ success: false, message: "Job description is required" });
    }

    const resumes = await Promise.all(
      req.files.map(async (file) => {
        let text = "";
        try {
          if (file.mimetype === "application/pdf") {
            const pdf = (await import("pdf-parse")).default;
            const pdfData = await pdf(file.buffer);
            text = pdfData.text;
          } else if (file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
            const mammoth = (await import("mammoth")).default;
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            text = result.value;
          } else {
            text = file.buffer.toString("utf-8");
          }
        } catch (parseError) {
          console.error(`Error parsing ${file.originalname}:`, parseError);
          text = `Error extracting text from ${file.originalname}: ${parseError.message}`;
        }
        return { fileName: file.originalname, text: text, size: file.size };
      })
    );

    const results = await GeminiService.batchAnalyzeResumes(resumes, jobDescription);
    res.json({ success: true, results: results.results, summary: results.summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Analysis failed" });
  }
});

// File upload
router.post("/upload", upload.array("files"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: "No files uploaded" });
    }
    const processedFiles = req.files.map((file) => ({
      fileName: file.originalname,
      size: file.size,
      type: file.mimetype,
      text: file.buffer.toString("utf-8"),
    }));
    res.json({ success: true, data: { files: processedFiles, count: processedFiles.length } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Legacy job description endpoints
let currentJobDescription = "";

router.get("/job-description", (req, res) => {
  res.json({
    success: true,
    data: { description: currentJobDescription },
  });
});

router.post("/job-description", (req, res) => {
  try {
    const { description } = req.body;
    if (!description || description.trim() === "") {
      return res.status(400).json({ success: false, error: "Job description is required" });
    }
    currentJobDescription = description;
    res.json({ success: true, data: { description: currentJobDescription } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
