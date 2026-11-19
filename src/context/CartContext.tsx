import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, ProductVariant } from '../types/store.ts';
import { calculateCartTotals } from '../utils/pricing.ts';
import { useStore } from './StoreContext.tsx';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  freeThreshold: number;
  isFreeShipping: boolean;
  amountNeededForFreeShipping: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dar_al_maghribia_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode; shippingFee?: number; freeThreshold?: number }> = ({
  children,
  shippingFee: propShippingFee,
  freeThreshold: propFreeThreshold,
}) => {
  const { settings } = useStore();
  const activeShippingFee = propShippingFee ?? settings.shipping_fee ?? 40;
  const activeFreeThreshold = propFreeThreshold ?? settings.free_shipping_threshold ?? 500;
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to persist cart', e);
    }
  }, [cart]);

  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(item => item.variant.id === variant.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantity;
        // Cap to available stock
        updated[existingIndex].quantity = Math.min(newQty, variant.stock_quantity);
        return updated;
      } else {
        const actualQty = Math.min(quantity, variant.stock_quantity);
        return [...prev, { product, variant, quantity: actualQty }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.variant.id !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    setCart(prev =>
      prev.map(item => {
        if (item.variant.id === variantId) {
          const validQty = Math.min(quantity, item.variant.stock_quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const { subtotal, shippingCost, total, isFreeShipping, amountNeededForFreeShipping } =
    calculateCartTotals(cart, activeShippingFee, activeFreeThreshold);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shippingCost,
        total,
        freeThreshold: activeFreeThreshold,
        isFreeShipping,
        amountNeededForFreeShipping,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
