import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { getErrorMessage } from '../utils/errors';
import { formatPrice } from '../utils/product';

function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;

  const quantityAction = useAsyncAction((err) =>
    getErrorMessage(err, 'Unable to update quantity. Please try again.')
  );
  const removeAction = useAsyncAction((err) =>
    getErrorMessage(err, 'Unable to remove item. Please try again.')
  );

  const busy = quantityAction.saving || removeAction.saving;

  function handleIncrease() {
    quantityAction.run(() => updateQuantity(product._id, quantity + 1));
  }

  function handleDecrease() {
    if (quantity <= 1) return; // Use Remove to take it below 1
    quantityAction.run(() => updateQuantity(product._id, quantity - 1));
  }

  function handleRemove() {
    removeAction.run(() => removeItem(product._id));
  }

  return (
    <div className="cart-item">
      <img src={product.image} alt={product.name} />

      <div className="cart-item-info">
        <Link to={`/products/${product._id}`}>{product.name}</Link>
        <p className="product-price">{formatPrice(product.price)}</p>
      </div>

      <div className="cart-item-quantity">
        <button onClick={handleDecrease} disabled={busy || quantity <= 1}>-</button>
        <span>{quantity}</span>
        <button onClick={handleIncrease} disabled={busy || quantity >= product.stock}>+</button>
      </div>

      <p className="cart-item-line-total">{formatPrice(product.price * quantity)}</p>

      <button className="secondary" onClick={handleRemove} disabled={busy}>
        {removeAction.saving ? 'Removing...' : 'Remove'}
      </button>

      {(quantityAction.error || removeAction.error) && (
        <p className="error">{quantityAction.error || removeAction.error}</p>
      )}
    </div>
  );
}

export default CartItem;
