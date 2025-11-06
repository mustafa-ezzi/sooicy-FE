import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Bell,
  Home,
  Package,
  MapPin,
  Crown,
  LogOut,
  Phone,
} from 'lucide-react';
import logo from "../logo/sooicy-logo.png";

const Header = ({
  cartItemCount,
  selectedLocation,
  setShowLocationPopup,
  isMenuOpen,
  setIsMenuOpen,
  currentUser,
  onUserLogout
}) => {
  const navigate = useNavigate();

  const navigationItems = [
    { key: '/', label: 'Home', icon: Home },
    { key: '/about', label: 'About', icon: User },
    { key: '/orders', label: 'Orders', icon: Package },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40 border-b-2 border-[#0486D2]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <button
              className="lg:hidden p-2 hover:bg-[#0486D2]/10 rounded-lg transition-colors text-[#0486D2]"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={() => handleNavigation('/')}
            >
              <img
                src={logo}
                alt="SooIcy Logo"
                className="w-[100px] h-[100px] object-contain group-hover:scale-105 transition-transform"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => setShowLocationPopup(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-white hover:bg-[#0486D2]/5 rounded-lg shadow border border-[#0486D2]/20 transition-all hover:shadow-md"
            >
              <MapPin className="w-4 h-4 text-[#0486D2]" />
              <div className="text-left">
                <div className="text-sm font-semibold text-[#F279AB]">
                  {selectedLocation?.name}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedLocation?.delivery_time}
                </div>
              </div>
            </button>

            {currentUser && (
              <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-[#F279AB]/10 to-[#0486D2]/10 border-2 border-[#F279AB] rounded-lg shadow">
                <Crown className="w-4 h-4 text-[#F279AB]" />
                <div className="text-left">
                  <div className="text-sm font-bold text-[#F279AB]">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-[#0486D2]">
                    SooIcy Member • {currentUser.total_orders} orders
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right side - Navigation */}
          <nav className="hidden lg:flex items-center space-x-4">
            {navigationItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => handleNavigation(key)}
                className="flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors text-[#0486D2] hover:bg-[#0486D2]/10 hover:text-[#F279AB] font-medium"
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}

            {/* ✅ Phone Box (after Orders button) */}
            <div className="flex items-center space-x-3">
  {/* Call Button */}
  <a
    href="tel:+92 332 5159474"
    className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-[#0486D2]/20 text-[#0486D2] hover:bg-[#F279AB]/10 hover:text-[#F279AB] font-medium transition-all"
  >
    <Phone className="w-4 h-4" />
    <span className="font-semibold">+92 336 3399445</span>
  </a>

</div>

          </nav>

          {/* Right side - Action buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowLocationPopup(true)}
              className="md:hidden p-2 hover:bg-[#0486D2]/10 rounded-lg transition-colors text-[#0486D2]"
            >
              <MapPin className="w-6 h-6" />
            </button>

            {/* Cart */}
            <button
              onClick={() => handleNavigation('/cart')}
              className="relative p-2 hover:bg-[#F279AB]/10 rounded-lg transition-colors text-[#F279AB]"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#0486D2] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>

            

            {currentUser && (
              <button
                onClick={onUserLogout}
                className="hidden md:flex items-center space-x-1 px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Logout</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-[#0486D2]/20 pt-4">
            <div className="mb-4 p-3 bg-white rounded-lg border border-[#0486D2]/20">
              <button
                onClick={() => { setShowLocationPopup(true); setIsMenuOpen(false); }}
                className="flex items-center space-x-2 w-full text-left"
              >
                <MapPin className="w-5 h-5 text-[#0486D2]" />
                <div>
                  <div className="font-semibold text-[#F279AB]">
                    {selectedLocation?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Delivery: {selectedLocation?.delivery_time}
                  </div>
                </div>
              </button>
            </div>

            {currentUser && (
              <div className="mb-4 p-3 bg-gradient-to-r from-[#F279AB]/10 to-[#0486D2]/10 border-2 border-[#F279AB] rounded-lg">
                <div className="flex items-center space-x-2">
                  <Crown className="w-5 h-5 text-[#F279AB]" />
                  <div>
                    <div className="font-bold text-[#F279AB]">
                      {currentUser.name}
                    </div>
                    <div className="text-sm text-[#0486D2]">
                      SooIcy Member • {currentUser.total_orders} orders • ₨{currentUser.total_spent} spent
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ Mobile Navigation + Phone */}
            <nav className="flex flex-col space-y-2">
              {navigationItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => handleNavigation(key)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-left transition-colors text-[#0486D2] hover:bg-[#0486D2]/10 hover:text-[#F279AB] font-medium"
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}

              {/* ✅ Mobile Phone Box */}
              <a
                href="tel:+923363399445"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-left transition-colors text-[#0486D2] hover:bg-[#F279AB]/10 hover:text-[#F279AB] font-medium"
              >
                <Phone className="w-4 h-4" />
                <span>+92 336 3399445</span>
              </a>

              {currentUser && (
                <button
                  onClick={() => { onUserLogout(); setIsMenuOpen(false); }}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg text-left transition-colors text-red-500 hover:bg-red-50 border-t mt-2 pt-4 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
