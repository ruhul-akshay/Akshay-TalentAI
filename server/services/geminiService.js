import { config } from "../config/environment.js";

const {
  apiKey: GEMINI_API_KEY,
  apiUrl: GEMINI_API_URL,
  rateLimitDelay,
} = config.gemini;

export class GeminiService {
  static validateApiKey() {
    if (!GEMINI_API_KEY || GEMINI_API_KEY.trim() === "") {
      throw new Error(
        "Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.",
      );
    }
    return true;
  }

  static validateEnvironment() {
    const errors = [];

    if (!GEMINI_API_KEY) {
      errors.push("GEMINI_API_KEY is not configured");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static async analyzeResume(resumeText, jobDescription, retryCount = 0) {
    this.validateApiKey();

    if (!resumeText || resumeText.trim() === "") {
      throw new Error("Resume text is required for analysis");
    }

    if (!jobDescription || jobDescription.trim() === "") {
      throw new Error("Job description is required for analysis");
    }

    const prompt = `
You are an advanced ATS (Applicant Tracking System) analyzer. Perform a comprehensive resume analysis against the job description with focus on keyword matching, semantic understanding, ATS compatibility, and detailed information extraction.

JOB DESCRIPTION:
${jobDescription}

RESUME:
${resumeText}

ANALYSIS REQUIREMENTS:
1. Extract detailed personal and professional information
2. Keyword Matching: Identify exact matches, synonyms, and related terms
3. ATS Compatibility: Evaluate resume format and structure for ATS parsing
4. Skills Assessment: Technical and soft skills alignment
5. Experience Evaluation: Years, relevance, and progression
6. Education Matching: Degree relevance and requirements fulfillment
7. Cultural Fit Indicators: Leadership, teamwork, communication
8. Gap Analysis: Missing critical requirements
9. Interview Readiness: Overall candidate preparedness

Respond in this exact JSON format:
{
  "matchPercentage": number,
  "extractedInfo": {
    "name": "Full Name",
    "firstName": "First Name",
    "lastName": "Last Name", 
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State",
    "currentRole": "Current Job Title",
    "currentCompany": "Current Company",
    "totalYearsExperience": "Total years of experience",
    "relevantExperience": "Years of relevant experience",
    "education": "Highest degree",
    "degree": "Degree name",
    "university": "University name",
    "graduationYear": year,
    "skills": ["skill1", "skill2"],
    "certifications": ["cert1", "cert2"],
    "languages": ["language1", "language2"],
    "linkedin": "LinkedIn URL",
    "github": "GitHub URL",
    "portfolio": "Portfolio or Website URL"
  },
  "atsScore": {
    "overall": number,
    "keywordMatch": number,
    "skillsAlignment": number,
    "experienceRelevance": number,
    "educationFit": number,
    "formatCompatibility": number
  },
  "keywordAnalysis": {
    "totalJobKeywords": number,
    "matchedKeywords": ["keyword1", "keyword2"],
    "missingKeywords": ["keyword1", "keyword2"],
    "synonymMatches": [{"job": "keyword", "resume": "synonym"}],
    "keywordDensity": number
  },
  "skillsAnalysis": {
    "matchingSkills": ["skill1", "skill2"],
    "missingCriticalSkills": ["skill1", "skill2"],
    "additionalSkills": ["skill1", "skill2"],
    "skillLevel": "entry/mid/senior/expert",
    "technicalSkillsScore": number,
    "softSkillsScore": number
  },
  "experienceAnalysis": {
    "totalYears": number,
    "relevantYears": number,
    "experienceMatch": "entry/mid/senior/expert",
    "careerProgression": "excellent/good/average/poor",
    "industryRelevance": "high/medium/low",
    "leadershipExperience": boolean
  },
  "educationAnalysis": {
    "degreeMatch": "exact/related/unrelated",
    "educationRelevance": "high/medium/low",
    "certifications": ["cert1", "cert2"],
    "continuousLearning": boolean
  },
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "redFlags": ["flag1", "flag2"],
  "recommendations": {
    "forCandidate": ["rec1", "rec2"],
    "forRecruiter": ["rec1", "rec2"]
  },
  "interviewQuestions": ["question1", "question2"],
  "salaryExpectation": "below/within/above budget",
  "overallAssessment": "detailed assessment",
  "interviewReadiness": "ready/needs-preparation/not-ready",
  "hiringRecommendation": "strong-hire/hire/maybe/no-hire",
  "confidenceScore": number
}
`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData?.error?.message ||
          `HTTP ${response.status}: ${response.statusText}`;

        // Check if it's an overload error and retry with exponential backoff
        if (
          response.status === 429 ||
          response.status === 503 ||
          errorMessage.includes("overloaded")
        ) {
          if (retryCount < 3) {
            const delay = Math.pow(2, retryCount) * 2000 + Math.random() * 1000; // 2s, 4s, 8s + jitter
            console.log(
              `API overloaded, retrying in ${delay}ms... (attempt ${retryCount + 1}/3)`,
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            return this.analyzeResume(
              resumeText,
              jobDescription,
              retryCount + 1,
            );
          }
        }

        throw new Error(`Gemini API error: ${errorMessage}`);
      }

      const data = await response.json();

      if (
        !data.candidates ||
        !data.candidates[0] ||
        !data.candidates[0].content
      ) {
        throw new Error("Invalid response format from Gemini API");
      }

      const responseText = data.candidates[0].content.parts[0].text;

      // Extract and parse JSON from response
      // const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const cleanText = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedResult = JSON.parse(jsonMatch[0]);

          // Validate and enhance the response with dynamic scoring
          const enhancedResult = {
            matchPercentage: Math.min(
              100,
              Math.max(0, parsedResult.matchPercentage || 0),
            ),
            extractedInfo: {
              name: parsedResult.extractedInfo?.name || "Unknown",
              firstName:
                parsedResult.extractedInfo?.firstName ||
                parsedResult.extractedInfo?.name?.split(" ")[0] ||
                "Unknown",
              lastName:
                parsedResult.extractedInfo?.lastName ||
                parsedResult.extractedInfo?.name
                  ?.split(" ")
                  .slice(1)
                  .join(" ") ||
                "",
              email: parsedResult.extractedInfo?.email || "",
              phone: parsedResult.extractedInfo?.phone || "",
              location: parsedResult.extractedInfo?.location || "",
              currentRole: parsedResult.extractedInfo?.currentRole || "",
              currentCompany: parsedResult.extractedInfo?.currentCompany || "",
              totalYearsExperience:
                parsedResult.extractedInfo?.totalYearsExperience || "",
              relevantExperience:
                parsedResult.extractedInfo?.relevantExperience || "",
              education: parsedResult.extractedInfo?.education || "",
              degree: parsedResult.extractedInfo?.degree || "",
              university: parsedResult.extractedInfo?.university || "",
              graduationYear:
                parsedResult.extractedInfo?.graduationYear || null,
              skills: Array.isArray(parsedResult.extractedInfo?.skills)
                ? parsedResult.extractedInfo.skills
                : [],
              certifications: Array.isArray(
                parsedResult.extractedInfo?.certifications,
              )
                ? parsedResult.extractedInfo.certifications
                : [],
              languages: Array.isArray(parsedResult.extractedInfo?.languages)
                ? parsedResult.extractedInfo.languages
                : [],
              linkedin: parsedResult.extractedInfo?.linkedin || "",
              github: parsedResult.extractedInfo?.github || "",
              portfolio: parsedResult.extractedInfo?.portfolio || "",
            },
            atsScore: {
              overall: Math.min(
                100,
                Math.max(
                  0,
                  parsedResult.atsScore?.overall ||
                    parsedResult.matchPercentage ||
                    0,
                ),
              ),
              keywordMatch: Math.min(
                100,
                Math.max(0, parsedResult.atsScore?.keywordMatch || 0),
              ),
              skillsAlignment: Math.min(
                100,
                Math.max(0, parsedResult.atsScore?.skillsAlignment || 0),
              ),
              experienceRelevance: Math.min(
                100,
                Math.max(0, parsedResult.atsScore?.experienceRelevance || 0),
              ),
              educationFit: Math.min(
                100,
                Math.max(0, parsedResult.atsScore?.educationFit || 0),
              ),
              formatCompatibility: Math.min(
                100,
                Math.max(0, parsedResult.atsScore?.formatCompatibility || 85),
              ),
            },
            keywordAnalysis: {
              totalJobKeywords:
                parsedResult.keywordAnalysis?.totalJobKeywords || 0,
              matchedKeywords: Array.isArray(
                parsedResult.keywordAnalysis?.matchedKeywords,
              )
                ? parsedResult.keywordAnalysis.matchedKeywords
                : [],
              missingKeywords: Array.isArray(
                parsedResult.keywordAnalysis?.missingKeywords,
              )
                ? parsedResult.keywordAnalysis.missingKeywords
                : [],
              synonymMatches: Array.isArray(
                parsedResult.keywordAnalysis?.synonymMatches,
              )
                ? parsedResult.keywordAnalysis.synonymMatches
                : [],
              keywordDensity: Math.min(
                100,
                Math.max(0, parsedResult.keywordAnalysis?.keywordDensity || 0),
              ),
            },
            skillsAnalysis: {
              matchingSkills: Array.isArray(
                parsedResult.skillsAnalysis?.matchingSkills,
              )
                ? parsedResult.skillsAnalysis.matchingSkills
                : [],
              missingCriticalSkills: Array.isArray(
                parsedResult.skillsAnalysis?.missingCriticalSkills,
              )
                ? parsedResult.skillsAnalysis.missingCriticalSkills
                : [],
              additionalSkills: Array.isArray(
                parsedResult.skillsAnalysis?.additionalSkills,
              )
                ? parsedResult.skillsAnalysis.additionalSkills
                : [],
              skillLevel: parsedResult.skillsAnalysis?.skillLevel || "unknown",
              technicalSkillsScore: Math.min(
                100,
                Math.max(
                  0,
                  parsedResult.skillsAnalysis?.technicalSkillsScore || 0,
                ),
              ),
              softSkillsScore: Math.min(
                100,
                Math.max(0, parsedResult.skillsAnalysis?.softSkillsScore || 0),
              ),
            },
            experienceAnalysis: {
              totalYears: Math.max(
                0,
                parsedResult.experienceAnalysis?.totalYears || 0,
              ),
              relevantYears: Math.max(
                0,
                parsedResult.experienceAnalysis?.relevantYears || 0,
              ),
              experienceMatch:
                parsedResult.experienceAnalysis?.experienceMatch || "unknown",
              careerProgression:
                parsedResult.experienceAnalysis?.careerProgression || "unknown",
              industryRelevance:
                parsedResult.experienceAnalysis?.industryRelevance || "unknown",
              leadershipExperience:
                parsedResult.experienceAnalysis?.leadershipExperience || false,
            },
            educationAnalysis: {
              degreeMatch:
                parsedResult.educationAnalysis?.degreeMatch || "unknown",
              educationRelevance:
                parsedResult.educationAnalysis?.educationRelevance || "unknown",
              certifications: Array.isArray(
                parsedResult.educationAnalysis?.certifications,
              )
                ? parsedResult.educationAnalysis.certifications
                : [],
              continuousLearning:
                parsedResult.educationAnalysis?.continuousLearning || false,
            },
            strengths: Array.isArray(parsedResult.strengths)
              ? parsedResult.strengths
              : [],
            weaknesses: Array.isArray(parsedResult.weaknesses)
              ? parsedResult.weaknesses
              : [],
            redFlags: Array.isArray(parsedResult.redFlags)
              ? parsedResult.redFlags
              : [],
            recommendations: {
              forCandidate: Array.isArray(
                parsedResult.recommendations?.forCandidate,
              )
                ? parsedResult.recommendations.forCandidate
                : [],
              forRecruiter: Array.isArray(
                parsedResult.recommendations?.forRecruiter,
              )
                ? parsedResult.recommendations.forRecruiter
                : [],
            },
            interviewQuestions: Array.isArray(parsedResult.interviewQuestions)
              ? parsedResult.interviewQuestions
              : [],
            salaryExpectation: parsedResult.salaryExpectation || "unknown",
            overallAssessment:
              parsedResult.overallAssessment || "Analysis completed",
            interviewReadiness: parsedResult.interviewReadiness || "unknown",
            hiringRecommendation: parsedResult.hiringRecommendation || "maybe",
            confidenceScore: Math.min(
              100,
              Math.max(0, parsedResult.confidenceScore || 75),
            ),
            analysisTimestamp: new Date().toISOString(),
            processingTime: Date.now(), // Will be calculated by caller
          };

          // Calculate dynamic overall score if not provided
          if (!parsedResult.atsScore?.overall && enhancedResult.atsScore) {
            const scores = enhancedResult.atsScore;
            enhancedResult.atsScore.overall = Math.round(
              scores.keywordMatch * 0.25 +
                scores.skillsAlignment * 0.3 +
                scores.experienceRelevance * 0.25 +
                scores.educationFit * 0.15 +
                scores.formatCompatibility * 0.05,
            );
          }

          return enhancedResult;
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError);
          throw new Error(
            `Failed to parse AI response JSON: ${parseError.message}`,
          );
        }
      } else {
        throw new Error("No valid JSON found in AI response");
      }
    } catch (error) {
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error("Network error: Please check your internet connection");
      }

      console.error("Gemini API error:", error);

      // If all retries failed, provide a fallback basic analysis
      if (retryCount >= 3 || error.message.includes("overloaded")) {
        console.log("Providing fallback analysis due to API overload...");
        return this.generateFallbackAnalysis(resumeText, jobDescription);
      }

      throw error;
    }
  }

  static async batchAnalyzeResumes(resumes, jobDescription, onProgress) {
    this.validateApiKey();

    if (!Array.isArray(resumes) || resumes.length === 0) {
      throw new Error("No resumes provided for analysis");
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    console.log(`Starting batch analysis of ${resumes.length} resumes...`);

    for (let i = 0; i < resumes.length; i++) {
      const processStart = Date.now();

      try {
        const resume = resumes[i];

        if (!resume.fileName || !resume.text) {
          throw new Error("Invalid resume format: missing fileName or text");
        }

        console.log(
          `Analyzing resume ${i + 1}/${resumes.length}: ${resume.fileName}`,
        );

        const analysis = await this.analyzeResume(resume.text, jobDescription);
        analysis.processingTime = Date.now() - processStart;

        results.push({
          fileName: resume.fileName,
          fileSize: resume.text.length,
          ...analysis,
          status: "success",
        });

        successCount++;

        if (onProgress) {
          onProgress(i + 1, resumes.length, {
            successCount,
            errorCount,
            currentFile: resume.fileName,
            estimatedTimeRemaining: this.calculateETA(
              i + 1,
              resumes.length,
              Date.now() - startTime,
            ),
          });
        }

        // Add intelligent delay based on API response time
        const delay = Math.max(rateLimitDelay, analysis.processingTime * 0.1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } catch (error) {
        console.error(
          `Error analyzing ${resumes[i]?.fileName || "unknown file"}:`,
          error,
        );
        errorCount++;

        results.push({
          fileName: resumes[i]?.fileName || "unknown",
          fileSize: resumes[i]?.text?.length || 0,
          matchPercentage: 0,
          matchingSkills: [],
          missingSkills: [],
          experienceMatch: "unknown",
          educationRelevance: "unknown",
          strengths: [],
          weaknesses: [],
          recommendations: ["Analysis failed - please try again"],
          keywordMatches: 0,
          overallAssessment: "Analysis failed due to error",
          interviewReadiness: "unknown",
          error: error.message,
          status: "error",
          processingTime: Date.now() - processStart,
          analysisTimestamp: new Date().toISOString(),
        });

        if (onProgress) {
          onProgress(i + 1, resumes.length, {
            successCount,
            errorCount,
            currentFile: resumes[i]?.fileName || "unknown",
            estimatedTimeRemaining: this.calculateETA(
              i + 1,
              resumes.length,
              Date.now() - startTime,
            ),
          });
        }

        // Shorter delay on errors to speed up processing
        await new Promise((resolve) =>
          setTimeout(resolve, rateLimitDelay * 0.5),
        );
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(
      `Batch analysis complete: ${successCount} successful, ${errorCount} errors in ${totalTime}ms`,
    );

    return {
      results,
      summary: {
        total: resumes.length,
        successful: successCount,
        failed: errorCount,
        totalProcessingTime: totalTime,
        averageProcessingTime: totalTime / resumes.length,
        successRate: (successCount / resumes.length) * 100,
      },
    };
  }

  static calculateETA(current, total, elapsedTime) {
    if (current === 0) return "Calculating...";
    const averageTime = elapsedTime / current;
    const remaining = total - current;
    const eta = remaining * averageTime;

    const minutes = Math.floor(eta / 60000);
    const seconds = Math.floor((eta % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  static async generateJobAnalytics(jobDescription) {
    this.validateApiKey();

    const prompt = `
Analyze this job description and provide insights for better recruitment:

JOB DESCRIPTION:
${jobDescription}

Provide analysis in this JSON format:
{
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "experienceLevel": "entry/mid/senior",
  "industry": "industry name",
  "estimatedSalaryRange": "range",
  "competitionLevel": "low/medium/high",
  "suggestions": ["suggestion1", "suggestion2"]
}
`;

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error("Failed to parse job analytics response");
    } catch (error) {
      console.error("Job analytics error:", error);
      throw error;
    }
  }

  static getApiKeyStatus() {
    try {
      this.validateApiKey();
      return {
        configured: true,
        message: "API key is configured and ready",
        lastChecked: new Date().toISOString(),
      };
    } catch (error) {
      return {
        configured: false,
        message: error.message,
        lastChecked: new Date().toISOString(),
      };
    }
  }

  static generateFallbackAnalysis(resumeText, jobDescription) {
    // Basic keyword matching fallback
    const resumeLower = resumeText.toLowerCase();
    const jobLower = jobDescription.toLowerCase();

    // Extract basic skills from common patterns
    const commonSkills = [
      "javascript",
      "python",
      "java",
      "react",
      "node",
      "sql",
      "html",
      "css",
      "git",
      "aws",
      "docker",
      "mongodb",
      "express",
      "angular",
      "vue",
    ];
    const matchingSkills = commonSkills.filter(
      (skill) => resumeLower.includes(skill) && jobLower.includes(skill),
    );
    const missingSkills = commonSkills.filter(
      (skill) => !resumeLower.includes(skill) && jobLower.includes(skill),
    );

    // Basic experience detection
    const experienceMatch = resumeLower.includes("senior")
      ? "senior"
      : resumeLower.includes("lead")
        ? "senior"
        : resumeLower.includes("junior")
          ? "entry"
          : "mid";

    // Extract basic info using regex patterns
    const emailMatch = resumeText.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    );
    const phoneMatch = resumeText.match(
      /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    );
    const nameMatch = resumeText.split("\n")[0]?.trim();

    // Calculate basic match percentage
    const matchPercentage = Math.min(
      95,
      Math.max(
        30,
        matchingSkills.length * 10 +
          (resumeLower.includes("experience") ? 20 : 0) +
          (resumeLower.includes("degree") ||
          resumeLower.includes("bachelor") ||
          resumeLower.includes("master")
            ? 15
            : 0),
      ),
    );

    return {
      extractedInfo: {
        name: nameMatch || "Unknown",
        firstName: nameMatch?.split(" ")[0] || "Unknown",
        lastName: nameMatch?.split(" ").slice(1).join(" ") || "",
        email: emailMatch ? emailMatch[0] : "",
        phone: phoneMatch ? phoneMatch[0] : "",
        location: "Not specified",
        currentRole: "Not specified",
        currentCompany: "Not specified",
        totalYearsExperience: resumeLower.includes("year")
          ? "Experience mentioned"
          : "",
        relevantExperience: "Not specified",
        education: resumeLower.includes("degree")
          ? "Degree mentioned"
          : "Not specified",
        degree: "Not specified",
        university: "Not specified",
        graduationYear: null,
        skills: matchingSkills,
        certifications: [],
        languages: ["English"],
        linkedin: "",
        github: "",
        portfolio: "",
      },
      matchPercentage,
      atsScore: {
        overall: matchPercentage,
        keywordMatch: Math.min(100, matchingSkills.length * 12),
        skillsAlignment: Math.min(100, matchingSkills.length * 15),
        experienceRelevance: resumeLower.includes("year") ? 75 : 50,
        educationFit: resumeLower.includes("degree") ? 80 : 60,
        formatCompatibility: 85,
      },
      keywordAnalysis: {
        totalJobKeywords: 20,
        matchedKeywords: matchingSkills,
        missingKeywords: missingSkills.slice(0, 5),
        synonymMatches: [],
        keywordDensity: Math.min(100, matchingSkills.length * 8),
      },
      skillsAnalysis: {
        matchingSkills,
        missingCriticalSkills: missingSkills.slice(0, 3),
        additionalSkills: [],
        skillLevel: experienceMatch,
        technicalSkillsScore: Math.min(100, matchingSkills.length * 12),
        softSkillsScore: 70,
      },
      experienceAnalysis: {
        totalYears: resumeLower.includes("year") ? 3 : 1,
        relevantYears: resumeLower.includes("year") ? 2 : 1,
        experienceMatch,
        careerProgression: "average",
        industryRelevance: "medium",
        leadershipExperience:
          resumeLower.includes("lead") || resumeLower.includes("manage"),
      },
      educationAnalysis: {
        degreeMatch: resumeLower.includes("degree") ? "related" : "unknown",
        educationRelevance:
          resumeLower.includes("computer") ||
          resumeLower.includes("engineering")
            ? "high"
            : "medium",
        certifications: [],
        continuousLearning:
          resumeLower.includes("certification") ||
          resumeLower.includes("course"),
      },
      strengths: ["Basic skill match detected", "Resume format compatible"],
      weaknesses: ["Detailed analysis unavailable due to API limitations"],
      redFlags: [],
      recommendations: {
        forCandidate: ["Consider adding more specific skills to resume"],
        forRecruiter: ["Manual review recommended due to limited AI analysis"],
      },
      interviewQuestions: [
        "Tell me about your experience with the technologies mentioned",
      ],
      salaryExpectation: "within",
      overallAssessment:
        "Basic analysis completed - API temporarily unavailable",
      interviewReadiness: "needs-preparation",
      hiringRecommendation: matchPercentage >= 70 ? "maybe" : "no-hire",
      confidenceScore: 60,
      analysisTimestamp: new Date().toISOString(),
      processingTime: 100,
      fallbackAnalysis: true,
    };
  }

  static getServiceHealth() {
    const status = this.getApiKeyStatus();
    const envStatus = this.validateEnvironment();

    return {
      status: status.configured && envStatus.isValid ? "healthy" : "unhealthy",
      apiKey: status,
      environment: envStatus,
      rateLimitDelay,
      features: {
        singleAnalysis: status.configured,
        batchAnalysis: status.configured,
        jobAnalytics: status.configured,
      },
    };
  }
}
