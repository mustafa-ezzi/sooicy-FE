import React, { useState, useEffect } from 'react';
import { Star, Clock, ArrowLeft, Plus, Minus, Sparkles } from 'lucide-react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import apiService from '../services/apiService';

const ProductDetailPage = ({ addToCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  // Get product from location state or from props
  const product = location.state?.product;

  const [quantity, setQuantity] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch popular products
  useEffect(() => {
    const fetchPopularProducts = async () => {
      setLoading(true);
      try {
        const products = await apiService.getAllProducts();
        // Filter popular products and exclude current product
        const popular = products
          .filter(p => p.is_popular && p.id !== product?.id)
          .sort(() => 0.5 - Math.random()) // Randomize the order
          .slice(0, 4); // Get only 4 products
        setPopularProducts(popular);
      } catch (error) {
        console.error('Error fetching popular products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (product) {
      fetchPopularProducts();
    }
  }, [product?.id]);

  const handleToggleAddon = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a.id === addon.id);
      if (exists) {
        return prev.filter(a => a.id !== addon.id);
      } else {
        return [...prev, addon];
      }
    });
  };

  // Calculate total price including addons
  const calculateTotalPrice = () => {
    const basePrice = parseFloat(product.price || 0) * quantity;
    const addonPrice = selectedAddons.reduce((sum, addon) => sum + (parseFloat(addon.price || 0) * quantity), 0);
    return basePrice + addonPrice;
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product not found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 hover:opacity-90 text-white rounded-lg transition-all font-semibold"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    const productWithAddons = {
      ...product,
      quantity: quantity,
      selectedAddons: selectedAddons,
      cartItemId: Date.now() // Add unique ID for cart management
    };
    addToCart(productWithAddons);
    navigate('/cart');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen py-8" style={{ background: 'linear-gradient(135deg, #FFF5F9 0%, #E3F4FD 100%)' }}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center space-x-2 px-4 py-2 bg-white shadow-md hover:shadow-lg rounded-lg transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products</span>
        </button>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.image || "https://via.placeholder.com/600x400"}
                alt={product.name}
                className="w-full h-96 lg:h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-2 shadow-lg border border-[#0486D2]">
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 fill-[#0486D2] text-[#0486D2]" />
                  <span className="text-lg font-semibold text-[#0486D2]">{product.rating}</span>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="p-8">
              <div className="mb-4">
                <span className="bg-[#F279AB]/10 text-[#F279AB] px-3 py-1 rounded-full text-sm font-semibold border border-[#F279AB]/20">
                  {product.category}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4" style={{ color: '#F279AB' }}>{product.name}</h1>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">{product.description}</p>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center space-x-2" style={{ color: '#0486D2' }}>
                  <Clock className="w-5 h-5" />
                  <span className="text-lg font-medium">{product.preparation_time}</span>
                </div>
              </div>

              <div className="mb-8">
                <div className="text-4xl font-bold" style={{ color: '#0486D2' }}>
                  Rs. {parseFloat(product.price).toFixed(2)}
                </div>
                {selectedAddons.length > 0 && (
                  <div className="mt-2">
                    <div className="text-sm text-gray-600">
                      Selected Extras: +Rs. {selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price || 0), 0).toFixed(2)}
                    </div>
                    <div className="text-lg font-semibold mt-1" style={{ color: '#F279AB' }}>
                      Total per item: Rs. {(parseFloat(product.price) + selectedAddons.reduce((sum, addon) => sum + parseFloat(addon.price || 0), 0)).toFixed(2)}
                    </div>
                  </div>
                )}
              </div>

              {/* Addons Section */}
              {product.addons && product.addons.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#F279AB' }}>
                    Customize Your Order
                  </h3>
                  <div className="space-y-3">
                    {product.addons.map((addon) => {
                      const isSelected = selectedAddons.find(a => a.id === addon.id);
                      return (
                        <div
                          key={addon.id}
                          onClick={() => handleToggleAddon(addon)}
                          className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'border-[#0486D2] bg-[#E3F4FD]' : 'border-gray-200'
                            }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#0486D2] bg-[#0486D2]' : 'border-gray-300'
                                }`}
                            >
                              {isSelected && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-semibold" style={{ color: isSelected ? '#0486D2' : '#374151' }}>
                                {addon.name}
                              </h4>
                              {addon.description && (
                                <p className="text-sm text-gray-500">{addon.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="font-bold" style={{ color: '#F279AB' }}>
                            +Rs. {addon.price}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">

                <button
                  onClick={handleAddToCart}
                  className="w-full px-6 py-4 text-white rounded-lg bg-[#ed7baa] transition-all text-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-105"

                >
                  <span>Add to Cart</span>
                  <span className="px-2 py-1 rounded ">
                    Rs. {calculateTotalPrice().toFixed(2)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Products Section */}
        {popularProducts.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-center mb-8">
              <div className="flex-1 h-1 rounded" style={{ background: 'linear-gradient(to right, transparent, #F279AB)' }}></div>
              <div className="px-6 py-3 rounded-full shadow-lg mx-4 transform hover:scale-105 transition-transform"
                style={{ background: 'linear-gradient(135deg, #F279AB 0%, #0486D2 100%)' }}>
                <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-6 h-6" />
                  <span>Popular Products</span>
                </h3>
              </div>
              <div className="flex-1 h-1 rounded" style={{ background: 'linear-gradient(to left, transparent, #0486D2)' }}></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularProducts.map((popularProduct) => (
                <div
                  key={popularProduct.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 cursor-pointer border-2"
                  style={{ borderColor: '#F279AB' }}
                  onClick={() => {
                    navigate(`/product/${popularProduct.id}`, { state: { product: popularProduct } });
                  }}
                >
                  <div className="relative">
                    {popularProduct.image ? (
                      <img
                        src={popularProduct.image}
                        alt={popularProduct.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 shadow-lg border text-sm font-semibold"
                      style={{ borderColor: '#0486D2', color: '#0486D2' }}>
                      Rs. {parseFloat(popularProduct.price).toFixed(2)}
                    </div>
                  </div>

                  <div className="p-4">
                    <h4 className="font-bold text-lg mb-2 line-clamp-1" style={{ color: '#F279AB' }}>
                      {popularProduct.name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {popularProduct.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium px-2 py-1 rounded-full bg-[#E3F4FD] text-[#0486D2]">
                        {popularProduct.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-[#F279AB] text-[#F279AB]" />
                        <span className="text-sm font-semibold text-[#F279AB]">
                          {popularProduct.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPage;