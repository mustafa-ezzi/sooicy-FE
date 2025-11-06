import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter } from 'lucide-react';
import apiService from '../../services/apiService';

const AddonManagement = ({ addNotification }) => {
    const [addons, setAddons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAddon, setEditingAddon] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [availabilityFilter, setAvailabilityFilter] = useState('all');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        is_available: true
    });

    useEffect(() => {
        fetchAddons();
    }, []);

    const fetchAddons = async () => {
        try {
            setLoading(true);
            const data = await apiService.getAllAddons();
            setAddons(data);
        } catch (error) {
            addNotification('Failed to fetch addons', 'error');
            console.error('Error fetching addons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const addonData = {
                ...formData,
                price: parseFloat(formData.price),
                is_available: Boolean(formData.is_available)
            };

            if (editingAddon) {
                await apiService.updateAddon(editingAddon.id, addonData);
                addNotification('Addon updated successfully', 'success');
            } else {
                await apiService.createAddon(addonData);
                addNotification('Addon created successfully', 'success');
            }

            await fetchAddons(); // Refresh the list
            resetForm();
            setShowModal(false);
        } catch (error) {
            console.error('Error saving addon:', error);
            addNotification(
                error.response?.data?.message || 'Failed to save addon',
                'error'
            );
        }
    };

    const handleEdit = (addon) => {
        setEditingAddon(addon);
        setFormData({
            name: addon.name,
            description: addon.description || '',
            price: addon.price.toString(),
            is_available: addon.is_available
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this addon?')) {
            try {
                await apiService.deleteAddon(id);
                addNotification('Addon deleted successfully', 'success');
                await fetchAddons(); // Refresh the list
            } catch (error) {
                console.error('Error deleting addon:', error);
                addNotification(
                    error.response?.data?.message || 'Failed to delete addon',
                    'error'
                );
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            is_available: true
        });
        setEditingAddon(null);
    };

    const filteredAddons = addons.filter(addon => {
        const matchesSearch = addon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (addon.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAvailability = availabilityFilter === 'all' ||
            (availabilityFilter === 'available' ? addon.is_available : !addon.is_available);
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
                <h2 className="text-2xl font-bold text-gray-800">Addon Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add Addon</span>
                </button>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search addons..."
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
                            <option value="all">All Status</option>
                            <option value="available">Available</option>
                            <option value="unavailable">Unavailable</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Addons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAddons.map(addon => (
                    <div key={addon.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">{addon.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{addon.description}</p>
                                </div>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${addon.is_available
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                    }`}>
                                    {addon.is_available ? 'Available' : 'Unavailable'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                                <div className="text-lg font-bold text-pink-600">
                                    PKR {addon.price}
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(addon)}
                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(addon.id)}
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

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editingAddon ? 'Edit Addon' : 'Add New Addon'}
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

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Price (PKR) *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_available"
                                        checked={formData.is_available}
                                        onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                        className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                                    />
                                    <label htmlFor="is_available" className="ml-2 text-sm text-gray-700">
                                        Available for selection
                                    </label>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
                                    >
                                        {editingAddon ? 'Update' : 'Create'} Addon
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

export default AddonManagement;