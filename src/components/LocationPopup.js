import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Navigation, Clock, Loader, ChevronDown } from 'lucide-react';
import logo from "../logo/sooicy-logo.png";

const LocationPopup = ({ showLocationPopup, deliveryAreas, onLocationSelect, selectedLocation }) => {
  const [tempSelectedLocation, setTempSelectedLocation] = useState(selectedLocation?.id || '');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

    // close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  if (!showLocationPopup) return null;

  const handleConfirm = () => {
    const location = deliveryAreas.find(area => area.id === parseInt(tempSelectedLocation));
    if (location && location.available) {
      onLocationSelect(location);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const findNearestLocation = (userLat, userLon) => {
    let nearestLocation = null;
    let minDistance = Infinity;

    deliveryAreas.forEach(area => {
      if (area.available && area.latitude && area.longitude) {
        const distance = calculateDistance(userLat, userLon, area.latitude, area.longitude);
        if (distance < minDistance) {
          minDistance = distance;
          nearestLocation = area;
        }
      }
    });

    return nearestLocation || deliveryAreas.find(a => a.available);
  };

  const handleUseCurrentLocation = () => {
    setIsDetectingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearestArea = findNearestLocation(latitude, longitude);
        if (nearestArea) {
          setTempSelectedLocation(nearestArea.id.toString());
          setSearchTerm(nearestArea.name);
        } else {
          setLocationError('No delivery area found near you');
        }
        setIsDetectingLocation(false);
      },
      (error) => {
        let msg = 'Unable to detect location';
        if (error.code === error.PERMISSION_DENIED) msg = 'Location permission denied';
        setLocationError(msg);
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const filteredAreas = deliveryAreas.filter(area =>
    area.available &&
    (area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.area?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedArea = deliveryAreas.find(a => a.id === parseInt(tempSelectedLocation));



  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl animate-fadeIn">
        <div className="p-6">
          {/* Header */}
<div className="text-center mb-4">
  {/* Company Logo */}
  <img
     src={logo}
    alt="SooIcy Logo"
    className="w-16 h-16 mx-auto mb-2 object-contain"
  />

  {/* Location Icon */}
  {/* <div
    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg"
    style={{ background: '#0486D2' }}
  >
    <MapPin className="w-7 h-7 text-white" />
  </div> */}

  {/* Title */}
  <h2 className="text-2xl font-bold" style={{ color: '#F279AB' }}>
    Select Location
  </h2>
</div>


          {/* Use current location */}
          <button
            onClick={handleUseCurrentLocation}
            disabled={isDetectingLocation}
            className="w-full mb-3 px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 border-2 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50"
            style={{
              borderColor: '#0486D2',
              color: '#0486D2',
              backgroundColor: '#E3F4FD'
            }}
          >
            {isDetectingLocation ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Detecting...</span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>Use Current Location</span>
              </>
            )}
          </button>

          {locationError && (
            <div className="mb-3 p-2 rounded-lg border border-red-300 bg-red-50">
              <p className="text-xs text-red-600 font-medium">{locationError}</p>
            </div>
          )}

          {/* Custom searchable dropdown */}
          <div className="mb-3 relative" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between w-full px-4 py-2.5 border-2 rounded-lg cursor-pointer"
              style={{
                borderColor: '#0486D2',
                color: '#F279AB',
                backgroundColor: '#FFF5F9'
              }}
            >
              <input
                type="text"
                placeholder="Search or select area..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                className="w-full bg-transparent focus:outline-none text-sm font-medium"
                style={{ color: '#F279AB' }}
              />
              <ChevronDown className="ml-2 w-4 h-4" style={{ color: '#0486D2' }} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full mt-1 w-full max-h-48 overflow-y-auto bg-white border-2 rounded-lg shadow-md z-50"
                   style={{ borderColor: '#0486D2' }}>
                {filteredAreas.length > 0 ? (
                  filteredAreas.map(area => (
                    <div
                      key={area.id}
                      onClick={() => {
                        setTempSelectedLocation(area.id.toString());
                        setSearchTerm(area.name);
                        setIsDropdownOpen(false);
                      }}
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                        tempSelectedLocation === area.id.toString()
                          ? 'bg-blue-100 font-semibold'
                          : ''
                      }`}
                      style={{ color: '#F279AB' }}
                    >
                      {area.name} — {area.delivery_time}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No areas found</div>
                )}
              </div>
            )}
          </div>

          {/* Selected info */}
          {selectedArea && (
            <div className="mb-3 p-3 rounded-lg border-2"
                 style={{ borderColor: '#0486D2', backgroundColor: '#E3F4FD' }}>
              <div className="space-y-1.5">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" style={{ color: '#0486D2' }} />
                  <span className="font-bold text-sm" style={{ color: '#0486D2' }}>
                    {selectedArea.name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" style={{ color: '#F279AB' }} />
                    <span className="text-gray-600">{selectedArea.delivery_time}</span>
                  </div>
                  <span className="font-bold" style={{ color: '#F279AB' }}>
                    PKR {selectedArea.delivery_fee}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Confirm */}
          <button
            onClick={handleConfirm}
            disabled={!tempSelectedLocation || !selectedArea?.available}
            className={`w-full px-6 py-3 rounded-lg transition-all text-base font-bold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center justify-center space-x-2 ${
              tempSelectedLocation && selectedArea?.available
                ? 'text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            style={
              tempSelectedLocation && selectedArea?.available
                ? { background: 'linear-gradient(135deg, #0486D2 0%, #0366A6 100%)' }
                : {}
            }
          >
            <MapPin className="w-4 h-4" />
            <span>{tempSelectedLocation && selectedArea?.available ? 'Confirm' : 'Select Area'}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default LocationPopup;
