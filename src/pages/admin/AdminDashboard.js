import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
    LayoutDashboard, Package, Users, MapPin, ShoppingBag,
    LogOut, Menu, X, BarChart3, Settings, Bell, Plus
} from 'lucide-react';


import DashboardOverview from './DashboardOverview';
import ProductManagement from './ProductManagement';
import RiderManagement from './RiderManagement';
import LocationManagement from './LocationManagement';
import OrderManagement from './OrderManagement';
import AddonManagement from './AddonManagement';

const AdminDashboard = ({ adminUser, onLogout, addNotification }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/orders', label: 'Orders', icon: Package },
        { path: '/admin/products', label: 'Products', icon: ShoppingBag },
        { path: '/admin/riders', label: 'Riders', icon: Users },
        { path: '/admin/locations', label: 'Locations', icon: MapPin },
        { path: '/admin/addons', label: 'Addons', icon: Plus },
    ];

    const handleLogout = () => {
        onLogout();
        navigate('/admin/login');
        addNotification('Logged out successfully', 'info');
    };

    const Sidebar = () => (
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>

            { }
            <div className="flex items-center justify-between h-16 px-6 bg-gray-800">
                <h2 className="text-xl font-bold text-white">SooIcy Admin</h2>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden text-gray-400 hover:text-white"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            { }
            <div className="p-6 bg-gray-800 border-b border-gray-700">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                            {adminUser?.name?.charAt(0) || 'A'}
                        </span>
                    </div>
                    <div className="ml-3">
                        <p className="text-white font-medium">{adminUser?.name || 'Admin'}</p>
                        <p className="text-gray-400 text-sm">{adminUser?.email}</p>
                    </div>
                </div>
            </div>

            { }
            <nav className="mt-6">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;

                    return (
                        <button
                            key={item.path}
                            onClick={() => {
                                navigate(item.path);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center px-6 py-3 text-left transition-colors ${isActive
                                ? 'bg-blue-600 text-white border-r-4 border-blue-400'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <Icon className="w-5 h-5 mr-3" />
                            {item.label}
                        </button>
                    );
                })}
            </nav>

            { }
            <div className="absolute bottom-0 w-full p-6">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );

    const TopBar = () => (
        <div className="bg-white shadow-sm border-b">
            <div className="flex items-center justify-between h-16 px-6">
                <div className="flex items-center">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <h1 className="ml-4 text-2xl font-bold text-gray-900 lg:ml-0">
                        {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
                    </h1>
                </div>

                <div className="flex items-center space-x-4">
                    <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                        <Bell className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        View Customer App →
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />

            { }
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            { }
            <div className="flex-1 flex flex-col overflow-hidden">
                <TopBar />

                <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
                    <Routes>
                        <Route path="dashboard" element={
                            <DashboardOverview addNotification={addNotification} />
                        } />
                        <Route path="orders" element={
                            <OrderManagement addNotification={addNotification} />
                        } />
                        <Route path="products" element={
                            <ProductManagement addNotification={addNotification} />
                        } />
                        <Route path="riders" element={
                            <RiderManagement addNotification={addNotification} />
                        } />
                        <Route path="locations" element={
                            <LocationManagement addNotification={addNotification} />
                        } />
                        <Route path="addons" element={
                            <AddonManagement addNotification={addNotification} />
                        } />
                        <Route path="" element={
                            <Navigate to="dashboard" replace />
                        } />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;