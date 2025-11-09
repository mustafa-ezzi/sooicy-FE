// src/config/api.js
import axios from 'axios';


export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'https://sooicy-be-production-7c15.up.railway.app/api';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://sooicy-be-production-7c15.up.railway.app/api',
  adapter: 'xhr',
  headers: { 'Content-Type': 'application/json' },
});
export const API_ENDPOINTS = {
  PRODUCTS: {
    GET_ALL: '/products/',
    GET_BY_ID: (id) => `/products/${id}/`,
    CREATE: '/products/create/',
    UPDATE: (id) => `/products/${id}/update/`,
    DELETE: (id) => `/products/${id}/delete/`,
    UPLOAD_IMAGE: '/products/upload-image/',
  },
  LOCATIONS: {
    GET_ALL: '/locations/',
    GET_BY_ID: (id) => `/locations/${id}/`,
    CREATE: '/locations/create/',
    UPDATE: (id) => `/locations/${id}/update/`,
    DELETE: (id) => `/locations/${id}/delete/`,
    TOGGLE_AVAILABILITY: (id) => `/locations/${id}/toggle-availability/`,
  },
  RIDERS: {
    GET_ALL: '/riders/',
    GET_BY_ID: (id) => `/riders/${id}/`,
    CREATE: '/riders/create/',
    UPDATE: (id) => `/riders/${id}/update/`,
    DELETE: (id) => `/riders/${id}/delete/`,
    UPDATE_STATUS: (id) => `/riders/${id}/status/`,
  },
  ORDERS: {
    GET_ALL: '/orders/',
    GET_BY_ID: (id) => `/orders/${id}/`,
    CREATE: '/orders/create/',
    UPDATE_STATUS: (id) => `/orders/${id}/status/`,
    ASSIGN_RIDER: (id) => `/orders/${id}/assign-rider/`,
  },
  USERS: {
    CREATE_OR_GET: '/user/create-or-get/',
    GET_ORDERS: (userId) => `/user/${userId}/orders/`,
  },
  DASHBOARD: {
    STATS: '/dashboard/stats/',
    ANALYTICS: '/dashboard/analytics/',
    RECENT_ORDERS: '/orders/recent/',
  },
  CATEGORIES: '/categories/',
  STATUS_CHOICES: '/status-choices/',
  AUTH: {
    LOGIN: '/admin/login/',
    LOGOUT: '/admin/logout/',
    VERIFY: '/admin/verify/',
  },
  ADDONS: {
    GET_ALL: '/addons/',
    GET_BY_ID: (id) => `/addons/${id}/`,
    CREATE: '/addons/create/',
    UPDATE: (id) => `/addons/${id}/update/`,
    DELETE: (id) => `/addons/${id}/delete/`,
  },
};



export default API_BASE_URL;