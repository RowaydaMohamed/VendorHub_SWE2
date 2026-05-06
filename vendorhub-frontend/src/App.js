import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth pages
import LoginPage             from './pages/auth/LoginPage';
import CustomerRegisterPage  from './pages/auth/CustomerRegisterPage';
import VendorRegisterPage    from './pages/auth/VendorRegisterPage';
import VerifyEmailPage       from './pages/shared/VerifyEmailPage';

// Admin pages
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminVendorsPage from './pages/admin/AdminVendorsPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage  from './pages/admin/AdminOrdersPage';

// Vendor pages
import VendorDashboard    from './pages/vendor/VendorDashboard';
import VendorProductsPage from './pages/vendor/VendorProductsPage';
import VendorOrdersPage   from './pages/vendor/VendorOrdersPage';

// Customer pages
import ShopPage         from './pages/customer/ShopPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage         from './pages/customer/CartPage';
import CheckoutPage     from './pages/customer/CheckoutPage';
import OrdersPage       from './pages/customer/OrdersPage';
import FavoritesPage    from './pages/customer/FavoritesPage';

// Shared pages
import NotificationsPage from './pages/shared/NotificationsPage';
import ProfilePage       from './pages/shared/ProfilePage';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'ROLE_ADMIN')    return <Navigate to="/admin"  replace />;
  if (user.role === 'ROLE_VENDOR')   return <Navigate to="/vendor" replace />;
  return <Navigate to="/shop" replace />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Public auth routes */}
          <Route path="/login"             element={<LoginPage />} />
          <Route path="/register/customer" element={<CustomerRegisterPage />} />
          <Route path="/register/vendor"   element={<VendorRegisterPage />} />
          <Route path="/verify-email"      element={<VerifyEmailPage />} />

          {/* Admin routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN']} />}>
            <Route path="/admin"           element={<AdminDashboard />} />
            <Route path="/admin/vendors"   element={<AdminVendorsPage />} />
            <Route path="/admin/products"  element={<AdminProductsPage />} />
            <Route path="/admin/orders"    element={<AdminOrdersPage />} />
          </Route>

          {/* Vendor routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_VENDOR']} />}>
            <Route path="/vendor"          element={<VendorDashboard />} />
            <Route path="/vendor/products" element={<VendorProductsPage />} />
            <Route path="/vendor/orders"   element={<VendorOrdersPage />} />
          </Route>

          {/* Customer routes */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_CUSTOMER']} />}>
            <Route path="/shop"            element={<ShopPage />} />
            <Route path="/shop/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart"            element={<CartPage />} />
            <Route path="/checkout"        element={<CheckoutPage />} />
            <Route path="/orders"          element={<OrdersPage />} />
            <Route path="/favorites"       element={<FavoritesPage />} />
          </Route>

          {/* Shared authenticated routes (all roles) */}
          <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN','ROLE_VENDOR','ROLE_CUSTOMER']} />}>
            <Route path="/notifications"   element={<NotificationsPage />} />
            <Route path="/profile"         element={<ProfilePage />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}