import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { getSubtotal, getItemCount } from '../utils/cart';
import { formatPrice } from '../utils/product';

function Cart() {
  const { cartItems, loading, error, refreshCart } = useCart();

  function renderContent() {
    if (loading) {
      return <p>Loading your cart...</p>;
    }

    if (error) {
      return (
        <div className="empty-state">
          <h3>Unable to load your cart.</h3>
          <button onClick={refreshCart}>Try Again</button>
        </div>
      );
    }

    if (cartItems.length === 0) {
      return (
        <EmptyState
          icon="🛒"
          title="Your cart is empty"
          message="Looks like you haven't added anything yet."
          linkTo="/products"
          linkText="Browse Products"
        />
      );
    }

    const subtotal = getSubtotal(cartItems);
    const itemCount = getItemCount(cartItems);

    return (
      <>
        <div className="cart-items">
          {cartItems.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <p>Items: {itemCount}</p>
          <p className="order-summary-total">Subtotal: {formatPrice(subtotal)}</p>
          <Link className="button-link" to="/checkout">
            Proceed to Checkout
          </Link>
        </div>
      </>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="products-page">
        <h2>My Cart</h2>
        {renderContent()}
      </div>
    </div>
  );
}

export default Cart;
