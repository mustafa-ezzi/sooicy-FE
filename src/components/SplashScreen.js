import React, { useState, useEffect } from 'react';
import logo from "../logo/sooicy-logo.png";

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Start fade out animation
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Complete splash screen
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Main Content */}
      <div className="relative text-center">
        {/* Logo Container with Animation */}
        <div className="relative mb-8">
          {/* Rotating Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 border-4 border-white/30 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
          </div>
          
          {/* Pulsing Ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-40 h-40 border-4 border-white/50 rounded-full animate-ping"></div>
          </div>

          {/* Logo Circle */}
          <div className="relative w-44 h-44 mx-auto bg-white rounded-full shadow-2xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 animate-bounce-slow">
            <img
              src={logo}
              alt="SooIcy Logo"
              className="w-32 h-32 object-contain"
            />
          </div>

          {/* Floating Ice Crystals */}
          <div className="absolute -top-4 -right-4 text-4xl animate-float">❄️</div>
          <div className="absolute -bottom-4 -left-4 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>🍦</div>
          <div className="absolute top-0 -left-8 text-2xl animate-float" style={{ animationDelay: '1s' }}>✨</div>
        </div>

        {/* Title with Gradient */}
        <h1 className="text-6xl font-bold text-white mb-3 animate-fade-in-up" style={{ 
          textShadow: '0 4px 20px rgba(0,0,0,0.3)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          SooIcy
        </h1>

        {/* Subtitle */}
        <p className="text-2xl text-white/90 mb-8 animate-fade-in-up font-light" style={{ 
          animationDelay: '0.2s',
          textShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          Deliciously Cool 🍧
        </p>

        {/* Progress Bar */}
        <div className="w-64 mx-auto animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="h-2 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-white rounded-full transition-all duration-300 ease-out shadow-lg"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-white/80 text-sm mt-2 font-medium">Loading your treats...</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;