import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { orderAPI } from '../../api/services';
import { toast } from 'react-toastify';

const STATUS_STYLE = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  CONFIRMED:  'bg-blue-100   text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED:    'bg-purple-100 text-purple-700',
  DELIVERED:  'bg-green-100  text-green-700',
  CANCELLED:  'bg-red-100    text-red-700',
};

const PAYMENT_STYLE = {
  PENDING:  'bg-yellow-50 text-yellow-600',
  PAID:     'bg-green-50  text-green-600',
  FAILED:   'bg-red-50    text-red-600',
  REFUNDED: 'bg-gray-50   text-gray-600',
};

export default function OrdersPage() {
  const [orders,   setOrders]   = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    orderAPI.getMyOrders()
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      const res = await orderAPI.cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
      toast.success('Order cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel this order');
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse"/>)}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ShoppingBag size={24}/> My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
          <ShoppingBag size={56} className="mx-auto mb-4 text-gray-200"/>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h2>
          <p className="text-gray-400">Your order history will appear here after your first purchase.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-bold text-gray-800">{order.orderNumber}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                      year:'numeric', month:'short', day:'numeric'
                    }) : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[order.status]}`}>
                    {order.status}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${PAYMENT_STYLE[order.paymentStatus]}`}>
                    {order.paymentStatus}
                  </span>
                  <span className="font-bold text-gray-900">${order.totalAmount?.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-2">
                  {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                    <button onClick={() => handleCancel(order.id)}
                      className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-2.5 py-1 rounded-lg transition">
                      <XCircle size={13}/> Cancel
                    </button>
                  )}
                  <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border px-2.5 py-1 rounded-lg transition">
                    {expanded === order.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                    {expanded === order.id ? 'Hide' : 'Details'}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              {expanded === order.id && (
                <div className="border-t px-4 py-4 bg-gray-50">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Shipping Address</p>
                      <p className="text-gray-500">{order.shippingAddress}</p>
                      <p className="text-gray-500">{order.shippingCity}, {order.shippingCountry}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Payment Method</p>
                      <p className="text-gray-500">{order.paymentMethod?.replace(/_/g,' ')}</p>
                    </div>
                  </div>

                  <p className="font-medium text-gray-700 mb-2 text-sm">Items ({order.items?.length})</p>
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white rounded-xl border p-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {item.productImageUrl
                            ? <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover"/>
                            : <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>
                          }
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                          <p className="text-xs text-gray-500">${item.unitPrice} × {item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">${item.subtotal?.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-end">
                    <p className="text-sm font-bold text-gray-900">
                      Total: ${order.totalAmount?.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}