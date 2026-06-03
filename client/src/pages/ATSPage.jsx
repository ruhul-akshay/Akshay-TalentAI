import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function ATSPage() {
  const { apiCall } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // State management
  const [activeMode, setActiveMode] = useState('resume-analysis'); // 'resume-analysis' or 'job-matching'
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Resume Analysis Mode States
  const [uploadedResumes, setUploadedResumes] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [analyzedCandidates, setAnalyzedCandidates] = useState([]);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Job Matching Mode States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('matchScore');

  useEffect(() => {
    loadJobs();

    const jobId = searchParams.get('jobId');
    if (jobId) {
      loadJobDetails(jobId);
    }
  }, [searchParams]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs?status=active');
      const data = await response.json();

      if (data.success) {
        setJobs(data.data);
        if (data.data.length > 0 && !selectedJob) {
          setSelectedJob(data.data[0]);
          loadJobApplications(data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setMessage({ type: 'error', text: 'Failed to load jobs' });
    } finally {
      setLoading(false);
    }
  };

  const loadJobDetails = async (jobId) => {
    try {
      const response = await apiCall(`/api/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedJob(data.data);
          loadJobApplications(jobId);
        }
      }
    } catch (error) {
      console.error('Error loading job details:', error);
    }
  };

  const loadJobApplications = async (jobId) => {
    try {
      const response = await apiCall(`/api/admin/job-applications/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJobApplications(data.data || []);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setJobApplications([]);
    }
  };

  // File Upload Handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = droppedFiles.filter(file => 
        file.type === 'application/pdf' || 
        file.name.endsWith('.docx') || 
        file.name.endsWith('.doc')
      );

      if (validFiles.length > 0) {
        setUploadedResumes(prev => [...prev, ...validFiles]);
      }
    }
  };

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setUploadedResumes(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setUploadedResumes(prev => prev.filter((_, i) => i !== index));
  };

  // Analyze Resumes and Show Popup
  const analyzeResumes = async () => {
    if (uploadedResumes.length === 0) {
      setMessage({ type: 'error', text: 'Please upload at least one resume' });
      return;
    }

    setAnalysisLoading(true);
    setMessage({ type: 'info', text: 'Analyzing resumes...' });

    try {
      const formData = new FormData();
      uploadedResumes.forEach(file => {
        formData.append('resumes', file);
      });

      // Generic job description for initial analysis
      const genericJobDesc = "Analyze this resume and extract all relevant information including personal details, skills, experience, and education.";
      formData.append('jobDescription', genericJobDesc);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        const transformedResults = result.results.map(res => ({
          ...res,
          extractedInfo: res.extractedInfo || {},
          status: res.status || 'success'
        }));

        setAnalyzedCandidates(transformedResults);
        setMessage({ 
          type: 'success', 
          text: `Successfully analyzed ${transformedResults.length} resumes. Review and confirm to add to database.` 
        });
        setUploadedResumes([]);
      } else {
        throw new Error(result.message || 'Analysis failed');
      }
    } catch (error) {
      console.error('Resume analysis error:', error);
      setMessage({ type: 'error', text: `Analysis failed: ${error.message}` });
    } finally {
      setAnalysisLoading(false);
    }
  };

  // Open Confirmation Popup
  const openConfirmationPopup = (candidate) => {
    setCurrentCandidate({...candidate});
    setEditMode(false);
    setShowConfirmationPopup(true);
  };

  // Update Candidate Data in Popup
  const updateCandidateField = (field, value) => {
    setCurrentCandidate(prev => ({
      ...prev,
      extractedInfo: {
        ...prev.extractedInfo,
        [field]: value
      }
    }));
  };

  // Confirm and Submit to Database
  const confirmAndSubmit = async () => {
    try {
      setMessage({ type: 'info', text: 'Adding candidate to database...' });

      const response = await apiCall('/api/admin/confirm-candidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentCandidate)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ 
          type: 'success', 
          text: `✅ ${currentCandidate.extractedInfo?.name || 'Candidate'} successfully added to database!` 
        });

        setAnalyzedCandidates(prev => 
          prev.filter(c => c.fileName !== currentCandidate.fileName)
        );
        setShowConfirmationPopup(false);
        setCurrentCandidate(null);
      } else {
        throw new Error(result.error || 'Failed to add candidate');
      }
    } catch (error) {
      console.error('Error confirming candidate:', error);
      setMessage({ type: 'error', text: `Failed to add candidate: ${error.message}` });
    }
  };

  // Calculate ATS Score for Existing Candidate
  const calculateATSScore = async (candidateId) => {
    if (!selectedJob) {
      setMessage({ type: 'error', text: 'Please select a job first' });
      return;
    }

    try {
      setAnalysisLoading(true);
      setMessage({ type: 'info', text: 'Calculating ATS score...' });

      const candidate = jobApplications.find(app => app._id === candidateId);
      if (!candidate || !candidate.applicant?.profile) {
        throw new Error('Candidate data not found');
      }

      const resumeText = `
        Name: ${candidate.applicant.firstName} ${candidate.applicant.lastName}
        Email: ${candidate.applicant.email}
        Phone: ${candidate.applicant.profile.phone || ''}
        Location: ${candidate.applicant.profile.address?.city || ''}
        Professional Summary: ${candidate.applicant.profile.bio || ''}
        Experience: ${candidate.applicant.profile.totalExperience || ''}
        Current Company: ${candidate.applicant.profile.currentCompany || ''}
        Current Position: ${candidate.applicant.profile.currentDesignation || ''}
        Education: ${candidate.applicant.profile.degree || ''}
        University: ${candidate.applicant.profile.university || ''}
        Skills: ${(candidate.applicant.profile.skills || []).join(', ')}
        ${candidate.coverLetter || ''}
      `;

      const jobDescription = `
        Position: ${selectedJob.title}
        Department: ${selectedJob.department}
        Experience Level: ${selectedJob.experienceLevel}
        Location: ${selectedJob.location}
        Required Skills: ${(selectedJob.skills || []).join(', ')}
        Description: ${selectedJob.description}
        Education: ${selectedJob.requirements?.education || ''}
      `;

      const response = await fetch('/api/analyze/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, jobDescription })
      });

      const result = await response.json();

      if (result.success) {
        const updatedApplications = jobApplications.map(app => {
          if (app._id === candidateId) {
            return {
              ...app,
              aiAnalysis: {
                ...result.data,
                analysisDate: new Date()
              }
            };
          }
          return app;
        });

        setJobApplications(updatedApplications);
        setMessage({ type: 'success', text: 'ATS score calculated successfully!' });
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error calculating ATS score:', error);
      setMessage({ type: 'error', text: `Failed to calculate ATS score: ${error.message}` });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const updateCandidateStatus = async (candidateId, newStatus) => {
    try {
      const response = await apiCall(`/api/applications/${candidateId}/${getActionFromStatus(newStatus)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: '' })
      });

      if (response.ok) {
        loadJobApplications(selectedJob._id);
        setMessage({ type: 'success', text: 'Candidate status updated successfully!' });
      }
    } catch (error) {
      console.error('Error updating candidate status:', error);
      setMessage({ type: 'error', text: 'Failed to update candidate status' });
    }
  };

  const getActionFromStatus = (status) => {
    const actions = {
      'reviewing': 'review',
      'shortlisted': 'shortlist',
      'interview-scheduled': 'schedule-interview',
      'rejected': 'reject',
      'hired': 'hire'
    };
    return actions[status] || 'review';
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 80) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    if (score >= 70) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    if (score >= 60) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-gradient-to-r from-blue-400 to-cyan-500',
      'reviewing': 'bg-gradient-to-r from-yellow-400 to-orange-500',
      'shortlisted': 'bg-gradient-to-r from-green-400 to-emerald-500',
      'interview-scheduled': 'bg-gradient-to-r from-purple-400 to-pink-500',
      'rejected': 'bg-gradient-to-r from-red-400 to-rose-500',
      'hired': 'bg-gradient-to-r from-emerald-500 to-teal-500'
    };
    return colors[status] || 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  // Filter and sort candidates for job matching mode
  const filteredCandidates = jobApplications
    .filter(app => {
      const matchesSearch = app.applicant && (
        `${app.applicant.firstName} ${app.applicant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'matchScore':
          return (b.aiAnalysis?.matchPercentage || 0) - (a.aiAnalysis?.matchPercentage || 0);
        case 'name':
          const nameA = `${a.applicant?.firstName || ''} ${a.applicant?.lastName || ''}`;
          const nameB = `${b.applicant?.firstName || ''} ${b.applicant?.lastName || ''}`;
          return nameA.localeCompare(nameB);
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading ATS System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/8 to-blue-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-br from-pink-400/8 to-red-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            🎯 Advanced ATS System
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
            Intelligent resume analysis and job-based candidate matching powered by AI
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-8">
            <div className={`p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                : message.type === 'error'
                ? 'bg-red-500/20 border-red-500/30 text-red-300'
                : 'bg-blue-500/20 border-blue-500/30 text-blue-300'
            }`}>
              <p className="text-center font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Mode Selector */}
        <div className="flex space-x-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 mb-8 shadow-lg border border-white/20">
          <button
            onClick={() => setActiveMode('resume-analysis')}
            className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
              activeMode === 'resume-analysis'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="text-2xl mb-1">📄</div>
            <div>Resume Analysis</div>
            <div className="text-xs opacity-75">Upload & Extract Data</div>
          </button>
          <button
            onClick={() => setActiveMode('job-matching')}
            className={`flex-1 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
              activeMode === 'job-matching'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <div className="text-2xl mb-1">🎯</div>
            <div>Job Matching</div>
            <div className="text-xs opacity-75">Calculate ATS Scores</div>
          </button>
        </div>

        {/* Resume Analysis Mode */}
        {activeMode === 'resume-analysis' && (
          <div className="space-y-8">
            {/* Upload Section */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-3">📤</span>
                Upload Resumes for Analysis
              </h3>

              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-blue-400 bg-blue-400/10 scale-105'
                    : 'border-gray-600 hover:border-gray-500 hover:bg-white/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  id="resume-upload"
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc"
                  onChange={handleFileInput}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div className="text-6xl opacity-50">📁</div>
                  <div>
                    <label 
                      htmlFor="resume-upload" 
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl cursor-pointer font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <span>📎</span>
                      <span>Choose Resume Files</span>
                    </label>
                  </div>
                  <p className="text-gray-400 text-sm">or drag and drop resume files here</p>
                  <p className="text-gray-500 text-xs">Supports PDF, DOC, DOCX files • Max 10MB per file</p>
                </div>
              </div>

              {/* Uploaded Files */}
              {uploadedResumes.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="text-lg font-semibold text-white">Uploaded Files ({uploadedResumes.length})</h4>
                  {uploadedResumes.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{file.type === 'application/pdf' ? '📄' : '📝'}</div>
                        <div>
                          <p className="text-white font-medium">{file.name}</p>
                          <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={analyzeResumes}
                    disabled={analysisLoading}
                    className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {analysisLoading ? '🔄 Analyzing Resumes...' : '🚀 Analyze & Extract Data'}
                  </button>
                </div>
              )}
            </div>

            {/* Analyzed Candidates */}
            {analyzedCandidates.length > 0 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-md rounded-2xl p-4 border border-green-500/20">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <span className="mr-3">✅</span>
                    Analyzed Candidates ({analyzedCandidates.length})
                  </h3>
                  <p className="text-green-300 mt-2">Review extracted data and confirm to add to database</p>
                </div>

                {analyzedCandidates.map((candidate, index) => (
                  <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-xl font-bold text-white">{candidate.fileName}</h4>
                          {candidate.status === 'success' ? (
                            <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">✓ Analyzed</span>
                          ) : (
                            <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">✗ Error</span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-400 block">Name:</span>
                            <span className="text-white font-medium">{candidate.extractedInfo?.name || 'Not found'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Email:</span>
                            <span className="text-white">{candidate.extractedInfo?.email || 'Not found'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Phone:</span>
                            <span className="text-white">{candidate.extractedInfo?.phone || 'Not found'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Experience:</span>
                            <span className="text-white">{candidate.extractedInfo?.totalYearsExperience || 'Not specified'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-2 ml-4">
                        {candidate.status === 'success' ? (
                          <>
                            <button
                              onClick={() => openConfirmationPopup(candidate)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                            >
                              ✓ Review & Confirm
                            </button>
                            <button
                              onClick={() => setAnalyzedCandidates(prev => prev.filter((_, i) => i !== index))}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                            >
                              ✗ Reject
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => setAnalyzedCandidates(prev => prev.filter((_, i) => i !== index))}
                            className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-medium"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Job Matching Mode */}
        {activeMode === 'job-matching' && (
          <div className="space-y-8">
            {/* Job Selection */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Select Job Position</h3>
              <select
                value={selectedJob?._id || ''}
                onChange={(e) => {
                  const job = jobs.find(j => j._id === e.target.value);
                  setSelectedJob(job);
                  if (job) loadJobApplications(job._id);
                }}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
              >
                <option value="">Select a job position...</option>
                {jobs.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title} - {job.department} ({job.jobId})
                  </option>
                ))}
              </select>
            </div>

            {selectedJob && (
              <>
                {/* Job Overview */}
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                  <h2 className="text-3xl font-bold text-white mb-4">{selectedJob.title}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 text-center border border-blue-500/30">
                      <div className="text-2xl font-bold text-blue-400">{jobApplications.length}</div>
                      <div className="text-sm text-gray-300">Total Applications</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 text-center border border-green-500/30">
                      <div className="text-2xl font-bold text-green-400">
                        {jobApplications.filter(app => app.status === 'shortlisted').length}
                      </div>
                      <div className="text-sm text-gray-300">Shortlisted</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 text-center border border-purple-500/30">
                      <div className="text-2xl font-bold text-purple-400">
                        {jobApplications.filter(app => app.aiAnalysis?.matchPercentage >= 80).length}
                      </div>
                      <div className="text-sm text-gray-300">High Match (80%+)</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-4 text-center border border-yellow-500/30">
                      <div className="text-2xl font-bold text-yellow-400">
                        {jobApplications.filter(app => app.aiAnalysis).length}
                      </div>
                      <div className="text-sm text-gray-300">Analyzed</div>
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      placeholder="Search candidates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                    />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview-scheduled">Interview Scheduled</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                    >
                      <option value="matchScore">Sort by Match Score</option>
                      <option value="name">Sort by Name</option>
                      <option value="date">Sort by Date</option>
                    </select>
                  </div>
                </div>

                {/* Candidates List */}
                <div className="space-y-6">
                  {filteredCandidates.map((application) => (
                    <div key={application._id} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl">
                            {application.applicant ? 
                              `${application.applicant.firstName?.charAt(0) || ''}${application.applicant.lastName?.charAt(0) || ''}` : 
                              '👤'}
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                              {application.applicant ? 
                                `${application.applicant.firstName} ${application.applicant.lastName}` : 
                                'Unknown Candidate'}
                            </h3>
                            <p className="text-gray-400">{application.applicant?.email}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {application.aiAnalysis?.matchPercentage ? (
                            <div className={`px-4 py-2 rounded-lg font-bold text-lg ${getScoreColor(application.aiAnalysis.matchPercentage)}`}>
                              {application.aiAnalysis.matchPercentage}% Match
                            </div>
                          ) : (
                            <button
                              onClick={() => calculateATSScore(application._id)}
                              disabled={analysisLoading}
                              className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                            >
                              {analysisLoading ? 'Calculating...' : '🎯 Calculate ATS Score'}
                            </button>
                          )}

                          <div className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('-', ' ')}
                          </div>
                        </div>
                      </div>

                      {/* ATS Analysis Display */}
                      {application.aiAnalysis && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-white/10">
                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h4 className="text-white font-semibold mb-2">📊 ATS Scores</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Overall:</span>
                                <span className="text-white font-bold">{application.aiAnalysis.atsScore?.overall || 0}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Skills:</span>
                                <span className="text-white">{application.aiAnalysis.atsScore?.skillsAlignment || 0}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Experience:</span>
                                <span className="text-white">{application.aiAnalysis.atsScore?.experienceRelevance || 0}%</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h4 className="text-white font-semibold mb-2">🎯 Skills Match</h4>
                            <div className="flex flex-wrap gap-1">
                              {(application.aiAnalysis.skillsAnalysis?.matchingSkills || []).slice(0, 4).map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">{skill}</span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h4 className="text-white font-semibold mb-2">💼 Experience</h4>
                            <div className="text-sm">
                              <p className="text-gray-400">Total: <span className="text-white">{application.aiAnalysis.experienceAnalysis?.totalYears || 0} yrs</span></p>
                              <p className="text-gray-400">Level: <span className="text-white capitalize">{application.aiAnalysis.experienceAnalysis?.experienceMatch || 'N/A'}</span></p>
                            </div>
                          </div>

                          <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            <h4 className="text-white font-semibold mb-2">📈 Recommendation</h4>
                            <div className={`px-3 py-2 rounded text-sm font-medium text-center ${
                              application.aiAnalysis.hiringRecommendation === 'strong-hire' ? 'bg-green-500/20 text-green-300' :
                              application.aiAnalysis.hiringRecommendation === 'hire' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }`}>
                              {(application.aiAnalysis.hiringRecommendation || 'maybe').replace('-', ' ').toUpperCase()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3 pt-6 border-t border-white/10 mt-6">
                        {application.applicant?.profile?.resume?.fileUrl && (
                          <a
                            href={application.applicant.profile.resume.fileUrl.startsWith('http') ? 
                              application.applicant.profile.resume.fileUrl : 
                              `http://localhost:8000${application.applicant.profile.resume.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                          >
                            📄 View Resume
                          </a>
                        )}
                        {application.status === 'pending' && (
                          <button onClick={() => updateCandidateStatus(application._id, 'reviewing')}
                            className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg font-medium transition-all">
                            📋 Review
                          </button>
                        )}
                        {(application.status === 'reviewing' || application.status === 'pending') && (
                          <button onClick={() => updateCandidateStatus(application._id, 'shortlisted')}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-lg font-medium transition-all">
                            ⭐ Shortlist
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Popup */}
      {showConfirmationPopup && currentCandidate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Review Candidate Information</h2>
              <button
                onClick={() => setShowConfirmationPopup(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">👤 Personal Information</h3>
                  <button
                    onClick={() => setEditMode(!editMode)}
                    className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    {editMode ? '🔒 Lock' : '✏️ Edit'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Name</label>
                    <input
                      type="text"
                      value={currentCandidate.extractedInfo?.name || ''}
                      onChange={(e) => updateCandidateField('name', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white mt-1 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Email</label>
                    <input
                      type="email"
                      value={currentCandidate.extractedInfo?.email || ''}
                      onChange={(e) => updateCandidateField('email', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white mt-1 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Phone</label>
                    <input
                      type="text"
                      value={currentCandidate.extractedInfo?.phone || ''}
                      onChange={(e) => updateCandidateField('phone', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white mt-1 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Location</label>
                    <input
                      type="text"
                      value={currentCandidate.extractedInfo?.location || ''}
                      onChange={(e) => updateCandidateField('location', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white mt-1 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">💼 Professional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-400 text-sm">Current Role</label>
                    <input
                      type="text"
                      value={currentCandidate.extractedInfo?.currentRole || ''}
                      onChange={(e) => updateCandidateField('currentRole', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white mt-1 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Total Experience</label>
                    <input
                      type="text"
                      value={currentCandidate.extractedInfo?.totalYearsExperience || ''}
                      onChange={(e) => updateCandidateField('totalYearsExperience', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white mt-1 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Education</label>
                    <input
                      type="text"
                      value={currentCandidate.extractedInfo?.education || ''}
                      onChange={(e) => updateCandidateField('education', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white mt-1 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">University</label>
                    <input
                      type="text"
                      value={currentCandidate.extractedInfo?.university || ''}
                      onChange={(e) => updateCandidateField('university', e.target.value)}
                      disabled={!editMode}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white mt-1 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-4">🛠️ Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(currentCandidate.extractedInfo?.skills || []).map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6 border-t border-white/10">
                <button
                  onClick={confirmAndSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105"
                >
                  ✓ Confirm & Add to Database
                </button>
                <button
                  onClick={() => setShowConfirmationPopup(false)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300 border border-white/20"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}