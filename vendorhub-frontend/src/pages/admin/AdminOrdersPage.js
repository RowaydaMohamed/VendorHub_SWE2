import React, { useState, useEffect } from 'react';
import { adminOrderAPI } from '../../api/services';
import { toast } from 'react-toastify';

const STATUSES = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'];
const STATUS_COLOR = {
  PENDING:'bg-yellow-100 text-yellow-700', CONFIRMED:'bg-blue-100 text-blue-700',
  PROCESSING:'bg-indigo-100 text-indigo-700', SHIPPED:'bg-purple-100 text-purple-700',
  DELIVERED:'bg-green-100 text-green-700', CANCELLED:'bg-red-100 text-red-700',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminOrderAPI.getAllOrders()
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await adminOrderAPI.updateOrderStatus(id, status);
      setOrders(prev => prev.map(o => o.id === id ? res.data : o));
      toast.success('Order status updated');
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Management</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              {['Order #','Customer','Total','Payment','Status','Date','Action'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map(o => (
              <tr key={o.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-mono text-xs font-medium">{o.orderNumber}</td>
                <td className="px-4 py-3 text-gray-600">{o.customerEmail}</td>
                <td className="px-4 py-3 font-semibold">${o.totalAmount?.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-500">{o.paymentMethod?.replace(/_/g,' ')}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[o.status]}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">
                  {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <select value={o.status}
                    onChange={e => handleStatusChange(o.id, e.target.value)}
                    className="border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center text-gray-400 py-8">No orders yet.</p>}
      </div>
    </div>
  );
}