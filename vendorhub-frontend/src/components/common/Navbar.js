import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Bell, LogOut, User, Package, LayoutDashboard, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { notificationAPI } from '../../api/services';

export default function Navbar() {
  const { user, logout, isAdmin, isVendor, isCustomer } = useAuth();
  const { itemCount } = useCart() || {};
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      try {
        const res = await notificationAPI.getCount();
        setUnreadCount(res.data.count);
      } catch { /* silent */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl tracking-wide">
            <Store size={24} />
            VendorHub
          </Link>

          {/* Role-based nav links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            {isAdmin && (
              <>
                <Link to="/admin" className="hover:text-indigo-200 flex items-center gap-1">
                  <LayoutDashboard size={16}/> Dashboard
                </Link>
                <Link to="/admin/vendors" className="hover:text-indigo-200">Vendors</Link>
                <Link to="/admin/products" className="hover:text-indigo-200">Products</Link>
                <Link to="/admin/orders" className="hover:text-indigo-200">Orders</Link>
              </>
            )}
            {isVendor && (
              <>
                <Link to="/vendor" className="hover:text-indigo-200 flex items-center gap-1">
                  <LayoutDashboard size={16}/> Dashboard
                </Link>
                <Link to="/vendor/products" className="hover:text-indigo-200 flex items-center gap-1">
                  <Package size={16}/> Products
                </Link>
                <Link to="/vendor/orders" className="hover:text-indigo-200">Orders</Link>
              </>
            )}
            {isCustomer && (
              <>
                <Link to="/shop" className="hover:text-indigo-200">Shop</Link>
                <Link to="/orders" className="hover:text-indigo-200">My Orders</Link>
                <Link to="/favorites" className="hover:text-indigo-200">Favorites</Link>
              </>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {/* Cart – customers only */}
            {isCustomer && (
              <Link to="/cart" className="relative hover:text-indigo-200">
                <ShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Notification bell */}
            <Link to="/notifications" className="relative hover:text-indigo-200">
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 hover:text-indigo-200"
              >
                <User size={22} />
                <span className="hidden md:block text-sm">{user.firstName}</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl z-50 py-1">
                  <div className="px-4 py-2 border-b">
                    <p className="font-semibold text-sm">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-indigo-600 mt-1">{user.role.replace('ROLE_', '')}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}