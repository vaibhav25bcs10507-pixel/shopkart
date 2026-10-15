import React from 'react';
import { Link } from 'react-router-dom';
import OrderItemsList from './OrderItemsList';
import { formatPrice } from '../utils/product';
import { formatDate, shortOrderId } from '../utils/order';
import { toLineItems } from '../utils/cart';

function OrderCard({ order }) {
  return (
    <div className="order-card">
      <div className="order-card-header">
        <strong>Order #{shortOrderId(order._id)}</strong>
        <span>{formatDate(order.createdAt)}</span>
      </div>

      <OrderItemsList items={toLineItems(order.items)} />

      <p className="order-summary-total">Total: {formatPrice(order.totalAmount)}</p>
      <p>Status: {order.status}</p>

      <Link className="button-link" to={`/orders/${order._id}`}>
        View Details
      </Link>
    </div>
  );
}

export default OrderCard;
