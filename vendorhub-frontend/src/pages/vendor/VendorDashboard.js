import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, AlertTriangle, TrendingUp } from 'lucide-react';
import { vendorProductAPI, vendorOrderAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [products,     setProducts]     = useState([]);
  const [lowStock,     setLowStock]     = useState([]);
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      vendorProductAPI.getMyProducts(),
      vendorProductAPI.getLowStock(),
      vendorOrderAPI.getVendorOrders(),
    ]).then(([p, ls, o]) => {
      setProducts(p.data);
      setLowStock(ls.data);
      setOrders(o.data);
    }).catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const approvedCount  = products.filter(p => p.approvalStatus === 'APPROVED').length;
  const pendingCount   = products.filter(p => p.approvalStatus === 'PENDING').length;
  const revenueTotal   = orders
    .flatMap(o => o.items?.filter(i => i.vendorId === user?.id) ?? [])
    .reduce((sum, i) => sum + (i.subtotal || 0), 0);

  const stats = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-indigo-600 bg-indigo-50', link: '/vendor/products' },
    { label: 'Approved',       value: approvedCount,   icon: TrendingUp, color: 'text-green-600 bg-green-50',  link: '/vendor/products' },
    { label: 'Pending Review', value: pendingCount,    icon: Package,   color: 'text-yellow-600 bg-yellow-50', link: '/vendor/products' },
    { label: 'Total Orders',   value: orders.length,   icon: ShoppingBag, color: 'text-blue-600 bg-blue-50',  link: '/vendor/orders' },
  ];

  const STATUS_COLOR = {
    PENDING:'bg-yellow-100 text-yellow-700', CONFIRMED:'bg-blue-100 text-blue-700',
    PROCESSING:'bg-indigo-100 text-indigo-700', SHIPPED:'bg-purple-100 text-purple-700',
    DELIVERED:'bg-green-100 text-green-700', CANCELLED:'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, {user?.firstName}! · {user?.businessName}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, link }) => (
          <Link key={label} to={link}
            className={`rounded-xl p-4 border shadow-sm hover:shadow-md transition flex items-center gap-3 bg-white`}>
            <div className={`p-2 rounded-lg ${color}`}><Icon size={20}/></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Low Stock Alert */}
      {lowStock.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <h2 className="font-semibold text-amber-800 flex items-center gap-2 mb-3">
            <AlertTriangle size={18}/> Low Stock Alert ({lowStock.length} products)
          </h2>
          <div className="space-y-2">
            {lowStock.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-lg px-4 py-2 border border-amber-100">
                <span className="text-sm font-medium text-gray-800">{p.name}</span>
                <span className="text-sm font-bold text-amber-600">{p.stockQuantity} left</span>
              </div>
            ))}
          </div>
          <Link to="/vendor/products" className="mt-3 inline-block text-sm text-indigo-600 hover:underline">
            Update stock →
          </Link>
        </section>
      )}

      {/* Recent Orders */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
          <Link to="/vendor/orders" className="text-sm text-indigo-600 hover:underline">View all</Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-400 text-sm">No orders yet. Once customers purchase your products, they'll appear here.</p>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  {['Order #','Items','Total','Status','Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.slice(0,8).map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600">{o.items?.length} item(s)</td>
                    <td className="px-4 py-3 font-semibold">${o.totalAmount?.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}