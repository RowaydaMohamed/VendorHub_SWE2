import React, { createContext, useContext, useState, useCallback } from 'react';
import { cartAPI } from '../api/services';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isCustomer } = useAuth();
  const [cart, setCart]       = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isCustomer) return;
    setLoading(true);
    try {
      const res = await cartAPI.getCart();
      setCart(res.data);
    } catch (e) {
      console.error('Failed to fetch cart:', e);
    } finally {
      setLoading(false);
    }
  }, [isCustomer]);

  const addToCart = useCallback(async (product, quantity = 1) => {
    const res = await cartAPI.addItem({
      productId: product.id,
      quantity,
      productName: product.name,
      productImageUrl: product.imageUrl,
      unitPrice: product.price,
      vendorId: product.vendorId,
      vendorEmail: product.vendorEmail,
    });
    setCart(res.data);
    return res.data;
  }, []);

  const updateItem = useCallback(async (itemId, quantity) => {
    const res = await cartAPI.updateItem(itemId, { quantity });
    setCart(res.data);
  }, []);

  const removeItem = useCallback(async (itemId) => {
    const res = await cartAPI.removeItem(itemId);
    setCart(res.data);
  }, []);

  const clearCart = useCallback(async () => {
    const res = await cartAPI.clearCart();
    setCart(res.data);
  }, []);

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <CartContext.Provider value={{
      cart, loading, itemCount,
      fetchCart, addToCart, updateItem, removeItem, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);