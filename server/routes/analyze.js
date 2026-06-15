import express from "express";
import multer from "multer";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
});

// Analyze uploaded resumes
// router.post("/analyze", upload.array("resumes"), async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "No resumes uploaded",
//       });
//     }

//     const results = req.files.map((file) => ({
//       fileName: file.originalname,
//       status: "success",
//       extractedInfo: {
//         name: "",
//         email: "",
//         phone: "",
//         location: "",
//         education: "",
//         university: "",
//         currentRole: "",
//         totalYearsExperience: "",
//         skills: [],
//       },
//     }));

//     res.json({
//       success: true,
//       results,
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// });
import pdfParse from "pdf-parse";

router.post("/analyze", upload.array("resumes"), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: "No resumes uploaded",
      });
    }

    const results = [];

    for (const file of req.files) {
      try {
        // For memoryStorage()
        const pdfData = await pdfParse(file.buffer);

        const text = pdfData.text;

        console.log("Resume Text:", text);

        const email =
          text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";

        const phone = text.match(/(\+91[\s-]?)?[6-9]\d{9}/)?.[0] || "";

        const lines = text
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean);

        const name = lines[0] || "";
        const location = lines[1] || "";
        const education =
          lines.find((line) => /bachelor|master|ph\.?d/i.test(line)) || "";
        const university =
          lines.find((line) => /university|institute|college/i.test(line)) ||
          "";
        const currentRole =
          lines.find((line) =>
            /software engineer|developer|programmer|analyst/i.test(line),
          ) || "";
        const experienceMatches = text.match(/(\d+)\+?\s*(year|years)/gi) || [];
        const totalYearsExperience =
          experienceMatches.length > 0 ? experienceMatches[0] : "";

        const skillKeywords = [
          "JavaScript",
          "React",
          "Node.js",
          "Express",
          "MongoDB",
          "MySQL",
          "HTML",
          "CSS",
          "Bootstrap",
          "Tailwind",
          "TypeScript",
          "Angular",
          "Next.js",
          "Python",
          "Java",
          "C#",
          ".NET",
          "Git",
        ];

        const skills = skillKeywords.filter((skill) =>
          text.toLowerCase().includes(skill.toLowerCase()),
        );

        results.push({
          fileName: file.originalname,
          status: "success",
          extractedInfo: {
            name,
            email,
            phone,
            location,
            education,
            university,
            currentRole,
            totalYearsExperience,
            skills,
          },
        });
      } catch (err) {
        results.push({
          fileName: file.originalname,
          status: "failed",
          error: err.message,
        });
      }
    }

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Calculate ATS Score

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
