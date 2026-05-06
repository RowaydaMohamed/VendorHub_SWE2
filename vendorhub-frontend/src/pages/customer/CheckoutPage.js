import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, Building2, CheckCircle } from 'lucide-react';
import { orderAPI } from '../../api/services';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

const PAYMENT_METHODS = [
  { value: 'CREDIT_CARD',    label: 'Credit Card',      icon: CreditCard },
  { value: 'DEBIT_CARD',     label: 'Debit Card',       icon: CreditCard },
  { value: 'CASH_ON_DELIVERY', label: 'Cash on Delivery', icon: Banknote  },
  { value: 'BANK_TRANSFER',  label: 'Bank Transfer',    icon: Building2  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    shippingAddress:    '',
    shippingCity:       '',
    shippingCountry:    '',
    shippingPostalCode: '',
    paymentMethod:      'CREDIT_CARD',
  });

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart?.items?.length) { toast.error('Your cart is empty'); return; }
    setPlacing(true);
    try {
      const res = await orderAPI.placeOrder(form);
      setSuccess(res.data);
      toast.success('Order placed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  // Success screen
  if (success) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="bg-white rounded-2xl border shadow-sm p-10">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4"/>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-1">Your order number is:</p>
        <p className="text-xl font-mono font-bold text-indigo-700 mb-4">{success.orderNumber}</p>
        <p className="text-sm text-gray-400 mb-8">
          Total: <strong>${success.totalAmount?.toFixed(2)}</strong> · Payment: {success.paymentMethod?.replace(/_/g,' ')}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/orders')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition text-sm">
            View My Orders
          </button>
          <button onClick={() => navigate('/shop')}
            className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-6 py-2.5 rounded-xl transition text-sm">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );

  const items  = cart?.items  || [];
  const total  = cart?.totalAmount || 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-6">
          {/* Shipping */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Shipping Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input type="text" name="shippingAddress" required value={form.shippingAddress}
                  onChange={handleChange} placeholder="123 Main Street"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input type="text" name="shippingCity" required value={form.shippingCity}
                    onChange={handleChange} placeholder="Cairo"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code *</label>
                  <input type="text" name="shippingPostalCode" required value={form.shippingPostalCode}
                    onChange={handleChange} placeholder="12345"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <input type="text" name="shippingCountry" required value={form.shippingCountry}
                  onChange={handleChange} placeholder="Egypt"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-4">Payment Method</h2>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                <button key={value} type="button"
                  onClick={() => setForm(f => ({ ...f, paymentMethod: value }))}
                  className={`flex items-center gap-3 p-3 border-2 rounded-xl transition text-left ${
                    form.paymentMethod === value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}>
                  <Icon size={20}/>
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={placing || items.length === 0}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3.5 rounded-xl transition text-base">
            {placing ? 'Placing Order...' : `Place Order · $${Number(total).toFixed(2)}`}
          </button>
        </form>

        {/* Order Summary */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border shadow-sm p-5 sticky top-4">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                    {item.productImageUrl
                      ? <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">📦</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">×{item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>${Number(total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}