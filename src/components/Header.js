import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Home,
  User,
  Phone,
  MapPin,
  Search,
  X,
  Menu,
  Info,
} from 'lucide-react';
import logo from '../logo/sooicy-logo.png';

const Header = ({
  cartItemCount,
  selectedLocation,
  setShowLocationPopup,
  setSearchTerm,
  searchTerm,
}) => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');

  // Sync local state with prop
  useEffect(() => {
    setLocalSearchTerm(searchTerm || '');
  }, [searchTerm]);

  const handleNavigation = (path) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  // Handle search input change with debouncing
  const handleSearchChange = (value) => {
    setLocalSearchTerm(value);
    // Update parent immediately to prevent re-render issues
    if (setSearchTerm) {
      setSearchTerm(value);
    }
  };

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest('.mobile-menu-container')) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMobileMenu]);

  return (
    <>
      {/* ===== DESKTOP HEADER ===== */}
      <header
        className="hidden md:flex sticky top-0 z-50 bg-white border-b-4 shadow-lg items-center justify-between px-6 lg:px-8 py-3"
        style={{ borderColor: '#0188D3' }}
      >
        {/* Left Section: Location - WIDER */}
        <div className="flex items-center min-w-[240px]">
          <button
            onClick={() => setShowLocationPopup(true)}
            className="w-full flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-pink-50 px-4 py-2.5 rounded-xl border-2 border-[#0188D3]/20 shadow-sm hover:shadow-md transition-all hover:scale-105"
          >
            <MapPin className="w-5 h-5 text-[#0188D3] flex-shrink-0" />
            <div className="text-left flex-1 min-w-0">
              <div className="text-sm font-bold text-[#ED709E] truncate">
                {selectedLocation?.name || 'Select Location'}
              </div>
              {selectedLocation?.delivery_time && (
                <div className="text-xs text-gray-600 font-medium">
                  ⏱️ {selectedLocation.delivery_time}
                </div>
              )}
            </div>
          </button>
        </div>

        {/* Middle Section: Logo */}
        <div
          className="flex items-center cursor-pointer hover:scale-110 transition-transform duration-300"
          onClick={() => handleNavigation('/')}
        >
          <img
            src={logo}
            alt="SooIcy Logo"
            className="w-[90px] h-[90px] object-contain drop-shadow-lg"
          />
        </div>

        {/* Right Section: Search + Navigation */}
        <div className="flex items-center space-x-2 min-w-[240px] justify-end">
          {/* Always visible search input */}
          <div className="flex items-center bg-white border-2 border-[#0188D3] rounded-full px-4 py-2 shadow-sm focus-within:shadow-md transition-all">
            <Search className="w-4 h-4 text-[#0188D3] mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search..."
              value={localSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-32 lg:w-48 text-sm outline-none"
              style={{ color: '#ED709E' }}
            />
          </div>

          {/* Navigation Icons */}
          <button
            onClick={() => handleNavigation('/')}
            className="p-2.5 rounded-full hover:bg-blue-50 text-[#0188D3] hover:text-[#ED709E] transition-all hover:scale-110"
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleNavigation('/about')}
            className="p-2.5 rounded-full hover:bg-blue-50 text-[#0188D3] hover:text-[#ED709E] transition-all hover:scale-110"
            title="About Us"
          >
            <Info className="w-5 h-5" />
          </button>

          <a
            href="tel:+923111794175"
            className="p-2.5 rounded-full hover:bg-blue-50 text-[#0188D3] hover:text-[#ED709E] transition-all hover:scale-110"
            title="Call Us"
          >
            <Phone className="w-5 h-5" />
          </a>

          {/* Cart with Badge */}
          <button
            onClick={() => handleNavigation('/cart')}
            className="relative p-2.5 rounded-full bg-gradient-to-r from-[#ED709E] to-[#ff94c2] text-white hover:shadow-lg transition-all hover:scale-110"
            title="Shopping Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#0188D3] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md animate-bounce">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* ===== MOBILE HEADER ===== */}
      <header
        className="md:hidden sticky top-0 z-50 bg-white border-b-4 shadow-lg"
        style={{ borderColor: '#0188D3' }}
      >
        <div className="flex items-center justify-between px-4 py-2">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer"
            onClick={() => handleNavigation('/')}
          >
            <img
              src={logo}
              alt="SooIcy Logo"
              className="w-[60px] h-[60px] object-contain"
            />
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-2">
            {/* Cart */}
            <button
              onClick={() => handleNavigation('/cart')}
              className="relative p-2 rounded-full bg-gradient-to-r from-[#ED709E] to-[#ff94c2] text-white"
            >
              <ShoppingCart className="w-4 h-4" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0188D3] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-full hover:bg-gray-100 text-[#0188D3]"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center bg-white border-2 border-[#0188D3] rounded-full px-3 py-2 shadow-md">
            <Search className="w-4 h-4 text-[#0188D3] mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search for food..."
              value={localSearchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 text-sm outline-none"
              style={{ color: '#ED709E' }}
            />
          </div>
        </div>

        {/* Location Bar - WIDER */}
        <div className="px-4 pb-2">
          <button
            onClick={() => setShowLocationPopup(true)}
            className="w-full flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-pink-50 px-3 py-2.5 rounded-lg border border-[#0188D3]/20"
          >
            <MapPin className="w-4 h-4 text-[#0188D3] flex-shrink-0" />
            <div className="text-left flex-1 min-w-0">
              <div className="text-xs font-bold text-[#ED709E] truncate">
                {selectedLocation?.name || 'Select Location'}
              </div>
              {selectedLocation?.delivery_time && (
                <div className="text-[10px] text-gray-600">
                  ⏱️ {selectedLocation.delivery_time}
                </div>
              )}
            </div>
          </button>
        </div>
      </header>

      {/* ===== MOBILE MENU DRAWER ===== */}
      {showMobileMenu && (
        <>
          {/* Overlay */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40 animate-fade-in"
            onClick={() => setShowMobileMenu(false)}
          ></div>

          {/* Menu Drawer */}
          <div className="md:hidden mobile-menu-container fixed right-0 top-0 bottom-0 w-64 bg-white shadow-2xl z-50 animate-slide-in-right">
            <div className="p-4 border-b-2 border-[#0188D3] flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#ED709E]">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <nav className="p-4 space-y-2">
              <button
                onClick={() => handleNavigation('/')}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-[#0188D3] transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="font-semibold">Home</span>
              </button>

              <button
                onClick={() => handleNavigation('/about')}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-[#0188D3] transition-colors"
              >
                <Info className="w-5 h-5" />
                <span className="font-semibold">About Us</span>
              </button>

              <button
                onClick={() => handleNavigation('/orders')}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-[#0188D3] transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="font-semibold">My Orders</span>
              </button>

              <a
                href="tel:+923111794175"
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-[#0188D3] transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span className="font-semibold">Call Us</span>
              </a>
            </nav>
          </div>
        </>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;