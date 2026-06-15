import express from "express";
import { authenticateToken } from "../middleware/auth.js";
import JobApplication from "../models/JobApplication.js";
import User from "../models/User.js";
import JobRole from "../models/JobRole.js";
import Interview from "../models/Interview.js";
import CandidateProfile from "../models/CandidateProfile.js";
import {
  extractExperienceYears,
  isCandidateFresher,
  generateMockPhone,
  generateNoticePeriod,
  extractCurrentCompany,
  generateTotalExperience,
  generateRelevantExperience,
  generateDegree,
  generateUniversity,
  generateGraduationYear,
  generateGPA,
  generateABCId,
  getRandomAvatar,
} from "../utils/helpers.js";

const router = express.Router();

// Get all candidates for admin view
router.get("/candidates", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin role required.",
      });
    }

    const {
      search,
      skills,
      experience,
      location,
      company,
      page = 1,
      limit = 50,
    } = req.query;

    // Build search filter for CandidateProfile
    const filter = {};

    if (search) {
      filter.$or = [
        { "personalInfo.firstName": { $regex: search, $options: "i" } },
        { "personalInfo.lastName": { $regex: search, $options: "i" } },
        { "personalInfo.email": { $regex: search, $options: "i" } },
        { "professionalInfo.currentRole": { $regex: search, $options: "i" } },
        {
          "professionalInfo.currentCompany": { $regex: search, $options: "i" },
        },
      ];
    }

    if (skills) {
      const skillsArray = skills.split(",").map((s) => s.trim());
      filter["skillsAndCertifications.technicalSkills.skillName"] = {
        $in: skillsArray,
      };
    }

    if (location) {
      filter["personalInfo.address.city"] = { $regex: location, $options: "i" };
    }

    if (experience) {
      filter["professionalInfo.totalExperience"] = {
        $regex: experience,
        $options: "i",
      };
    }

    if (company) {
      filter["professionalInfo.currentCompany"] = {
        $regex: company,
        $options: "i",
      };
    }

    // Fetch candidate profiles with complete data
    const candidateProfiles = await CandidateProfile.find(filter)
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Transform the data to match frontend expectations with all profile fields
    const transformedCandidates = candidateProfiles.map((profile) => {
      return {
        _id: profile._id,
        candidateId: profile.candidateId,
        name: profile.personalInfo
          ? `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`
          : "Unknown",
        firstName: profile.personalInfo?.firstName || "",
        lastName: profile.personalInfo?.lastName || "",
        email: profile.personalInfo?.email || "",
        phone: profile.personalInfo?.phone || "",
        mobile: profile.personalInfo?.phone || "",
        alternatePhone: profile.personalInfo?.alternatePhone || "",
        dateOfBirth: profile.personalInfo?.dateOfBirth || "",
        gender: profile.personalInfo?.gender || "",
        position: profile.professionalInfo?.currentRole || "Not specified",
        currentDesignation: profile.professionalInfo?.currentRole || "",
        currentCompany: profile.professionalInfo?.currentCompany || "",
        location: profile.personalInfo?.address?.city || "",
        address: profile.personalInfo?.address || {},
        bio: profile.professionalInfo?.bio || "",
        summary: profile.professionalInfo?.bio || "",
        skills:
          profile.skillsAndCertifications?.technicalSkills?.map(
            (s) => s.skillName,
          ) || [],
        technicalSkills: profile.skillsAndCertifications?.technicalSkills || [],
        softSkills: profile.skillsAndCertifications?.softSkills || [],
        experienceYears: profile.professionalInfo?.totalExperience || "",
        totalExperience: profile.professionalInfo?.totalExperience || "",
        relevantExperience: profile.professionalInfo?.relevantExperience || "",
        isFresher:
          !profile.professionalInfo?.totalExperience ||
          profile.professionalInfo.totalExperience === "0" ||
          profile.professionalInfo.totalExperience.includes("0"),
        currentSalary: profile.professionalInfo?.currentSalary || "",
        expectedSalary: profile.professionalInfo?.expectedSalary || "",
        noticePeriod: profile.professionalInfo?.noticePeriod || "",
        availability: profile.professionalInfo?.availability || "",
        workAuthorization: profile.professionalInfo?.workAuthorization || "",

        // Education - Complete history
        educationHistory: profile.educationHistory || {},
        degree: profile.educationHistory?.graduation?.degree || "",
        university: profile.educationHistory?.graduation?.university || "",
        graduationYear:
          profile.educationHistory?.graduation?.yearOfPassing || "",
        gpa: profile.educationHistory?.graduation?.cgpa || "",
        academicDetails: {
          degree: profile.educationHistory?.graduation?.degree || "",
          university: profile.educationHistory?.graduation?.university || "",
          abcId: profile.educationHistory?.abcId || "",
          tenthGrade: profile.educationHistory?.tenthGrade || {},
          twelfthGrade: profile.educationHistory?.twelfthGrade || {},
          graduation: profile.educationHistory?.graduation || {},
          postGraduation: profile.educationHistory?.postGraduation || {},
        },

        // Work Experience
        workExperienceHistory: profile.workExperienceHistory || [],

        // References
        references: profile.references || [],

        // Social Links
        socialLinks: profile.socialLinks || {},
        linkedIn: profile.socialLinks?.linkedin || "",
        linkedin: profile.socialLinks?.linkedin || "",
        portfolio: profile.socialLinks?.portfolio || "",
        github: profile.socialLinks?.github || "",

        // Resume
        resume: profile.resume || null,

        // Certifications
        certifications:
          profile.skillsAndCertifications?.certifications
            ?.map((c) => (typeof c === "string" ? c : c.name))
            .filter(Boolean) || [],
        certificationsDetail:
          profile.skillsAndCertifications?.certifications || [],

        // Languages
        languages: profile.skillsAndCertifications?.languages || [],

        // Career Preferences
        careerPreferences: profile.careerPreferences || {},
        preferredLocation: profile.careerPreferences?.preferredLocations || [],
        workPreferences: profile.careerPreferences?.preferredWorkMode
          ? [profile.careerPreferences.preferredWorkMode]
          : profile.careerPreferences?.preferredJobTypes || [],

        // Profile Picture
        profilePicture: profile.personalInfo?.profilePictureUrl
          ? {
              fileUrl: profile.personalInfo.profilePictureUrl,
            }
          : null,

        // Background Check
        backgroundCheck: profile.backgroundCheck || null,

        // Hiring Details
        hiringDetails: profile.hiringDetails || null,

        // Metadata
        // status: "new",
        status: profile.status || "pending",
        appliedDate: profile.createdAt,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt || profile.lastUpdated,
        profileCompleteness: profile.profileCompleteness || 0,
        profileViews: profile.profileViews || 0,
        isActive: profile.isActive !== false,
        tags: profile.tags || [],
        notes: profile.notes || "",

        // Placeholder for ATS match score
        // atsMatch: 0,
        // matchScore: 0,
        atsMatch: profile.resume?.aiAnalysis?.atsScore || 0,
        matchScore: profile.resume?.aiAnalysis?.atsScore || 0,

        // Application source
        applicationSource: profile.source || "Direct Registration",

        // User who created this profile
        createdBy: profile.createdBy || null,
      };
    });

    const total = await CandidateProfile.countDocuments(filter);
    console.log(
      `📊 Fetched ${candidateProfiles.length} candidates from database (Total: ${total})`,
    );

    res.json({
      success: true,
      data: transformedCandidates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCandidates: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching candidates:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Confirm and add analyzed candidate to database
router.post("/confirm-candidate", authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin role required.",
      });
    }

    const candidateData = req.body;

    if (!candidateData.extractedInfo) {
      return res.status(400).json({
        success: false,
        error: "Candidate information is required",
      });
    }

    const { extractedInfo } = candidateData;

    // Check if user already exists
    let user = await User.findOne({ email: extractedInfo.email });

    if (!user) {
      // Create new user account for the candidate
      const tempPassword = Math.random().toString(36).slice(-8) + "Aa1!";

      user = new User({
        firstName:
          extractedInfo.firstName ||
          extractedInfo.name?.split(" ")[0] ||
          "Unknown",
        lastName:
          extractedInfo.lastName ||
          extractedInfo.name?.split(" ").slice(1).join(" ") ||
          "",
        email: extractedInfo.email,
        password: tempPassword,
        role: "applicant",
        profile: {
          phone: extractedInfo.phone || "",
          mobile: extractedInfo.phone || "",
          alternatePhone: extractedInfo.alternatePhone || "",
          dateOfBirth: extractedInfo.dateOfBirth || "",
          gender: extractedInfo.gender || "",
          currentDesignation: extractedInfo.currentRole || "",
          currentCompany: extractedInfo.currentCompany || "",
          totalExperience: extractedInfo.totalYearsExperience || "",
          relevantExperience: extractedInfo.relevantExperience || "",
          currentSalary: extractedInfo?.currentSalary || "",
          expectedSalary: extractedInfo?.expectedSalary || "",
          noticePeriod: extractedInfo?.noticePeriod || "",
          availability: extractedInfo?.availability || "",
          workAuthorization: extractedInfo?.workAuthorization || "",
          degree: extractedInfo.degree || extractedInfo.education || "",
          university: extractedInfo.university || "",
          graduationYear: extractedInfo.graduationYear || null,
          skills: extractedInfo.skills || [],
          bio: "",
          address: {
            city: extractedInfo.location || "",
            country: "India",
          },
        },
      });

      await user.save();
    }

    // Create or update candidate profile
    const candidateProfile = await CandidateProfile.findOneAndUpdate(
      { "personalInfo.email": extractedInfo.email },
      {
        personalInfo: {
          firstName:
            extractedInfo.firstName ||
            extractedInfo.name?.split(" ")[0] ||
            "Unknown",
          lastName:
            extractedInfo.lastName ||
            extractedInfo.name?.split(" ").slice(1).join(" ") ||
            "",
          email: extractedInfo.email,
          phone: extractedInfo.phone || "",
          alternatePhone: extractedInfo.alternatePhone || "",
          dateOfBirth: extractedInfo.dateOfBirth || "",
          profilePictureUrl: getRandomAvatar(),
          address: {
            street: "",
            city: extractedInfo.location || "",
            state: extractedInfo.state || "",
            postalCode: extractedInfo.postalCode || " ",
            country: "India",
          },
        },
        professionalInfo: {
          currentRole: extractedInfo.currentRole || "",
          currentCompany: extractedInfo.currentCompany || "",
          totalExperience: extractedInfo.totalYearsExperience || "",
          relevantExperience: extractedInfo.relevantExperience || "",
          expectedSalary: extractedInfo.expectedSalary || "",
          currentSalary: extractedInfo.currentSalary || "",
          noticePeriod: extractedInfo.noticePeriod || "",
          workAuthorization: extractedInfo.workAuthorization || "",
          bio: extractedInfo.bio || "",
          availability: extractedInfo.availability || "",
        },
        educationHistory: {
          graduation: {
            degree: extractedInfo.degree || extractedInfo.education || "",
            specialization: extractedInfo.specialization || "",
            university: extractedInfo.university || "",
            collegeName: extractedInfo.collegeName || "",
            yearOfPassing: extractedInfo.graduationYear || null,
            cgpa: extractedInfo.gpa || "",
            percentage: extractedInfo.percentage || "",
            grade: extractedInfo.grade || "",
            projects: extractedInfo.projects || [],
          },
        },
        skillsAndCertifications: {
          technicalSkills: (extractedInfo.skills || []).map((skill) => ({
            skillName: skill,
            proficiencyLevel: "intermediate",
            yearsOfExperience:
              extractExperienceYears(extractedInfo.totalYearsExperience) || 0,
          })),
          softSkills: [],
          certifications: (extractedInfo.certifications || []).map((cert) => ({
            certificationName: typeof cert === "string" ? cert : cert.name,
            issuingOrganization: cert.issuingOrganization || "",
            issueDate: extractedInfo.issueDate || "",
            expiryDate: extractedInfo.expiryDate || "",
            credentialId: extractedInfo.credentialId || "",
            credentialUrl: extractedInfo.credentialUrl || "",
          })),
          languages: (extractedInfo.languages || []).map((lang) => ({
            language: lang,
            proficiency: "fluent",
          })),
        },
        socialLinks: {
          linkedIn: extractedInfo.linkedin || "",
          github: extractedInfo.github || "",
          portfolio: extractedInfo.portfolio || "",
        },
        source: "ATS Resume Analysis",
        createdBy: req.user._id,
      },
      { new: true, upsert: true, runValidators: true },
    );

    res.json({
      success: true,
      data: {
        user,
        candidateProfile,
      },
      message: "Candidate added to database successfully",
    });
  } catch (error) {
    console.error("Error confirming candidate:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get single candidate by ID
router.get("/candidates/:candidateId", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Access denied. Admin role required.",
      });
    }

    // Fetch the full CandidateProfile by its _id (which serves as candidateId in this context)
    const candidateProfile = await CandidateProfile.findById(
      req.params.candidateId,
    );

    if (!candidateProfile) {
      return res.status(404).json({
        success: false,
        error: "Candidate profile not found",
      });
    }

    // Transform the data to match frontend expectations (similar to the admin view but for a single candidate)
    const transformedCandidate = {
      _id: candidateProfile._id,
      candidateId: candidateProfile._id,
      name: candidateProfile.personalInfo
        ? `${candidateProfile.personalInfo.firstName} ${candidateProfile.personalInfo.lastName}`
        : "Unknown",
      firstName: candidateProfile.personalInfo?.firstName || "",
      lastName: candidateProfile.personalInfo?.lastName || "",
      email: candidateProfile.personalInfo?.email || "",
      phone: candidateProfile.personalInfo?.phone || "",
      position:
        candidateProfile.professionalInfo?.currentRole || "Not specified",
      location: candidateProfile.personalInfo?.address?.city || "",
      skills:
        candidateProfile.skillsAndCertifications?.technicalSkills.map(
          (s) => s.skillName,
        ) || [],
      status: "Profile Complete", // Default status
      matchScore: candidateProfile.matchScore || 0, // Placeholder, can be calculated if needed
      aiAnalysis: candidateProfile.aiAnalysis || {}, // Placeholder
      resume: candidateProfile.resume || {},
      createdAt: candidateProfile.createdAt,
      // Include other detailed fields from candidateProfile as needed for a single view
      mobile:
        candidateProfile.professionalInfo?.mobile ||
        candidateProfile.personalInfo?.phone ||
        "",
      alternatePhone: candidateProfile.personalInfo?.alternatePhone || "",
      currentDesignation: candidateProfile.professionalInfo?.currentRole || "",
      currentCompany: candidateProfile.professionalInfo?.currentCompany || "",
      address: candidateProfile.personalInfo?.address || {},
      bio: candidateProfile.professionalInfo?.bio || "",
      summary: candidateProfile.professionalInfo?.bio || "",
      experienceYears: candidateProfile.professionalInfo?.totalExperience || 0,
      totalExperience: candidateProfile.professionalInfo?.totalExperience || "",
      relevantExperience:
        candidateProfile.professionalInfo?.relevantExperience || "",
      isFresher:
        !candidateProfile.professionalInfo?.totalExperience ||
        parseFloat(candidateProfile.professionalInfo?.totalExperience) === 0,
      education: candidateProfile.educationHistory?.graduation?.degree || "",
      degree: candidateProfile.educationHistory?.graduation?.degree || "",
      university:
        candidateProfile.educationHistory?.graduation?.university || "",
      graduationYear:
        candidateProfile.educationHistory?.graduation?.yearOfPassing || "",
      gpa: candidateProfile.educationHistory?.graduation?.cgpa || "",
      academicDetails: {
        degree: candidateProfile.educationHistory?.graduation?.degree || "",
        university:
          candidateProfile.educationHistory?.graduation?.university || "",
        graduationYear:
          candidateProfile.educationHistory?.graduation?.yearOfPassing || "",
        gpa: candidateProfile.educationHistory?.graduation?.cgpa || "",
        abcId: candidateProfile.educationHistory?.graduation?.abcId || "",
        additionalEducation:
          candidateProfile.educationHistory?.additionalEducation || "",
      },
      currentSalary: candidateProfile.professionalInfo?.currentSalary || "",
      expectedSalary: candidateProfile.professionalInfo?.expectedSalary || "",
      noticePeriod: candidateProfile.professionalInfo?.noticePeriod || "",
      workAuthorization:
        candidateProfile.professionalInfo?.workAuthorization || "",
      availability: candidateProfile.professionalInfo?.availability || "",
      preferredLocation:
        candidateProfile.workPreferences?.preferredLocation || [],
      workPreferences: candidateProfile.workPreferences?.workPreferences || [],
      languages:
        candidateProfile.skillsAndCertifications?.languages.map(
          (l) => l.language,
        ) || [],
      certifications:
        candidateProfile.skillsAndCertifications?.certifications.map(
          (c) => c.certificationName,
        ) || [],
      linkedIn: candidateProfile.socialLinks?.linkedIn || "",
      linkedin: candidateProfile.socialLinks?.linkedIn || "",
      portfolio: candidateProfile.socialLinks?.portfolio || "",
      github: candidateProfile.socialLinks?.github || "",
      dateOfBirth: candidateProfile.personalInfo?.dateOfBirth || "",
      gender: candidateProfile.personalInfo?.gender || "",
      profilePicture: candidateProfile.personalInfo?.profilePictureUrl || {},
      applicationSource: candidateProfile.source || "ATS Resume Analysis",
      matchScore: candidateProfile.matchScore || 0,
      atsMatch: candidateProfile.atsMatch || 0,
      strengths: candidateProfile.strengths || [],
      concerns: candidateProfile.concerns || [],
      aiAnalysis: candidateProfile.aiAnalysis || {},
      references: candidateProfile.references || [],
      hiringDetails: {},
      jobId: candidateProfile.jobId || null,
      coverLetter: candidateProfile.coverLetter || "",
      adminNotes: "",
      interviewDetails: {},
      statusHistory: [],
      updatedAt: candidateProfile.updatedAt,
    };

    res.json({
      success: true,
      data: transformedCandidate,
    });
  } catch (error) {
    console.error("Error fetching candidate:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Update application status
router.put("/applications/:id/:action", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, error: "Access denied" });
    }

    const { id, action } = req.params;
    const { notes } = req.body;

    let newStatus;
    switch (action) {
      case "review":
        newStatus = "reviewing";
        break;
      case "shortlist":
        newStatus = "shortlisted";
        break;
      case "reject":
        newStatus = "rejected";
        break;
      case "schedule-interview":
        newStatus = "interview-scheduled";
        break;
      case "hire":
        newStatus = "hired";
        break;
      default:
        return res
          .status(400)
          .json({ success: false, error: "Invalid action" });
    }

    const application = await JobApplication.findByIdAndUpdate(
      id,
      {
        status: newStatus,
        adminNotes: notes || "",
        updatedAt: Date.now(),
      },
      { new: true },
    )
      .populate("applicant", "firstName lastName email")
      .populate("job", "title");

    if (!application) {
      return res
        .status(404)
        .json({ success: false, error: "Application not found" });
    }

    // Update job statistics
    await updateJobStatistics(application.job._id);

    res.json({ success: true, data: application });
  } catch (error) {
    console.error("Error updating application:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to update job statistics
async function updateJobStatistics(jobId) {
  try {
    const stats = await JobApplication.aggregate([
      { $match: { job: jobId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const statsMap = {};
    stats.forEach((stat) => {
      statsMap[stat._id] = stat.count;
    });

    await JobRole.findByIdAndUpdate(jobId, {
      applications:
        (statsMap.pending || 0) +
        (statsMap.reviewing || 0) +
        (statsMap.shortlisted || 0) +
        (statsMap.Interview || 0) +
        (statsMap.hired || 0) +
        (statsMap.rejected || 0),
      shortlisted: statsMap.shortlisted || 0,
      interviewed: statsMap["interview-scheduled"] || 0,
      hired: statsMap.hired || 0,
    });
  } catch (error) {
    console.error("Error updating job statistics:", error);
  }
}
router.get("/job-applications/:jobId", async (req, res) => {
  try {
    const applications = await JobApplication.find({
      job: req.params.jobId,
    })
      .populate("applicant", "firstName lastName email profile")
      .populate("job", "title department jobId");

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
