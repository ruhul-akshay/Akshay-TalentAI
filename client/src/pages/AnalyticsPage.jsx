import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeMetric, setActiveMetric] = useState('overview');

  const [analytics, setAnalytics] = useState({
    overview: {
      totalApplications: 1247,
      applicationsThisWeek: 89,
      averageMatchScore: 78.5,
      topPerformingJobs: 12,
      conversionRate: 23.4,
      timeToHire: 14.2
    },
    hiring: {
      interviews: 156,
      offers: 34,
      hired: 23,
      rejected: 89,
      pending: 67
    },
    sources: [
      { name: 'LinkedIn', applications: 423, percentage: 34 },
      { name: 'Company Website', applications: 312, percentage: 25 },
      { name: 'Indeed', applications: 298, percentage: 24 },
      { name: 'Referrals', applications: 156, percentage: 12.5 },
      { name: 'Other', applications: 58, percentage: 4.5 }
    ],
    topSkills: [
      { skill: 'React', demand: 89, availability: 67 },
      { skill: 'Python', demand: 85, availability: 72 },
      { skill: 'Node.js', demand: 78, availability: 54 },
      { skill: 'AWS', demand: 76, availability: 43 },
      { skill: 'TypeScript', demand: 71, availability: 38 }
    ]
  });

  const getMetricIcon = (metric) => {
    const icons = {
      overview: '📊',
      hiring: '🎯',
      sources: '🌐',
      skills: '💡'
    };
    return icons[metric] || '📈';
  };

  const MetricCard = ({ title, value, subtitle, trend, icon, color = "blue" }) => (
    <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105">
      <div className="flex items-center justify-between mb-6">
        <div className={`text-4xl p-4 bg-gradient-to-br from-${color}-400/20 to-${color}-600/20 rounded-2xl`}>
          {icon}
        </div>
        {trend && (
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${trend > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            <span className="text-sm">{trend > 0 ? '↗️' : '↘️'}</span>
            <span className="text-sm font-medium">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className={`text-4xl font-bold mb-2 bg-gradient-to-r from-${color}-400 to-purple-400 bg-clip-text text-transparent`}>
        {value}
      </div>
      <div className="text-white font-medium text-lg mb-2">{title}</div>
      {subtitle && (
        <div className="text-gray-400 text-sm">{subtitle}</div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/8 to-blue-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-br from-green-400/8 to-cyan-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-purple-400/8 to-pink-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Navbar softwareName="Akshay ATS Pro" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-black mb-8 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            📊 Analytics Hub
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 max-w-4xl mx-auto font-light">
            Deep insights into your hiring performance and candidate trends
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            {['1d', '7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {range === '1d' ? 'Today' : range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>

        {/* Metric Navigation */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-4 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            {['overview', 'hiring', 'sources', 'skills'].map((metric) => (
              <button
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeMetric === metric
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-xl">{getMetricIcon(metric)}</span>
                <span className="capitalize">{metric}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Metrics */}
        {activeMetric === 'overview' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <MetricCard
                title="Total Applications"
                value={analytics.overview.totalApplications.toLocaleString()}
                subtitle="All time applications"
                trend={12.5}
                icon="📝"
                color="blue"
              />
              <MetricCard
                title="This Week"
                value={analytics.overview.applicationsThisWeek}
                subtitle="New applications"
                trend={8.3}
                icon="📈"
                color="green"
              />
              <MetricCard
                title="Avg Match Score"
                value={`${analytics.overview.averageMatchScore}%`}
                subtitle="Quality indicator"
                trend={5.2}
                icon="🎯"
                color="purple"
              />
              <MetricCard
                title="Conversion Rate"
                value={`${analytics.overview.conversionRate}%`}
                subtitle="Application to hire"
                trend={-2.1}
                icon="⚡"
                color="yellow"
              />
              <MetricCard
                title="Time to Hire"
                value={`${analytics.overview.timeToHire} days`}
                subtitle="Average duration"
                trend={-15.3}
                icon="⏱️"
                color="cyan"
              />
              <MetricCard
                title="Top Jobs"
                value={analytics.overview.topPerformingJobs}
                subtitle="High performance"
                trend={7.8}
                icon="🏆"
                color="orange"
              />
            </div>
          </div>
        )}

        {/* Hiring Funnel */}
        {activeMetric === 'hiring' && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">🔄 Hiring Funnel</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {Object.entries(analytics.hiring).map(([stage, count], index) => {
                const colors = ['blue', 'purple', 'green', 'red', 'yellow'];
                const icons = ['👥', '🎤', '💼', '❌', '⏳'];
                return (
                  <div key={stage} className="text-center">
                    <div className={`mx-auto w-32 h-32 bg-gradient-to-br from-${colors[index]}-400 to-${colors[index]}-600 rounded-full flex items-center justify-center mb-4 hover:scale-110 transition-transform duration-300`}>
                      <div className="text-4xl">{icons[index]}</div>
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">{count}</div>
                    <div className="text-gray-400 capitalize text-lg">{stage}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Application Sources */}
        {activeMetric === 'sources' && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">🌐 Application Sources</h3>
            <div className="space-y-6">
              {analytics.sources.map((source, index) => (
                <div key={source.name} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">
                        {source.name === 'LinkedIn' ? '💼' : 
                         source.name === 'Company Website' ? '🏢' : 
                         source.name === 'Indeed' ? '🔍' : 
                         source.name === 'Referrals' ? '👥' : '🌟'}
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white">{source.name}</div>
                        <div className="text-gray-400">{source.applications} applications</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-purple-400">{source.percentage}%</div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${source.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Analysis */}
        {activeMetric === 'skills' && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">💡 Skills Analysis</h3>
            <div className="space-y-6">
              {analytics.topSkills.map((skillData, index) => (
                <div key={skillData.skill} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '⭐'}
                      </div>
                      <div className="text-xl font-bold text-white">{skillData.skill}</div>
                    </div>
                    <div className="flex space-x-6">
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-400">{skillData.demand}%</div>
                        <div className="text-sm text-gray-400">Demand</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{skillData.availability}%</div>
                        <div className="text-sm text-gray-400">Supply</div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Demand</span>
                        <span>{skillData.demand}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-red-400 to-orange-500 h-2 rounded-full"
                          style={{ width: `${skillData.demand}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>Availability</span>
                        <span>{skillData.availability}%</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-cyan-500 h-2 rounded-full"
                          style={{ width: `${skillData.availability}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
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