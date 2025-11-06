class SyncService {
  static syncLocalOrdersWithBackend = async (localOrders, apiService) => {
    try {
      const backendOrders = await apiService.getAllOrders();
      const backendOrderIds = backendOrders.map(order => order.id);

      // Find local orders that aren't in backend
      const unsyncedOrders = localOrders.filter(order =>
        !backendOrderIds.includes(order.id) && typeof order.id === 'number'
      );

      // Attempt to sync unsynced orders
      for (const order of unsyncedOrders) {
        try {
          await apiService.createOrder({
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            customer_email: order.customer_email,
            delivery_address: order.delivery_address,
            payment_method: order.payment_method,
            delivery_type: order.delivery_type,
            pickup_location: order.pickup_location,
            selected_location: order.selected_location,
            subtotal: parseFloat(order.total) - order.delivery_fee,
            delivery_fee: order.delivery_fee,
            tax: 0,
            total: order.total,
            estimated_time: order.estimated_time,
            items_data: order.items.map(item => ({
              product_id: item.id,
              quantity: item.quantity,
              unit_price: item.price
            }))
          });
        } catch (syncError) {
          console.error('Failed to sync order:', order.id, syncError);
        }
      }
    } catch (error) {
      console.error('Error syncing orders:', error);
    }
  };

  static clearExpiredData = () => {
    const expiredKeys = ['SooIcy_notifications', 'SooIcy_temp_data'];
    expiredKeys.forEach(key => localStorage.removeItem(key));
  };
}

export default SyncService;