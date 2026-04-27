import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Favorites from './pages/Favorites';

import VendorDashboard from './pages/vendor/VendorDashboard';
import MyProducts from './pages/vendor/MyProducts';
import AddProduct from './pages/vendor/AddProduct';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageProducts from './pages/admin/ManageProducts';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />

          <Route path="/cart" element={<ProtectedRoute role="CUSTOMER"><Cart /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute role="CUSTOMER"><Orders /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute role="CUSTOMER"><Favorites /></ProtectedRoute>} />

          <Route path="/vendor/dashboard" element={<ProtectedRoute role="VENDOR"><VendorDashboard /></ProtectedRoute>} />
          <Route path="/vendor/products" element={<ProtectedRoute role="VENDOR"><MyProducts /></ProtectedRoute>} />
          <Route path="/vendor/add-product" element={<ProtectedRoute role="VENDOR"><AddProduct /></ProtectedRoute>} />

          <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute role="ADMIN"><ManageUsers /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute role="ADMIN"><ManageProducts /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}