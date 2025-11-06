
export const addNotification = (notifications, setNotifications, message, type = 'success') => {
  const notification = {
    id: Date.now(),
    message,
    type,
    timestamp: new Date()
  };
  setNotifications(prev => [...prev, notification]);
};


export const getTotalPrice = (cart) => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
};


export const getCartItemCount = (cart) => {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
};


export const filterProducts = (products, searchTerm, selectedCategory) => {
  return products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
};