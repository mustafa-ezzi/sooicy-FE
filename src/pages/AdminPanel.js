import React, { useState, useEffect, useRef } from 'react';
import {
  Package, BarChart3, Users, Settings, MapPin, ShoppingBag,
  Eye, Search, Filter, User, Volume2, VolumeX, Bell
} from 'lucide-react';
import { printKitchenReceipt } from '../utils/printUtils';
import RiderManagement from './admin/RiderManagement';
import LocationManagement from './admin/LocationManagement';
import ProductManagement from './admin/ProductManagement';
import apiService from '../services/apiService';

const AdminPanel = ({ orders, riders, products, updateOrderStatus, assignRider, addNotification }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrderIds, setLastOrderIds] = useState(new Set());

  // Audio refs for notification sounds
  const newOrderSound = useRef(null);
  const statusUpdateSound = useRef(null);

  // Initialize audio objects with static files
  useEffect(() => {
    newOrderSound.current = new Audio('/sounds/new-order.mp3');
    statusUpdateSound.current = new Audio('/sounds/status-update.mp3');
    
    // Set volume levels
    if (newOrderSound.current) {
      newOrderSound.current.volume = 0.7;
      newOrderSound.current.preload = 'auto';
    }
    if (statusUpdateSound.current) {
      statusUpdateSound.current.volume = 0.5;
      statusUpdateSound.current.preload = 'auto';
    }

    // Initialize with current order IDs to prevent false alerts on first load
    setLastOrderIds(new Set(orders.map(order => order.id)));
  }, []);

  const playNewOrderSound = () => {
    if (soundEnabled && newOrderSound.current) {
      newOrderSound.current.currentTime = 0; // Reset to start
      newOrderSound.current.play().catch(e => {
        console.log('Could not play new order sound:', e);
        // Fallback: create a simple beep if audio file fails
        createFallbackBeep();
      });
    }
  };

  const playStatusUpdateSound = () => {
    if (soundEnabled && statusUpdateSound.current) {
      statusUpdateSound.current.currentTime = 0; // Reset to start  
      statusUpdateSound.current.play().catch(e => {
        console.log('Could not play status update sound:', e);
      });
    }
  };

  // Fallback beep sound using Web Audio API
  const createFallbackBeep = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Fallback beep also failed:', error);
    }
  };

  // Monitor for new orders and play sound
  useEffect(() => {
    const currentOrderIds = new Set(orders.map(order => order.id));
    const newOrders = orders.filter(order => !lastOrderIds.has(order.id));
    
    if (newOrders.length > 0 && lastOrderIds.size > 0) {
      // New order detected - play sound
      playNewOrderSound();
      
      // Show notifications for each new order
      newOrders.forEach(order => {
        const customerName = order.customer_name || order.customerInfo?.name || 'Customer';
        addNotification(`🔔 New Order #${order.id} from ${customerName}`, 'info');
        
        // Browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(`New SooIcy Order #${order.id}`, {
            body: `New order from ${customerName} - PKR ${order.total}`,
            icon: '/favicon.ico',
            tag: `order-${order.id}`,
            requireInteraction: false,
            silent: false
          });
        }
      });
    }
    
    setLastOrderIds(currentOrderIds);
  }, [orders, lastOrderIds, addNotification, soundEnabled]);

  // Request notification permission on component mount
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Enhanced order status update with sound
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      playStatusUpdateSound();
      addNotification(`Order #${orderId} status updated to ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      addNotification(`Failed to update order #${orderId}`, 'error');
    }
  };

  // Enhanced rider assignment with sound
  const handleAssignRider = async (orderId, riderId) => {
    try {
      await assignRider(orderId, riderId);
      playStatusUpdateSound();
      const rider = riders.find(r => r.id === riderId);
      addNotification(`Order #${orderId} assigned to ${rider?.name}`, 'success');
    } catch (error) {
      console.error('Error assigning rider:', error);
      addNotification(`Failed to assign rider to order #${orderId}`, 'error');
    }
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, order) => sum + parseFloat(order.total), 0),
    availableRiders: riders.filter(r => r.status === 'available').length
  };

  const filteredOrders = orders.filter(order => {
    const customerName = order.customer_name || order.customerInfo?.name || '';
    const matchesSearch = order.id.toString().includes(searchTerm) ||
      customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
      case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-500';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-500';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-500';
      default: return 'bg-gray-100 text-gray-800 border-gray-500';
    }
  };

  const OrderModal = ({ order, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Order Management - #{order.id}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Order Status</h3>
                <div className="space-y-2">
                  {['pending', 'preparing', 'delivered'].map(status => (
                    <button
                      key={status}
                      onClick={() => handleUpdateOrderStatus(order.id, status)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${order.status === status
                          ? 'bg-pink-500 text-white'
                          : 'bg-white hover:bg-gray-100'
                        }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Assign Rider</h3>
                <div className="space-y-2">
                  {riders.filter(r => r.status === 'available').map(rider => (
                    <button
                      key={rider.id}
                      onClick={() => handleAssignRider(order.id, rider.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${order.rider_id === rider.id
                          ? 'bg-blue-500 text-white'
                          : 'bg-white hover:bg-gray-100'
                        }`}
                    >
                      <div className="flex justify-between">
                        <span>{rider.name}</span>
                        <span className="text-sm">⭐ {rider.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => printKitchenReceipt(order)}
                  className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Package className="w-4 h-4" />
                  <span>Kitchen Receipt</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Order Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Order ID:</span> #{order.id}</p>
                  <p><span className="font-medium">Date:</span> {new Date(order.created_at || order.timestamp).toLocaleDateString()}</p>
                  <p><span className="font-medium">Time:</span> {new Date(order.created_at || order.timestamp).toLocaleTimeString()}</p>
                  <p><span className="font-medium">Customer:</span> {order.customer_name || order.customerInfo?.name || 'Guest'}</p>
                  <p><span className="font-medium">Phone:</span> {order.customer_phone || order.customerInfo?.phone || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {order.customer_email || order.customerInfo?.email || 'N/A'}</p>
                  <p><span className="font-medium">Address:</span> {order.delivery_address || order.deliveryAddress}</p>
                  <p><span className="font-medium">Payment:</span> {order.payment_method || order.paymentMethod}</p>
                  <p><span className="font-medium">Total:</span> <span className="font-bold text-pink-600">PKR {order.total}</span></p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
                <div className="space-y-2">
                  {(order.items || []).map((item, index) => (
                    <div key={item.id || index} className="flex justify-between items-center bg-white rounded p-2">
                      <div>
                        <p className="font-medium">{item.product_name || item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} × PKR {item.unit_price || item.price}</p>
                      </div>
                      <p className="font-semibold">PKR {((item.unit_price || item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const DashboardTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
            </div>
            <Package className="w-10 h-10 text-pink-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-800">PKR {stats.totalRevenue.toFixed(2)}</p>
            </div>
            <BarChart3 className="w-10 h-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Riders</p>
              <p className="text-3xl font-bold text-gray-800">{stats.availableRiders}</p>
            </div>
            <Users className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-3xl font-bold text-gray-800">{stats.pendingOrders}</p>
            </div>
            <Package className="w-10 h-10 text-yellow-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Order ID</th>
                <th className="text-left py-2">Customer</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Total</th>
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(-10).reverse().map(order => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3">#{order.id}</td>
                  <td className="py-3">{order.customer_name || order.customerInfo?.name || 'Guest'}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 font-semibold">PKR {order.total}</td>
                  <td className="py-3 text-sm text-gray-600">
                    {new Date(order.created_at || order.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const OrdersTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between">
              <div className="mb-4 lg:mb-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">Order #{order.id}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Customer:</span> {order.customer_name || order.customerInfo?.name || 'Guest'}</p>
                  <p><span className="font-medium">Time:</span> {new Date(order.created_at || order.timestamp).toLocaleString()}</p>
                  <p><span className="font-medium">Items:</span> {(order.items || []).length}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-pink-600">PKR {order.total}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Manage</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            {/* Sound Toggle Button */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                soundEnabled 
                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={soundEnabled ? 'Disable Order Notifications' : 'Enable Order Notifications'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-sm font-medium">
                {soundEnabled ? 'Sound On' : 'Sound Off'}
              </span>
            </button>
            
            {/* Notification Status */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
              Notification.permission === 'granted' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              <Bell className="w-4 h-4" />
              <span className="text-sm font-medium">
                {Notification.permission === 'granted' ? 'Notifications On' : 'Enable Browser Notifications'}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>Administrator</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="flex flex-wrap border-b">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { key: 'orders', label: 'Orders', icon: Package },
              { key: 'riders', label: 'Riders', icon: Users },
              { key: 'locations', label: 'Locations', icon: MapPin },
              { key: 'products', label: 'Products', icon: ShoppingBag }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 px-6 py-4 transition-colors ${activeTab === key
                    ? 'border-b-2 border-pink-500 text-pink-600 bg-pink-50'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'orders' && <OrdersTab />}
          {activeTab === 'riders' && <RiderManagement addNotification={addNotification} />}
          {activeTab === 'locations' && <LocationManagement addNotification={addNotification} />}
          {activeTab === 'products' && <ProductManagement addNotification={addNotification} />}
        </div>

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

export default AdminPanel;