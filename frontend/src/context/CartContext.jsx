import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (book, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.liber_id === book.liber_id);
      if (existing) {
        const newQty = Math.min(existing.qty + qty, Number(book.sasia_stok));
        return prev.map(i => i.liber_id === book.liber_id ? { ...i, qty: newQty } : i);
      }
      return [...prev, { ...book, qty: Math.min(qty, Number(book.sasia_stok)) }];
    });
  };

  const removeFromCart = (liber_id) => {
    setItems(prev => prev.filter(i => i.liber_id !== liber_id));
  };

  const updateQty = (liber_id, qty) => {
    if (qty < 1) { removeFromCart(liber_id); return; }
    setItems(prev => prev.map(i => i.liber_id === liber_id ? { ...i, qty } : i));
  };

  const clearCart = () => setItems([]);

  const total = useMemo(() => items.reduce((s, i) => s + Number(i.cmimi) * i.qty, 0), [items]);
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQty, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
