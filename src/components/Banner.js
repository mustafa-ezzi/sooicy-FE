import React, { useState, useEffect } from 'react';
import { Truck, X, Zap, ShoppingBag } from 'lucide-react';

const Banner = ({ showBanner, setShowBanner }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (showBanner) {
      setIsVisible(true);
    }
  }, [showBanner]);

  if (!showBanner) return null;

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShowBanner(false);
    }, 300);
  };

  return (
    <div
      className={`relative overflow-hidden transition-all duration-300 ${isVisible ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
        }`}
      style={{ backgroundColor: '#FF69B4' }} // Changed to pink theme
    >
      {/* Diagonal stripes pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 20px,
          #FFF0F5 20px,
          #FFF0F5 40px
        )`
      }} />

      {/* Main content container */}
      <div className="container mx-auto px-4 py-3 sm:py-4 relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">

          {/* Delivery icon with pulse effect */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-ping bg-white/30" />
              <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-lg bg-white">
                <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-pink-500" />
              </div>
            </div>
          </div>

          {/* Main text content */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse text-white" />
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                FREE DELIVERY
              </h3>
            </div>

            <div className="hidden sm:block w-px h-8 bg-white/30" />

            <div className="flex flex-wrap items-center justify-center gap-2 text-sm sm:text-base md:text-lg font-semibold text-white">
              <span>On orders over</span>
              <span className="px-3 py-1 rounded-lg font-black text-base sm:text-lg md:text-xl shadow-lg transform hover:scale-105 transition-transform bg-white text-pink-500">
                PKR 2500
              </span>
            </div>
          </div>

          {/* Shopping bag icon */}
          <div className="hidden md:flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full animate-ping bg-white/30" />
              <div className="relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg bg-white">
                <ShoppingBag className="w-7 h-7 text-pink-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Limited time tag */}
        <div className="flex justify-center mt-2 sm:mt-3">
          <div className="px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-md bg-white text-pink-500 animate-pulse">
            ⚡ Limited Time Offer!
          </div>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full transition-all transform hover:scale-110 hover:rotate-90 shadow-lg z-20 bg-white"
        aria-label="Close banner"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
      </button>

      {/* Bottom accent bar with moving dot */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white">
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute h-full w-12 animate-slide-fast bg-pink-500/50" />
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes slide-fast {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(calc(100vw + 100%));
          }
        }

        .animate-slide-fast {
          animation: slide-fast 2s linear infinite;
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @media (max-width: 640px) {
          @keyframes slide-fast {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(calc(100vw + 50%));
            }
          }
        }
      `}</style>
    </div>
  );
};

export default Banner;