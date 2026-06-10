import express from "express";
import multer from "multer";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

// Analyze uploaded resumes
router.post("/analyze", upload.array("resumes"), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No resumes uploaded",
      });
    }

    const results = req.files.map((file) => ({
      fileName: file.originalname,
      status: "success",
      extractedInfo: {
        name: "",
        email: "",
        phone: "",
        location: "",
        education: "",
        university: "",
        currentRole: "",
        totalYearsExperience: "",
        skills: [],
      },
    }));

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Calculate ATS Score
// router.post("/single", async (req, res) => {
//   try {
//     const { resumeText, jobDescription } = req.body;

//     if (!resumeText || !jobDescription) {
//       return res.status(400).json({
//         success: false,
//         error: "Resume text and Job description are required",
//       });
//     }

//     const result = {
//       matchPercentage: 85,

//       atsScore: {
//         overall: 85,
//         skillsAlignment: 80,
//         experienceRelevance: 90,
//       },

//       skillsAnalysis: {
//         matchingSkills: ["React", "Node.js", "MongoDB", "JavaScript"],
//         missingSkills: [],
//       },

//       experienceAnalysis: {
//         totalYears: 2,
//         experienceMatch: "good",
//       },

//       hiringRecommendation: "hire",
//     };

//     res.json({
//       success: true,
//       data: result,
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       success: false,
//       error: error.message,
//     });
//   }
// });
router.post("/single", async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: "Resume text and Job description are required",
      });
    }

    // Convert to lowercase
    const resume = resumeText.toLowerCase();
    const jd = jobDescription.toLowerCase();

    // Common tech skills
    const skillsList = [
      "javascript",
      "react",
      "node.js",
      "express",
      "mongodb",
      "mysql",
      "sql",
      "html",
      "css",
      "typescript",
      "java",
      "python",
      "aws",
      "docker",
      "git",
      "redux",
      "next.js",
      "angular",
      "vue",
      "c++",
      "c#",
      "ruby",
      "php",
      "swift",
      "kotlin",
      "flutter",
      "dart",
      "go",
      "rust",
      "scala",
      "hadoop",
      "spark",
      "kafka",
      "tensorflow",
      "pytorch",
      "nlp",
      "computer vision",
      "data analysis",
      "machine learning",
      "deep learning",
      "artificial intelligence",
      "devops",
      "ci/cd",
      "microservices",
      "rest",
      "graphql",
      "api development",
      "agile",
      "scrum",
      "kanban",
      "project management",
      "communication",
      "teamwork",
      "problem-solving",
      "critical thinking",
      "leadership",
      "time management",
      "adaptability",
      "creativity",
      "collaboration",
      "emotional intelligence",
      "conflict resolution",
      "decision making",
      "interpersonal skills",
      "presentation skills",
      "public speaking",
      "writing skills",
      "analytical skills",
      "organizational skills",
      "multitasking",
    ];

    // Extract JD skills
    const jdSkills = skillsList.filter((skill) => jd.includes(skill));

    // Matching skills
    const matchingSkills = jdSkills.filter((skill) => resume.includes(skill));

    // Missing skills
    const missingSkills = jdSkills.filter((skill) => !resume.includes(skill));

    // Skills Score (50%)
    const skillsScore =
      jdSkills.length > 0
        ? Math.round((matchingSkills.length / jdSkills.length) * 100)
        : 0;

    // Keyword Match Score (30%)
    const jdWords = [...new Set(jd.split(/\W+/).filter(Boolean))];

    let matchedWords = 0;

    jdWords.forEach((word) => {
      if (resume.includes(word)) matchedWords++;
    });

    const keywordScore = Math.round((matchedWords / jdWords.length) * 100);

    // Experience Extraction
    const expRegex = /(\d+)\+?\s*(year|years)/gi;

    const resumeExpMatch = resume.match(expRegex);
    const jdExpMatch = jd.match(expRegex);

    const resumeYears = resumeExpMatch ? parseInt(resumeExpMatch[0]) : 0;

    const requiredYears = jdExpMatch ? parseInt(jdExpMatch[0]) : 0;

    let experienceScore = 100;

    if (requiredYears > 0) {
      experienceScore = Math.min(
        100,
        Math.round((resumeYears / requiredYears) * 100),
      );
    }

    // Final ATS Score
    const atsScore = Math.round(
      skillsScore * 0.5 + keywordScore * 0.3 + experienceScore * 0.2,
    );

    const result = {
      matchPercentage: atsScore,

      atsScore: {
        overall: atsScore,
        skillsAlignment: skillsScore,
        keywordMatch: keywordScore,
        experienceRelevance: experienceScore,
      },

      skillsAnalysis: {
        matchingSkills,
        missingSkills,
      },

      experienceAnalysis: {
        totalYears: resumeYears,
        requiredYears,
        experienceMatch:
          experienceScore >= 80
            ? "excellent"
            : experienceScore >= 60
              ? "good"
              : "low",
      },

      hiringRecommendation:
        atsScore >= 80 ? "hire" : atsScore >= 60 ? "consider" : "reject",
    };

    res.json({
      success: true,
      data: result,
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
