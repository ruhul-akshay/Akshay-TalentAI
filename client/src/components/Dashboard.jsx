
import { useState, useEffect } from 'react';
import SystemStatus from './SystemStatus';

export default function Dashboard() {
  const [stats] = useState({
    totalResumes: 45,
    processed: 38,
    matched: 12,
    pending: 7
  });

  const [recentActivity] = useState([
    { id: 1, action: "Resume processed", candidate: "John Smith", time: "2 mins ago", type: "success" },
    { id: 2, action: "Job description updated", job: "Frontend Developer", time: "15 mins ago", type: "info" },
    { id: 3, action: "High match found", candidate: "Sarah Johnson", time: "1 hour ago", type: "success" },
    { id: 4, action: "Batch processing completed", count: "12 resumes", time: "2 hours ago", type: "info" }
  ]);

  const [topCandidates] = useState([
    { name: "Alice Wilson", match: 95, skills: ["React", "Node.js", "TypeScript"], status: "New" },
    { name: "Bob Chen", match: 89, skills: ["Python", "Django", "PostgreSQL"], status: "Reviewed" },
    { name: "Carol Davis", match: 84, skills: ["Java", "Spring", "AWS"], status: "Interview" },
    { name: "David Brown", match: 78, skills: ["C#", ".NET", "Azure"], status: "New" }
  ]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const getCardTransform = (index) => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const moveX = (mousePosition.x - centerX) * 0.01;
    const moveY = (mousePosition.y - centerY) * 0.01;
    
    return `perspective(1000px) rotateX(${moveY}deg) rotateY(${moveX}deg)`;
  };

  return (
    <div className="space-y-8 relative">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-red-600/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-40 h-40 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Welcome to ATS Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Revolutionizing recruitment with AI-powered resume analysis and intelligent matching
          </p>
        </div>
      </div>

      {/* Enhanced Stats Cards with 3D Effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {[
          { title: "Total Resumes", value: stats.totalResumes, icon: "📄", color: "blue", change: "+12%" },
          { title: "Processed", value: stats.processed, icon: "✅", color: "green", change: "+8%" },
          { title: "High Matches", value: stats.matched, icon: "🎯", color: "purple", change: `${Math.round((stats.matched/stats.processed)*100)}%` },
          { title: "Pending", value: stats.pending, icon: "⏳", color: "orange", change: "In queue" }
        ].map((stat, index) => (
          <div
            key={index}
            className="group relative"
            style={{ transform: getCardTransform(index) }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-300 text-sm font-medium uppercase tracking-wider">{stat.title}</p>
                  <p className="text-4xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`text-4xl p-4 rounded-full bg-gradient-to-br from-${stat.color}-400 to-${stat.color}-600 shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
              <div className="flex items-center">
                <span className={`text-${stat.color}-400 text-sm font-medium mr-2`}>
                  {stat.change}
                </span>
                <span className="text-gray-400 text-sm">from last week</span>
              </div>
              
              {/* Animated Progress Bar */}
              <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r from-${stat.color}-400 to-${stat.color}-600 rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${(stat.value / 50) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid with Enhanced Design */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Recent Activity with Modern Design */}
        <div className="lg:col-span-2 group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
              <div className="bg-gradient-to-r from-green-400 to-blue-500 p-2 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="group/item flex items-center space-x-4 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300">
                  <div className={`w-4 h-4 rounded-full ${activity.type === 'success' ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'} shadow-lg group-hover/item:scale-125 transition-transform duration-200`}></div>
                  <div className="flex-1">
                    <p className="text-base font-medium text-white">{activity.action}</p>
                    <p className="text-sm text-gray-300">
                      {activity.candidate || activity.job || activity.count} • {activity.time}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                    <span className="text-white/60">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Candidates with 3D Cards */}
        <div className="group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Top Candidates</h3>
              <div className="bg-gradient-to-r from-purple-400 to-pink-500 p-2 rounded-lg">
                <span className="text-2xl">🏆</span>
              </div>
            </div>
            <div className="space-y-4">
              {topCandidates.map((candidate, index) => (
                <div key={index} className="group/candidate p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-white">{candidate.name}</h4>
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      candidate.status === 'New' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                      candidate.status === 'Reviewed' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                      'bg-green-500/20 text-green-300 border border-green-500/30'
                    }`}>
                      {candidate.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-green-400">{candidate.match}% match</span>
                    <div className="w-24 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${candidate.match}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.slice(0, 3).map((skill, skillIndex) => (
                      <span key={skillIndex} className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-lg border border-white/20 hover:border-white/40 transition-colors duration-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="relative z-10">
        <SystemStatus />
      </div>

      {/* Enhanced Quick Actions with 3D Hover Effects */}
      <div className="group relative z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 to-purple-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
        <div className="relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "📤", label: "Upload Resumes", color: "blue" },
              { icon: "📝", label: "Create Job", color: "green" },
              { icon: "📊", label: "View Reports", color: "purple" },
              { icon: "⚙️", label: "Settings", color: "orange" }
            ].map((action, index) => (
              <button 
                key={index}
                className="group/action relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-r from-${action.color}-600/30 to-${action.color}-400/30 rounded-xl blur-sm group-hover/action:blur-md transition-all duration-300`}></div>
                <div className={`relative flex flex-col items-center p-6 bg-gradient-to-br from-${action.color}-500/20 to-${action.color}-600/20 backdrop-blur-sm rounded-xl border border-white/20 hover:border-${action.color}-400/50 transition-all duration-300 hover:scale-105 hover:rotate-1 group-hover/action:shadow-2xl`}>
                  <span className="text-3xl mb-3 group-hover/action:scale-110 transition-transform duration-200">{action.icon}</span>
                  <span className="text-sm font-medium text-white text-center">{action.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button className="group relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
          <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full shadow-2xl hover:scale-110 transition-all duration-300">
            <span className="text-2xl text-white">✨</span>
          </div>
        </button>
      </div>
    </div>
  );
}
