import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { vendorOrderAPI } from '../../api/services';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const STATUS_STYLE = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  CONFIRMED:  'bg-blue-100   text-blue-700',
  PROCESSING: 'bg-indigo-100 text-indigo-700',
  SHIPPED:    'bg-purple-100 text-purple-700',
  DELIVERED:  'bg-green-100  text-green-700',
  CANCELLED:  'bg-red-100    text-red-700',
};

export default function VendorOrdersPage() {
  const { user }   = useAuth();
  const [orders,   setOrders]   = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    vendorOrderAPI.getVendorOrders()
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  // For each order, filter items belonging to this vendor
  const vendorId = user?.id;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ShoppingBag size={24}/> Customer Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
          <ShoppingBag size={56} className="mx-auto mb-4 text-gray-200"/>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h2>
          <p className="text-gray-400">Orders containing your products will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            // Items belonging to this vendor in this order
            const myItems = order.items?.filter(i => i.vendorId === vendorId || !i.vendorId) || order.items || [];
            const mySubtotal = myItems.reduce((sum, i) => sum + (i.subtotal || 0), 0);

            return (
              <div key={order.id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-bold text-gray-800">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Customer: {order.customerEmail}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', {
                        year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'
                      }) : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[order.status]}`}>
                      {order.status}
                    </span>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${mySubtotal.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">your earnings</p>
                    </div>
                    <button onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border px-2.5 py-1 rounded-lg transition">
                      {expanded === order.id ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                      {expanded === order.id ? 'Hide' : 'Items'}
                    </button>
                  </div>
                </div>

                {/* Expanded Items */}
                {expanded === order.id && (
                  <div className="border-t px-4 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <p className="font-medium text-gray-700">Ship to</p>
                        <p className="text-gray-500">{order.shippingAddress}, {order.shippingCity}, {order.shippingCountry}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Payment</p>
                        <p className="text-gray-500">{order.paymentMethod?.replace(/_/g,' ')}</p>
                      </div>
                    </div>
                    <p className="font-medium text-gray-700 text-sm mb-2">Your Items in this Order</p>
                    <div className="space-y-2">
                      {myItems.map((item, idx) => (
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
                          <p className="text-sm font-bold text-indigo-700">${item.subtotal?.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}