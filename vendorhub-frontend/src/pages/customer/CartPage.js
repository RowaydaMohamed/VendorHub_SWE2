import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';

export default function CartPage() {
  const { cart, loading, fetchCart, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    try { await updateItem(itemId, newQty); }
    catch { toast.error('Failed to update quantity'); }
  };

  const handleRemove = async (itemId, name) => {
    try {
      await removeItem(itemId);
      toast.info(`${name} removed from cart`);
    } catch { toast.error('Failed to remove item'); }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse space-y-4">
      {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-xl"/>)}
    </div>
  );

  const items = cart?.items || [];
  const total = cart?.totalAmount || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ShoppingCart size={24}/> My Cart
        {items.length > 0 && (
          <span className="text-sm font-normal text-gray-500">({items.length} item{items.length !== 1 ? 's' : ''})</span>
        )}
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border shadow-sm">
          <ShoppingCart size={56} className="mx-auto mb-4 text-gray-200"/>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Browse our products and add something you like!</p>
          <Link to="/shop"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl transition">
            Start Shopping <ArrowRight size={16}/>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Cart Items */}
          <div className="flex-1 space-y-3">
            {items.map(item => (
              <div key={item.id}
                className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.productImageUrl
                    ? <img src={item.productImageUrl} alt={item.productName} className="w-full h-full object-cover"/>
                    : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={28}/></div>
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{item.productName}</p>
                  <p className="text-sm text-gray-500 mt-0.5">${item.unitPrice} each</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-lg leading-none">−</button>
                  <span className="px-3 py-1.5 text-sm font-semibold border-x min-w-[2rem] text-center">{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    className="px-2.5 py-1.5 text-gray-600 hover:bg-gray-100 font-bold text-lg leading-none">+</button>
                </div>

                {/* Subtotal */}
                <p className="font-bold text-gray-900 w-20 text-right">
                  ${(item.unitPrice * item.quantity).toFixed(2)}
                </p>

                {/* Remove */}
                <button onClick={() => handleRemove(item.id, item.productName)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                  <Trash2 size={17}/>
                </button>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border shadow-sm p-5 sticky top-4">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>

              <div className="space-y-2 text-sm">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-gray-600">
                    <span className="truncate max-w-[140px]">{item.productName} ×{item.quantity}</span>
                    <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t mt-4 pt-4 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span>${Number(total).toFixed(2)}</span>
              </div>

              <button onClick={() => navigate('/checkout')}
                className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={16}/>
              </button>

              <Link to="/shop"
                className="block text-center text-sm text-indigo-600 hover:underline mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}