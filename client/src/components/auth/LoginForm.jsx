import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = ({ onSuccess, switchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      onSuccess && onSuccess();
    } catch (error) {
      setErrors({ 
        submit: error.message || 'Login failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* Modern Header with Animated Elements */}
      <div className="text-center mb-4">
        <div className="relative inline-block mb-3">
          {/* Animated Background Ring */}
          <div className="absolute inset-0 rounded-full">
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 animate-spin" style={{animationDuration: '20s'}}></div>
          </div>
          <div className="absolute inset-1 rounded-full">
            <div className="w-14 h-14 rounded-full border border-white/10 animate-pulse"></div>
          </div>
          
          {/* Main Icon */}
          <div 
            className="relative w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg transform hover:scale-110 transition-transform duration-300 mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl blur-lg opacity-50"></div>
            <svg className="relative w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-1 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Welcome Back
        </h2>
        <p className="text-gray-300 text-sm font-medium">Sign in to continue your journey</p>
        
        {/* Decorative Line */}
        <div className="flex items-center justify-center mt-3">
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-16"></div>
          <div className="mx-3 text-white/40 text-sm">✦</div>
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-16"></div>
        </div>
      </div>

      {/* Modern Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-200">
            <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`relative w-full px-4 py-3 rounded-xl border bg-white/5 backdrop-blur-sm text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:bg-white/10 focus:border-white/30 hover:bg-white/8 ${
                errors.email 
                  ? 'border-red-400/60 focus:border-red-400' 
                  : 'border-white/20'
              }`}
              placeholder="Enter your email address"
              disabled={loading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="flex items-center text-sm font-medium text-gray-200">
            <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Password
          </label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`relative w-full px-4 py-3 rounded-xl border bg-white/5 backdrop-blur-sm text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:bg-white/10 focus:border-white/30 hover:bg-white/8 ${
                errors.password 
                  ? 'border-red-400/60 focus:border-red-400' 
                  : 'border-white/20'
              }`}
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-red-400 font-medium">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="relative group mt-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
          <button
            type="submit"
            disabled={loading}
            className="relative w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                <span className="bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">Signing you in...</span>
              </div>
            ) : (
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </span>
            )}
          </button>
        </div>

        {/* Switch to Register */}
        <div className="text-center pt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-r from-transparent via-gray-900/80 to-transparent text-gray-400">
                New to ATS Pro?
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={switchToRegister}
            className="mt-3 text-white font-medium hover:text-blue-400 focus:outline-none transition-all duration-300 group"
          >
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300">
              Create your account →
            </span>
          </button>
        </div>
      </form>

      {/* Additional Options */}
      <div className="mt-4 text-center">
        <button
          type="button"
          className="text-sm text-gray-400 hover:text-gray-300 focus:outline-none transition-colors duration-300 relative group"
        >
          <span className="relative">
            Forgot your password?
            <div className="absolute bottom-0 left-0 w-0 h-px bg-gradient-to-r from-blue-400 to-purple-400 group-hover:w-full transition-all duration-300"></div>
          </span>
        </button>
      </div>
    </div>
  );
};

export default LoginForm;