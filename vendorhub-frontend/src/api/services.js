import api from './axiosConfig';

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  // Returns AuthResponse {token, user} — customer is immediately logged in
  registerCustomer: (data) => api.post('/auth/register/customer', data),
  // Returns MessageResponse — vendor must verify email then wait for admin
  registerVendor:   (data) => api.post('/auth/register/vendor', data),

  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  login:       (data)  => api.post('/auth/login', data),
  getMe:       ()      => api.get('/auth/me'),
  updateMe:    (data)  => api.put('/auth/me', data),

  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword:  (data) => api.post('/auth/reset-password', data),
};

// ── Admin – User Management ───────────────────────────────────────
export const adminUserAPI = {
  getAllVendors:     () => api.get('/admin/users/vendors'),
  getPendingVendors: () => api.get('/admin/users/vendors/pending'),
  approveVendor:    (id) => api.patch(`/admin/users/vendors/${id}/approve`),
  rejectVendor:     (id) => api.patch(`/admin/users/vendors/${id}/reject`),
  getAllCustomers:   () => api.get('/admin/users/customers'),
  suspendUser:      (id) => api.patch(`/admin/users/${id}/suspend`),
  removeUser:       (id) => api.delete(`/admin/users/${id}`),
};

// ── Admin – Product Management ────────────────────────────────────
export const adminProductAPI = {
  getAllProducts:  (params) => api.get('/admin/products', { params }),
  approveProduct: (id) => api.patch(`/admin/products/${id}/approve`),
  rejectProduct:  (id) => api.patch(`/admin/products/${id}/reject`),
  deleteProduct:  (id) => api.delete(`/admin/products/${id}`),
  createCategory: (data) => api.post('/admin/products/categories', data),
};

// ── Admin – Orders ────────────────────────────────────────────────
export const adminOrderAPI = {
  getAllOrders:      () => api.get('/admin/orders'),
  updateOrderStatus: (id, status) => api.patch(`/admin/orders/${id}/status?status=${status}`),
};

// ── Products (Public) ─────────────────────────────────────────────
export const productAPI = {
  getProducts:    (params) => api.get('/products/public', { params }),
  searchProducts: (params) => api.get('/products/public/search', { params }),
  getByCategory:  (id, params) => api.get(`/products/public/category/${id}`, { params }),
  getByPriceRange:(params) => api.get('/products/public/price-range', { params }),
  getProduct:     (id) => api.get(`/products/public/${id}`),
  getReviews:     (id) => api.get(`/products/public/${id}/reviews`),
  addReview:      (id, data) => api.post(`/products/${id}/reviews`, data),
  getCategories:  () => api.get('/categories'),
};

// ── Vendor – Products ─────────────────────────────────────────────
export const vendorProductAPI = {
  getMyProducts: () => api.get('/vendor/products'),
  getLowStock:   () => api.get('/vendor/products/low-stock'),
  createProduct: (data) => api.post('/vendor/products', data),
  updateProduct: (id, data) => api.put(`/vendor/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/vendor/products/${id}`),
  uploadImage:   (id, formData) =>
    api.post(`/vendor/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// ── Vendor – Orders ───────────────────────────────────────────────
export const vendorOrderAPI = {
  getVendorOrders: () => api.get('/vendor/orders'),
};

// ── Cart ──────────────────────────────────────────────────────────
export const cartAPI = {
  getCart:   () => api.get('/cart'),
  addItem:   (data) => api.post('/cart/items', data),
  updateItem:(itemId, data) => api.put(`/cart/items/${itemId}`, data),
  removeItem:(itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// ── Orders ────────────────────────────────────────────────────────
export const orderAPI = {
  placeOrder:  (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders'),
  getOrder:    (id) => api.get(`/orders/${id}`),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
};

// ── Favorites ─────────────────────────────────────────────────────
export const favoritesAPI = {
  getFavorites:   () => api.get('/favorites'),
  addFavorite:    (data) => api.post('/favorites', data),
  removeFavorite: (productId) => api.delete(`/favorites/${productId}`),
};

// ── Notifications ─────────────────────────────────────────────────
export const notificationAPI = {
  getAll:      () => api.get('/notifications'),
  getUnread:   () => api.get('/notifications/unread'),
  getCount:    () => api.get('/notifications/unread/count'),
  markOneRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};