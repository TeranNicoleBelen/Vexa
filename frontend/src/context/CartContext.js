import React, { createContext, useContext, useState, useEffect } from 'react';
import { carritoService } from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.rol_nombre === 'cliente') {
      loadCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const res = await carritoService.get();
      setItems(res.data.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const addItem = async (producto_id, cantidad = 1) => {
    await carritoService.add(producto_id, cantidad);
    await loadCart();
  };

  const updateItem = async (id, cantidad) => {
    await carritoService.update(id, cantidad);
    await loadCart();
  };

  const removeItem = async (id) => {
    await carritoService.remove(id);
    await loadCart();
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + parseFloat(item.precio) * item.cantidad, 0);
  const count = items.reduce((sum, item) => sum + item.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, loading, total, count, addItem, updateItem, removeItem, clearCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
