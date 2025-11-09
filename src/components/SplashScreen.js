import React, { useState, useEffect } from 'react';
import logo from "../logo/sooicy-logo.png";

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out animation
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 2500);

    // Complete splash screen
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Main Content */}
      <div className="text-center">
        {/* Logo Container */}
        <div className="relative mb-6">
          {/* Logo Circle */}
          <div className="relative w-40 h-40 mx-auto bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-gray-100 animate-fade-in">
            <img
              src={logo}
              alt="SooIcy Logo"
              className="w-28 h-28 object-contain"
            />
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center items-center space-x-2 mt-6 animate-fade-in-delay-3">
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: '#ed709e', animationDelay: '0s' }}
          ></div>
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: '#178BD0', animationDelay: '0.2s' }}
          ></div>
          <div 
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ backgroundColor: '#ed709e', animationDelay: '0.4s' }}
          ></div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-delay {
          opacity: 0;
          animation: fade-in-up 0.5s ease-out 0.3s forwards;
        }

        .animate-fade-in-delay-2 {
          opacity: 0;
          animation: fade-in-up 0.5s ease-out 0.5s forwards;
        }

        .animate-fade-in-delay-3 {
          opacity: 0;
          animation: fade-in-up 0.5s ease-out 0.7s forwards;
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;