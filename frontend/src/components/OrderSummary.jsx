import React from 'react';
import OrderItemsList from './OrderItemsList';
import { formatPrice } from '../utils/product';

// Item lines + total, with the action button passed in as children
function OrderSummary({ items, total, children }) {
  return (
    <div className="order-summary">
      <h3>Order Summary</h3>
      <OrderItemsList items={items} />
      <p className="order-summary-total">Total: {formatPrice(total)}</p>
      {children}
    </div>
  );
}

export default OrderSummary;
