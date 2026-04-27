import { useState, useEffect } from 'react';
import { orderApi } from '../api/axios';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.get('/api/orders/my').then(res => setOrders(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    try {
      await orderApi.put(`/api/orders/${id}/cancel`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'CANCELLED' } : o));
    } catch (err) {
      alert(err.response?.data?.error || 'Cannot cancel');
    }
  };

  const statusColor = { PENDING: 'warning', CONFIRMED: 'info', SHIPPED: 'primary', DELIVERED: 'success', CANCELLED: 'danger' };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container py-4">
      <h4 className="mb-4">My Orders</h4>
      {orders.length === 0 ? (
        <p className="text-muted">No orders yet.</p>
      ) : (
        orders.map(order => (
          <div key={order.id} className="card mb-4 shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <span>Order #{order.id}</span>
              <span className={`badge bg-${statusColor[order.status] || 'secondary'}`}>{order.status}</span>
            </div>
            <div className="card-body">
              {order.items?.map(item => (
                <div key={item.id} className="d-flex justify-content-between py-1 border-bottom">
                  <span>{item.productName} × {item.quantity}</span>
                  <span>${item.subtotal?.toFixed(2)}</span>
                </div>
              ))}
              <div className="d-flex justify-content-between mt-2 fw-bold">
                <span>Total</span>
                <span>${order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
            {order.status === 'PENDING' && (
              <div className="card-footer">
                <button className="btn btn-sm btn-outline-danger" onClick={() => cancel(order.id)}>Cancel Order</button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}