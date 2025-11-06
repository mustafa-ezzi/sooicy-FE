export const clearAppData = () => {
  const keysToKeep = ['SooIcy_admin_auth', 'SooIcy_admin_user', 'SooIcy_location'];
  const keysToRemove = ['SooIcy_cart', 'SooIcy_orders'];

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
  });
};

export const clearAllData = () => {
  const SooIcyKeys = Object.keys(localStorage).filter(key => key.startsWith('SooIcy_'));
  SooIcyKeys.forEach(key => localStorage.removeItem(key));
};

export const getStorageSize = () => {
  let total = 0;
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      total += localStorage[key].length + key.length;
    }
  }
  return total;
};