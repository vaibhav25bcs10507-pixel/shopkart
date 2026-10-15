import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getWishlistCount, onWishlistChanged } from '../services/wishlistService';
import { useCart } from '../context/CartContext';
import { getItemCount } from '../utils/cart';

function Navbar() {
  const navigate = useNavigate();
  const [wishlistCount, setWishlistCount] = useState(0);
  // Cart count comes from the one shared cart context - the Navbar never
  // fetches its own copy, so it can't drift from what the Cart page shows.
  const { cartItems } = useCart();
  const cartCount = getItemCount(cartItems);

  // Ask the backend for the count on mount and whenever the wishlist changes
  useEffect(() => {
    let ignore = false;

    async function loadCount() {
      try {
        const count = await getWishlistCount();
        if (!ignore) setWishlistCount(count);
      } catch (err) {
        // Not logged in or a network error: just leave the badge as it is
      }
    }

    loadCount();
    const unsubscribe = onWishlistChanged(loadCount);

    return () => {
      ignore = true;
      unsubscribe();
    };
  }, []);

  async function handleLogout() {
    try {
      await api.post('/customers/logout');
    } catch (err) {
      // proceed to login regardless
    }
    navigate('/login');
  }

  return (
    <div className="navbar">
      <span>ShopKart</span>
      <div className="navbar-links">
        <Link to="/home">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/wishlist">
          Wishlist ({wishlistCount})
        </Link>
        <Link to="/cart">
          Cart ({cartCount})
        </Link>
        <Link to="/orders">Orders</Link>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Navbar;
