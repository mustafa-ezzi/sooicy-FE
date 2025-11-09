import React, { useState } from 'react';
import { Star, Clock, Eye, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, addToCart, setSelectedProduct }) => {
  const navigate = useNavigate();
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [showAddons, setShowAddons] = useState(false);

  const handleView = () => {
    // Set the selected product in the parent state
    if (setSelectedProduct) {
      setSelectedProduct(product);
    }
    // Navigate to the product detail page with product ID
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const toggleAddon = (addon) => {
    if (selectedAddons.find(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const calculateTotalPrice = () => {
    const basePrice = parseFloat(product.price);
    const addonTotal = selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price), 0);
    return (basePrice + addonTotal).toFixed(2);
  };

  const handleAddToCart = () => {
    const productWithAddons = {
      ...product,
      cartItemId: Date.now(), // Add unique cartItemId
      selectedAddons,
      quantity: 1, // Ensure quantity is set
      addons: product.addons || [], // Preserve available addons
      totalPrice: calculateTotalPrice()
    };
    addToCart(productWithAddons);
    setSelectedAddons([]);
    setShowAddons(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100">
      <div className="relative">
        <img
          src={product.image || "https://via.placeholder.com/300x200"}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-lg border border-[#0486D2]">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 fill-[#0486D2] text-[#0486D2]" />
            <span className="text-sm font-semibold text-[#0486D2]">{product.rating}</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-[#F279AB] line-clamp-1">{product.name}</h3>
          <div className="text-right">
            <span className="text-2xl font-bold text-[#0486D2]">
              Rs. {calculateTotalPrice()}
            </span>
            {product.discount > 0 && (
              <div className="text-sm text-gray-500 line-through">
                Rs. {product.price}
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
          {product.description}
        </p>

        {/* Addons Section */}
        {product.addons && product.addons.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowAddons(!showAddons)}
              className="text-sm font-medium text-[#0486D2] hover:text-[#0486D2]/80 mb-2"
            >
              {showAddons ? '− Hide Addons' : '+ Show Addons'}
            </button>

            {showAddons && (
              <div className="space-y-2 bg-gray-50 p-3 rounded-lg">
                {product.addons.map(addon => (
                  <div
                    key={addon.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-gray-100"
                  >
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleAddon(addon)}
                        className={`w-5 h-5 rounded flex items-center justify-center mr-3 transition-colors ${selectedAddons.find(a => a.id === addon.id)
                          ? 'bg-[#F279AB] text-white'
                          : 'border-2 border-[#F279AB]'
                          }`}
                      >
                        {selectedAddons.find(a => a.id === addon.id) && (
                          <Check className="w-3 h-3" />
                        )}
                      </button>
                      <div>
                        <span className="font-medium text-sm">{addon.name}</span>
                        {addon.description && (
                          <p className="text-xs text-gray-500">{addon.description}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-[#0486D2]">
                      +Rs. {addon.price}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2 text-sm text-[#0486D2]">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{product.preparation_time}</span>
          </div>
          <span className="bg-[#F279AB]/10 text-[#F279AB] px-3 py-1 rounded-full text-xs font-semibold border border-[#F279AB]/20">
            {product.category}
          </span>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleView}
            className="flex-1 px-4 py-3 bg-[#0486D2] hover:bg-[#0486D2]/90 text-white rounded-lg transition-all flex items-center justify-center space-x-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Eye className="w-4 h-4" />
            <span>View</span>
          </button>
          <button
            onClick={handleAddToCart}
            className="px-4 py-3 bg-[#F279AB] hover:bg-[#F279AB]/90 text-white rounded-lg transition-all transform hover:scale-110 shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;