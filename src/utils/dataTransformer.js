
export const transformProduct = (backendProduct) => ({
    id: backendProduct.id,
    name: backendProduct.name,
    description: backendProduct.description,
    price: backendProduct.price,
    image: backendProduct.image,
    category: backendProduct.category,
    rating: backendProduct.rating,
    preparationTime: backendProduct.preparation_time,
    ingredients: backendProduct.ingredients || [],
    isVegetarian: backendProduct.is_vegetarian,
    isVegan: backendProduct.is_vegan,
    isGlutenFree: backendProduct.is_gluten_free,
    calories: backendProduct.calories,
    isAvailable: backendProduct.is_available,
    discount: backendProduct.discount,
    discountedPrice: backendProduct.discounted_price,
    tags: backendProduct.tags || []
});

export const transformLocation = (backendLocation) => ({
    id: backendLocation.id,
    name: backendLocation.name,
    area: backendLocation.area,
    address: backendLocation.address,
    deliveryTime: backendLocation.delivery_time,
    deliveryFee: backendLocation.delivery_fee,
    available: backendLocation.available,
    description: backendLocation.description,
    coverageRadius: backendLocation.coverage_radius,
    minOrderAmount: backendLocation.min_order_amount
});

export const transformOrder = (backendOrder) => ({
    id: backendOrder.id,
    customerInfo: {
        name: backendOrder.customer_name,
        phone: backendOrder.customer_phone,
        email: backendOrder.customer_email
    },
    deliveryAddress: backendOrder.delivery_address,
    paymentMethod: backendOrder.payment_method,
    deliveryType: backendOrder.delivery_type,
    pickupLocation: backendOrder.pickup_location,
    selectedLocation: backendOrder.selected_location,
    riderId: backendOrder.rider,
    status: backendOrder.status,
    total: backendOrder.total,
    estimatedTime: backendOrder.estimated_time,
    timestamp: new Date(backendOrder.created_at),
    items: backendOrder.items?.map(item => ({
        id: item.product.id,
        name: item.product.name,
        price: item.unit_price,
        quantity: item.quantity,
        image: item.product.image
    })) || []
});