import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  getCart,
  addToCart as addToCartRequest,
  updateCartQuantity as updateCartQuantityRequest,
  removeFromCart as removeFromCartRequest
} from '../services/cartService';

// One shared cart lives here. The Navbar, Products page and Cart page all
// read from this same context instead of fetching their own copies, so
// they can never disagree about what's in the cart.
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Per-product "this one row is busy" flag, so adding/removing one item
  // doesn't disable every other row on the page.
  const [itemsLoading, setItemsLoading] = useState({});

  const setItemLoading = (productId, value) => {
    setItemsLoading((current) => ({ ...current, [productId]: value }));
  };

  const refreshCart = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const cart = await getCart();
      setCartItems(cart);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        // Not logged in yet - an empty cart is the correct state, not an error
        setCartItems([]);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load the cart once when the app starts (e.g. after login)
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addItem(productId) {
    setItemLoading(productId, true);
    try {
      const cart = await addToCartRequest(productId);
      setCartItems(cart);
    } finally {
      setItemLoading(productId, false);
    }
  }

  async function updateQuantity(productId, quantity) {
    setItemLoading(productId, true);
    try {
      const cart = await updateCartQuantityRequest(productId, quantity);
      setCartItems(cart);
    } finally {
      setItemLoading(productId, false);
    }
  }

  async function removeItem(productId) {
    setItemLoading(productId, true);
    try {
      const cart = await removeFromCartRequest(productId);
      setCartItems(cart);
    } finally {
      setItemLoading(productId, false);
    }
  }

  // The backend empties the cart when a payment is verified; this brings the
  // shared frontend copy in line straight away, so the Navbar shows Cart (0).
  function clearCart() {
    setCartItems([]);
  }

  const value = {
    cartItems,
    loading,
    error,
    itemsLoading,
    refreshCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return context;
}
