import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function CandidatesPage() {
  const { user, apiCall } = useAuth();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('score');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    screening: 0,
    interview: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
    avgMatch: 0
  });

  // Load candidates data from backend
  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    try {
      setLoading(true);
      console.log('Loading candidates...');

      const response = await apiCall('/api/admin/candidates');
      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Candidates data received:', data);

        if (data.success && Array.isArray(data.data)) {
          setCandidates(data.data);
          calculateStats(data.data);
          console.log(`Loaded ${data.data.length} candidates successfully`);
        } else {
          console.error('Invalid data format received:', data);
          setCandidates([]);
          calculateStats([]);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to load candidates:', errorData);
        setCandidates([]);
        calculateStats([]);
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
      setCandidates([]);
      calculateStats([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshCandidates = async () => {
    try {
      setRefreshing(true);
      await loadCandidates();
    } catch (error) {
      console.error('Error refreshing candidates:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const calculateStats = (candidatesData) => {
    const total = candidatesData.length;
    const newCount = candidatesData.filter(c => c.status === 'new' || c.status === 'pending').length;
    const screening = candidatesData.filter(c => c.status === 'screening' || c.status === 'reviewing').length;
    const interview = candidatesData.filter(c => c.status === 'interview' || c.status === 'interview-scheduled').length;
    const offer = candidatesData.filter(c => c.status === 'offer').length;
    const hired = candidatesData.filter(c => c.status === 'hired').length;
    const rejected = candidatesData.filter(c => c.status === 'rejected').length;
    const avgMatch = total > 0 ? Math.round(candidatesData.reduce((sum, c) => sum + (c.matchScore || 0), 0) / total) : 0;

    setStats({
      total,
      new: newCount,
      screening,
      interview,
      offer,
      hired,
      rejected,
      avgMatch
    });
  };

  const updateCandidateStatus = async (candidateId, newStatus, notes = '') => {
    try {
      const response = await apiCall(`/api/applications/${candidateId}/${getActionFromStatus(newStatus)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        // Refresh candidates list
        await loadCandidates();

        // Show success message (you might want to add a toast notification)
        console.log('Candidate status updated successfully');
      } else {
        console.error('Failed to update candidate status');
      }
    } catch (error) {
      console.error('Error updating candidate status:', error);
    }
  };

  const getActionFromStatus = (status) => {
    switch (status) {
      case 'reviewing': return 'review';
      case 'shortlisted': return 'shortlist';
      case 'interview-scheduled': return 'schedule-interview';
      case 'rejected': return 'reject';
      case 'hired': return 'hire';
      default: return 'review';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
      case 'pending': return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      case 'screening':
      case 'reviewing': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'interview':
      case 'interview-scheduled': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'offer': return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'hired': return 'bg-gradient-to-r from-emerald-500 to-teal-500';
      case 'rejected': return 'bg-gradient-to-r from-red-400 to-rose-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-yellow-400';
    if (score >= 70) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '⭐';
    if (score >= 70) return '👍';
    return '📊';
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'pending': return 'new';
      case 'reviewing': return 'screening';
      case 'interview-scheduled': return 'interview';
      case 'shortlisted': return 'interview';
      default: return status;
    }
  };

  const filteredAndSortedCandidates = candidates
    .filter(candidate => {
      if (activeFilter === 'all') return true;
      const formattedStatus = formatStatus(candidate.status);
      return formattedStatus === activeFilter;
    })
    .filter(candidate =>
      candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'score': return (b.matchScore || 0) - (a.matchScore || 0);
        case 'name': return (a.name || '').localeCompare(b.name || '');
        case 'date': return new Date(b.appliedDate || a.createdAt) - new Date(a.appliedDate || a.createdAt);
        default: return 0;
      }
    });

  const CandidateCard = ({ candidate }) => (
    <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-6">
          <div className="relative">
            {candidate.profilePicture?.fileUrl ? (
              <img
                src={candidate.profilePicture.fileUrl.startsWith('http') ? candidate.profilePicture.fileUrl : candidate.profilePicture.fileUrl}
                alt={candidate.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl">
                {candidate.name ? candidate.name.charAt(0).toUpperCase() : '👤'}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 text-2xl">
              {candidate.atsMatch || candidate.matchScore ? getScoreBadge(candidate.atsMatch || candidate.matchScore) : '👤'}
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{candidate.name || 'Unknown'}</h3>
            <p className="text-xl text-purple-300 mb-2">{candidate.position || 'Position not specified'}</p>
            <div className="flex items-center space-x-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${candidate.isFresher ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'}`}>
                {candidate.isFresher ? `Fresher` : `${candidate.experienceYears || 0} years exp`}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {candidate.noticePeriod || 'Notice period not specified'}
              </span>
              {candidate.applicationSource && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  📍 {candidate.applicationSource}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <span>📍</span>
                <span>{candidate.location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📱</span>
                <span>{candidate.mobile || candidate.phone || 'Phone not provided'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>📧</span>
                <span className="truncate">{candidate.email || 'Email not provided'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <span>🏢</span>
                <span>{candidate.currentCompany || 'Current company not specified'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-3">
          <div className="text-center">
            <div className={`text-4xl font-bold ${(candidate.atsMatch || candidate.matchScore) ? getScoreColor(candidate.atsMatch || candidate.matchScore) : 'text-gray-500'}`}>
              {(candidate.atsMatch || candidate.matchScore) ? `${candidate.atsMatch || candidate.matchScore}%` : 'N/A'}
            </div>
            <div className="text-sm text-gray-400">ATS Match</div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(candidate.status)}`}>
            {formatStatus(candidate.status).charAt(0).toUpperCase() + formatStatus(candidate.status).slice(1)}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-300 leading-relaxed">{candidate.summary || candidate.bio || 'No summary available'}</p>
      </div>

      <div className="mb-6">
        <h4 className="text-white font-semibold mb-3">Skills:</h4>
        <div className="flex flex-wrap gap-2">
          {(candidate.skills || []).map((skill, index) => (
            <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-lg border border-blue-500/30">
              {skill}
            </span>
          ))}
          {(!candidate.skills || candidate.skills.length === 0) && (
            <span className="px-3 py-1 bg-gray-500/20 text-gray-300 text-sm rounded-lg border border-gray-500/30">
              No skills listed
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h5 className="text-green-400 font-medium mb-2">✅ Strengths</h5>
          <ul className="text-sm text-gray-300 space-y-1">
            {(candidate.strengths || candidate.aiAnalysis?.strengths || []).map((strength, index) => (
              <li key={index}>• {strength}</li>
            ))}
            {(!candidate.strengths && !candidate.aiAnalysis?.strengths) && (
              <li>• Analysis pending</li>
            )}
          </ul>
        </div>
        <div>
          <h5 className="text-yellow-400 font-medium mb-2">⚠️ Considerations</h5>
          <ul className="text-sm text-gray-300 space-y-1">
            {(candidate.concerns || candidate.aiAnalysis?.weaknesses || []).map((concern, index) => (
              <li key={index}>• {concern}</li>
            ))}
            {(!candidate.concerns && !candidate.aiAnalysis?.weaknesses) && (
              <li>• Analysis pending</li>
            )}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-center">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Education</div>
          <div className="text-white font-medium text-sm">{candidate.academicDetails?.degree || candidate.education || 'Not specified'}</div>
          <div className="text-xs text-gray-500">{candidate.academicDetails?.university || ''}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Experience</div>
          <div className="text-white font-medium text-sm">{candidate.totalExperience || 'Not specified'}</div>
          <div className="text-xs text-gray-500">Total Experience</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Notice Period</div>
          <div className="text-white font-medium text-sm">{candidate.noticePeriod || 'Not specified'}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-sm text-gray-400 mb-1">ABC ID</div>
          <div className="text-white font-medium text-sm">
            {candidate.academicDetails?.abcId || 'Not available'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 text-center">
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Expected Salary</div>
          <div className="text-green-400 font-medium text-sm">{candidate.expectedSalary || 'Not specified'}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Work Authorization</div>
          <div className="text-blue-400 font-medium text-sm">{candidate.workAuthorization || 'Not specified'}</div>
        </div>
        <div className="bg-white/5 rounded-xl p-3 border border-white/10">
          <div className="text-sm text-gray-400 mb-1">Applied</div>
          <div className="text-white font-medium text-sm">
            {candidate.appliedDate ? new Date(candidate.appliedDate).toLocaleDateString() : 
             candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'Unknown'}
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button 
          onClick={() => setSelectedCandidate(candidate)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105"
        >
          View Details
        </button>

        {candidate.resume?.fileUrl && (
          <a
            href={`/ats?candidateId=${candidate._id || candidate.id}${candidate.jobId ? `&jobId=${candidate.jobId}` : ''}`}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105"
            title="ATS Analysis"
          >
            🎯
          </a>
        )}

        {candidate.resume?.fileUrl && (
          <a
            href={candidate.resume.fileUrl.startsWith('http') ? candidate.resume.fileUrl : candidate.resume.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105"
            title="View Resume"
          >
            📄
          </a>
        )}

        {candidate.status === 'pending' && (
          <button 
            onClick={() => updateCandidateStatus(candidate._id || candidate.id, 'reviewing')}
            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105"
          >
            Review
          </button>
        )}

        {(candidate.status === 'reviewing' || candidate.status === 'pending') && (
          <button 
            onClick={() => updateCandidateStatus(candidate._id || candidate.id, 'shortlisted')}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105"
          >
            Shortlist
          </button>
        )}

        {candidate.status === 'shortlisted' && (
          <button 
            onClick={() => updateCandidateStatus(candidate._id || candidate.id, 'interview-scheduled')}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105"
          >
            Schedule Interview
          </button>
        )}

        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors">
          💬
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Candidates...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting to database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/8 to-blue-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-br from-pink-400/8 to-red-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-green-400/8 to-cyan-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              👥 Master Data Hub
            </h1>
            <button 
              onClick={refreshCandidates}
              disabled={refreshing}
              className={`p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 ${refreshing ? 'animate-spin' : 'hover:scale-110'}`}
              title="Refresh Candidates"
            >
              <span className="text-2xl">{refreshing ? '⏳' : '🔄'}</span>
            </button>
          </div>
          <p className="text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto font-light">
            Discover and manage your talent pipeline with AI-powered insights
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-6 space-y-6 lg:space-y-0">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            {['all', 'new', 'screening', 'interview', 'offer', 'hired', 'rejected'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  activeFilter === filter
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
            >
              <option value="score">Sort by Match Score</option>
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Application Date</option>
            </select>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8 text-center">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="text-3xl mb-3">👥</div>
            <div className="text-2xl font-bold text-blue-400 mb-2">{stats.total}</div>
            <div className="text-gray-300 text-sm">Total</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="text-3xl mb-3">🆕</div>
            <div className="text-2xl font-bold text-green-400 mb-2">{stats.new}</div>
            <div className="text-gray-300 text-sm">New</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="text-3xl mb-3">👀</div>
            <div className="text-2xl font-bold text-yellow-400 mb-2">{stats.screening}</div>
            <div className="text-gray-300 text-sm">Screening</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="text-3xl mb-3">🎤</div>
            <div className="text-2xl font-bold text-purple-400 mb-2">{stats.interview}</div>
            <div className="text-gray-300 text-sm">Interview</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="text-3xl mb-3">💼</div>
            <div className="text-2xl font-bold text-cyan-400 mb-2">{stats.offer}</div>
            <div className="text-gray-300 text-sm">Offers</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="text-3xl mb-3">🎉</div>
            <div className="text-2xl font-bold text-emerald-400 mb-2">{stats.hired}</div>
            <div className="text-gray-300 text-sm">Hired</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="text-3xl mb-3">🏆</div>
            <div className="text-2xl font-bold text-orange-400 mb-2">{stats.avgMatch}%</div>
            <div className="text-gray-300 text-sm">Avg Match</div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="space-y-8">
          {filteredAndSortedCandidates.length > 0 ? (
            filteredAndSortedCandidates.map((candidate) => (
              <CandidateCard key={candidate._id || candidate.id} candidate={candidate} />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-3xl font-bold text-gray-400 mb-4">No candidates found</h3>
              <p className="text-gray-500 text-lg">
                {candidates.length === 0 ? 'No candidates in the system yet' : 'Try adjusting your search or filters'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Detailed Candidate Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-slate-800 to-purple-800 rounded-3xl p-8 max-w-6xl max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {selectedCandidate.profilePicture?.fileUrl ? (
                    <img
                      src={selectedCandidate.profilePicture.fileUrl.startsWith('http') ? selectedCandidate.profilePicture.fileUrl : selectedCandidate.profilePicture.fileUrl}
                      alt={selectedCandidate.name}
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-500"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl">
                      {selectedCandidate.name ? selectedCandidate.name.charAt(0).toUpperCase() : '👤'}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedCandidate.name}</h2>
                  <p className="text-xl text-purple-300">{selectedCandidate.position}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCandidate.status)}`}>
                      {formatStatus(selectedCandidate.status)}
                    </span>
                    <span className={`text-2xl font-bold ${(selectedCandidate.atsMatch || selectedCandidate.matchScore) ? getScoreColor(selectedCandidate.atsMatch || selectedCandidate.matchScore) : 'text-gray-500'}`}>
                      {(selectedCandidate.atsMatch || selectedCandidate.matchScore) ? `${selectedCandidate.atsMatch || selectedCandidate.matchScore}%` : 'N/A'} ATS Match
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="text-gray-400 hover:text-white text-2xl p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Complete Profile Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Personal Information */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">👤</span> Personal Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">First Name:</span>
                    <span className="text-white">{selectedCandidate.firstName || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Last Name:</span>
                    <span className="text-white">{selectedCandidate.lastName || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-blue-400 break-all">{selectedCandidate.email}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Phone:</span>
                    <span className="text-white">{selectedCandidate.phone || selectedCandidate.mobile || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Alt Phone:</span>
                    <span className="text-white">{selectedCandidate.alternatePhone || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Date of Birth:</span>
                    <span className="text-white">
                      {selectedCandidate.dateOfBirth ? new Date(selectedCandidate.dateOfBirth).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Gender:</span>
                    <span className="text-white">{selectedCandidate.gender || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Profile Views:</span>
                    <span className="text-cyan-400">{selectedCandidate.profileViews || 0}</span>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📍</span> Address Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Street:</span>
                    <span className="text-white">{selectedCandidate.address?.street || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">City:</span>
                    <span className="text-white">{selectedCandidate.address?.city || selectedCandidate.location || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">State:</span>
                    <span className="text-white">{selectedCandidate.address?.state || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Postal Code:</span>
                    <span className="text-white">{selectedCandidate.address?.postalCode || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Country:</span>
                    <span className="text-white">{selectedCandidate.address?.country || 'India'}</span>
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📄</span> Professional Summary
                </h3>
                <div className="text-sm text-gray-300 leading-relaxed">
                  {selectedCandidate.bio || selectedCandidate.summary || 'No professional summary provided'}
                </div>
              </div>
            </div>

            {/* Professional Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">💼</span> Professional Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Current Company:</span>
                    <span className="text-white">{selectedCandidate.currentCompany || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Designation:</span>
                    <span className="text-white">{selectedCandidate.currentDesignation || selectedCandidate.position || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Total Experience:</span>
                    <span className="text-white">{selectedCandidate.totalExperience || (selectedCandidate.isFresher ? 'Fresher' : 'N/A')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Relevant Experience:</span>
                    <span className="text-white">{selectedCandidate.relevantExperience || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Current Salary:</span>
                    <span className="text-green-400">{selectedCandidate.currentSalary || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Expected Salary:</span>
                    <span className="text-green-400">{selectedCandidate.expectedSalary || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Notice Period:</span>
                    <span className="text-yellow-400">{selectedCandidate.noticePeriod || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Work Authorization:</span>
                    <span className="text-white">{selectedCandidate.workAuthorization || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Availability:</span>
                    <span className="text-white">{selectedCandidate.availability || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🎓</span> Complete Academic History
                </h3>
                <div className="space-y-4 text-sm">
                  {/* 10th Grade */}
                  {selectedCandidate.educationHistory?.tenthGrade && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <h4 className="text-blue-300 font-semibold mb-2">Class 10th</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-gray-400">Board:</span> <span className="text-white">{selectedCandidate.educationHistory.tenthGrade.board || 'N/A'}</span></div>
                        <div><span className="text-gray-400">Year:</span> <span className="text-white">{selectedCandidate.educationHistory.tenthGrade.yearOfPassing || 'N/A'}</span></div>
                        <div><span className="text-gray-400">School:</span> <span className="text-white">{selectedCandidate.educationHistory.tenthGrade.schoolName || 'N/A'}</span></div>
                        <div><span className="text-gray-400">Percentage:</span> <span className="text-green-400">{selectedCandidate.educationHistory.tenthGrade.percentage || 'N/A'}</span></div>
                      </div>
                    </div>
                  )}
                  
                  {/* 12th Grade */}
                  {selectedCandidate.educationHistory?.twelfthGrade && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <h4 className="text-blue-300 font-semibold mb-2">Class 12th</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-gray-400">Board:</span> <span className="text-white">{selectedCandidate.educationHistory.twelfthGrade.board || 'N/A'}</span></div>
                        <div><span className="text-gray-400">Stream:</span> <span className="text-white">{selectedCandidate.educationHistory.twelfthGrade.stream || 'N/A'}</span></div>
                        <div><span className="text-gray-400">Year:</span> <span className="text-white">{selectedCandidate.educationHistory.twelfthGrade.yearOfPassing || 'N/A'}</span></div>
                        <div><span className="text-gray-400">Percentage:</span> <span className="text-green-400">{selectedCandidate.educationHistory.twelfthGrade.percentage || 'N/A'}</span></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Graduation */}
                  {selectedCandidate.educationHistory?.graduation && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <h4 className="text-blue-300 font-semibold mb-2">Graduation</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-gray-400">Degree:</span> <span className="text-white">{selectedCandidate.educationHistory.graduation.degree || selectedCandidate.degree || 'N/A'}</span></div>
                        <div><span className="text-gray-400">Specialization:</span> <span className="text-white">{selectedCandidate.educationHistory.graduation.specialization || 'N/A'}</span></div>
                        <div><span className="text-gray-400">University:</span> <span className="text-white text-xs">{selectedCandidate.educationHistory.graduation.university || selectedCandidate.university || 'N/A'}</span></div>
                        <div><span className="text-gray-400">Year:</span> <span className="text-white">{selectedCandidate.educationHistory.graduation.yearOfPassing || selectedCandidate.graduationYear || 'N/A'}</span></div>
                        <div><span className="text-gray-400">CGPA:</span> <span className="text-green-400">{selectedCandidate.educationHistory.graduation.cgpa || selectedCandidate.gpa || 'N/A'}</span></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Post Graduation */}
                  {selectedCandidate.educationHistory?.postGraduation?.degree && (
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <h4 className="text-purple-300 font-semibold mb-2">Post Graduation</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="text-gray-400">Degree:</span> <span className="text-white">{selectedCandidate.educationHistory.postGraduation.degree}</span></div>
                        <div><span className="text-gray-400">Specialization:</span> <span className="text-white">{selectedCandidate.educationHistory.postGraduation.specialization || 'N/A'}</span></div>
                        <div><span className="text-gray-400">University:</span> <span className="text-white text-xs">{selectedCandidate.educationHistory.postGraduation.university || 'N/A'}</span></div>
                        <div><span className="text-gray-400">Year:</span> <span className="text-white">{selectedCandidate.educationHistory.postGraduation.yearOfPassing || 'N/A'}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Skills and Languages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🛠️</span> Technical Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedCandidate.skills || []).length > 0 ? (
                    selectedCandidate.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg border border-blue-500/30">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No skills listed</span>
                  )}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🗣️</span> Languages
                </h3>
                <div className="space-y-2">
                  {(selectedCandidate.languages || []).length > 0 ? (
                    selectedCandidate.languages.map((lang, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-white text-sm">{typeof lang === 'string' ? lang : lang.name}</span>
                        <span className="text-blue-400 text-xs">
                          {typeof lang === 'object' ? lang.proficiency : 'Not specified'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500 text-sm">No languages specified</span>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences and Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📍</span> Work Preferences
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400 block mb-2">Preferred Locations:</span>
                    <div className="flex flex-wrap gap-1">
                      {(selectedCandidate.preferredLocation || []).length > 0 ? (
                        selectedCandidate.preferredLocation.map((location, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">
                            {location}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No preferences specified</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400 block mb-2">Work Type Preferences:</span>
                    <div className="flex flex-wrap gap-1">
                      {(selectedCandidate.workPreferences || []).length > 0 ? (
                        selectedCandidate.workPreferences.map((pref, index) => (
                          <span key={index} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded border border-green-500/30">
                            {pref}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No preferences specified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🔗</span> Links & Social Profiles
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">LinkedIn:</span>
                    <span className="text-blue-400 text-xs break-all">
                      {selectedCandidate.linkedIn || selectedCandidate.linkedin || 'Not provided'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">Portfolio:</span>
                    <span className="text-blue-400 text-xs break-all">
                      {selectedCandidate.portfolio || 'Not provided'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <span className="text-gray-400">GitHub:</span>
                    <span className="text-blue-400 text-xs break-all">
                      {selectedCandidate.github || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Experience History */}
            {selectedCandidate.workExperienceHistory && selectedCandidate.workExperienceHistory.length > 0 && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">💼</span> Work Experience History ({selectedCandidate.workExperienceHistory.length})
                </h3>
                <div className="space-y-4">
                  {selectedCandidate.workExperienceHistory.map((exp, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-semibold text-lg">{exp.jobTitle}</h4>
                          <p className="text-blue-300">{exp.companyName}</p>
                          <p className="text-gray-400 text-sm">
                            {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A'} - 
                            {exp.isCurrentJob ? ' Present' : (exp.endDate ? ` ${new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ' N/A')}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded border border-purple-500/30">
                            {exp.employmentType || 'Full-time'}
                          </span>
                          {exp.workMode && (
                            <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                              {exp.workMode}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {exp.location && (
                        <p className="text-gray-400 text-sm mb-2">📍 {exp.location}</p>
                      )}
                      
                      {exp.responsibilities && exp.responsibilities.length > 0 && (
                        <div className="mb-2">
                          <h5 className="text-green-300 text-sm font-semibold mb-1">Key Responsibilities:</h5>
                          <ul className="text-gray-300 text-xs space-y-1">
                            {exp.responsibilities.slice(0, 3).map((resp, rIndex) => (
                              <li key={rIndex}>• {resp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {exp.technologies && exp.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {exp.technologies.map((tech, tIndex) => (
                            <span key={tIndex} className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {(selectedCandidate.certifications || selectedCandidate.certificationsDetail || []).length > 0 && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🏆</span> Certifications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(selectedCandidate.certificationsDetail || selectedCandidate.certifications || []).map((cert, index) => (
                    <span key={index} className="px-3 py-1 bg-orange-500/20 text-orange-300 text-sm rounded-lg border border-orange-500/30">
                      {typeof cert === 'string' ? cert : cert.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume Information */}
            {selectedCandidate.resume && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">📄</span> Resume Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 block">File Name:</span>
                    <span className="text-white">{selectedCandidate.resume.fileName || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Upload Date:</span>
                    <span className="text-white">
                      {selectedCandidate.resume.uploadDate ? 
                        new Date(selectedCandidate.resume.uploadDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Action:</span>
                    {selectedCandidate.resume.fileUrl && (
                      <a 
                        href={selectedCandidate.resume.fileUrl.startsWith('http') ? selectedCandidate.resume.fileUrl : selectedCandidate.resume.fileUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-white underline"
                      >
                        View Resume
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {(selectedCandidate.strengths || selectedCandidate.concerns || selectedCandidate.aiAnalysis) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-green-400 mb-4 flex items-center">
                    <span className="mr-2">✅</span> Strengths
                  </h3>
                  <ul className="space-y-2">
                    {(selectedCandidate.strengths || selectedCandidate.aiAnalysis?.strengths || []).map((strength, index) => (
                      <li key={index} className="text-gray-300 text-sm">• {strength}</li>
                    ))}
                    {(!selectedCandidate.strengths && !selectedCandidate.aiAnalysis?.strengths) && (
                      <li className="text-gray-500 text-sm">• Analysis pending</li>
                    )}
                  </ul>
                </div>
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <h3 className="text-lg font-bold text-yellow-400 mb-4 flex items-center">
                    <span className="mr-2">⚠️</span> Areas for Consideration
                  </h3>
                  <ul className="space-y-2">
                    {(selectedCandidate.concerns || selectedCandidate.aiAnalysis?.weaknesses || []).map((concern, index) => (
                      <li key={index} className="text-gray-300 text-sm">• {concern}</li>
                    ))}
                    {(!selectedCandidate.concerns && !selectedCandidate.aiAnalysis?.weaknesses) && (
                      <li className="text-gray-500 text-sm">• Analysis pending</li>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Application Details */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <span className="mr-2">📊</span> Application Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-400 block">Candidate ID:</span>
                  <span className="text-cyan-400 font-mono font-bold">{selectedCandidate.candidateId || selectedCandidate.id}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Job ID:</span>
                  <span className="text-purple-400 font-mono font-bold">{selectedCandidate.jobId || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Application ID:</span>
                  <span className="text-pink-400 font-mono text-xs">{selectedCandidate.applicationId || selectedCandidate._id}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400 block">Applied Date:</span>
                  <span className="text-white">
                    {selectedCandidate.appliedDate ? new Date(selectedCandidate.appliedDate).toLocaleDateString() : 
                     selectedCandidate.createdAt ? new Date(selectedCandidate.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Application Source:</span>
                  <span className="text-white">{selectedCandidate.applicationSource || 'Direct Application'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">ATS Match Score:</span>
                  <span className={`font-bold ${getScoreColor(selectedCandidate.atsMatch || selectedCandidate.matchScore || 0)}`}>
                    {selectedCandidate.atsMatch || selectedCandidate.matchScore || 0}%</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Profile Views:</span>
                  <span className="text-white">{selectedCandidate.profileViews || 0}</span>
                </div>
              </div>
            </div>

            {/* Background Check */}
            {selectedCandidate.backgroundCheck && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">🔍</span> Background Check Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-gray-400 block">Status:</span>
                    <span className={`font-semibold ${
                      selectedCandidate.backgroundCheck.status === 'Completed' ? 'text-green-400' :
                      selectedCandidate.backgroundCheck.status === 'In Progress' ? 'text-yellow-400' :
                      selectedCandidate.backgroundCheck.status === 'Failed' ? 'text-red-400' :
                      'text-gray-400'
                    }`}>
                      {selectedCandidate.backgroundCheck.status || 'Not Started'}
                    </span>
                  </div>
                  {selectedCandidate.backgroundCheck.lastCheckedDate && (
                    <div>
                      <span className="text-gray-400 block">Last Checked:</span>
                      <span className="text-white">
                        {new Date(selectedCandidate.backgroundCheck.lastCheckedDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
                
                {selectedCandidate.backgroundCheck.documents && selectedCandidate.backgroundCheck.documents.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-white font-semibold mb-2">Verified Documents:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedCandidate.backgroundCheck.documents.map((doc, index) => (
                        <div key={index} className="bg-white/5 rounded p-2 border border-white/10">
                          <div className="flex justify-between items-center">
                            <span className="text-blue-300 font-medium">{doc.type}</span>
                            <span className={doc.verified ? 'text-green-400' : 'text-yellow-400'}>
                              {doc.verified ? '✓ Verified' : 'Pending'}
                            </span>
                          </div>
                          <span className="text-gray-400 text-xs">{doc.number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedCandidate.backgroundCheck.criminalRecord && (
                  <div className="bg-white/5 rounded p-3 border border-white/10">
                    <h4 className="text-white font-semibold mb-2">Criminal Record Check:</h4>
                    <div className="text-sm">
                      <span className={selectedCandidate.backgroundCheck.criminalRecord.status === 'Clear' ? 'text-green-400' : 'text-red-400'}>
                        {selectedCandidate.backgroundCheck.criminalRecord.status || 'Not Checked'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* References */}
            {selectedCandidate.references && selectedCandidate.references.length > 0 && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">👥</span> References ({selectedCandidate.references.length})
                </h3>
                <div className="space-y-4">
                  {selectedCandidate.references.map((ref, index) => (
                    <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400 block">Name:</span>
                          <span className="text-white font-semibold">{ref.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Designation:</span>
                          <span className="text-white">{ref.designation}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Company:</span>
                          <span className="text-white">{ref.company || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Relationship:</span>
                          <span className="text-white">{ref.relationship || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Email:</span>
                          <span className="text-blue-400">{ref.email}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Phone:</span>
                          <span className="text-white">{ref.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Years Known:</span>
                          <span className="text-white">{ref.yearsKnown || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 block">Can Contact:</span>
                          <span className={ref.canContact ? 'text-green-400' : 'text-red-400'}>
                            {ref.canContact ? '✅ Yes' : '❌ No'}
                          </span>
                        </div>
                        {ref.rating && (
                          <div>
                            <span className="text-gray-400 block">Rating:</span>
                            <span className="text-yellow-400">
                              {'⭐'.repeat(ref.rating)} ({ref.rating}/5)
                            </span>
                          </div>
                        )}
                        {ref.feedback && (
                          <div className="col-span-2">
                            <span className="text-gray-400 block mb-1">Feedback:</span>
                            <span className="text-white text-xs">{ref.feedback}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Hiring Details */}
            {selectedCandidate.hiringDetails && (
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                  <span className="mr-2">💼</span> Hiring Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400 block">Hiring Company:</span>
                    <span className="text-white font-semibold">{selectedCandidate.hiringDetails.hiringCompany || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Department:</span>
                    <span className="text-white">{selectedCandidate.hiringDetails.hiringDepartment || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Position Applied For:</span>
                    <span className="text-white font-semibold">{selectedCandidate.hiringDetails.positionAppliedFor || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Offer Status:</span>
                    <span className={`font-semibold ${
                      selectedCandidate.hiringDetails.offerStatus === 'Offer Accepted' ? 'text-green-400' :
                      selectedCandidate.hiringDetails.offerStatus === 'Offer Extended' ? 'text-blue-400' :
                      selectedCandidate.hiringDetails.offerStatus === 'Offer Declined' ? 'text-red-400' :
                      selectedCandidate.hiringDetails.offerStatus === 'Negotiating' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {selectedCandidate.hiringDetails.offerStatus || 'Not Offered'}
                    </span>
                  </div>
                  {selectedCandidate.hiringDetails.offerDate && (
                    <div>
                      <span className="text-gray-400 block">Offer Date:</span>
                      <span className="text-white">
                        {new Date(selectedCandidate.hiringDetails.offerDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {selectedCandidate.hiringDetails.joiningDate && (
                    <div>
                      <span className="text-gray-400 block">Joining Date:</span>
                      <span className="text-white">
                        {new Date(selectedCandidate.hiringDetails.joiningDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {selectedCandidate.hiringDetails.offeredSalary && (
                    <div>
                      <span className="text-gray-400 block">Offered Salary:</span>
                      <span className="text-green-400 font-semibold">{selectedCandidate.hiringDetails.offeredSalary}</span>
                    </div>
                  )}
                  {selectedCandidate.hiringDetails.offeredDesignation && (
                    <div>
                      <span className="text-gray-400 block">Offered Designation:</span>
                      <span className="text-white">{selectedCandidate.hiringDetails.offeredDesignation}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4 border-t border-white/10">
              {selectedCandidate.status === 'pending' && (
                <button 
                  onClick={() => {
                    updateCandidateStatus(selectedCandidate._id || selectedCandidate.id, 'reviewing');
                    setSelectedCandidate(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300"
                >
                  Review Application
                </button>
              )}

              {(selectedCandidate.status === 'reviewing' || selectedCandidate.status === 'pending') && (
                <button 
                  onClick={() => {
                    updateCandidateStatus(selectedCandidate._id || selectedCandidate.id, 'shortlisted');
                    setSelectedCandidate(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300"
                >
                  Shortlist Candidate
                </button>
              )}

              {selectedCandidate.status === 'shortlisted' && (
                <button 
                  onClick={() => {
                    updateCandidateStatus(selectedCandidate._id || selectedCandidate.id, 'interview-scheduled');
                    setSelectedCandidate(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300"
                >
                  Schedule Interview
                </button>
              )}

              <button 
                onClick={() => setSelectedCandidate(null)}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}