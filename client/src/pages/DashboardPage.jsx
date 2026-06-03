import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SystemStatus from '../components/SystemStatus';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardPage() {
  const { user, apiCall } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Dynamic dashboard data
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalResumes: 0,
      processed: 0,
      matched: 0,
      pending: 0,
      activeJobs: 0,
      totalApplications: 0,
      interviewsScheduled: 0,
      hiredCandidates: 0
    },
    recentActivity: [],
    topCandidates: [],
    jobsOverview: [],
    systemMetrics: {
      processingSpeed: 0,
      matchAccuracy: 0,
      responseTime: 0,
      uptime: 100
    }
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState('overview');
  const [chartView, setChartView] = useState('weekly');

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      refreshDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load various dashboard components
      await Promise.all([
        loadStats(),
        loadRecentActivity(),
        loadTopCandidates(),
        loadJobsOverview(),
        loadSystemMetrics()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboardData = async () => {
    try {
      setRefreshing(true);
      await loadDashboardData();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiCall('/api/admin/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(prev => ({ ...prev, stats: data.data }));
      } else {
        console.error('Failed to load stats');
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentActivity = async () => {
    try {
      const response = await apiCall('/api/admin/dashboard/activity');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(prev => ({ ...prev, recentActivity: data.data }));
      } else {
        console.error('Failed to load activity');
      }
    } catch (error) {
      console.error('Error loading activity:', error);
    }
  };

  const loadTopCandidates = async () => {
    try {
      const response = await apiCall('/api/admin/dashboard/candidates');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(prev => ({ ...prev, topCandidates: data.data }));
      } else {
        console.error('Failed to load candidates');
      }
    } catch (error) {
      console.error('Error loading candidates:', error);
    }
  };

  const loadJobsOverview = async () => {
    try {
      const response = await apiCall('/api/admin/dashboard/jobs');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(prev => ({ ...prev, jobsOverview: data.data }));
      } else {
        console.error('Failed to load jobs');
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadSystemMetrics = async () => {
    try {
      const mockMetrics = {
        processingSpeed: Math.floor(Math.random() * 50) + 70, // 70-120 resumes/hour
        matchAccuracy: Math.floor(Math.random() * 15) + 85, // 85-100%
        responseTime: Math.floor(Math.random() * 200) + 100, // 100-300ms
        uptime: 99.8
      };

      setDashboardData(prev => ({ ...prev, systemMetrics: mockMetrics }));
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-gradient-to-r from-emerald-400 to-cyan-400';
      case 'Interview': return 'bg-gradient-to-r from-purple-400 to-pink-400';
      case 'Reviewing': return 'bg-gradient-to-r from-yellow-400 to-orange-400';
      case 'Offer Sent': return 'bg-gradient-to-r from-green-400 to-emerald-400';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-500/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-l-green-500 bg-green-500/10';
      default: return 'border-l-gray-500 bg-gray-500/10';
    }
  };

  const StatCard = ({ title, value, subtitle, trend, icon, color = "primary", loading: cardLoading = false }) => (
    <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className={`text-5xl p-4 bg-gradient-to-br ${color === 'primary' ? 'from-red-400/20 to-red-600/20' : color === 'secondary' ? 'from-blue-400/20 to-blue-600/20' : 'from-purple-400/20 to-purple-600/20'} rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
          {cardLoading ? '⏳' : icon}
        </div>
        {trend && (
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <span className="text-sm">{trend > 0 ? '↗️' : '↘️'}</span>
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className={`text-4xl font-bold mb-2 ${color === 'primary' ? 'bg-gradient-to-r from-red-400 to-red-600' : color === 'secondary' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-purple-400 to-purple-600'} bg-clip-text text-transparent`}>
        {cardLoading ? '...' : typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-white font-medium text-lg mb-2">{title}</div>
      {subtitle && (
        <div className="text-gray-400 text-sm">{subtitle}</div>
      )}

      {/* Progress bar for visual appeal */}
      <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color === 'primary' ? 'bg-gradient-to-r from-red-400 to-red-600' : color === 'secondary' ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 'bg-gradient-to-r from-purple-400 to-purple-600'} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: cardLoading ? '0%' : `${Math.min((typeof value === 'number' ? value : 0) / Math.max((typeof value === 'number' ? value : 0) + 20, 100), 100) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-red-400/10 to-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-red-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/5 to-transparent animate-pulse"></div>
      </div>

      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-2 pb-6 space-y-12">

        {/* Enhanced Hero Section with Real-time Elements */}
        <div className="text-center py-12">
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-red-400 via-blue-400 to-red-400 bg-clip-text text-transparent">
                🎯 Admin Dashboard
              </h1>
              <button 
                onClick={refreshDashboardData}
                disabled={refreshing}
                className={`p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:border-white/40 transition-all duration-300 ${refreshing ? 'animate-spin' : 'hover:scale-110'}`}
                title="Refresh Dashboard"
              >
                <span className="text-2xl">{refreshing ? '⏳' : '🔄'}</span>
              </button>
            </div>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed mb-6">
              Welcome back, {user?.firstName}! Here's your intelligent ATS command center
            </p>
            <div className="flex items-center justify-center space-x-8">
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-gray-300 font-medium">
                  {currentTime.toLocaleString()}
                </span>
              </div>
              <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <span className="text-green-400">⚡</span>
                <span className="text-gray-300 font-medium">
                  System Online
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            {[
              { key: 'overview', label: '📊 Overview', icon: '📊' },
              { key: 'analytics', label: '📈 Analytics', icon: '📈' },
              { key: 'activity', label: '⚡ Activity', icon: '⚡' },
              { key: 'system', label: '🔧 System', icon: '🔧' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeSection === tab.key
                    ? 'bg-gradient-to-r from-red-500 to-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            title="Total Resumes"
            value={dashboardData.stats.totalResumes}
            subtitle="All submissions"
            trend={12.5}
            icon="📄"
            color="primary"
            loading={refreshing}
          />
          <StatCard
            title="Processed"
            value={dashboardData.stats.processed}
            subtitle="AI analyzed"
            trend={8.3}
            icon="⚡"
            color="secondary"
            loading={refreshing}
          />
          <StatCard
            title="High Matches"
            value={dashboardData.stats.matched}
            subtitle="Quality candidates"
            trend={15.2}
            icon="🎯"
            color="primary"
            loading={refreshing}
          />
          <StatCard
            title="Active Jobs"
            value={dashboardData.stats.activeJobs}
            subtitle="Open positions"
            trend={-2.1}
            icon="💼"
            color="secondary"
            loading={refreshing}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard
            title="Applications"
            value={dashboardData.stats.totalApplications}
            subtitle="Total received"
            trend={7.8}
            icon="📝"
            color="primary"
            loading={refreshing}
          />
          <StatCard
            title="Interviews"
            value={dashboardData.stats.interviewsScheduled}
            subtitle="Scheduled"
            trend={22.4}
            icon="🎤"
            color="secondary"
            loading={refreshing}
          />
          <StatCard
            title="Hired"
            value={dashboardData.stats.hiredCandidates}
            subtitle="Successful placements"
            trend={33.1}
            icon="🎉"
            color="primary"
            loading={refreshing}
          />
          <StatCard
            title="Pending Review"
            value={dashboardData.stats.pending}
            subtitle="Awaiting action"
            trend={-5.2}
            icon="⏳"
            color="secondary"
            loading={refreshing}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Enhanced Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-white">⚡ Live Activity Feed</h3>
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400 font-medium">Real-time</span>
                </div>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {dashboardData.recentActivity.length > 0 ? dashboardData.recentActivity.map((activity, index) => (
                  <div key={activity.id} className={`group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border-l-4 transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] ${getPriorityColor(activity.priority)}`}>
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                        {activity.icon}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-lg">{activity.action}</div>
                        <div className="text-gray-400 flex items-center space-x-3">
                          <span>
                            {activity.candidate && `👤 ${activity.candidate}`}
                            {activity.job && ` • 💼 ${activity.job}`}
                            {activity.count && `📊 ${activity.count}`}
                          </span>
                          <span>•</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                      {activity.score && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">{activity.score}%</div>
                          <div className="text-xs text-gray-400">Match</div>
                        </div>
                      )}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <span className="text-white/60 text-xl">→</span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-4">📭</div>
                    <div>No recent activity</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Top Candidates */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-8">🏆 Top Candidates</h3>
              <div className="space-y-4">
                {dashboardData.topCandidates.length > 0 ? dashboardData.topCandidates.map((candidate, index) => (
                  <div key={index} className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{candidate.avatar}</div>
                        <div>
                          <div className="text-white font-semibold text-lg">{candidate.name}</div>
                          <div className="text-gray-400 text-sm">{candidate.position}</div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white mt-1 ${getStatusColor(candidate.status)}`}>
                            {candidate.status}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-400">{candidate.match}%</div>
                        <div className="text-xs text-gray-400">Match Score</div>
                      </div>
                      <div className="w-24 bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${candidate.match}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="text-gray-400 text-sm mb-3">
                      📍 {candidate.location} • 💼 {candidate.experience}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-colors duration-200">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-500/20 text-gray-300 text-xs rounded-lg border border-gray-500/30">
                          +{candidate.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-4">👥</div>
                    <div>No candidates yet</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Overview Section */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">💼 Acti
            
            
            ve Jobs Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardData.jobsOverview.length > 0 ? dashboardData.jobsOverview.map((job) => (
              <div key={job.id} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-bold text-lg">{job.title}</h4>
                  <div className={`w-3 h-3 rounded-full ${
                    job.urgency === 'high' ? 'bg-red-400' : 
                    job.urgency === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                  }`}></div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Applications</span>
                    <span className="text-blue-400 font-bold">{job.applications}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Views</span>
                    <span className="text-red-400 font-bold">{job.views}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Days Open</span>
                    <span className="text-yellow-400 font-bold">{job.daysOpen}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="text-sm text-gray-400">{job.department}</div>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center py-8 text-gray-400">
                <div className="text-4xl mb-4">💼</div>
                <div>No active jobs</div>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <SystemStatus />
        </div>

        {/* System Metrics */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">🔧 System Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-4xl mb-4">⚡</div>
              <div className="text-2xl font-bold text-red-400 mb-2">{dashboardData.systemMetrics.processingSpeed}/hr</div>
              <div className="text-gray-300 text-sm">Processing Speed</div>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-4xl mb-4">🎯</div>
              <div className="text-2xl font-bold text-green-400 mb-2">{dashboardData.systemMetrics.matchAccuracy}%</div>
              <div className="text-gray-300 text-sm">Match Accuracy</div>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-4xl mb-4">📡</div>
              <div className="text-2xl font-bold text-blue-400 mb-2">{dashboardData.systemMetrics.responseTime}ms</div>
              <div className="text-gray-300 text-sm">Response Time</div>
            </div>
            <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="text-4xl mb-4">🟢</div>
              <div className="text-2xl font-bold text-emerald-400 mb-2">{dashboardData.systemMetrics.uptime}%</div>
              <div className="text-gray-300 text-sm">System Uptime</div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "📤", label: "Upload Resumes", color: "red", action: "/ats" },
              { icon: "📝", label: "Create Job", color: "blue", action: "/jobs" },
              { icon: "👥", label: "View Candidates", color: "red", action: "/candidates" },
              { icon: "📊", label: "Analytics", color: "blue", action: "/analytics" }
            ].map((action, index) => (
              <button 
                key={index}
                onClick={() => window.location.href = action.action}
                className="group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${action.color === 'red' ? 'from-red-600/30 to-red-400/30' : 'from-blue-600/30 to-blue-400/30'} rounded-xl blur-sm group-hover:blur-md transition-all duration-300`}></div>
                <div className={`relative flex flex-col items-center p-8 bg-gradient-to-br ${action.color === 'red' ? 'from-red-500/20 to-red-600/20 border-red-400/50' : 'from-blue-500/20 to-blue-600/20 border-blue-400/50'} backdrop-blur-sm rounded-xl border border-white/20 hover:border-opacity-50 transition-all duration-300 hover:scale-105 hover:rotate-1 group-hover:shadow-2xl`}>
                  <span className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">{action.icon}</span>
                  <span className="text-lg font-medium text-white text-center">{action.label}</span>
                </div>
              </button>
            ))}
          </div>
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