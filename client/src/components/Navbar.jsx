import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const adminNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'ATS', href: '/ats', icon: '🎯' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    { name: 'Jobs', href: '/jobs', icon: '💼' },
    { name: 'Candidates', href: '/candidates', icon: '👥' },
    { name: 'Master Data', href: '/candidates-database', icon: '🗄️' },
  ];

  const jobSeekerNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { name: 'Jobs', href: '/jobs', icon: '💼' },
    { name: 'Applications', href: '/applications', icon: '📋' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  const navigation = isAdmin ? adminNavigation : jobSeekerNavigation;

  const isActive = (href) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="relative z-50 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="w-10 h-10 bg-white/10 rounded-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
              <img 
                src="/src/assets/logo.png" 
                alt="ATS Pro Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <div className="hidden lg:block">
              <div className="text-xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                ATS Pro
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 flex-1 justify-center max-w-4xl">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-1 lg:space-x-2 px-3 lg:px-4 py-2 rounded-xl font-medium transition-all duration-300 text-sm lg:text-base ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <span className="text-base lg:text-lg">{item.icon}</span>
                <span className="hidden lg:inline">{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white font-medium transition-all duration-300 border border-white/20"
              >
                <span className="text-lg">{isAdmin ? '👑' : '👤'}</span>
                <span className="hidden xl:block text-sm">{user?.firstName || (isAdmin ? 'Admin' : 'User')}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 shadow-xl z-50">
                  <div className="p-3 border-b border-white/20">
                    <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {isAdmin ? '👑 Admin' : '👤 Job Seeker'}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {/* Profile logic */}}
                      className="w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      ⚙️ Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      🚪 Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex items-center justify-center p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <span className="text-xl">{isOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-white/20">
            <div className="space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/20 space-y-3">
              <div className="px-6 py-2">
                <p className="text-white font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-gray-400 text-sm">{isAdmin ? '👑 Admin' : '👤 Job Seeker'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white font-medium"
              >
                <span className="text-lg">🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Backdrop for user menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </nav>
  );
}