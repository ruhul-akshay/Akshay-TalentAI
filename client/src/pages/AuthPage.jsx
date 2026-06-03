
import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const AuthPage = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToLogin = () => setIsLogin(true);
  const switchToRegister = () => setIsLogin(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden">
      {/* Enhanced 3D Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orbs with brand colors */}
        <div 
          className="absolute top-10 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse opacity-20"
          style={{
            background: 'radial-gradient(circle, #ED1B2F 0%, transparent 70%)',
            animationDuration: '4s'
          }}
        ></div>
        <div 
          className="absolute top-1/3 right-10 w-80 h-80 rounded-full blur-3xl animate-pulse opacity-25"
          style={{
            background: 'radial-gradient(circle, #455185 0%, transparent 70%)',
            animationDelay: '2s',
            animationDuration: '5s'
          }}
        ></div>
        <div 
          className="absolute bottom-20 left-1/3 w-72 h-72 rounded-full blur-3xl animate-pulse opacity-20"
          style={{
            background: 'radial-gradient(circle, #ED1B2F 20%, #455185 80%)',
            animationDelay: '1s',
            animationDuration: '6s'
          }}
        ></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-float"
              style={{
                background: i % 2 === 0 ? '#ED1B2F' : '#455185',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Main Content with 3D Card */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 pt-0">
        <div className="w-full max-w-md">
          {/* Compact Brand Logo Section */}
          <div className="text-center mb-6 transform-gpu">
            <div className="relative inline-block group mb-4">
              {/* Main logo - smaller size */}
              <div 
                className="relative w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 mx-auto"
                style={{ background: 'linear-gradient(135deg, #ED1B2F, #455185)' }}
              >
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <img 
                    src="/src/assets/logo.png" 
                    alt="ATS Pro Logo" 
                    className="w-8 h-8 object-contain"
                  />
                </div>
              </div>
            </div>
            
            <h1 
              className="text-3xl md:text-4xl font-black mb-2 tracking-tight"
              style={{ 
                backgroundImage: 'linear-gradient(135deg, #ED1B2F 0%, #455185 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Welcome to ATS Pro
            </h1>
            <p className="text-base text-gray-300 font-light tracking-wide mb-6">
              Advanced Talent Management System
            </p>
          </div>

          {/* Enhanced Auth Forms with 3D Effect */}
          <div className="relative group">
            {/* 3D shadow layers for form */}
            <div className="absolute inset-0 transform translate-x-3 translate-y-3 bg-black/20 rounded-3xl blur-xl"></div>
            <div className="absolute inset-0 transform translate-x-1.5 translate-y-1.5 bg-black/10 rounded-3xl blur-lg"></div>
            
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500">
              {isLogin ? (
                <LoginForm 
                  onSuccess={onSuccess} 
                  switchToRegister={switchToRegister}
                />
              ) : (
                <RegisterForm 
                  onSuccess={onSuccess} 
                  switchToLogin={switchToLogin}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        /* 3D Transform utilities */
        .transform-gpu {
          transform: translateZ(0);
        }

        /* Enhanced hover effects */
        .hover\\:scale-\\[1\\.02\\]:hover {
          transform: scale(1.02);
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
