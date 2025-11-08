    import React, { useState, useEffect } from 'react';
    import { Plus, Edit2, Trash2, MapPin, Search, Filter, ToggleLeft, ToggleRight } from 'lucide-react';
    import apiService from '../../services/apiService';

    const LocationManagement = ({ addNotification }) => {
        const [locations, setLocations] = useState([]);
        const [loading, setLoading] = useState(true);
        const [showModal, setShowModal] = useState(false);
        const [editingLocation, setEditingLocation] = useState(null);
        const [searchTerm, setSearchTerm] = useState('');
        const [availabilityFilter, setAvailabilityFilter] = useState('all');

        const [formData, setFormData] = useState({
            name: '',
            area: '',
            address: '',
            delivery_time: '',
            delivery_fee: '',
            available: true,
            description: '',
            coverage_radius: 5,
            min_order_amount: 0
        });

        useEffect(() => {
            fetchLocations();
        }, []);

        const fetchLocations = async () => {
            try {
                setLoading(true);
                const data = await apiService.getAllLocations();

                const locationsArray = Array.isArray(data) ? data : data.results || [];
                setLocations(locationsArray);
            } catch (error) {
                addNotification('Failed to fetch locations', 'error');
                console.error('Error fetching locations:', error);
            } finally {
                setLoading(false);
            }
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const locationData = {
                    name: formData.name,
                    area: formData.area,
                    address: formData.address,
                    delivery_time: formData.delivery_time,
                    delivery_fee: parseFloat(formData.delivery_fee),
                    available: formData.available,
                    description: formData.description,
                    coverage_radius: parseInt(formData.coverage_radius) || 5,
                    min_order_amount: parseFloat(formData.min_order_amount) || 0
                };

                if (editingLocation) {
                    await apiService.updateLocation(editingLocation.id, locationData);
                    addNotification('Location updated successfully');
                } else {
                    await apiService.createLocation(locationData);
                    addNotification('Location created successfully');
                }

                fetchLocations();
                resetForm();
                setShowModal(false);
            } catch (error) {
                const errorMessage = error.message || 'Failed to save location';
                addNotification(errorMessage, 'error');
                console.error('Error saving location:', error);
            }
        };

        const handleEdit = (location) => {
            setEditingLocation(location);
            setFormData({
                name: location.name || '',
                area: location.area || '',
                address: location.address || '',
                delivery_time: location.delivery_time || '',
                delivery_fee: location.delivery_fee?.toString() || '',
                available: location.available !== false,
                description: location.description || '',
                coverage_radius: location.coverage_radius || 5,
                min_order_amount: location.min_order_amount || 0
            });
            setShowModal(true);
        };

        const handleDelete = async (id) => {
            if (window.confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
                try {
                    await apiService.deleteLocation(id);
                    addNotification('Location deleted successfully');
                    fetchLocations();
                } catch (error) {
                    const errorMessage = error.message || 'Failed to delete location';
                    addNotification(errorMessage, 'error');
                    console.error('Error deleting location:', error);
                }
            }
        };

        const handleToggleAvailability = async (id) => {
            try {
                await apiService.toggleLocationAvailability(id);
                addNotification('Location availability updated');
                fetchLocations();
            } catch (error) {
                const errorMessage = error.message || 'Failed to update location availability';
                addNotification(errorMessage, 'error');
                console.error('Error updating location availability:', error);
            }
        };

        const resetForm = () => {
            setFormData({
                name: '',
                area: '',
                address: '',
                delivery_time: '',
                delivery_fee: '',
                longitude: '',
                available: true,
                description: '',
                coverage_radius: 5,
                min_order_amount: 0
            });
            setEditingLocation(null);
        };

        const filteredLocations = locations.filter(location => {
            const matchesSearch = location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                location.address?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesAvailability = availabilityFilter === 'all' ||
                (availabilityFilter === 'available' && location.available) ||
                (availabilityFilter === 'unavailable' && !location.available);
            return matchesSearch && matchesAvailability;
        });

        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Location Management</h2>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center space-x-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Location</span>
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search locations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Filter className="w-5 h-5 text-gray-400" />
                            <select
                                value={availabilityFilter}
                                onChange={(e) => setAvailabilityFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                                <option value="all">All Locations</option>
                                <option value="available">Available</option>
                                <option value="unavailable">Unavailable</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Locations Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLocations.map(location => (
                        <div key={location.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-1">{location.name}</h3>
                                        <p className="text-sm text-gray-600">{location.area}</p>
                                    </div>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${location.available
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {location.available ? 'Available' : 'Unavailable'}
                                    </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <MapPin className="w-4 h-4 mr-2" />
                                        <span className="truncate">{location.address}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Delivery Time:</span>
                                        <span className="font-medium">{location.delivery_time}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Delivery Fee:</span>
                                        <span className="font-medium">PKR {location.delivery_fee}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Coverage:</span>
                                        <span className="font-medium">{location.coverage_radius || 5} KM</span>
                                    </div>
                                    {location.min_order_amount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Min Order:</span>
                                            <span className="font-medium">PKR {location.min_order_amount}</span>
                                        </div>
                                    )}
                                </div>

                                {location.description && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 line-clamp-2">{location.description}</p>
                                    </div>
                                )}

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <button
                                        onClick={() => handleToggleAvailability(location.id)}
                                        className={`flex items-center space-x-1 text-sm ${location.available ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
                                            }`}
                                    >
                                        {location.available ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                                        <span>{location.available ? 'Disable' : 'Enable'}</span>
                                    </button>

                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(location)}
                                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(location.id)}
                                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredLocations.length === 0 && (
                    <div className="text-center py-12">
                        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <div className="text-gray-500 text-lg">No locations found</div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-2 text-pink-600 hover:text-pink-800 underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        {editingLocation ? 'Edit Location' : 'Add New Location'}
                                    </h2>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="text-gray-500 hover:text-gray-700 text-2xl"
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Location Name *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="e.g., Downtown Area"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Area *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.area}
                                                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="e.g., City Center"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Time *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.delivery_time}
                                                onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="e.g., 15-25 min"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Fee (PKR) *
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                value={formData.delivery_fee}
                                                onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="e.g., 150.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Coverage Radius (KM)
                                            </label>
                                            <input
                                                type="number"
                                                value={formData.coverage_radius}
                                                onChange={(e) => setFormData({ ...formData, coverage_radius: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="e.g., 5"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Min Order Amount (PKR)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={formData.min_order_amount}
                                                onChange={(e) => setFormData({ ...formData, min_order_amount: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="e.g., 500.00"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address *
                                        </label>
                                        <textarea
                                            required
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            placeholder="Complete address of the location"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows="2"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            placeholder="Additional information about this location"
                                        />
                                    </div>

                                

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="available"
                                            checked={formData.available}
                                            onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                                            className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500"
                                        />
                                        <label htmlFor="available" className="ml-2 text-sm font-medium text-gray-700">
                                            Location is available for delivery
                                        </label>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowModal(false);
                                                resetForm();
                                            }}
                                            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                                        >
                                            {editingLocation ? 'Update' : 'Create'} Location
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    export default LocationManagement;