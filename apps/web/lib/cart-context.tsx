'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface CartContextValue {
  /** Current total number of items in the cart */
  cartCount: number;
  /** Call this after successfully adding items to update the badge */
  incrementCart: (byAmount?: number) => void;
  /** Set cart count to a specific value (e.g. from API response) */
  setCartCount: (count: number) => void;
  /** Trigger a visual "bounce" on the navbar cart icon */
  cartBounce: number;
}

const CartContext = createContext<CartContextValue>({
  cartCount: 0,
  incrementCart: () => {},
  setCartCount: () => {},
  cartBounce: 0,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartCount, setCartCountState] = useState(0);
  const [cartBounce, setCartBounce] = useState(0);

  const setCartCount = useCallback((count: number) => {
    setCartCountState(count);
  }, []);

  const incrementCart = useCallback((byAmount = 1) => {
    setCartCountState((prev) => prev + byAmount);
    // Trigger bounce animation by incrementing a counter
    setCartBounce((prev) => prev + 1);
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, incrementCart, setCartCount, cartBounce }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
