import React from 'react';

const Popup = ({ showPopup, setShowPopup, onClaimOffer }) => {
    if (!showPopup) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 transform animate-fadeIn">
                <div className="text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Welcome to SooIcy!</h3>
                    <p className="text-gray-600 mb-6">
                        Get 20% off on your first order. Use code:
                        <span className="font-bold text-pink-600"> WELCOME20</span>
                    </p>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => {
                                setShowPopup(false);
                                onClaimOffer();
                            }}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-lg transition-all transform hover:scale-105"
                        >
                            Claim Offer
                        </button>
                        <button
                            onClick={() => setShowPopup(false)}
                            className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Popup;