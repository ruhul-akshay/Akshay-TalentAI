
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function JobSeekerDashboard({ initialSection = 'overview' }) {
  const { user, apiCall } = useAuth();
  const [activeSection, setActiveSection] = useState(initialSection);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    appliedJobs: 0,
    savedJobs: 0,
    interviews: 0,
    profileViews: 0
  });

  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Sync section if prop changes
  useEffect(() => {
    if (initialSection && initialSection !== activeSection) {
      handleSectionChange(initialSection);
    }
  }, [initialSection]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsResponse = await apiCall('/api/job-seeker/dashboard/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }

      // Load applications if viewing applications section
      if (activeSection === 'applications') {
        loadApplications();
      } else if (activeSection === 'saved') {
        loadSavedJobs();
      } else if (activeSection === 'interviews') {
        loadInterviews();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      const response = await apiCall('/api/job-seeker/applications');
      if (response.ok) {
        const data = await response.json();
        setApplications(data.data || []);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const loadSavedJobs = async () => {
    try {
      const response = await apiCall('/api/job-seeker/saved-jobs');
      if (response.ok) {
        const data = await response.json();
        setSavedJobs(data.data || []);
      }
    } catch (error) {
      console.error('Error loading saved jobs:', error);
    }
  };

  const loadInterviews = async () => {
    try {
      const response = await apiCall('/api/job-seeker/interviews');
      if (response.ok) {
        const data = await response.json();
        setInterviews(data.data || []);
      }
    } catch (error) {
      console.error('Error loading interviews:', error);
    }
  };

  // Handle section change
  const handleSectionChange = async (section) => {
    setActiveSection(section);
    setLoading(true);
    
    if (section === 'applications') {
      await loadApplications();
    } else if (section === 'saved') {
      await loadSavedJobs();
    } else if (section === 'interviews') {
      await loadInterviews();
    }
    
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-gradient-to-r from-blue-400 to-blue-500';
      case 'reviewing': return 'bg-gradient-to-r from-yellow-400 to-orange-400';
      case 'shortlisted': return 'bg-gradient-to-r from-green-400 to-cyan-400';
      case 'interview-scheduled': return 'bg-gradient-to-r from-purple-400 to-pink-400';
      case 'rejected': return 'bg-gradient-to-r from-red-400 to-pink-400';
      case 'hired': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const formatSalary = (salaryRange) => {
    if (!salaryRange) return 'Not specified';
    if (salaryRange.min && salaryRange.max) {
      return `$${salaryRange.min}k - $${salaryRange.max}k`;
    }
    return 'Competitive';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'applications':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">📋 My Applications</h3>
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h4 className="text-xl font-bold text-gray-400 mb-2">No Applications Yet</h4>
                <p className="text-gray-500">Start applying to jobs to see them here</p>
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-white font-semibold text-lg">{app.job}</h4>
                      <p className="text-gray-400">{app.company}</p>
                      {app.location && <p className="text-gray-500 text-sm">📍 {app.location}</p>}
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(app.status)}`}>
                      {app.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                    <div className="flex space-x-4">
                      {app.salary && <span>💰 {formatSalary(app.salary)}</span>}
                      <button className="text-blue-400 hover:text-blue-300 transition-colors">
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'saved':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">❤️ Saved Jobs</h3>
            {savedJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">❤️</div>
                <h4 className="text-xl font-bold text-gray-400 mb-2">No Saved Jobs</h4>
                <p className="text-gray-500">Save jobs to view them later</p>
              </div>
            ) : (
              savedJobs.map((saved) => (
                <div key={saved.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-white font-semibold text-lg">{saved.title}</h4>
                      <p className="text-gray-400">{saved.company}</p>
                      {saved.location && <p className="text-gray-500 text-sm">📍 {saved.location}</p>}
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white py-2 px-4 rounded-xl font-medium transition-all duration-300">
                        Apply Now
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl font-medium transition-all duration-300">
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>Saved: {new Date(saved.savedDate).toLocaleDateString()}</span>
                    {saved.salary && <span>💰 {formatSalary(saved.salary)}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        );

      case 'interviews':
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-6">🎤 Interviews</h3>
            {interviews.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎤</div>
                <h4 className="text-xl font-bold text-gray-400 mb-2">No Interviews Scheduled</h4>
                <p className="text-gray-500">Your upcoming interviews will appear here</p>
              </div>
            ) : (
              interviews.map((interview) => (
                <div key={interview.id} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-white font-semibold text-lg">{interview.job}</h4>
                      <p className="text-gray-400">{interview.company}</p>
                      <p className="text-blue-400 text-sm">{interview.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Interview</p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium text-white ${
                      interview.status === 'scheduled' ? 'bg-gradient-to-r from-green-400 to-cyan-400' :
                      interview.status === 'completed' ? 'bg-gradient-to-r from-blue-400 to-purple-400' :
                      'bg-gradient-to-r from-red-400 to-pink-400'
                    }`}>
                      {interview.status.replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-400 mb-4">
                    <div>📅 {new Date(interview.scheduledDate).toLocaleDateString()}</div>
                    <div>⏰ {new Date(interview.scheduledDate).toLocaleTimeString()}</div>
                    <div>⏱️ {interview.duration} minutes</div>
                    {interview.interviewer?.name && (
                      <div>👤 {interview.interviewer.name}</div>
                    )}
                  </div>
                  {interview.meetingLink && (
                    <div className="flex justify-end">
                      <a 
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-2 px-4 rounded-xl font-medium transition-all duration-300"
                      >
                        Join Meeting
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        );

      default:
        return (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
                   onClick={() => handleSectionChange('applications')}>
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📋</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
                  {stats.appliedJobs}
                </div>
                <div className="text-gray-300 font-medium text-lg">Applied Jobs</div>
              </div>

              <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
                   onClick={() => handleSectionChange('saved')}>
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">❤️</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-3">
                  {stats.savedJobs}
                </div>
                <div className="text-gray-300 font-medium text-lg">Saved Jobs</div>
              </div>

              <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer"
                   onClick={() => handleSectionChange('interviews')}>
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🎤</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-3">
                  {stats.interviews}
                </div>
                <div className="text-gray-300 font-medium text-lg">Interviews</div>
              </div>

              <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">👁️</div>
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                  {stats.profileViews}
                </div>
                <div className="text-gray-300 font-medium text-lg">Profile Views</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-8 text-center">🚀 Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <button className="group bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">🔍</div>
                  <div className="font-bold text-lg">Search Jobs</div>
                  <div className="text-sm opacity-80 mt-2">Find opportunities</div>
                </button>
                <button 
                  onClick={() => window.location.href = '/profile'}
                  className="group bg-gradient-to-br from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📄</div>
                  <div className="font-bold text-lg">Update Profile</div>
                  <div className="text-sm opacity-80 mt-2">Improve your profile</div>
                </button>
                <button className="group bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
                  <div className="font-bold text-lg">Skill Assessment</div>
                  <div className="text-sm opacity-80 mt-2">Test your skills</div>
                </button>
                <button className="group bg-gradient-to-br from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">💬</div>
                  <div className="font-bold text-lg">Interview Prep</div>
                  <div className="text-sm opacity-80 mt-2">Practice interviews</div>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-2 pb-6 space-y-12">
        {/* Hero Section */}
        <div className="text-center py-12">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              👤 Job Seeker Dashboard
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              Welcome back, {user?.firstName}! Track your applications and discover new opportunities
            </p>
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mt-6">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 font-medium">
                {currentTime.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            {[
              { key: 'overview', label: '🏠 Overview', icon: '🏠' },
              { key: 'applications', label: '📋 Applications', icon: '📋' },
              { key: 'saved', label: '❤️ Saved Jobs', icon: '❤️' },
              { key: 'interviews', label: '🎤 Interviews', icon: '🎤' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleSectionChange(tab.key)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeSection === tab.key
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          {renderContent()}
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
