import * as React from 'react';
import { createContext, useState, useEffect, useContext } from 'react';
import { saveActiveCart, loadActiveCart, saveBudget, getBudget, clearActiveCart as clearStorageCart } from './storage';
import { calculateItemTotal, Offer } from '../utils/pricing';

export interface CartItem {
  id: string;
  barcode: string | null;
  name: string;
  mrp: number;
  sellingPrice: number;
  quantity: number;
  savings: number;
  offer: Offer;
  finalTotal: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  budget: number;
  setBudget: (val: number) => void;
  totalBachat: number;
  currentTotal: number;
}

const CartContext = createContext<CartContextType>({} as any);

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [budget, setBudgetState] = useState(1000);

  useEffect(() => {
    loadActiveCart().then(items => {
      if(items) setCartItems(items);
    });
    getBudget().then(val => {
      if(val !== null) setBudgetState(val);
    });
  }, []);

  const setBudget = async (val: number) => {
    setBudgetState(val);
    await saveBudget(val);
  };

  const addToCart = async (newItem: CartItem) => {
    const existingIndex = cartItems.findIndex((i: CartItem) => i.barcode === newItem.barcode && i.barcode);
    let updated;
    if(existingIndex >= 0) {
      updated = [...cartItems];
      updated[existingIndex].quantity += newItem.quantity;
      const calc = calculateItemTotal(updated[existingIndex].mrp, updated[existingIndex].sellingPrice, updated[existingIndex].quantity, updated[existingIndex].offer);
      updated[existingIndex].finalTotal = calc.finalTotal;
      updated[existingIndex].savings = calc.totalSavings;
    } else {
      updated = [...cartItems, newItem];
    }
    setCartItems(updated);
    await saveActiveCart(updated);
  };

  const updateQuantity = async (id: string, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        const calc = calculateItemTotal(item.mrp, item.sellingPrice, newQty, item.offer);
        return { ...item, quantity: newQty, finalTotal: calc.finalTotal, savings: calc.totalSavings };
      }
      return item;
    });
    setCartItems(updated);
    await saveActiveCart(updated);
  };

  const clearCart = async () => {
    setCartItems([]);
    await clearStorageCart();
  };

  const currentTotal = cartItems.reduce((acc: number, item: CartItem) => acc + item.finalTotal, 0);
  const totalBachat = cartItems.reduce((acc: number, item: CartItem) => acc + item.savings, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, updateQuantity, clearCart, budget, setBudget, currentTotal, totalBachat }}>
      {children}
    </CartContext.Provider>
  );
};
