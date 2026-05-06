import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingBag, Clock, CheckCircle, XCircle } from 'lucide-react';
import { adminUserAPI, adminProductAPI, adminOrderAPI } from '../../api/services';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
  const [pendingVendors,  setPendingVendors]  = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [allOrders,       setAllOrders]       = useState([]);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      adminUserAPI.getPendingVendors(),
      adminProductAPI.getAllProducts({ status: 'PENDING', page: 0, size: 5 }),
      adminOrderAPI.getAllOrders(),
    ]).then(([vendors, products, orders]) => {
      setPendingVendors(vendors.data);
      setPendingProducts(products.data.content);
      setAllOrders(orders.data);
    }).catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  const handleApproveVendor = async (id, approve) => {
    try {
      if (approve) await adminUserAPI.approveVendor(id);
      else         await adminUserAPI.rejectVendor(id);
      setPendingVendors(prev => prev.filter(v => v.id !== id));
      toast.success(approve ? 'Vendor approved!' : 'Vendor rejected');
    } catch { toast.error('Action failed'); }
  };

  const handleApproveProduct = async (id, approve) => {
    try {
      if (approve) await adminProductAPI.approveProduct(id);
      else         await adminProductAPI.rejectProduct(id);
      setPendingProducts(prev => prev.filter(p => p.id !== id));
      toast.success(approve ? 'Product approved!' : 'Product rejected');
    } catch { toast.error('Action failed'); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const stats = [
    { label: 'Pending Vendors',  value: pendingVendors.length,  icon: Users,       color: 'bg-yellow-50 text-yellow-700', link: '/admin/vendors' },
    { label: 'Pending Products', value: pendingProducts.length, icon: Package,     color: 'bg-blue-50 text-blue-700',   link: '/admin/products' },
    { label: 'Total Orders',     value: allOrders.length,       icon: ShoppingBag, color: 'bg-green-50 text-green-700', link: '/admin/orders' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} to={link}
            className={`rounded-xl p-5 flex items-center gap-4 shadow-sm border hover:shadow-md transition ${color}`}>
            <Icon size={32} />
            <div>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm font-medium">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending Vendors */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Clock size={18} className="text-yellow-600"/> Pending Vendor Approvals
          </h2>
          <Link to="/admin/vendors" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        {pendingVendors.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending vendors.</p>
        ) : (
          <div className="space-y-3">
            {pendingVendors.slice(0,5).map(vendor => (
              <div key={vendor.id} className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div>
                  <p className="font-semibold text-gray-900">{vendor.businessName}</p>
                  <p className="text-sm text-gray-500">{vendor.firstName} {vendor.lastName} · {vendor.email}</p>
                  {vendor.businessDescription && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{vendor.businessDescription}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveVendor(vendor.id, true)}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition">
                    <CheckCircle size={14}/> Approve
                  </button>
                  <button onClick={() => handleApproveVendor(vendor.id, false)}
                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg transition">
                    <XCircle size={14}/> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending Products */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Package size={18} className="text-blue-600"/> Pending Product Approvals
          </h2>
          <Link to="/admin/products" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        {pendingProducts.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending products.</p>
        ) : (
          <div className="space-y-3">
            {pendingProducts.map(product => (
              <div key={product.id} className="bg-white border rounded-xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  {product.imageUrl && (
                    <img src={product.imageUrl} alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover"/>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">${product.price} · Stock: {product.stockQuantity}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApproveProduct(product.id, true)}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition">
                    <CheckCircle size={14}/> Approve
                  </button>
                  <button onClick={() => handleApproveProduct(product.id, false)}
                    className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg transition">
                    <XCircle size={14}/> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}