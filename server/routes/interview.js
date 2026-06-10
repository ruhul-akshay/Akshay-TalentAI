// routes/interviewRoutes.js

import express from "express";
import Interview from "../models/Interview.js";
import Application from "../models/JobApplication.js";

const router = express.Router();

router.post("/create", async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const { applicationId, scheduledDate, meetingLink } = req.body;

    const application = await Application.findById(applicationId);

    if (!application) {
      return res.status(404).json({
        message: "Application not found",
      });
    }

    // const interview = await Interview.create({
    //   applicant: application.applicant,
    //   application: application._id,
    //   scheduledDate,
    //   meetingLink,
    //   status: "scheduled",
    // });
    const interview = await Interview.create({
      applicant: application.applicant,
      application: application._id,
      job: application.job,
      scheduledDate,
      meetingLink,
      status: "scheduled",
    });

    application.status = "interview";

    await application.save();

    res.status(201).json({
      success: true,
      message: "Interview Scheduled",
      data: interview,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const interviews = await Interview.find({
      applicant: req.params.userId,
    })
      .populate("application")
      .sort({ scheduledDate: -1 });

    res.json(interviews);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

export default router;
