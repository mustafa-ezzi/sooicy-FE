

import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import {
    ShoppingCart,
    Plus,
    Minus,
    X,
    ArrowRight,
    CheckCircle,
    Clock,
    MapPin,
    Package,
    Crown,
    Sparkles,
    TrendingUp,
    Star,
    Heart,
    Loader
} from 'lucide-react';

// Add CSS animation for fade-in effect
const styleElement = document.getElementById('cart-animations') || document.createElement('style');
if (!styleElement.id) {
    styleElement.id = 'cart-animations';
    styleElement.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(styleElement);
}

const CartPage = ({
    cart,
    updateCart,  // Make sure this is passed
    getDeliveryFee,
    selectedLocation,
    lastOrder,
    clearLastOrder,
}) => {
    const navigate = useNavigate();
    const [showAddonsModal, setShowAddonsModal] = useState(null);
    const [selectedAddonsInModal, setSelectedAddonsInModal] = useState([]);
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loadingRecommended, setLoadingRecommended] = useState(false);

    const rawDeliveryFee = getDeliveryFee?.() ?? selectedLocation?.delivery_fee ?? 0;
    const deliveryFee = Number(rawDeliveryFee) || 0;

    // ✅ Fetch recommended products
    // ✅ Fetch recommended (popular) products from API
    useEffect(() => {
        if (cart.length === 0) return;

        let isMounted = true;

        const fetchRecommendedProducts = async () => {
            setLoadingRecommended(true);
            try {
                const data = await apiService.getAllProducts();
                const products = Array.isArray(data) ? data : data.data;

                // ✅ Only popular products
                const popularProducts = products.filter(p => p.is_popular === true);

                // ✅ Remove products already in cart
                const cartIds = cart.map(item => item.productId || item.id);
                const available = popularProducts.filter(p => !cartIds.includes(p.id));

                // ✅ Shuffle and take top 3
                const shuffled = available.sort(() => 0.5 - Math.random());
                if (isMounted) setRecommendedProducts(shuffled.slice(0, 3));
            } catch (error) {
                console.error('Error fetching recommended products:', error);
            } finally {
                if (isMounted) setLoadingRecommended(false);
            }
        };

        fetchRecommendedProducts();
        return () => {
            isMounted = false;
        };
    }, [JSON.stringify(cart)]);



    // ✅ Calculate single item total including addons (per quantity)
    const calculateItemTotal = (item) => {
        const basePrice = parseFloat(item.price) || 0;
        const addonTotal = (item.selectedAddons || []).reduce(
            (sum, addon) => sum + (parseFloat(addon.price) || 0),
            0
        );
        return (basePrice + addonTotal) * (item.quantity || 1);
    };

    // ✅ Calculate addon subtotal per item (not multiplied by quantity)
    const calculateAddonSubtotalPerUnit = (addons) =>
        (addons || []).reduce((sum, addon) => sum + (parseFloat(addon.price) || 0), 0);

    // ✅ Optimized cart calculations using useMemo
    const cartCalculations = useMemo(() => {
        const subtotal = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0);
        const tax = subtotal * 0.08;
        const total = subtotal + deliveryFee + tax;
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

        return { subtotal, tax, total, totalItems };
    }, [cart, deliveryFee]);

    // ✅ Open modal and initialize selected addons for specific cart item
    const handleOpenAddonsModal = (cartItem) => {
        setShowAddonsModal(cartItem.cartItemId); // Use unique cartItemId
        setSelectedAddonsInModal(cartItem.selectedAddons || []);
    };

    // ✅ Toggle addon in modal (local state)
    const toggleAddonInModal = (addon) => {
        setSelectedAddonsInModal(prev => {
            const exists = prev.find(a => a.id === addon.id);
            if (exists) {
                return prev.filter(a => a.id !== addon.id);
            } else {
                return [...prev, addon];
            }
        });
    };

    const handleSaveAddons = (cartItemId) => {
        const updatedCart = cart.map(item =>
            item.cartItemId === cartItemId
                ? { ...item, selectedAddons: selectedAddonsInModal }
                : item
        );
        updateCart(updatedCart);
        setShowAddonsModal(null);
        setSelectedAddonsInModal([]);
    };

    const handleQuickRemoveAddon = (cartItemId, addonId) => {
        const updatedCart = cart.map(item =>
            item.cartItemId === cartItemId
                ? {
                    ...item,
                    selectedAddons: (item.selectedAddons || []).filter(a => a.id !== addonId)
                }
                : item
        );
        updateCart(updatedCart);
    };

    const handleDuplicateItem = (item) => {
        const newItem = {
            ...item,
            cartItemId: Date.now(),
            quantity: 1,
            // Keep the addons array for product options
            addons: item.addons || [],
            // Initialize selectedAddons as an empty array for the new item
            selectedAddons: []
        };
        const updatedCart = [...cart, newItem];
        updateCart(updatedCart);
    };

    const handleUpdateQuantity = (cartItemId, change) => {
        const updatedCart = cart.map(item => {
            if (item.cartItemId === cartItemId) {
                const newQuantity = Math.max(1, item.quantity + change);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(item => item.quantity > 0);
        updateCart(updatedCart);
    };

    // ✅ Add recommended product to cart
    const handleAddRecommendedProduct = (product) => {
        const newItem = {
            ...product,
            cartItemId: Date.now(),
            quantity: 1,
            // Ensure addons array is preserved
            addons: product.addons || [],
            // Initialize empty selected addons
            selectedAddons: []
        };
        const updatedCart = [...cart, newItem];
        updateCart(updatedCart);
    };
    // ✅ Order Confirmation Page
    if (lastOrder) {
        return (
            <div
                className="min-h-screen py-12"

            >
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div
                            className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg animate-bounce"
                            style={{
                                background: 'linear-gradient(135deg, #F279AB 0%, #0486D2 100%)'
                            }}
                        >
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-4xl font-bold mb-3" style={{ color: '#F279AB' }}>
                            Order Confirmed!
                        </h2>
                        <p className="text-xl mb-8" style={{ color: '#0486D2' }}>
                            Thank you for your order. We'll prepare it with care!
                        </p>

                        {lastOrder.userWelcomeMessage && (
                            <div
                                className="mt-8 p-6 border-2 rounded-2xl max-w-md mx-auto shadow-lg"
                                style={{
                                    backgroundColor: '#E3F4FD',
                                    borderColor: '#0486D2'
                                }}
                            >
                                <div className="flex items-center justify-center space-x-2 mb-3">
                                    <Crown className="w-7 h-7" style={{ color: '#F279AB' }} />
                                    <h3 className="text-xl font-bold" style={{ color: '#F279AB' }}>
                                        SooIcy Member!
                                    </h3>
                                </div>
                                <p className="font-bold text-lg mb-3" style={{ color: '#0486D2' }}>
                                    {lastOrder.userWelcomeMessage}
                                </p>
                                <div className="text-sm font-medium space-y-1" style={{ color: '#0486D2' }}>
                                    <p>✓ Order tracking & history</p>
                                    <p>✓ Faster checkout experience</p>
                                    <p>✓ Exclusive member offers</p>
                                </div>
                            </div>
                        )}

                        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => navigate('/')}
                                className="flex-1 px-8 py-4 text-white rounded-xl font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #0486D2 0%, #0366A6 100%)'
                                }}
                            >
                                Continue Shopping
                            </button>
                            <button
                                onClick={() => navigate('/orders')}
                                className="flex-1 px-8 py-4 rounded-xl border-2 font-bold hover:shadow-lg transition-all"
                                style={{
                                    borderColor: '#F279AB',
                                    color: '#F279AB',
                                    backgroundColor: 'white'
                                }}
                            >
                                Track Order
                            </button>
                            <button
                                onClick={() => {
                                    clearLastOrder();
                                    navigate('/');
                                }}
                                className="px-8 py-4 font-semibold hover:opacity-80"
                                style={{ color: '#0486D2' }}
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Empty Cart
    if (cart.length === 0) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"

            >
                <div
                    className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-4 border-2"
                    style={{ borderColor: '#F279AB' }}
                >
                    <div
                        className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center"
                        style={{
                            background: 'linear-gradient(135deg, #F279AB 0%, #0486D2 100%)'
                        }}
                    >
                        <ShoppingCart className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4" style={{ color: '#F279AB' }}>
                        Your cart is empty
                    </h2>
                    <p className="text-xl mb-8" style={{ color: '#0486D2' }}>
                        Add some delicious items to get started!
                    </p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-4 text-white rounded-xl text-lg font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all"
                        style={{
                            background: 'linear-gradient(135deg, #0486D2 0%, #0366A6 100%)'
                        }}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    // ✅ Main Cart Page
    return (
        <div
            className="min-h-screen py-12"

        >
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <h2
                        className="text-4xl font-bold"
                        style={{
                            background: 'linear-gradient(135deg, #F279AB 0%, #0486D2 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}
                    >
                        Your Cart ({cartCalculations.totalItems} items)
                    </h2>
                    <button
                        onClick={() => navigate('/')}
                        className="font-bold inline-flex items-center hover:opacity-80 transition-opacity"
                        style={{ color: '#0486D2' }}
                    >
                        <ArrowRight className="w-5 h-5 mr-2 rotate-180" />
                        Continue Shopping
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 🧁 Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => {
                            const itemTotal = calculateItemTotal(item);
                            const basePrice = parseFloat(item.price) || 0;
                            const addonSubtotal = calculateAddonSubtotalPerUnit(item.selectedAddons);

                            return (
                                <div
                                    key={item.cartItemId} // Use unique cartItemId
                                    className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all relative border-2"
                                    style={{ borderColor: '#F279AB' }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                        {item.image && item.image.trim() !== '' ? (
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full sm:w-32 h-32 object-cover rounded-xl border-2 flex-shrink-0"
                                                style={{ borderColor: '#F279AB' }}
                                            />
                                        ) : (
                                            <div
                                                className="w-full sm:w-32 h-32 rounded-xl flex items-center justify-center text-sm text-gray-400 border-2 flex-shrink-0"
                                                style={{ borderColor: '#F279AB', backgroundColor: '#FFF5F9' }}
                                            >
                                                No image
                                            </div>
                                        )}


                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xl font-bold mb-2 truncate" style={{ color: '#F279AB' }}>
                                                {item.name}
                                            </h3>
                                            <p className="text-sm mb-3 font-medium line-clamp-2" style={{ color: '#0486D2' }}>
                                                {item.description}
                                            </p>

                                            {/* 🍫 Addons Section */}
                                            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: '#FFF5F9' }}>
                                                <div className="flex justify-between items-center mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4" style={{ color: '#F279AB' }} />
                                                        <span className="text-sm font-bold" style={{ color: '#F279AB' }}>
                                                            Extras ({item.selectedAddons?.length || 0})
                                                        </span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleOpenAddonsModal(item)}
                                                        className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:shadow-md"
                                                        style={{ backgroundColor: '#E3F4FD', color: '#0486D2' }}
                                                    >
                                                        {item.selectedAddons?.length > 0 ? 'Edit' : '+ Add'} Extras
                                                    </button>
                                                </div>

                                                {item.selectedAddons?.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {item.selectedAddons.map((addon) => (
                                                            <div
                                                                key={addon.id}
                                                                className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border-2 transition-all hover:shadow-md"
                                                                style={{
                                                                    backgroundColor: 'white',
                                                                    borderColor: '#E3F4FD',
                                                                    color: '#0486D2'
                                                                }}
                                                            >
                                                                <span>{addon.name}</span>
                                                                <span style={{ color: '#F279AB' }}>
                                                                    +Rs. {parseFloat(addon.price).toFixed(2)}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleQuickRemoveAddon(item.cartItemId, addon.id)}
                                                                    className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                                                                    style={{ color: '#F279AB' }}
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-500 italic">
                                                        No extras added yet
                                                    </p>
                                                )}
                                            </div>

                                            {/* 💰 Price Breakdown */}
                                            <div className="space-y-1 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="font-medium text-gray-600">Base Price:</span>
                                                    <span className="font-semibold" style={{ color: '#0486D2' }}>
                                                        Rs. {basePrice.toFixed(2)} × {item.quantity}
                                                    </span>
                                                </div>
                                                {addonSubtotal > 0 && (
                                                    <div className="flex justify-between">
                                                        <span className="font-medium text-gray-600">Extras:</span>
                                                        <span className="font-semibold" style={{ color: '#F279AB' }}>
                                                            Rs. {addonSubtotal.toFixed(2)} × {item.quantity}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between pt-2 border-t-2" style={{ borderColor: '#E3F4FD' }}>
                                                    <span className="font-bold" style={{ color: '#F279AB' }}>Item Total:</span>
                                                    <span className="font-bold text-lg" style={{ color: '#0486D2' }}>
                                                        Rs. {itemTotal.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 🧮 Quantity Controls */}
                                        <div className="flex sm:flex-col items-center justify-between sm:justify-start gap-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.cartItemId, -1)}
                                                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:shadow-lg"
                                                    style={{ backgroundColor: '#FFF5F9', color: '#F279AB' }}
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span
                                                    className="text-xl font-bold w-8 text-center"
                                                    style={{ color: '#F279AB' }}
                                                >
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.cartItemId, 1)}
                                                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:shadow-lg"
                                                    style={{ backgroundColor: '#E3F4FD', color: '#0486D2' }}
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    const updatedCart = cart.filter(cartItem =>
                                                        cartItem.cartItemId !== item.cartItemId
                                                    );
                                                    // Ensure we're passing a new array to updateCart
                                                    updateCart([...updatedCart]);
                                                }}
                                                className="p-2 rounded-lg transition-all hover:shadow-lg"
                                                style={{ backgroundColor: '#FFF5F9', color: '#F279AB' }}
                                                aria-label="Remove item"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDuplicateItem(item)}
                                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                                                style={{
                                                    backgroundColor: '#E3F4FD',
                                                    color: '#0486D2'
                                                }}
                                            >
                                                Duplicate Item
                                            </button>
                                        </div>
                                    </div>

                                    {/* 🍓 Enhanced Addons Modal */}
                                    {showAddonsModal === item.cartItemId && (
                                        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                                            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl">
                                                {/* Modal Header */}
                                                <div className="p-6 border-b-2" style={{ borderColor: '#F279AB', background: 'linear-gradient(135deg, #FFF5F9 0%, #E3F4FD 100%)' }}>
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <h3 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#F279AB' }}>
                                                                <Sparkles className="w-6 h-6" />
                                                                Customize Your Order
                                                            </h3>
                                                            <p className="text-sm mt-1" style={{ color: '#0486D2' }}>
                                                                Selected: {selectedAddonsInModal.length} extras
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setShowAddonsModal(null);
                                                                setSelectedAddonsInModal([]);
                                                            }}
                                                            className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-white transition-all"
                                                        >
                                                            <X className="w-6 h-6" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Modal Body */}
                                                <div className="p-6 max-h-96 overflow-y-auto">
                                                    {item.addons && item.addons.length > 0 ? (
                                                        <div className="space-y-3">
                                                            {item.addons.map((addon) => {
                                                                const isSelected = selectedAddonsInModal.find(a => a.id === addon.id);

                                                                return (
                                                                    <div
                                                                        key={addon.id}
                                                                        onClick={() => toggleAddonInModal(addon)}
                                                                        className="flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg"
                                                                        style={{
                                                                            backgroundColor: isSelected ? '#E3F4FD' : 'white',
                                                                            borderColor: isSelected ? '#0486D2' : '#E5E7EB'
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <div
                                                                                className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                                                                                style={{
                                                                                    borderColor: isSelected ? '#0486D2' : '#D1D5DB',
                                                                                    backgroundColor: isSelected ? '#0486D2' : 'white'
                                                                                }}
                                                                            >
                                                                                {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                                                            </div>
                                                                            <div>
                                                                                <div className="font-bold" style={{ color: isSelected ? '#0486D2' : '#374151' }}>
                                                                                    {addon.name}
                                                                                </div>
                                                                                {addon.description && (
                                                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                                                        {addon.description}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                        <div className="font-bold text-lg" style={{ color: '#F279AB' }}>
                                                                            +Rs. {parseFloat(addon.price).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-8 text-gray-500">
                                                            <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                            <p>No extras available for this item</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Modal Footer */}
                                                <div className="p-6 border-t-2" style={{ borderColor: '#E3F4FD' }}>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setShowAddonsModal(null);
                                                                setSelectedAddonsInModal([]);
                                                            }}
                                                            className="flex-1 px-6 py-3 rounded-xl border-2 font-bold transition-all hover:shadow-lg"
                                                            style={{
                                                                borderColor: '#F279AB',
                                                                color: '#F279AB'
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleSaveAddons(item.cartItemId)}
                                                            className="flex-1 px-6 py-3 rounded-xl text-white font-bold transition-all hover:shadow-lg"
                                                            style={{
                                                                background: 'linear-gradient(135deg, #0486D2 0%, #0366A6 100%)'
                                                            }}
                                                        >
                                                            Save Changes
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}


                        {/* 🌟 Enhanced Recommended Products Section */}
                        {recommendedProducts.length > 0 && (
                            <div className="mt-12">
                                {/* Header with Gradient and Icon */}
                                <div
                                    className="text-center mb-12 rounded-3xl shadow-lg p-8 sm:p-10 max-w-4xl mx-auto"
                                    style={{
                                        border: '3px solid #0188D3',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    {/* Icon and Title */}
                                    <div className="flex flex-col items-center">
                                        <div
                                            className="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md"
                                            style={{ backgroundColor: '#0188D3' }}
                                        >
                                            <TrendingUp className="w-8 h-8 text-white" />
                                        </div>

                                        <h3
                                            className="text-4xl sm:text-5xl font-extrabold tracking-tight"
                                            style={{ color: '#ED709E' }}
                                        >
                                            You Might Also Like
                                        </h3>


                                    </div>

                                    {/* Divider Line */}
                                    <div className="flex items-center justify-center mt-6">
                                        <div
                                            className="h-1 w-24 sm:w-32 rounded-full"
                                            style={{ backgroundColor: '#0188D3' }}
                                        ></div>
                                    </div>
                                </div>





                                {/* Products Grid */}
                                {loadingRecommended ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="text-center">
                                            <Loader
                                                className="w-12 h-12 mx-auto mb-4 animate-spin"
                                                style={{ color: '#0486D2' }}
                                            />
                                            <p className="text-gray-600 font-medium">Finding perfect matches...</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {recommendedProducts.map((product, index) => (
                                            <div
                                                key={product.id}
                                                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-2 overflow-hidden transform hover:-translate-y-2"
                                                style={{
                                                    borderColor: '#E3F4FD',
                                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s backwards`
                                                }}
                                            >
                                                {/* Image Container with Badge */}
                                                <div className="relative overflow-hidden">
                                                    {product.image && product.image.trim() !== '' ? (
                                                        <div className="relative h-56 overflow-hidden">
                                                            <img
                                                                src={product.image}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                            />
                                                            {/* Gradient Overlay on Hover */}
                                                            <div
                                                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                                                style={{
                                                                    background: 'linear-gradient(to top, rgba(242, 121, 171, 0.3), transparent)'
                                                                }}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="h-56 flex flex-col items-center justify-center"
                                                            style={{ backgroundColor: '#FFF5F9' }}
                                                        >
                                                            <Package className="w-16 h-16 text-gray-300 mb-2" />
                                                            <span className="text-sm text-gray-400">No image available</span>
                                                        </div>
                                                    )}

                                                    {/* Popular Badge */}
                                                    <div className="absolute top-3 left-3">
                                                        <div
                                                            className="px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1.5 backdrop-blur-sm"
                                                            style={{
                                                                background: 'linear-gradient(135deg, #F279AB 0%, #0486D2 100%)'
                                                            }}
                                                        >
                                                            <Star className="w-3.5 h-3.5 fill-current" />
                                                            <span>Popular</span>
                                                        </div>
                                                    </div>

                                                    {/* Quick Add Button (appears on hover) */}
                                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                                        <button
                                                            onClick={() => handleAddRecommendedProduct(product)}
                                                            className="w-12 h-12 rounded-full text-white shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 flex items-center justify-center"
                                                            style={{
                                                                background: 'linear-gradient(135deg, #0486D2 0%, #0366A6 100%)'
                                                            }}
                                                            aria-label="Quick add to cart"
                                                        >
                                                            <Plus className="w-6 h-6" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Product Info */}
                                                <div className="p-5">
                                                    {/* Product Name */}
                                                    <h4
                                                        className="text-lg font-bold mb-2 line-clamp-1 group-hover:text-opacity-80 transition-all"
                                                        style={{ color: '#F279AB' }}
                                                    >
                                                        {product.name}
                                                    </h4>

                                                    {/* Product Description */}
                                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[40px]">
                                                        {product.description || 'Delicious treat waiting for you!'}
                                                    </p>

                                                    {/* Price and Add Button Row */}
                                                    <div className="flex items-center justify-between pt-3 border-t-2" style={{ borderColor: '#FFF5F9' }}>
                                                        <div>
                                                            <div className="text-xs text-gray-500 mb-0.5">Price</div>
                                                            <div
                                                                className="text-2xl font-bold"
                                                                style={{ color: '#0486D2' }}
                                                            >
                                                                Rs. {parseFloat(product.price).toFixed(2)}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleAddRecommendedProduct(product)}
                                                            className="px-5 py-2.5 rounded-xl text-white font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center gap-2"
                                                            style={{
                                                                background: 'linear-gradient(135deg, #0486D2 0%, #0366A6 100%)'
                                                            }}
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            <span>Add</span>
                                                        </button>
                                                    </div>

                                                    {/* Product Features (if available) */}
                                                    {product.addons && product.addons.length > 0 && (
                                                        <div
                                                            className="mt-3 pt-3 border-t flex items-center gap-2 text-xs"
                                                            style={{ borderColor: '#E3F4FD', color: '#0486D2' }}
                                                        >
                                                            <Sparkles className="w-3.5 h-3.5" style={{ color: '#F279AB' }} />
                                                            <span className="font-semibold">
                                                                {product.addons.length} extras available
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Bottom Accent Bar */}
                                                <div
                                                    className="h-1.5 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
                                                    style={{
                                                        background: 'linear-gradient(90deg, #F279AB 0%, #0486D2 100%)'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Empty State */}
                                {!loadingRecommended && recommendedProducts.length === 0 && (
                                    <div
                                        className="text-center py-12 px-6 rounded-2xl border-2 border-dashed"
                                        style={{ borderColor: '#E3F4FD', backgroundColor: '#FFF5F9' }}
                                    >
                                        <div
                                            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                                            style={{ backgroundColor: '#E3F4FD' }}
                                        >
                                            <Package className="w-10 h-10" style={{ color: '#0486D2' }} />
                                        </div>
                                        <h4 className="text-xl font-bold mb-2" style={{ color: '#F279AB' }}>
                                            No Recommendations Yet
                                        </h4>
                                        <p className="text-gray-600 max-w-md mx-auto">
                                            Keep shopping to discover more amazing products we think you'll love!
                                        </p>
                                        <button
                                            onClick={() => navigate('/')}
                                            className="mt-6 px-6 py-3 rounded-xl text-white font-bold hover:shadow-xl transform hover:scale-105 transition-all"
                                            style={{
                                                background: 'linear-gradient(135deg, #0486D2 0%, #0366A6 100%)'
                                            }}
                                        >
                                            Explore Products
                                        </button>
                                    </div>
                                )}

                                {/* View More Button */}
                                {!loadingRecommended && recommendedProducts.length > 0 && (
                                    <div className="text-center mt-8">
                                        <button
                                            onClick={() => navigate('/')}
                                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border-2 font-bold hover:shadow-lg transition-all transform hover:scale-105"
                                            style={{
                                                borderColor: '#F279AB',
                                                color: '#F279AB',
                                                backgroundColor: 'white'
                                            }}
                                        >
                                            <span>Explore More Products</span>
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* 🧾 Order Summary */}
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-8 h-fit lg:sticky lg:top-8 border-2"
                        style={{ borderColor: '#F279AB' }}
                    >
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: '#F279AB' }}>
                            <ShoppingCart className="w-6 h-6" />
                            Order Summary
                        </h3>
                        <div
                            className="space-y-4 mb-8 p-5 rounded-xl"
                            style={{ backgroundColor: '#FFF5F9' }}
                        >
                            <div className="flex justify-between font-semibold text-base">
                                <span style={{ color: '#6B7280' }}>
                                    Subtotal ({cartCalculations.totalItems} items):
                                </span>
                                <span style={{ color: '#0486D2' }}>Rs. {cartCalculations.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-base">
                                <span className="flex items-center gap-1" style={{ color: '#6B7280' }}>
                                    <MapPin className="w-4 h-4" />
                                    Delivery ({selectedLocation?.name || 'Standard'}):
                                </span>
                                <span style={{ color: '#0486D2' }}>Rs. {deliveryFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-semibold text-base">
                                <span style={{ color: '#6B7280' }}>Tax (8%):</span>
                                <span style={{ color: '#0486D2' }}>Rs. {cartCalculations.tax.toFixed(2)}</span>
                            </div>
                            <div
                                className="border-t-2 pt-4 flex justify-between font-bold text-2xl"
                                style={{ borderColor: '#0486D2' }}
                            >
                                <span style={{ color: '#F279AB' }}>Total:</span>
                                <span
                                    style={{
                                        background: 'linear-gradient(135deg, #F279AB 0%, #0486D2 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}
                                >
                                    Rs. {cartCalculations.total.toFixed(2)}
                                </span>
                            </div>
                        </div>

                        {selectedLocation && (
                            <div className="mb-6 text-center p-4 rounded-xl" style={{ backgroundColor: '#E3F4FD' }}>
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <MapPin className="w-5 h-5" style={{ color: '#0486D2' }} />
                                    <p className="font-bold" style={{ color: '#0486D2' }}>
                                        {selectedLocation.name}
                                    </p>
                                </div>
                                {selectedLocation.delivery_time && (
                                    <div className="flex items-center justify-center gap-2 text-sm">
                                        <Clock className="w-4 h-4" style={{ color: '#F279AB' }} />
                                        <span style={{ color: '#F279AB' }}>{selectedLocation.delivery_time}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/checkout')}
                            className="w-full px-8 py-5 text-white rounded-xl text-xl font-bold hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-3 transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #0486D2 0%, #0366A6 100%)'
                            }}
                        >
                            <span>Proceed to Checkout</span>
                            <ArrowRight className="w-6 h-6" />
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;