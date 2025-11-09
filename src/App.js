import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useLocalStorage } from './hooks/useLocalStorage';
import Footer from './components/footer';
import Header from './components/Header';

import LocationPopup from './components/LocationPopup';
import NotificationSystem from './components/NotificationSystem';
import WhatsAppButton from './components/Whatsapp';
import SplashScreen from './components/SplashScreen';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ScrollToTop from './components/ScrollToTop';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import apiService from './services/apiService';
import { addNotification, getTotalPrice, getCartItemCount } from './utils/helpers';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [splashComplete, setSplashComplete] = useState(false);

  const [cart, setCart] = useLocalStorage('SooIcy_cart', []);
  const [orders, setOrders] = useLocalStorage('SooIcy_orders', []);
  const [selectedLocation, setSelectedLocation] = useLocalStorage('SooIcy_location', null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useLocalStorage('SooIcy_admin_auth', false);
  const [adminUser, setAdminUser] = useLocalStorage('SooIcy_admin_user', null);
  const [currentUser, setCurrentUser] = useLocalStorage('SooIcy_user', null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showBanner, setShowBanner] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(!selectedLocation);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastOrder, setLastOrder] = useState(null);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setSplashComplete(true);
  };

  useEffect(() => {
    if (splashComplete) {
      loadInitialData();
    }
  }, [splashComplete]);

  useEffect(() => {
    setShowLocationPopup(!selectedLocation);
  }, [selectedLocation]);

  useEffect(() => {
    if (selectedLocation && !showLocationPopup) {
      const timer = setTimeout(() => setShowPopup(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [selectedLocation, showLocationPopup]);

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications(prev => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notifications]);

  useEffect(() => {
    if (selectedLocation) {
      loadOrdersFromBackend();
    }
  }, [selectedLocation, orders, currentUser]);

  useEffect(() => {
    if (lastOrder) {
      const timer = setTimeout(() => {
        setLastOrder(null);
      }, 10 * 60 * 1000);
      return () => clearTimeout(timer);
    }
  }, [lastOrder]);

  const loadOrdersFromBackend = async () => {
    try {
      let backendOrders;
      if (currentUser) {
        backendOrders = await apiService.getUserOrders(currentUser.id);
      } else {
        backendOrders = await apiService.getAllOrders();
      }

      const ordersArray = Array.isArray(backendOrders) ? backendOrders : backendOrders.results || [];
      const localOrderIds = orders.map(order => order.id);
      const newBackendOrders = ordersArray.filter(order => !localOrderIds.includes(order.id));

      if (newBackendOrders.length > 0) {
        setOrders(prev => [...prev, ...newBackendOrders]);
      }
    } catch (error) {
      console.error('Error loading orders from backend:', error);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, locationsData] = await Promise.all([
        apiService.getAllProducts(),
        apiService.getCategories(),
        apiService.getAllLocations()
      ]);

      setProducts(productsData);
      const categoryLabels = ['All', ...categoriesData.map(cat => cat.label)];
      setCategories(categoryLabels);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading initial data:', error);
      addNotification(notifications, setNotifications, 'Failed to load app data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (adminData) => {
    setIsAdminAuthenticated(true);
    setAdminUser(adminData);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setAdminUser(null);
    localStorage.removeItem('SooIcy_admin_auth');
    localStorage.removeItem('SooIcy_admin_user');
  };

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setShowLocationPopup(false);
    addNotification(notifications, setNotifications,
      `Location set to ${location.name}. Delivery time: ${location.delivery_time}`
    );
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => {
        if (item.id !== product.id) return false;
        const itemAddons = item.selectedAddons || [];
        const productAddons = product.selectedAddons || [];
        if (itemAddons.length !== productAddons.length) return false;
        const itemAddonIds = itemAddons.map(a => a.id).sort();
        const productAddonIds = productAddons.map(a => a.id).sort();
        return JSON.stringify(itemAddonIds) === JSON.stringify(productAddonIds);
      });

      if (existingIndex >= 0) {
        return prev.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        );
      }

      return [...prev, {
        ...product,
        quantity: product.quantity || 1,
        cartItemId: Date.now(),
        selectedAddons: product.selectedAddons || []
      }];
    });

    const addonText = product.selectedAddons && product.selectedAddons.length > 0
      ? ` with ${product.selectedAddons.length} addon(s)`
      : '';

    addNotification(notifications, setNotifications, `${product.name}${addonText} added to cart`);
  };

  const removeFromCart = (productId) => {
    const item = cart.find(item => item.id === productId);
    setCart(prev => prev.filter(item => item.id !== productId));
    if (item) {
      addNotification(notifications, setNotifications, `${item.name} removed from cart`, 'info');
    }
  };

  const updateQuantity = (productId, change) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => {
    setCart([]);
  };

  const clearLastOrder = () => {
    setLastOrder(null);
  };

  const handleUserCreation = async (customerInfo) => {
    try {
      const userData = {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address || ''
      };

      const response = await apiService.createOrGetUser(userData);

      if (response.user) {
        setCurrentUser(response.user);
        setWelcomeMessage(response.message);
        setShowWelcomeMessage(true);
        setTimeout(() => {
          setShowWelcomeMessage(false);
        }, 5000);
        return response;
      }
    } catch (error) {
      console.error('Error creating/getting user:', error);
      return null;
    }
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    setOrders([]);
    setLastOrder(null);
    addNotification(notifications, setNotifications, 'Logged out successfully');
  };

  const placeOrder = async (orderDetails) => {
    try {
      console.log('Cart items:', cart);

      if (!cart || cart.length === 0) {
        throw new Error('Cart is empty');
      }

      const subtotalValue = cart.reduce((sum, item) => {
        const basePrice = parseFloat(item.price || 0);
        const addonTotal = (item.selectedAddons || []).reduce(
          (addonSum, addon) => addonSum + parseFloat(addon.price || 0),
          0
        );
        return sum + (basePrice + addonTotal) * (item.quantity || 1);
      }, 0);

      const deliveryFeeValue = parseFloat(selectedLocation?.delivery_fee || 150);
      const taxValue = subtotalValue * 0.08;
      const totalValue = subtotalValue + deliveryFeeValue + taxValue;

      const userResponse = await handleUserCreation(orderDetails.customerInfo);

      const localOrder = {
        id: Date.now(),
        items: [...cart],
        total: totalValue.toFixed(2),
        status: 'pending',
        timestamp: new Date(),
        customer_name: orderDetails.customerInfo.name,
        customer_phone: orderDetails.customerInfo.phone,
        customer_email: orderDetails.customerInfo.email,
        delivery_address: orderDetails.deliveryAddress,
        payment_method: orderDetails.paymentMethod,
        delivery_type: orderDetails.deliveryType || 'delivery',
        pickup_location: orderDetails.pickupLocation,
        selected_location: selectedLocation?.id,
        delivery_fee: deliveryFeeValue,
        estimated_time: selectedLocation?.delivery_time || '25-30 min',
        sooicy_user: userResponse?.user?.id || currentUser?.id || null
      };

      setLastOrder({
        id: localOrder.id,
        status: localOrder.status,
        customerInfo: orderDetails.customerInfo,
        deliveryAddress: orderDetails.deliveryAddress,
        paymentMethod: orderDetails.paymentMethod,
        deliveryType: orderDetails.deliveryType || 'delivery',
        items: [...cart],
        subtotal: subtotalValue,
        deliveryFee: deliveryFeeValue,
        tax: taxValue,
        total: totalValue,
        estimatedTime: selectedLocation?.delivery_time || '25-30 min',
        createdAt: new Date().toISOString(),
        userWelcomeMessage: userResponse?.is_new_user ?
          'Welcome to the SooIcy family! 🎉' :
          `Welcome back, ${orderDetails.customerInfo.name}! 👋`
      });

      setOrders(prev => [localOrder, ...prev]);
      clearCart();

      const successMessage = userResponse?.is_new_user ?
        `Welcome to SooIcy family! Order #${localOrder.id} placed successfully!` :
        `Order #${localOrder.id} placed successfully!`;

      addNotification(notifications, setNotifications, successMessage);

      const itemsData = cart.map(item => {
        const basePrice = parseFloat(item.price || 0);
        const selectedAddons = (item.selectedAddons || []).map(addon => ({
          id: parseInt(addon.id),
          name: addon.name,
          price: parseFloat(addon.price || 0)
        }));

        return {
          product_id: parseInt(item.id),
          quantity: parseInt(item.quantity || 1),
          unit_price: basePrice,
          special_instructions: item.notes || '',
          selectedAddons: selectedAddons
        };
      });

      console.log('Items data being sent:', itemsData);

      try {
        const orderData = {
          customer_name: orderDetails.customerInfo.name,
          customer_phone: orderDetails.customerInfo.phone,
          customer_email: orderDetails.customerInfo.email,
          delivery_address: orderDetails.deliveryAddress,
          payment_method: orderDetails.paymentMethod,
          delivery_type: orderDetails.deliveryType || 'delivery',
          pickup_location: orderDetails.pickupLocation,
          selected_location: selectedLocation?.id,
          subtotal: subtotalValue.toFixed(2),
          delivery_fee: deliveryFeeValue.toFixed(2),
          tax: taxValue.toFixed(2),
          total: totalValue.toFixed(2),
          estimated_time: selectedLocation?.delivery_time || '25-30 min',
          special_instructions: orderDetails.specialInstructions || '',
          sooicy_user: userResponse?.user?.id || currentUser?.id || null,
          items_data: itemsData
        };

        console.log('Complete order data being sent:', JSON.stringify(orderData, null, 2));

        const backendOrder = await apiService.createOrder(orderData);
        console.log('Backend order created:', backendOrder);

        setOrders(prev => prev.map(order =>
          order.id === localOrder.id ? { ...backendOrder, timestamp: new Date(backendOrder.created_at) } : order
        ));

        setLastOrder(prev => prev ? { ...prev, id: backendOrder.id } : null);

      } catch (backendError) {
        console.error('Backend error details:', {
          message: backendError.message,
          response: backendError.response?.data,
          status: backendError.response?.status
        });
        addNotification(notifications, setNotifications, 'Order saved locally. Will sync when connection is restored.', 'info');
      }

    } catch (error) {
      console.error('Error placing order:', error);
      addNotification(notifications, setNotifications, 'Failed to place order. Please try again.', 'error');
      throw error;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      addNotification(notifications, setNotifications, `Order #${orderId} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      addNotification(notifications, setNotifications, 'Failed to update order status', 'error');
    }
  };

  const assignRider = async (orderId, riderId) => {
    try {
      await apiService.assignRider(orderId, riderId);
      loadOrdersFromBackend();
      addNotification(notifications, setNotifications, `Rider assigned to order #${orderId}`);
    } catch (error) {
      console.error('Error assigning rider:', error);
      addNotification(notifications, setNotifications, 'Failed to assign rider', 'error');
    }
  };

  const getDeliveryFee = () => {
    return selectedLocation?.delivery_fee || 150;
  };

  const handleClaimOffer = () => {
    addNotification(notifications, setNotifications, 'Welcome offer activated! Use code WELCOME20');
  };

  const CustomerApp = ({ children }) => (
    <div className="min-h-screen bg-white">
      <LocationPopup
        showLocationPopup={showLocationPopup}
        deliveryAreas={locations.filter(loc => loc.available)}
        onLocationSelect={handleLocationSelect}
        selectedLocation={selectedLocation}
      />

      {selectedLocation && !loading && (
        <>
          <Header
            cartItemCount={getCartItemCount(cart)}
            notificationCount={notifications.length}
            selectedLocation={selectedLocation}
            setShowLocationPopup={setShowLocationPopup}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            currentUser={currentUser}
            onUserLogout={handleUserLogout}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />

          {showWelcomeMessage && (
            <div className="fixed top-20 right-4 z-50 animate-fade-in">
              <div className="bg-gradient-to-r from-pink-500 to-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🎉</div>
                  <div>
                    <p className="font-semibold">{welcomeMessage}</p>
                    <p className="text-sm opacity-90">You're now a SooIcy member!</p>
                  </div>
                  <button
                    onClick={() => setShowWelcomeMessage(false)}
                    className="text-white hover:text-gray-200"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          )}

          <NotificationSystem notifications={notifications} />
          {children}
          <Footer />
          <WhatsAppButton
            phoneNumber="+923325159474"
            message="Hi! I'm interested in SooIcy products."
          />
        </>
      )}
    </div>
  );

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading SooIcy...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={
          <CustomerApp>
            <HomePage
              products={products}
              categories={categories}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              addToCart={addToCart}
              setSelectedProduct={setSelectedProduct}
              selectedLocation={selectedLocation}
            />
          </CustomerApp>
        } />

        <Route path="/about" element={
          <CustomerApp>
            <AboutPage />
          </CustomerApp>
        } />

        <Route path="/product/:id" element={
          <CustomerApp>
            <ProductDetailPage
              product={selectedProduct}
              addToCart={addToCart}
            />
          </CustomerApp>
        } />

        <Route path="/cart" element={
          <CustomerApp>
            <CartPage
              cart={cart}
              updateQuantity={updateQuantity}
              updateCart={setCart}
              removeFromCart={removeFromCart}
              getTotalPrice={() => getTotalPrice(cart)}
              getDeliveryFee={getDeliveryFee}
              selectedLocation={selectedLocation}
              lastOrder={lastOrder}
              clearLastOrder={clearLastOrder}
            />
          </CustomerApp>
        } />

        <Route path="/checkout" element={
          <CustomerApp>
            <CheckoutPage
              cart={cart}
              getTotalPrice={() => getTotalPrice(cart)}
              getDeliveryFee={getDeliveryFee}
              selectedLocation={selectedLocation}
              placeOrder={placeOrder}
              api={apiService}
            />
          </CustomerApp>
        } />

        <Route path="/orders" element={
          <CustomerApp>
            <OrdersPage
              orders={orders}
              currentUser={currentUser}
            />
          </CustomerApp>
        } />

        <Route path="/admin/login" element={
          <AdminLogin
            onLogin={handleAdminLogin}
            addNotification={(message, type) => addNotification(notifications, setNotifications, message, type)}
          />
        } />

        <Route path="/admin/*" element={
          isAdminAuthenticated ? (
            <AdminDashboard
              adminUser={adminUser}
              onLogout={handleAdminLogout}
              addNotification={(message, type) => addNotification(notifications, setNotifications, message, type)}
            />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        } />

        <Route
          path="/admin"
          element={
            <Navigate
              to={isAdminAuthenticated ? "/admin/dashboard" : "/admin/login"}
              replace
            />
          }
        />
      </Routes>

      <NotificationSystem notifications={notifications} />
    </Router>
  );
}

export default App;