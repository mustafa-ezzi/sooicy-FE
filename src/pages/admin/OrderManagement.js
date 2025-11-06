import React, { useState, useEffect } from 'react';
import {
    Package, Search, Filter, Eye, Printer, User, MapPin,
    Clock, CheckCircle, Truck, AlertCircle
} from 'lucide-react';
import apiService from '../../services/apiService';
import { printKitchenReceipt, printCustomerReceipt } from '../../utils/printUtils';

const OrderManagement = ({ addNotification }) => {
    const [orders, setOrders] = useState([]);
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        loadOrders();
        loadRiders();
    }, []);

    const loadOrders = async () => {
        try {
            const data = await apiService.getAllOrders();
            setOrders(data.results || data);
        } catch (error) {
            console.error('Error loading orders:', error);
            addNotification('Failed to load orders', 'error');
        }
    };

    const loadRiders = async () => {
        try {
            const data = await apiService.getAllRiders();
            setRiders(data.results || data);
        } catch (error) {
            console.error('Error loading riders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await apiService.updateOrderStatus(orderId, newStatus);
            await loadOrders();
            addNotification(`Order #${orderId} status updated to ${newStatus}`, 'success');
        } catch (error) {
            console.error('Error updating order status:', error);
            addNotification('Failed to update order status', 'error');
        }
    };

    const handleAssignRider = async (orderId, riderId) => {
        try {
            await apiService.assignRider(orderId, riderId);
            await loadOrders();
            addNotification('Rider assigned successfully', 'success');
        } catch (error) {
            console.error('Error assigning rider:', error);
            addNotification('Failed to assign rider', 'error');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-500';
            case 'preparing': return 'bg-blue-100 text-blue-800 border-blue-500';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-500';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-500';
            default: return 'bg-gray-100 text-gray-800 border-gray-500';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'preparing': return <Package className="w-4 h-4" />;
            case 'delivered': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <AlertCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toString().includes(searchTerm) ||
            order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.customer_phone.includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const OrderDetailModal = ({ order, onClose }) => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Order Details - #{order.id}</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        { }
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Update Status</h3>
                                <div className="space-y-2">
                                    {['pending', 'preparing', 'delivered', 'cancelled'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => handleStatusUpdate(order.id, status)}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-2 ${order.status === status
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-white hover:bg-gray-100'
                                                }`}
                                        >
                                            {getStatusIcon(status)}
                                            <span className="capitalize">{status}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Assign Rider</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {riders.filter(r => r.status === 'available').map(rider => (
                                        <button
                                            key={rider.id}
                                            onClick={() => handleAssignRider(order.id, rider.id)}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${order.rider === rider.id
                                                ? 'bg-green-500 text-white'
                                                : 'bg-white hover:bg-gray-100'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span>{rider.name}</span>
                                                <span className="text-sm">⭐ {rider.rating || 5.0}</span>
                                            </div>
                                            <div className="text-xs opacity-75">{rider.phone}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    onClick={() => printKitchenReceipt(order)}
                                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Kitchen Receipt</span>
                                </button>
                                <button
                                    onClick={() => printCustomerReceipt(order)}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 font-semibold"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>Print Receipt</span>
                                </button>
                            </div>
                        </div>

                        { }
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Customer Information</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span>{order.customer_name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="w-4 h-4 text-center text-gray-500">📞</span>
                                        <span>{order.customer_phone}</span>
                                    </div>
                                    {order.customer_email && (
                                        <div className="flex items-center space-x-2">
                                            <span className="w-4 h-4 text-center text-gray-500">✉️</span>
                                            <span>{order.customer_email}</span>
                                        </div>
                                    )}
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                                        <span>{order.delivery_address}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span>Order ID:</span>
                                        <span className="font-medium">#{order.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Date:</span>
                                        <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Time:</span>
                                        <span>{new Date(order.created_at).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Payment Method:</span>
                                        <span className="capitalize">{order.payment_method}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Delivery Type:</span>
                                        <span className="capitalize">{order.delivery_type}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span className="text-green-600">PKR {order.total}</span>
                                    </div>
                                </div>
                            </div>

                            {order.items && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-800 mb-3">Order Items</h3>
                                    <div className="space-y-3">
                                        {order.items.map((item, index) => (
                                            <div
                                                key={index}
                                                className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm"
                                            >
                                                {/* Item Header */}
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-800">
                                                            {item.product?.name || `Item #${item.product}`}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            Qty: {item.quantity} × PKR {item.unit_price}
                                                        </p>
                                                    </div>
                                                    <p className="font-semibold text-green-600">PKR {item.total_price}</p>
                                                </div>

                                                {/* Addons (if any) */}
                                                {item.addons_detail && item.addons_detail.length > 0 && (
                                                    <div className="mt-2 pl-4 border-l-2 border-pink-300">
                                                        <p className="text-sm font-semibold text-[#F279AB] mb-1">Add-ons:</p>
                                                        <ul className="space-y-1">
                                                            {item.addons_detail.map((addon) => (
                                                                <li
                                                                    key={addon.id}
                                                                    className="flex justify-between text-sm text-gray-700"
                                                                >
                                                                    <span>
                                                                        {addon.name}
                                                                        {addon.description && (
                                                                            <span className="text-gray-500 italic text-xs ml-1">
                                                                                — {addon.description}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                    <span className="text-gray-800">+ PKR {addon.price}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {/* Special instructions (optional) */}
                                                {item.special_instructions && (
                                                    <p className="mt-2 text-xs text-gray-500 italic">
                                                        “{item.special_instructions}”
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            { }
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Order Management</h2>
                    <p className="text-gray-600">Manage and track all customer orders</p>
                </div>
            </div>

            { }
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search orders by ID, customer name, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            { }
            <div className="grid grid-cols-1 gap-6">
                {filteredOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                            <div className="mb-4 lg:mb-0">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-800">Order #{order.id}</h3>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        <span className="capitalize">{order.status}</span>
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <div className="flex items-center space-x-4">
                                        <span><strong>Customer:</strong> {order.customer_name}</span>
                                        <span><strong>Phone:</strong> {order.customer_phone}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</span>
                                        <span><strong>Time:</strong> {new Date(order.created_at).toLocaleTimeString()}</span>
                                    </div>
                                    <div>
                                        <strong>Address:</strong> {order.delivery_address}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-600">Total Amount</p>
                                    <p className="text-2xl font-bold text-green-600">PKR {order.total}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedOrder(order);
                                        setShowModal(true);
                                    }}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Eye className="w-4 h-4" />
                                    <span>Manage</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredOrders.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-600">No orders match your search criteria.</p>
                </div>
            )}

            { }
            {showModal && selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedOrder(null);
                    }}
                />
            )}
        </div>
    );
};

export default OrderManagement;