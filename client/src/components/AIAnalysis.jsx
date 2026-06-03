import { useState, useEffect } from 'react';

export default function AIAnalysis({ results, isAnalyzing }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [sortBy, setSortBy] = useState('matchPercentage');
  const [filterBy, setFilterBy] = useState('all');

  const sortedResults = results?.sort((a, b) => {
    switch (sortBy) {
      case 'matchPercentage':
        return (b.matchPercentage || 0) - (a.matchPercentage || 0);
      case 'atsScore':
        return (b.atsScore?.overall || 0) - (a.atsScore?.overall || 0);
      case 'experienceRelevance':
        return (b.atsScore?.experienceRelevance || 0) - (a.atsScore?.experienceRelevance || 0);
      case 'fileName':
        return a.fileName.localeCompare(b.fileName);
      default:
        return 0;
    }
  });

  const filteredResults = sortedResults?.filter(result => {
    if (filterBy === 'all') return true;
    if (filterBy === 'strong-hire') return result.hiringRecommendation === 'strong-hire';
    if (filterBy === 'hire') return result.hiringRecommendation === 'hire';
    if (filterBy === 'maybe') return result.hiringRecommendation === 'maybe';
    if (filterBy === 'no-hire') return result.hiringRecommendation === 'no-hire';
    if (filterBy === 'high-match') return (result.matchPercentage || 0) >= 80;
    if (filterBy === 'medium-match') return (result.matchPercentage || 0) >= 60 && (result.matchPercentage || 0) < 80;
    if (filterBy === 'low-match') return (result.matchPercentage || 0) < 60;
    return true;
  });

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 80) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    if (score >= 70) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    if (score >= 60) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'strong-hire': return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'hire': return 'bg-gradient-to-r from-blue-500 to-cyan-600';
      case 'maybe': return 'bg-gradient-to-r from-yellow-500 to-orange-600';
      case 'no-hire': return 'bg-gradient-to-r from-red-500 to-rose-600';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const ScoreCircle = ({ score, label, size = 'lg' }) => {
    const radius = size === 'sm' ? 20 : 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
      <div className={`flex flex-col items-center ${size === 'sm' ? 'space-y-1' : 'space-y-2'}`}>
        <div className="relative">
          <svg className={`transform -rotate-90 ${size === 'sm' ? 'w-12 h-12' : 'w-20 h-20'}`}>
            <circle
              cx={size === 'sm' ? 24 : 40}
              cy={size === 'sm' ? 24 : 40}
              r={radius}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
              fill="transparent"
            />
            <circle
              cx={size === 'sm' ? 24 : 40}
              cy={size === 'sm' ? 24 : 40}
              r={radius}
              stroke={score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444'}
              strokeWidth="3"
              fill="transparent"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center ${size === 'sm' ? 'text-sm' : 'text-lg'} font-bold text-white`}>
            {score}%
          </div>
        </div>
        <span className={`${size === 'sm' ? 'text-xs' : 'text-sm'} text-gray-300 text-center`}>{label}</span>
      </div>
    );
  };

  if (isAnalyzing) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin text-6xl mb-6">🤖</div>
        <h3 className="text-3xl font-bold text-white mb-4">AI is Analyzing Resumes</h3>
        <p className="text-gray-300 text-lg">Please wait while we process and match candidates...</p>
        <div className="mt-8 bg-white/10 rounded-full h-2 max-w-md mx-auto">
          <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-6">📊</div>
        <h3 className="text-3xl font-bold text-gray-400 mb-4">No Analysis Results Yet</h3>
        <p className="text-gray-500 text-lg">Upload resumes and start the analysis to see results here</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            🎯 ATS Analysis Results
          </h2>
          <p className="text-gray-400">{filteredResults?.length || 0} candidates analyzed with AI-powered matching</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-white/40"
          >
            <option value="matchPercentage">Sort by Match %</option>
            <option value="atsScore">Sort by ATS Score</option>
            <option value="experienceRelevance">Sort by Experience</option>
            <option value="fileName">Sort by Name</option>
          </select>

          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white text-sm focus:outline-none focus:border-white/40"
          >
            <option value="all">All Candidates</option>
            <option value="strong-hire">Strong Hire</option>
            <option value="hire">Hire</option>
            <option value="maybe">Maybe</option>
            <option value="no-hire">No Hire</option>
            <option value="high-match">High Match (80%+)</option>
            <option value="medium-match">Medium Match (60-79%)</option>
            <option value="low-match">Low Match (&lt;60%)</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl p-4 text-center border border-green-500/30">
          <div className="text-2xl font-bold text-green-400">
            {results.filter(r => r.hiringRecommendation === 'strong-hire' || r.hiringRecommendation === 'hire').length}
          </div>
          <div className="text-sm text-gray-300">Recommended</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-2xl p-4 text-center border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400">
            {Math.round(results.reduce((sum, r) => sum + (r.matchPercentage || 0), 0) / results.length)}%
          </div>
          <div className="text-sm text-gray-300">Avg Match</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-2xl p-4 text-center border border-purple-500/30">
          <div className="text-2xl font-bold text-purple-400">
            {results.filter(r => (r.matchPercentage || 0) >= 80).length}
          </div>
          <div className="text-sm text-gray-300">High Match</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 rounded-2xl p-4 text-center border border-yellow-500/30">
          <div className="text-2xl font-bold text-yellow-400">
            {results.filter(r => r.interviewReadiness === 'ready').length}
          </div>
          <div className="text-sm text-gray-300">Interview Ready</div>
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="space-y-6">
        {filteredResults?.map((result, index) => (
          <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-[1.02]">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-6">
                <div className="text-4xl">📄</div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{result.fileName}</h3>
                  <div className="flex items-center space-x-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getRecommendationColor(result.hiringRecommendation)}`}>
                      {result.hiringRecommendation?.replace('-', ' ').toUpperCase() || 'ANALYZING'}
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-sm ${getScoreColor(result.matchPercentage)}`}>
                      {result.matchPercentage}% Match
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-sm ${result.interviewReadiness === 'ready' ? 'text-green-400 bg-green-500/20' : 'text-yellow-400 bg-yellow-500/20'}`}>
                      {result.interviewReadiness === 'ready' ? '✅ Interview Ready' : '⏳ Needs Prep'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-6">
                <ScoreCircle score={result.matchPercentage || 0} label="Overall Match" />
                <ScoreCircle score={result.atsScore?.overall || 0} label="ATS Score" />
                <ScoreCircle score={result.confidenceScore || 85} label="Confidence" />
              </div>
            </div>

            {/* Detailed Scores */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              <ScoreCircle score={result.atsScore?.keywordMatch || 0} label="Keywords" size="sm" />
              <ScoreCircle score={result.atsScore?.skillsAlignment || 0} label="Skills" size="sm" />
              <ScoreCircle score={result.atsScore?.experienceRelevance || 0} label="Experience" size="sm" />
              <ScoreCircle score={result.atsScore?.educationFit || 0} label="Education" size="sm" />
              <ScoreCircle score={result.atsScore?.formatCompatibility || 85} label="Format" size="sm" />
            </div>

            {/* Keyword Analysis */}
            {result.keywordAnalysis && (
              <div className="mb-8">
                <h4 className="text-xl font-bold text-white mb-4">🔍 Keyword Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h5 className="text-green-400 font-semibold mb-3">✅ Matched Keywords ({result.keywordAnalysis.matchedKeywords?.length || 0})</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordAnalysis.matchedKeywords?.slice(0, 8).map((keyword, i) => (
                        <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-lg border border-green-500/30">
                          {keyword}
                        </span>
                      ))}
                      {result.keywordAnalysis.matchedKeywords?.length > 8 && (
                        <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-lg">
                          +{result.keywordAnalysis.matchedKeywords.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h5 className="text-red-400 font-semibold mb-3">❌ Missing Keywords ({result.keywordAnalysis.missingKeywords?.length || 0})</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.keywordAnalysis.missingKeywords?.slice(0, 8).map((keyword, i) => (
                        <span key={i} className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-lg border border-red-500/30">
                          {keyword}
                        </span>
                      ))}
                      {result.keywordAnalysis.missingKeywords?.length > 8 && (
                        <span className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-lg">
                          +{result.keywordAnalysis.missingKeywords.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h5 className="text-blue-400 font-semibold mb-3">📊 Keyword Stats</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Density:</span>
                        <span className="text-white">{result.keywordAnalysis.keywordDensity || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Job Keywords:</span>
                        <span className="text-white">{result.keywordAnalysis.totalJobKeywords || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Match Rate:</span>
                        <span className="text-white">
                          {Math.round(((result.keywordAnalysis.matchedKeywords?.length || 0) / (result.keywordAnalysis.totalJobKeywords || 1)) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Skills & Experience Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Skills */}
              <div>
                <h4 className="text-xl font-bold text-white mb-4">🛠️ Skills Analysis</h4>
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h5 className="text-green-400 font-medium mb-2">✅ Matching Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsAnalysis?.matchingSkills?.slice(0, 6).map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h5 className="text-red-400 font-medium mb-2">❌ Missing Critical Skills</h5>
                    <div className="flex flex-wrap gap-2">
                      {result.skillsAnalysis?.missingCriticalSkills?.slice(0, 6).map((skill, i) => (
                        <span key={i} className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded border border-red-500/30">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Experience */}
              <div>
                <h4 className="text-xl font-bold text-white mb-4">💼 Experience Analysis</h4>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400 block">Total Experience:</span>
                      <span className="text-white font-semibold">{result.experienceAnalysis?.totalYears || 0} years</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Relevant Experience:</span>
                      <span className="text-white font-semibold">{result.experienceAnalysis?.relevantYears || 0} years</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Experience Level:</span>
                      <span className="text-white font-semibold capitalize">{result.experienceAnalysis?.experienceMatch || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Career Progression:</span>
                      <span className="text-white font-semibold capitalize">{result.experienceAnalysis?.careerProgression || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h5 className="text-green-400 font-semibold mb-4">💪 Strengths</h5>
                <ul className="space-y-2">
                  {result.strengths?.map((strength, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start space-x-2">
                      <span className="text-green-400 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-yellow-400 font-semibold mb-4">⚠️ Areas for Improvement</h5>
                <ul className="space-y-2">
                  {result.weaknesses?.map((weakness, i) => (
                    <li key={i} className="text-gray-300 text-sm flex items-start space-x-2">
                      <span className="text-yellow-400 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interview Questions */}
            {result.interviewQuestions && result.interviewQuestions.length > 0 && (
              <div className="mb-8">
                <h4 className="text-xl font-bold text-white mb-4">❓ Suggested Interview Questions</h4>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <ul className="space-y-3">
                    {result.interviewQuestions.slice(0, 3).map((question, i) => (
                      <li key={i} className="text-gray-300 text-sm flex items-start space-x-2">
                        <span className="text-blue-400 mt-1">{i + 1}.</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-white/10">
              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105">
                📞 Schedule Interview
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105">
                📋 Detailed View
              </button>
              <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105">
                📊 Export Analysis
              </button>
              <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300 border border-white/20">
                ⭐ Save to Shortlist
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}