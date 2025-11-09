import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Clock,
  ChevronRight,
  Crown,
  LogOut,
} from 'lucide-react';
import logo from '../logo/sooicy-logo.png';

const Header = ({
  cartItemCount,
  selectedLocation,
  setShowLocationPopup,
  setSearchTerm,
  searchTerm,
  currentUser,
  onUserLogout,
}) => {
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchTerm || '');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [placeholderText, setPlaceholderText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const debounceTimer = useRef(null);
  const searchInputRef = useRef(null);

  const searchPhrases = [
    'Search for Brownie Sundae...',
    'Search for Tera Mera...',
    'Search for Breaking Oreo...',
    'Search for Classic Vanilla Swirl...',
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setShowMobileMenu(false);
  };

  // Typewriter effect
  useEffect(() => {
    if (!showSearchInput) {
      setPlaceholderText('');
      return;
    }

    let currentIndex = 0;
    const currentPhrase = searchPhrases[currentPhraseIndex];
    
    const typeInterval = setInterval(() => {
      if (currentIndex <= currentPhrase.length) {
        setPlaceholderText(currentPhrase.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        // Wait before starting next phrase
        setTimeout(() => {
          setCurrentPhraseIndex((prev) => (prev + 1) % searchPhrases.length);
        }, 2000);
      }
    }, 100);

    return () => clearInterval(typeInterval);
  }, [showSearchInput, currentPhraseIndex]);

  // Focus input when search opens
  useEffect(() => {
    if (showSearchInput && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchInput]);

  // Debounced search update
  const debouncedSetSearchTerm = useCallback((value) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      setSearchTerm(value);
    }, 500);
  }, [setSearchTerm]);

  // Handle input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    debouncedSetSearchTerm(value);
  };

  // Handle search icon click
  const handleSearchIconClick = () => {
    setShowSearchInput(!showSearchInput);
    if (showSearchInput) {
      setLocalSearch('');
      setSearchTerm('');
    }
  };

  // Sync local search with prop
  useEffect(() => {
    if (searchTerm !== localSearch) {
      setLocalSearch(searchTerm);
    }
  }, [searchTerm]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

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
  {/* Left Section: Location + User */}
  <div className="flex items-center space-x-3">
    <button
      onClick={() => setShowLocationPopup(true)}
      className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-pink-50 px-4 py-2.5 rounded-xl border-2 border-[#0188D3]/20 shadow-sm hover:shadow-md transition-all hover:scale-105"
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

    {currentUser && (
      <div className="flex items-center space-x-2 p-2 bg-gradient-to-r from-[#ED709E]/10 to-[#0188D3]/10 border-2 border-[#ED709E] rounded-lg">
        <Crown className="w-5 h-5 text-[#ED709E]" />
        <div className="flex-1">
          <div className="text-sm font-bold text-[#ED709E]">{currentUser.name}</div>
          <div className="text-xs text-[#0188D3]">
            SooIcy Member • {currentUser.total_orders} orders
          </div>
        </div>
      </div>
    )}
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
          {/* Expandable Search */}
          <div className="flex items-center">
            {showSearchInput ? (
              <div className="flex items-center bg-white border-2 border-[#0188D3] rounded-full px-4 py-2 shadow-md animate-expand">
                <Search className="w-4 h-4 text-[#0188D3] mr-2 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={placeholderText}
                  value={localSearch}
                  onChange={handleSearchChange}
                  className="w-48 lg:w-64 text-sm outline-none"
                  style={{ color: '#ED709E' }}
                />
                <button
                  onClick={handleSearchIconClick}
                  className="ml-2 text-gray-400 hover:text-[#ED709E]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleSearchIconClick}
                className="p-2.5 rounded-full hover:bg-blue-50 text-[#0188D3] hover:text-[#ED709E] transition-all hover:scale-110"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
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

          <button
            onClick={() => handleNavigation('/orders')}
            className="p-2.5 rounded-full hover:bg-blue-50 text-[#0188D3] hover:text-[#ED709E] transition-all hover:scale-110"
            title="My Orders"
          >
            <Clock className="w-5 h-5" />
          </button>

          <a
            href="tel:+923111794175"
            className="p-2.5 rounded-full hover:bg-blue-50 text-[#0188D3] hover:text-[#ED709E] transition-all hover:scale-110"
            title="Call Us"
          >
            <Phone className="w-5 h-5" />
          </a>

          {/* Logout Button (Desktop) */}
          {currentUser && (
            <button
              onClick={onUserLogout}
              className="p-2.5 rounded-full hover:bg-red-50 text-red-500 transition-all hover:scale-110"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}

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
            {/* Search Icon */}
            <button
              onClick={handleSearchIconClick}
              className="p-2 rounded-full hover:bg-blue-50 text-[#0188D3]"
            >
              <Search className="w-4 h-4" />
            </button>

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

        {/* Mobile Search Bar - Expandable */}
        {showSearchInput && (
          <div className="px-4 pb-3 animate-slide-down">
            <div className="flex items-center bg-white border-2 border-[#0188D3] rounded-full px-3 py-2 shadow-md">
              <Search className="w-4 h-4 text-[#0188D3] mr-2 flex-shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={placeholderText}
                value={localSearch}
                onChange={handleSearchChange}
                className="flex-1 text-sm outline-none"
                style={{ color: '#ED709E' }}
              />
              <button
                onClick={handleSearchIconClick}
                className="ml-2 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Location Bar */}
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

        {/* Premium Customer Badge (Mobile) */}
        {currentUser && (
          <div className="px-4 pb-2">
            <div className="flex items-center space-x-2 p-3 bg-gradient-to-r from-[#ED709E]/10 to-[#0188D3]/10 border-2 border-[#ED709E] rounded-lg">
              <Crown className="w-5 h-5 text-[#ED709E]" />
              <div className="flex-1">
                <div className="text-sm font-bold text-[#ED709E]">
                  {currentUser.name}
                </div>
                <div className="text-xs text-[#0188D3]">
                  SooIcy Member • {currentUser.total_orders} orders
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ===== ENHANCED MOBILE MENU DRAWER ===== */}
      {showMobileMenu && (
        <>
          {/* Overlay */}
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40 animate-fade-in backdrop-blur-sm"
            onClick={() => setShowMobileMenu(false)}
          ></div>

          {/* Menu Drawer */}
          <div className="md:hidden mobile-menu-container fixed right-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 animate-slide-in-right">
            {/* Header */}
            <div className="p-5 bg-[#0188D3] flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">SooIcy Menu</h2>
                <p className="text-xs text-white/90 mt-1">Navigate & Explore</p>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="p-4 space-y-1">
              <button
                onClick={() => handleNavigation('/')}
                className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-blue-50 text-[#0188D3] transition-all hover:shadow-sm group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-[#0188D3] transition-colors">
                    <Home className="w-5 h-5 text-[#0188D3] group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-semibold">Home</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => handleNavigation('/about')}
                className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-pink-50 text-[#0188D3] transition-all hover:shadow-sm group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pink-50 rounded-lg group-hover:bg-[#ED709E] transition-colors">
                    <Info className="w-5 h-5 text-[#ED709E] group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-semibold">About Us</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => handleNavigation('/orders')}
                className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-purple-50 text-[#0188D3] transition-all hover:shadow-sm group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-500 transition-colors">
                    <Clock className="w-5 h-5 text-purple-500 group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-semibold">My Orders</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <a
                href="tel:+923111794175"
                className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-green-50 text-[#0188D3] transition-all hover:shadow-sm group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-500 transition-colors">
                    <Phone className="w-5 h-5 text-green-500 group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-semibold">Call Us</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              {/* Logout Button (Mobile) */}
              {currentUser && (
                <button
                  onClick={() => {
                    onUserLogout();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-4 rounded-xl hover:bg-red-50 text-red-500 transition-all hover:shadow-sm group border-t-2 border-gray-100 mt-2 pt-4"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-500 transition-colors">
                      <LogOut className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
                    </div>
                    <span className="font-semibold">Logout</span>
                  </div>
                  <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
            </nav>

            {/* Footer Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-[#0188D3]/20">
              <div className="text-center">
                <p className="text-xs text-gray-600">Contact Support</p>
                <a
                  href="tel:+923111794175"
                  className="text-sm font-bold text-[#ED709E] hover:text-[#0188D3] transition-colors"
                >
                  +92 311 1794175
                </a>
              </div>
            </div>
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

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes expand {
          from {
            width: 0;
            opacity: 0;
          }
          to {
            width: auto;
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-expand {
          animation: expand 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default Header;