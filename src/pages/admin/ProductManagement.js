import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Upload } from 'lucide-react';
import apiService from '../../services/apiService';

const ProductManagement = ({ addNotification }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [imageUploading, setImageUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [addons, setAddons] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    ingredients: [],
    preparation_time: '',
    rating: 5.0,
    discount: 0,
    tags: [],
    addon_ids: [],
    is_popular: false, // 👈 new field

  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    try {
      const data = await apiService.getAllAddons();
      setAddons(data);
    } catch (error) {
      addNotification('Failed to fetch addons', 'error');
      console.error('Error fetching addons:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllProducts();
      setProducts(data);
    } catch (error) {
      addNotification('Failed to fetch products', 'error');
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories();

      // ✅ Use value/label directly since your backend already sends them
      setCategories(
        response.map(category => ({
          value: category.value,
          label: category.label
        }))
      );
    } catch (error) {
      addNotification('Failed to fetch categories', 'error');
      console.error('Error fetching categories:', error);
    }
  };



  const handleImageUpload = async (file) => {
    try {
      setImageUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const result = await apiService.uploadProductImage(file);

      // Check if the response contains the image URL in the expected format
      const imageUrl = result.image_url || result.imageUrl || result.url;

      if (!imageUrl) {
        throw new Error('No image URL in response');
      }

      setFormData(prev => ({ ...prev, image: imageUrl }));
      addNotification('Image uploaded successfully');
    } catch (error) {
      addNotification('Failed to upload image. Please try again.', 'error');
      console.error('Error uploading image:', error);
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount: parseFloat(formData.discount) || 0,
        ingredients: formData.ingredients.filter(ing => ing.trim() !== ''),
        tags: formData.tags.filter(tag => tag.trim() !== ''),
      };

      if (editingProduct) {
        await apiService.updateProduct(editingProduct.id, productData);
        addNotification('Product updated successfully');
      } else {
        await apiService.createProduct(productData);
        addNotification('Product created successfully');
      }

      fetchProducts();
      resetForm();
      setShowModal(false);
    } catch (error) {
      addNotification('Failed to save product', 'error');
      console.error('Error saving product:', error);
    }
  };


  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      category: product.category || '',
      image: product.image || '',
      ingredients: product.ingredients || [],
      preparation_time: product.preparation_time || '',
      rating: product.rating || 5.0,
      discount: product.discount ?? 0,
      tags: product.tags || [],
      addon_ids: product.addons ? product.addons.map(a => a.id) : [],
      is_popular: !!product.is_popular, // 👈 ensure boolean

    });

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiService.deleteProduct(id);
        addNotification('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        addNotification('Failed to delete product', 'error');
        console.error('Error deleting product:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      image: '',
      ingredients: [],
      preparation_time: '',
      rating: 5.0,
      discount: 0,
      tags: [],
      addon_ids: [],
      is_popular: false, // 👈 reset value

    });

    setEditingProduct(null);
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleTagChange = (index, value) => {
    const newTags = [...formData.tags];
    newTags[index] = value;
    setFormData({ ...formData, tags: newTags });
  };

  const addTag = () => {
    setFormData({ ...formData, tags: [...formData.tags, ''] });
  };

  const removeTag = (index) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
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
        <h2 className="text-2xl font-bold text-gray-800">Product Management</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
            <div className="relative">
              <img
                src={product.image || 'https://via.placeholder.com/300x200/FFB6C1/FFFFFF?text=No+Image'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              {product.discount > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  -{product.discount}%
                </div>
              )}
              <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 shadow-lg">
                <span className={`text-xs font-semibold ${product.isAvailable ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {product.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800 truncate">{product.name}</h3>
                <div className="text-right">
                  <div className="text-lg font-bold text-pink-600">
                    PKR {product.discount > 0 ?
                      (product.price * (1 - product.discount / 100)).toFixed(2) :
                      product.price
                    }
                  </div>
                  {product.discount > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      PKR {product.price}
                    </div>
                  )}
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{product.category}</span>
                </div>
                {product.preparation_time && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Prep Time:</span>
                    <span className="font-medium">{product.preparation_time}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rating:</span>
                  <span className="font-medium">⭐ {product.rating}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xs text-gray-500">
                  ID: #{product.id}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
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

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No products found</div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Name *
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
                        Description *
                      </label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price (PKR) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category *
                        </label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        >
                          <option value="">Select Category</option>
                          {categories.length === 0 ? (
                            <option disabled>No categories found</option>
                          ) : (
                            categories.map((category, index) => (
                              <option key={`${category.value}-${index}`} value={category.value}>
                                {category.label}
                              </option>
                            ))
                          )}
                        </select>

                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Preparation Time
                        </label>
                        <input
                          type="text"
                          value={formData.preparation_time}
                          onChange={(e) => setFormData({ ...formData, preparation_time: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                          placeholder="e.g., 15-20 min"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={formData.discount}
                          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product Image
                      </label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                        {formData.image ? (
                          <div className="space-y-2">
                            <img
                              src={formData.image}
                              alt="Product preview"
                              className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, image: '' })}
                              className="text-red-600 text-sm hover:text-red-800"
                            >
                              Remove Image
                            </button>
                          </div>
                        ) : (
                          <div className="text-center">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) handleImageUpload(file);
                              }}
                              className="hidden"
                              id="image-upload"
                            />
                            <label
                              htmlFor="image-upload"
                              className={`cursor-pointer text-pink-600 hover:text-pink-800 ${imageUploading ? 'opacity-50' : ''}`}
                            >
                              {imageUploading ? 'Uploading...' : 'Upload Image'}
                            </label>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Ingredients
                        </label>
                        <button
                          type="button"
                          onClick={addIngredient}
                          className="text-pink-600 hover:text-pink-800 text-sm"
                        >
                          + Add Ingredient
                        </button>
                      </div>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {formData.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={ingredient}
                              onChange={(e) => handleIngredientChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                              placeholder="Enter ingredient"
                            />
                            <button
                              type="button"
                              onClick={() => removeIngredient(index)}
                              className="px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Tags
                        </label>
                        <button
                          type="button"
                          onClick={addTag}
                          className="text-pink-600 hover:text-pink-800 text-sm"
                        >
                          + Add Tag
                        </button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {formData.tags.map((tag, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={tag}
                              onChange={(e) => handleTagChange(index, e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                              placeholder="Enter tag"
                            />
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              className="px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Addons */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Addons
                        </label>
                      </div>
                      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
                        {addons.length === 0 && (
                          <p className="text-sm text-gray-500">No addons available</p>
                        )}
                        {addons.map((addon) => (
                          <label key={addon.id} className="flex items-center space-x-2 py-1 px-2 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              checked={formData.addon_ids.includes(addon.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({
                                    ...formData,
                                    addon_ids: [...formData.addon_ids, addon.id],
                                  });
                                } else {
                                  setFormData({
                                    ...formData,
                                    addon_ids: formData.addon_ids.filter((id) => id !== addon.id),
                                  });
                                }
                              }}
                            />
                            <span className="text-sm text-gray-700">
                              {addon.name} — Rs {addon.price}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Popular Toggle */}
<div>
  <label className="flex items-center justify-between cursor-pointer">
    <span className="text-sm font-medium text-gray-700">Mark as Popular</span>
    <div className="relative">
      <input
        type="checkbox"
        checked={formData.is_popular}
        onChange={(e) =>
          setFormData({ ...formData, is_popular: e.target.checked })
        }
        className="sr-only"
      />
      <div
        className={`w-10 h-5 rounded-full transition-colors ${
          formData.is_popular ? 'bg-pink-500' : 'bg-gray-300'
        }`}
      ></div>
      <div
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
          formData.is_popular ? 'translate-x-5' : ''
        }`}
      ></div>
    </div>
  </label>
</div>


                <div className="flex justify-end space-x-3 pt-6 border-t">
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
                    {editingProduct ? 'Update' : 'Create'} Product
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

export default ProductManagement;