import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api/axios';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  const updateQty = (productId, qty) => {
    const updated = cart.map(i => i.productId === productId ? { ...i, quantity: qty } : i)
      .filter(i => i.quantity > 0);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const remove = (productId) => {
    const updated = cart.filter(i => i.productId !== productId);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  };

  const total = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

  const placeOrder = async () => {
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    try {
      await orderApi.post('/api/orders', { items: cart });
      localStorage.removeItem('cart');
      setCart([]);
      alert('Order placed successfully!');
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.error || 'Order failed');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) return (
    <div className="container py-5 text-center">
      <h5 className="text-muted">Your cart is empty</h5>
      <button className="btn btn-primary mt-3" onClick={() => navigate('/')}>Browse Products</button>
    </div>
  );

  return (
    <div className="container py-4">
      <h4 className="mb-4">Shopping Cart</h4>
      <div className="row">
        <div className="col-md-8">
          {cart.map(item => (
            <div key={item.productId} className="card mb-3 p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-0">{item.productName}</h6>
                  <small className="text-muted">${item.unitPrice.toFixed(2)} each</small>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQty(item.productId, item.quantity - 1)}>-</button>
                  <span className="fw-bold">{item.quantity}</span>
                  <button className="btn btn-sm btn-outline-secondary" onClick={() => updateQty(item.productId, item.quantity + 1)}>+</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(item.productId)}>Remove</button>
                </div>
              </div>
              <div className="text-end mt-1">
                <strong>${(item.unitPrice * item.quantity).toFixed(2)}</strong>
              </div>
            </div>
          ))}
        </div>
        <div className="col-md-4">
          <div className="card p-3">
            <h5>Order Summary</h5>
            <hr />
            <div className="d-flex justify-content-between">
              <span>Total</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
            <button className="btn btn-success w-100 mt-3" onClick={placeOrder} disabled={loading}>
              {loading ? 'Placing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}