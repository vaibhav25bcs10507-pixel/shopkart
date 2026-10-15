import React from 'react';
import { formatPrice } from '../utils/product';

// "Keyboard × 2 ........ ₹5,998". Takes plain { id, name, price, quantity }
// rows, so the cart (live prices) and past orders (saved prices) both use it.
function OrderItemsList({ items }) {
  return (
    <ul className="order-lines">
      {items.map((item) => (
        <li key={item.id}>
          <span>
            {item.name} × {item.quantity}
          </span>
          <span>{formatPrice(item.price * item.quantity)}</span>
        </li>
      ))}
    </ul>
  );
}

export default OrderItemsList;
