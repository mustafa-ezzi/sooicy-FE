import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CreditCard, User, CheckCircle, Award } from 'lucide-react';

const CheckoutPage = ({ cart, getDeliveryFee, placeOrder, api, setCurrentUser }) => {
  const navigate = useNavigate(); // ✅ use the hook here

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [pickupLocation, setPickupLocation] = useState('main-branch');
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [isMember, setIsMember] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);

  const subtotal = cart.reduce((sum, item) => {
    const basePrice = parseFloat(item.price || 0);
    const addonTotal = (item.selectedAddons || []).reduce(
      (addonSum, addon) => addonSum + parseFloat(addon.price || 0),
      0
    );
    return sum + (basePrice + addonTotal) * (item.quantity || 1);
  }, 0);

  const deliveryFee = deliveryType === 'delivery' ? Number(getDeliveryFee()) || 0 : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + deliveryFee + tax;

  // Check if user exists when email changes
  useEffect(() => {
    const checkUserMembership = async () => {
      if (customerInfo.email && customerInfo.email.includes('@') && api?.checkUser) {
        try {
          const result = await api.checkUser(customerInfo.email);
          if (result.exists) {
            setIsMember(true);
            setUserInfo(result.user);
            // Auto-fill name and phone if available
            if (result.user.first_name && result.user.last_name) {
              setCustomerInfo(prev => ({
                ...prev,
                name: `${result.user.first_name} ${result.user.last_name}`,
                phone: result.user.phone || prev.phone
              }));
            }
          } else {
            setIsMember(false);
            setUserInfo(null);
          }
        } catch (error) {
          console.error('Error checking user:', error);
        }
      }
    };

    const debounceTimer = setTimeout(checkUserMembership, 500);
    return () => clearTimeout(debounceTimer);
  }, [customerInfo.email, api]);

  const validateForm = () => {
    const newErrors = {};

    if (!customerInfo.name.trim()) newErrors.name = 'Name is required';
    if (!customerInfo.phone.trim()) newErrors.phone = 'Phone is required';
    if (!customerInfo.email.trim()) newErrors.email = 'Email is required';
    if (deliveryType === 'delivery' && !deliveryAddress.trim()) {
      newErrors.address = 'Delivery address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('Processing your order...');

    try {
      // Create or get user if API methods are available
      let userResult = null;
      if (api?.createUser) {
        userResult = await api.createUser({
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone
        });

        // Set current user
        if (userResult?.user) {
          if (api.setCurrentUser) api.setCurrentUser(userResult.user);
          if (setCurrentUser) setCurrentUser(userResult.user);
        }

        // Show welcome message for new members
        if (userResult?.created) {
          setShowWelcomeMessage(true);
        }
      }

      const orderDetails = {
        customerInfo: {
          ...customerInfo,
          address: deliveryType === 'delivery' ? deliveryAddress : ''
        },
        deliveryAddress: deliveryType === 'delivery' ? deliveryAddress : `Pickup at ${pickupLocation}`,
        paymentMethod,
        pickupLocation: deliveryType === 'pickup' ? pickupLocation : null,
        deliveryType,
        userWelcomeMessage: userResult?.message || null
      };

      await placeOrder(orderDetails);
      setShowOrderSuccess(true);

    } catch (error) {
      console.error('Error during checkout:', error);
      setSubmitMessage('');
      alert('There was an error processing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-12 max-w-md mx-4 border-2" style={{ borderColor: '#F279AB' }}>
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-5xl">🛒</span>
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#F279AB' }}>Your cart is empty</h2>
          <p style={{ color: '#0486D2' }} className="mb-8 text-lg">Add some delicious items before checkout</p>
          <button
            onClick={() => navigate('/')}
            className="px-8 py-4 text-white rounded-xl transition-all font-bold hover:shadow-2xl transform hover:-translate-y-1 text-lg"
            style={{ background: 'linear-gradient(135deg, #0486D2 0%, #0366A6 100%)' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  {/* Unified Success Modal */ }
  {
    showOrderSuccess && (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div
          className="bg-white rounded-3xl max-w-md w-full p-10 text-center shadow-2xl border-4 animate-fade-in"
          style={{ borderColor: '#F279AB' }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{ backgroundColor: '#0486D2' }}
          >
            <Award className="w-12 h-12 text-white" />
          </div>

          <h3 className="text-3xl font-bold mb-3" style={{ color: '#F279AB' }}>
            {isMember ? `Welcome back, ${userInfo?.first_name || 'SooIcy Member'}!` : 'Welcome to the SooIcy Family! 🎉'}
          </h3>

          <p className="mb-8 text-lg font-medium" style={{ color: '#0486D2' }}>
            {isMember
              ? 'Your order has been placed successfully. We’re so glad to have you with us again!'
              : 'Your account has been created and your order is confirmed. Enjoy your SooIcy treats!'}
          </p>

          <button
            onClick={() => setShowOrderSuccess(false)}
            className="px-8 py-4 text-white rounded-xl font-bold hover:shadow-2xl transition-all transform hover:-translate-y-1"
            style={{ backgroundColor: '#0486D2' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen py-12" >

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold mb-3" style={{
            background: 'linear-gradient(135deg, #F279AB 0%, #0486D2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Checkout
          </h2>
          <p className="text-lg" style={{ color: '#0486D2' }}>Complete your order in just a few steps</p>
        </div>

        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 transform hover:scale-[1.01] transition-transform" style={{ borderColor: '#F279AB' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold flex items-center" style={{ color: '#F279AB' }}>
                    <User className="w-6 h-6 mr-3" style={{ color: '#0486D2' }} />
                    Customer Information
                  </h3>
                  {isMember && userInfo && (
                    <div className="flex items-center space-x-2 px-4 py-2 rounded-full shadow-md" style={{ background: 'linear-gradient(135deg, #0486D2 0%, #0366A6 100%)' }}>
                      <Award className="w-5 h-5 text-white" />
                      <span className="text-sm font-bold text-white">SooIcy Member</span>
                    </div>
                  )}
                </div>

                {isMember && userInfo && (
                  <div className="mb-6 p-4 rounded-xl border-2 shadow-inner" style={{ borderColor: '#0486D2', backgroundColor: '#E3F4FD' }}>
                    <p className="text-sm" style={{ color: '#F279AB' }}>
                      <span className="font-bold text-lg">Welcome back, {userInfo.first_name}!</span>
                      <br />
                      <span style={{ color: '#0486D2' }}>Member since: {userInfo.member_duration} • Total orders: {userInfo.total_orders}</span>
                    </p>
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all font-medium ${errors.name ? 'border-red-500 focus:ring-red-200' : ''
                        }`}
                      style={{
                        borderColor: errors.name ? undefined : '#F279AB',
                        color: '#F279AB',
                        backgroundColor: '#FFF5F9'
                      }}
                      disabled={isSubmitting}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-2 font-semibold">{errors.name}</p>}
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all font-medium ${errors.phone ? 'border-red-500 focus:ring-red-200' : ''
                        }`}
                      style={{
                        borderColor: errors.phone ? undefined : '#F279AB',
                        color: '#F279AB',
                        backgroundColor: '#FFF5F9'
                      }}
                      disabled={isSubmitting}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-2 font-semibold">{errors.phone}</p>}
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all font-medium ${errors.email ? 'border-red-500 focus:ring-red-200' : ''
                        }`}
                      style={{
                        borderColor: errors.email ? undefined : '#F279AB',
                        color: '#F279AB',
                        backgroundColor: '#FFF5F9'
                      }}
                      disabled={isSubmitting}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-2 font-semibold">{errors.email}</p>}
                    {!isMember && customerInfo.email && customerInfo.email.includes('@') && (
                      <p className="text-sm mt-3 flex items-center font-semibold" style={{ color: '#0486D2' }}>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        We'll create your SooIcy account with this email
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Option */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 transform hover:scale-[1.01] transition-transform" style={{ borderColor: '#F279AB' }}>
                <h3 className="text-2xl font-bold mb-6" style={{ color: '#F279AB' }}>Delivery Option</h3>
                <div className="space-y-4">
                  <label className="flex items-center p-5 border-2 rounded-xl cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5" style={{
                    borderColor: deliveryType === 'delivery' ? '#0486D2' : '#F279AB',
                    backgroundColor: deliveryType === 'delivery' ? '#E3F4FD' : '#FFF5F9'
                  }}>
                    <input
                      type="radio"
                      value="delivery"
                      checked={deliveryType === 'delivery'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="mr-4 w-5 h-5"
                      style={{ accentColor: '#0486D2' }}
                      disabled={isSubmitting}
                    />
                    <div className="flex-1">
                      <div className="font-bold text-lg" style={{ color: '#F279AB' }}>🚚 Delivery</div>
                      <div className="text-sm font-medium mt-1" style={{ color: '#0486D2' }}>Delivered to your address (+Rs. {getDeliveryFee()})</div>
                    </div>
                  </label>
                  <label className="flex items-center p-5 border-2 rounded-xl cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5" style={{
                    borderColor: deliveryType === 'pickup' ? '#0486D2' : '#F279AB',
                    backgroundColor: deliveryType === 'pickup' ? '#E3F4FD' : '#FFF5F9'
                  }}>
                    <input
                      type="radio"
                      value="pickup"
                      checked={deliveryType === 'pickup'}
                      onChange={(e) => setDeliveryType(e.target.value)}
                      className="mr-4 w-5 h-5"
                      style={{ accentColor: '#0486D2' }}
                      disabled={isSubmitting}
                    />
                    <div className="flex-1">
                      <div className="font-bold text-lg" style={{ color: '#F279AB' }}>🏪 Pickup</div>
                      <div className="text-sm font-medium mt-1" style={{ color: '#0486D2' }}>Pick up at our location (Free)</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Address/Pickup Location */}
              {deliveryType === 'delivery' ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 transform hover:scale-[1.01] transition-transform" style={{ borderColor: '#F279AB' }}>
                  <h3 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#F279AB' }}>
                    <MapPin className="w-6 h-6 mr-3" style={{ color: '#0486D2' }} />
                    Delivery Address
                  </h3>
                  <div>
                    <textarea
                      placeholder="Enter your complete delivery address *"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      rows={4}
                      className={`w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 transition-all font-medium ${errors.address ? 'border-red-500 focus:ring-red-200' : ''
                        }`}
                      style={{
                        borderColor: errors.address ? undefined : '#F279AB',
                        color: '#F279AB',
                        backgroundColor: '#FFF5F9'
                      }}
                      disabled={isSubmitting}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-2 font-semibold">{errors.address}</p>}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-8 border-2 transform hover:scale-[1.01] transition-transform" style={{ borderColor: '#F279AB' }}>
                  <h3 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#F279AB' }}>
                    <MapPin className="w-6 h-6 mr-3" style={{ color: '#0486D2' }} />
                    Pickup Location
                  </h3>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full px-5 py-4 border-2 rounded-xl focus:outline-none focus:ring-4 appearance-none font-medium"
                    style={{ borderColor: '#F279AB', color: '#F279AB', backgroundColor: '#FFF5F9' }}
                    disabled={isSubmitting}
                  >
                    <option value="main-branch">Main Branch - Ready in 15-20 minutes</option>
                    <option value="downtown">Downtown Location - Ready in 10-15 minutes</option>
                    <option value="mall">Mall Food Court - Ready in 12-18 minutes</option>
                  </select>
                  <div className="mt-4 text-sm font-semibold flex items-center p-3 rounded-lg" style={{ color: '#0486D2', backgroundColor: '#E3F4FD' }}>
                    <MapPin className="w-5 h-5 mr-2" />
                    Ready for pickup in 15-20 minutes
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-xl p-8 border-2 transform hover:scale-[1.01] transition-transform" style={{ borderColor: '#F279AB' }}>
                <h3 className="text-2xl font-bold mb-6 flex items-center" style={{ color: '#F279AB' }}>
                  <CreditCard className="w-6 h-6 mr-3" style={{ color: '#0486D2' }} />
                  Payment Method
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center p-5 border-2 rounded-xl cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5" style={{
                    borderColor: paymentMethod === 'card' ? '#0486D2' : '#F279AB',
                    backgroundColor: paymentMethod === 'card' ? '#E3F4FD' : '#FFF5F9'
                  }}>
                    <input
                      type="radio"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4 w-5 h-5"
                      style={{ accentColor: '#0486D2' }}
                      disabled={isSubmitting}
                    />
                    <span className="font-bold text-lg" style={{ color: '#F279AB' }}>💳 Credit/Debit Card</span>
                  </label>
                  <label className="flex items-center p-5 border-2 rounded-xl cursor-pointer hover:shadow-lg transition-all transform hover:-translate-y-0.5" style={{
                    borderColor: paymentMethod === 'cash' ? '#0486D2' : '#F279AB',
                    backgroundColor: paymentMethod === 'cash' ? '#E3F4FD' : '#FFF5F9'
                  }}>
                    <input
                      type="radio"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-4 w-5 h-5"
                      style={{ accentColor: '#0486D2' }}
                      disabled={isSubmitting}
                    />
                    <span className="font-bold text-lg" style={{ color: '#F279AB' }}>💵 Cash on Delivery</span>
                  </label>
                </div>
              </div>

              {/* Member Benefits Info */}
              <div className="rounded-2xl p-6 border-2 shadow-lg" style={{ backgroundColor: '#E3F4FD', borderColor: '#0486D2' }}>
                <div className="flex items-center mb-3">
                  <span className="text-2xl">🎉</span>
                  <h4 className="text-xl font-bold ml-3" style={{ color: '#F279AB' }}>Join the Sooicy Family!</h4>
                </div>
                <p className="font-medium" style={{ color: '#0486D2' }}>
                  By placing this order, you'll become a Sooicy member and enjoy exclusive benefits,
                  order history tracking, and special offers!
                </p>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="bg-white rounded-2xl shadow-2xl p-8 h-fit sticky top-8 border-2" style={{ borderColor: '#F279AB' }}>
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#F279AB' }}>Order Summary</h3>

              {/* Order Items */}
              <div className="space-y-3 mb-8 max-h-72 overflow-y-auto pr-2">
                {cart.map(item => {
                  const basePrice = parseFloat(item.price || 0);
                  const addonTotal = (item.selectedAddons || []).reduce(
                    (sum, addon) => sum + parseFloat(addon.price || 0),
                    0
                  );
                  const totalPerItem = (basePrice + addonTotal) * item.quantity;

                  return (
                    <div key={item.cartItemId} className="py-3 border-b-2 hover:bg-opacity-50 transition-colors rounded-lg px-2"
                      style={{ borderColor: '#FFF5F9' }}>
                      <div className="flex justify-between text-sm mb-1">
                        <div>
                          <span className="font-bold" style={{ color: '#F279AB' }}>{item.name}</span>
                          <span className="font-semibold ml-2" style={{ color: '#0486D2' }}>x{item.quantity}</span>
                        </div>
                        <span className="font-bold" style={{ color: '#0486D2' }}>
                          Rs. {totalPerItem.toFixed(2)}
                        </span>
                      </div>
                      {item.selectedAddons && item.selectedAddons.length > 0 && (
                        <div className="text-xs pl-4 mt-1">
                          {item.selectedAddons.map(addon => (
                            <div key={addon.id} className="flex justify-between text-gray-600">
                              <span>+ {addon.name}</span>
                              <span>Rs. {(parseFloat(addon.price) * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-4 mb-8 p-5 rounded-xl" style={{ backgroundColor: '#FFF5F9' }}>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between font-semibold">
                    <span style={{ color: '#F279AB' }}>Items Subtotal:</span>
                    <span style={{ color: '#0486D2' }}>
                      Rs. {cart.reduce((sum, item) => sum + (parseFloat(item.price || 0) * item.quantity), 0).toFixed(2)}
                    </span>
                  </div>
                  {cart.some(item => item.selectedAddons?.length > 0) && (
                    <div className="flex justify-between font-semibold">
                      <span style={{ color: '#F279AB' }}>Addons Total:</span>
                      <span style={{ color: '#0486D2' }}>
                        Rs. {cart.reduce((sum, item) =>
                          sum + ((item.selectedAddons || []).reduce(
                            (addonSum, addon) => addonSum + parseFloat(addon.price || 0), 0
                          ) * item.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between font-semibold">
                  <span style={{ color: '#F279AB' }}>Delivery Fee:</span>
                  <span style={{ color: '#0486D2' }}>Rs. {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span style={{ color: '#F279AB' }}>Tax (8%):</span>
                  <span style={{ color: '#0486D2' }}>Rs. {(subtotal * 0.08).toFixed(2)}</span>
                </div>
                <div className="border-t-2 pt-4 flex justify-between font-bold text-2xl" style={{ borderColor: '#0486D2' }}>
                  <span style={{ color: '#F279AB' }}>Total:</span>
                  <span style={{
                    background: 'linear-gradient(135deg, #F279AB 0%, #0486D2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Rs. {(subtotal + deliveryFee + (subtotal * 0.08)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Message */}
              {submitMessage && (
                <div className="mb-6 p-4 border-2 rounded-xl shadow-inner" style={{ backgroundColor: '#E3F4FD', borderColor: '#0486D2' }}>
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-b-transparent mr-3" style={{ borderColor: '#0486D2' }}></div>
                    <span className="font-bold" style={{ color: '#F279AB' }}>{submitMessage}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full px-8 py-5 text-white rounded-xl transition-all text-xl font-bold hover:shadow-2xl transform hover:-translate-y-1 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                style={{ background: 'linear-gradient(135deg, #0486D2 0%, #0366A6 100%)' }}
              >
                {isSubmitting ? 'Processing...' : `Place Order - Rs. ${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;