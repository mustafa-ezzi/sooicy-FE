import React, { useState, useEffect } from 'react';
import {
  Package, DollarSign, Users, MapPin, TrendingUp,
  ShoppingBag, Clock, CheckCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import apiService from '../../services/apiService';

const DashboardOverview = ({ addNotification }) => {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState(30); // Default to 30 days
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    loadAnalytics(daysFilter);
  }, [daysFilter]);

  const loadDashboardData = async () => {
    try {
      const [statsData, ordersData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getAllOrders({ limit: 10 }),
      ]);

      setStats(statsData);
      setRecentOrders(ordersData.results || ordersData);
      await loadAnalytics(daysFilter);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      addNotification('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (days) => {
    try {
      setAnalyticsLoading(true);
      const data = await apiService.getSalesAnalytics(days);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      addNotification('Failed to load analytics', 'error');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, change }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className="text-sm text-green-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {change}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0486D2]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#0486D2]">Dashboard Overview</h2>
        <p className="text-gray-600">Welcome back! Here’s what's happening with your business.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value={stats.total_orders || 0} icon={Package} color="bg-[#0486D2]" change="+12% from last month" />
        <StatCard title="Total Revenue" value={`PKR ${stats.total_revenue || 0}`} icon={DollarSign} color="bg-[#F279AB]" change="+8% from last month" />
        <StatCard title="Active Riders" value={stats.available_riders || 0} icon={Users} color="bg-[#2E8BC0]" />
        <StatCard title="Total Products" value={stats.total_products || 0} icon={ShoppingBag} color="bg-[#FCA5A5]" />
      </div>

      {/* Orders Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Pending Orders" value={stats.pending_orders || 0} icon={Clock} color="bg-yellow-500" />
        <StatCard title="Completed Today" value={stats.completed_orders || 0} icon={CheckCircle} color="bg-green-600" />
        <StatCard title="Total Locations" value={stats.total_locations || 0} icon={MapPin} color="bg-indigo-500" />
      </div>

      {/* Sales Analytics */}
      {analytics && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#0486D2]">Sales Analytics</h3>
            {/* Days Filter */}
            <div className="flex space-x-2 bg-[#E3F4FD] rounded-full p-1">
              {[1, 7, 30].map(days => (
                <button
                  key={days}
                  onClick={() => setDaysFilter(days)}
                  className={`px-4 py-1 text-sm font-semibold rounded-full transition-all ${
                    daysFilter === days
                      ? 'bg-[#0486D2] text-white shadow-md'
                      : 'text-[#0486D2] hover:bg-[#D6EBFA]'
                  }`}
                >
                  {days === 1 ? '1 Day' : days === 7 ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>

          {analyticsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0486D2]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Sales */}
              <div>
                <h4 className="text-md font-semibold text-[#F279AB] mb-3">Daily Sales</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.daily_sales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#0486D2" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Category Performance */}
              <div>
                <h4 className="text-md font-semibold text-[#F279AB] mb-3">Category Performance</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(analytics.category_performance).map(([key, value]) => ({
                      category: key,
                      revenue: value,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#F279AB" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Products */}
      {analytics && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-[#0486D2] mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {analytics.top_products.map(product => (
              <div key={product.id} className="flex justify-between border-b pb-2 text-gray-700">
                <span className="font-medium">{product.name}</span>
                <span className="text-[#F279AB] font-semibold">₨ {product.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customer_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'delivering'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'preparing'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">PKR {order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentOrders.length === 0 && (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent orders found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
