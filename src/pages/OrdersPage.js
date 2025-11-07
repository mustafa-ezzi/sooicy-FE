import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, Eye, Printer, Search, Filter, Calendar, Phone, User, Crown } from 'lucide-react';
import apiService from '../services/apiService';

const OrdersPage = ({ orders, currentUser }) => {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [liveOrders, setLiveOrders] = useState(orders);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Fetch fresh order data from API
  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      let freshOrders;

      if (currentUser) {
        // Fetch orders for current user only
        freshOrders = await apiService.getUserOrders(currentUser.id);
      } else {
        // If no user logged in, show empty or redirect to home
        setLiveOrders([]);
        setLastRefresh(new Date());
        setIsLoading(false);
        return;
      }

      const ordersArray = Array.isArray(freshOrders) ? freshOrders : freshOrders.results || [];
      setLiveOrders(ordersArray);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Fallback to filtering local orders by user
      if (currentUser) {
        const userOrders = orders.filter(order =>
          order.customer_email === currentUser.email ||
          order.sooicy_user === currentUser.id
        );
        setLiveOrders(userOrders);
      } else {
        setLiveOrders([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh orders every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [currentUser]); // Added currentUser as dependency

  // Initial fetch when component mounts
  useEffect(() => {
    fetchOrders();
  }, [currentUser]); // Added currentUser as dependency

  // Handle rider contact
  const handleRiderContact = (rider) => {
    if (rider.phone) {
      window.open(`tel:${rider.phone}`);
    }
  };

  // Helper function to safely convert timestamp to Date
  const getOrderDate = (order) => {
    if (order.timestamp instanceof Date) {
      return order.timestamp;
    }
    if (typeof order.timestamp === 'string') {
      return new Date(order.timestamp);
    }
    if (order.created_at) {
      return new Date(order.created_at);
    }
    return new Date(); // fallback to current date
  };

  // Helper function to format date
  const formatDate = (date) => {
    try {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Helper function to format time
  const formatTime = (date) => {
    try {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Time';
    }
  };

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = liveOrders.filter(order => {
      const matchesSearch = searchTerm === '' ||
        order.id.toString().includes(searchTerm) ||
        (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.customerInfo?.name && order.customerInfo.name.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort orders
    filtered.sort((a, b) => {
      const dateA = getOrderDate(a);
      const dateB = getOrderDate(b);

      switch (sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'amount-high':
          return parseFloat(b.total) - parseFloat(a.total);
        case 'amount-low':
          return parseFloat(a.total) - parseFloat(b.total);
        default:
          return dateB - dateA;
      }
    });

    return filtered;
  }, [liveOrders, searchTerm, statusFilter, sortBy]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-500';

      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-500';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-500';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'preparing':
        return <Package className="w-4 h-4" />;

      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'pending':
        return 30;
      case 'preparing':
        return 60;
      case 'delivered':
        return 100;
      case 'cancelled':
        return 0;
      default:
        return 25;
    }
  };

  const OrderModal = ({ order, onClose }) => {
    const orderDate = getOrderDate(order);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              ×
            </button>
          </div>

          <div className="p-6">
            {/* Order Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Order Progress</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  style={{ width: `${getProgressPercentage(order.status)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>Placed</span>
                <span>Preparing</span>
                <span>Delivered</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Package className="w-5 h-5 mr-2" />
                        Order Information
                      </h3>
                      <div className="space-y-2">
                        <p><span className="font-medium text-gray-600">Order ID:</span> #{order.id}</p>
                        <p><span className="font-medium text-gray-600">Date:</span> {formatDate(orderDate)}</p>
                        <p><span className="font-medium text-gray-600">Time:</span> {formatTime(orderDate)}</p>
                        <p><span className="font-medium text-gray-600">Payment:</span> {order.payment_method || order.paymentMethod || 'N/A'}</p>
                        <p><span className="font-medium text-gray-600">Type:</span> {order.delivery_type || order.deliveryType || 'Delivery'}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-800 mb-4">Customer Information</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium text-gray-600">Name:</span> {order.customer_name || order.customerInfo?.name || 'Guest'}</p>
                        <p><span className="font-medium text-gray-600">Phone:</span> {order.customer_phone || order.customerInfo?.phone || 'N/A'}</p>
                        <p><span className="font-medium text-gray-600">Email:</span> {order.customer_email || order.customerInfo?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <Truck className="w-5 h-5 mr-2" />
                    Delivery Information
                  </h3>
                  <div className="space-y-2">
                    <p><span className="font-medium text-gray-600">Address:</span> {order.delivery_address || order.deliveryAddress || 'N/A'}</p>
                    <p><span className="font-medium text-gray-600">Estimated Time:</span> {order.estimated_time || order.estimatedTime || 'N/A'}</p>
                    {order.special_instructions && (
                      <p><span className="font-medium text-gray-600">Special Instructions:</span> {order.special_instructions}</p>
                    )}
                  </div>
                </div>

                {/* Rider Information */}
                {order.rider ? (
                  <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <Truck className="w-5 h-5 mr-2 text-blue-600" />
                      Assigned Rider
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p><span className="font-medium text-gray-600">Name:</span> {order.rider.name}</p>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-600">Phone:</span>
                          <span>{order.rider.phone || 'N/A'}</span>
                          {order.rider.phone && (
                            <button
                              onClick={() => handleRiderContact(order.rider)}
                              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                              title="Call rider"
                            >
                              <Phone className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p><span className="font-medium text-gray-600">Vehicle:</span> {order.rider.vehicle_type || 'N/A'} - {order.rider.license_number || 'N/A'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-600 mr-2">Status:</span>

                        </div>
                        <p><span className="font-medium text-gray-600">Rating:</span> {order.rider.rating || 'N/A'} ⭐</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-600 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-gray-400" />
                      Rider Assignment
                    </h3>
                    <div className="text-center py-4">
                      <User className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500">No rider assigned yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {order.status === 'pending' ? 'Waiting for order confirmation' : 'Rider will be assigned soon'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-6">
  <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
  <div className="space-y-3">
    {order.items.map((item, index) => (
      <div
        key={item.id || index}
        className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {item.product_image && (
              <img
                src={item.product_image}
                alt={item.product_name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h4 className="font-medium text-gray-800">{item.product_name}</h4>
              <p className="text-sm text-gray-600">
                Qty: {item.quantity} × Pkr{item.unit_price}
              </p>
              {item.special_instructions && (
                <p className="text-xs text-gray-500 mt-1">
                  Note: {item.special_instructions}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-800">Pkr{item.total_price}</p>
            {item.addons_price && (
              <p className="text-xs text-gray-500">
                + Add-ons: Pkr{item.addons_price}
              </p>
            )}
          </div>
        </div>

        {/* ✅ Add-ons section */}
        {item.addons_detail && item.addons_detail.length > 0 && (
          <div className="mt-3 ml-6 bg-gray-50 rounded-lg p-3 border-l-4 border-pink-300">
            <p className="text-sm font-semibold text-pink-600 mb-2 flex items-center">
               Add-ons
            </p>
            <ul className="space-y-1 text-sm text-gray-700">
              {item.addons_detail.map((addon) => (
                <li
                  key={addon.id}
                  className="flex justify-between items-center border-b last:border-none pb-1"
                >
                  <div>
                    <span className="font-medium">{addon.name}</span>
                    {addon.description && (
                      <p className="text-xs text-gray-500 italic">
                        {addon.description}
                      </p>
                    )}
                  </div>
                  <span className="text-gray-800 font-medium">
                    +Pkr{addon.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ))}
  </div>
</div>

              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-pink-50 to-blue-50 rounded-xl p-6 sticky top-6">
                  <h3 className="font-semibold text-gray-800 mb-6 text-center text-lg">Order Summary</h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal:</span>
                      <span>Pkr{(order.subtotal || '0.00')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span>Pkr{(order.delivery_fee || order.deliveryFee || '0.00')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span>Pkr{(order.tax || '0.00')}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-pink-600">Pkr{order.total}</span>
                    </div>
                  </div>

                  <div className="space-y-3">

                    <button
                      onClick={onClose}
                      className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors font-semibold"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (liveOrders.length === 0) {
    return (
      <div className="min-h-screen  py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-16">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading your orders...</h2>
                <p className="text-gray-600">Please wait while we fetch your order history</p>
              </>
            ) : !currentUser ? (
              <>
                <Package className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to SooIcy!</h2>
                <p className="text-xl text-gray-600 mb-8">Start shopping to create your account and see your orders here!</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-lg transition-colors text-lg font-semibold"
                >
                  Start Shopping
                </button>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 max-w-md mx-auto">
                  <h3 className="font-semibold text-blue-800 mb-2">How it works:</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>1. Add items to cart</p>
                    <p>2. Enter your details at checkout</p>
                    <p>3. We'll create your SooIcy account automatically</p>
                    <p>4. Track all your orders here!</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Package className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-800 mb-4">No orders yet, {currentUser.name}!</h2>
                <p className="text-xl text-gray-600 mb-8">Start shopping to see your order history here</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-4 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-lg transition-colors text-lg font-semibold"
                >
                  Start Shopping
                </button>
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200 max-w-md mx-auto">
                  <div className="flex items-center space-x-2 mb-2">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">SooIcy Member Benefits:</h3>
                  </div>
                  <div className="text-sm text-yellow-700 space-y-1">
                    <p>✓ Order tracking & history</p>
                    <p>✓ Faster checkout</p>
                    <p>✓ Exclusive member offers</p>
                    <p>✓ Priority support</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-3xl font-bold text-gray-800">
                {currentUser ? `${currentUser.name}'s Orders` : 'Your Orders'}
              </h2>
              {isLoading && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              )}
            </div>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-gray-600">{filteredAndSortedOrders.length} of {liveOrders.length} orders</p>
              <span className="text-gray-400">•</span>
              <p className="text-sm text-gray-500">Last updated: {lastRefresh.toLocaleTimeString()}</p>
              {currentUser && (
                <>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center space-x-1">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-yellow-700 font-medium">SooIcy Member</span>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={fetchOrders}
              disabled={isLoading}
              className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors flex items-center space-x-2 ${isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-50 text-gray-600 hover:text-gray-800'
                }`}
            >
              <Package className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white rounded-lg transition-colors font-semibold"
            >
              Continue Shopping
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="preparing">Preparing</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Highest Amount</option>
                <option value="amount-low">Lowest Amount</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== 'all' || sortBy !== 'newest') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setSortBy('newest');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {filteredAndSortedOrders.map(order => {
            const orderDate = getOrderDate(order);

            return (
              <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-pink-500">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
                  <div className="mb-4 lg:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">Order #{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center space-x-4 text-sm text-gray-600">
                      <span>{formatDate(orderDate)}</span>
                      <span>•</span>
                      <span>{formatTime(orderDate)}</span>
                      <span>•</span>
                      <span>{order.items.length} items</span>
                      <span>•</span>
                      <span>{order.payment_method || order.paymentMethod || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="text-2xl font-bold text-pink-600">Pkr{order.total}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-colors flex items-center space-x-2 font-semibold"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div
                          key={item.id || index}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {item.product_image && (
                                <img
                                  src={item.product_image}
                                  alt={item.product_name}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <h4 className="font-medium text-gray-800">{item.product_name}</h4>
                                <p className="text-sm text-gray-600">
                                  Qty: {item.quantity} × Pkr{item.unit_price}
                                </p>
                                {item.special_instructions && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Note: {item.special_instructions}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-800">Pkr{item.total_price}</p>
                              {item.addons_price && (
                                <p className="text-xs text-gray-500">
                                  + Add-ons: Pkr{item.addons_price}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* ✅ Add-ons section */}
                          {item.addons_detail && item.addons_detail.length > 0 && (
                            <div className="mt-3 ml-6 bg-gray-50 rounded-lg p-3 border-l-4 border-pink-300">
                              <p className="text-sm font-semibold text-pink-600 mb-2 flex items-center">
                                Add-ons
                              </p>
                              <ul className="space-y-1 text-sm text-gray-700">
                                {item.addons_detail.map((addon) => (
                                  <li
                                    key={addon.id}
                                    className="flex justify-between items-center border-b last:border-none pb-1"
                                  >
                                    <div>
                                      <span className="font-medium">{addon.name}</span>
                                      {addon.description && (
                                        <p className="text-xs text-gray-500 italic">
                                          {addon.description}
                                        </p>
                                      )}
                                    </div>
                                    <span className="text-gray-800 font-medium">
                                      +Pkr{addon.price}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>


                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Delivery Information</h4>
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-600">
                        <span className="font-medium">Customer:</span> {order.customer_name || order.customerInfo?.name || 'Guest'}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Address:</span> {order.delivery_address || order.deliveryAddress || 'N/A'}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Estimated Time:</span> {order.estimated_time || order.estimatedTime || 'N/A'}
                      </p>
                      {order.rider ? (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-blue-800 font-medium mb-1">Assigned Rider:</p>
                          <div className="flex items-center space-x-2">
                            {order.rider.profile_picture && (
                              <img
                                src={order.rider.profile_picture}
                                alt={order.rider.name}
                                className="w-8 h-8 rounded-full object-cover border border-blue-300"
                              />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium text-blue-800">{order.rider_name}</p>
                              <p className="text-xs text-blue-600">
                                {order.rider.vehicle_type} - {order.rider.phone}
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {order.rider.phone && (
                                <button
                                  onClick={() => handleRiderContact(order.rider)}
                                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
                                  title="Call rider"
                                >
                                  <Phone className="w-3 h-3" />
                                </button>
                              )}

                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-600">No rider assigned</p>
                              <p className="text-xs text-gray-500">
                                {order.status === 'pending' ? 'Awaiting confirmation' : 'Rider assignment in progress'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Order Progress</span>
                    <span className="text-sm text-gray-500">{getProgressPercentage(order.status)}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-gradient-to-r from-pink-500 to-blue-500'
                        }`}
                      style={{ width: `${getProgressPercentage(order.status)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredAndSortedOrders.length === 0 && liveOrders.length > 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSortBy('newest');
              }}
              className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Order Modal */}
        {selectedOrder && (
          <OrderModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
          />
        )}
      </div>
    </div>
  );
};

export default OrdersPage;