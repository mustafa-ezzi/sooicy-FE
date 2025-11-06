import { apiClient, API_ENDPOINTS } from '../config/api';

class ApiService {
    async get(url, params) {
        const { data } = await apiClient.get(url, { params });
        return data;
    }

    async post(url, body) {
        const { data } = await apiClient.post(url, body);
        return data;
    }

    async patch(url, body) {
        const { data } = await apiClient.patch(url, body);
        return data;
    }

    async delete(url) {
        const { data } = await apiClient.delete(url);
        return data;
    }

    // Products
    getAllProducts(params) {
        return this.get(API_ENDPOINTS.PRODUCTS.GET_ALL, params);
    }
    getProductById(id) {
        return this.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id));
    }
    createProduct(data) {
        return this.post(API_ENDPOINTS.PRODUCTS.CREATE, data);
    }
    updateProduct(id, data) {
        return this.patch(API_ENDPOINTS.PRODUCTS.UPDATE(id), data);
    }
    deleteProduct(id) {
        return this.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
    }
    async uploadProductImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await apiClient.post(API_ENDPOINTS.PRODUCTS.UPLOAD_IMAGE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return data;
        } catch (error) {
            throw new Error('Failed to upload image');
        }
    }

    // Locations
    getAllLocations(params) {
        return this.get(API_ENDPOINTS.LOCATIONS.GET_ALL, params);
    }
    getLocationById(id) {
        return this.get(API_ENDPOINTS.LOCATIONS.GET_BY_ID(id));
    }
    createLocation(data) {
        return this.post(API_ENDPOINTS.LOCATIONS.CREATE, data);
    }
    updateLocation(id, data) {
        return this.patch(API_ENDPOINTS.LOCATIONS.UPDATE(id), data);
    }
    deleteLocation(id) {
        return this.delete(API_ENDPOINTS.LOCATIONS.DELETE(id));
    }
    toggleLocationAvailability(id) {
        return this.patch(API_ENDPOINTS.LOCATIONS.TOGGLE_AVAILABILITY(id));
    }

    // Orders
    getAllOrders(params) {
        return this.get(API_ENDPOINTS.ORDERS.GET_ALL, params);
    }
    createOrder(data) {
        return this.post(API_ENDPOINTS.ORDERS.CREATE, data);
    }
    updateOrderStatus(id, status, updatedBy = 'Customer') {
        return this.patch(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), {
            status,
            updated_by: updatedBy,
        });
    }
    assignRider(orderId, riderId, updatedBy = 'Admin') {
        return this.patch(API_ENDPOINTS.ORDERS.ASSIGN_RIDER(orderId), {
            rider_id: riderId,
            updated_by: updatedBy,
        });
    }

    // Riders
    getAllRiders(params) {
        return this.get(API_ENDPOINTS.RIDERS.GET_ALL, params);
    }
    createRider(data) {
        return this.post(API_ENDPOINTS.RIDERS.CREATE, data);
    }
    updateRider(id, data) {
        return this.patch(API_ENDPOINTS.RIDERS.UPDATE(id), data);
    }
    deleteRider(id) {
        return this.delete(API_ENDPOINTS.RIDERS.DELETE(id));
    }
    updateRiderStatus(id, status) {
        return this.patch(API_ENDPOINTS.RIDERS.UPDATE_STATUS(id), { status });
    }

    // Dashboard
    getDashboardStats() {
        return this.get(API_ENDPOINTS.DASHBOARD.STATS);
    }
    getCategories() {
        return this.get(API_ENDPOINTS.CATEGORIES);
    }
    getSalesAnalytics(days = 30) {
    return this.get(`${API_ENDPOINTS.DASHBOARD.ANALYTICS}?days=${days}`);
}


    // NEW: User Management Methods
    createOrGetUser(userData) {
        return this.post('/user/create-or-get/', userData);
    }

    getUserOrders(userId) {
        return this.get(`/user/${userId}/orders/`);
    }

    // Update getAllOrders to accept user filter
    getUserOrdersFiltered(userId, params) {
        return this.get(`/user/${userId}/orders/`, params);
    }

    // Addon Methods
    getAllAddons(params) {
        return this.get(API_ENDPOINTS.ADDONS.GET_ALL, params);
    }

    getAddonById(id) {
        return this.get(API_ENDPOINTS.ADDONS.GET_BY_ID(id));
    }

    createAddon(data) {
        return this.post(API_ENDPOINTS.ADDONS.CREATE, data);
    }

    updateAddon(id, data) {
        return this.patch(API_ENDPOINTS.ADDONS.UPDATE(id), data);
    }

    deleteAddon(id) {
        return this.delete(API_ENDPOINTS.ADDONS.DELETE(id));
    }
}

export default new ApiService();