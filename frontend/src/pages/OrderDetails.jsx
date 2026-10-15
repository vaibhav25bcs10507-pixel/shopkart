import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DataState from '../components/DataState';
import OrderItemsList from '../components/OrderItemsList';
import { useFetch } from '../hooks/useFetch';
import { getOrderById } from '../services/orderService';
import { toLineItems } from '../utils/cart';
import { formatPrice } from '../utils/product';
import { formatDate } from '../utils/order';

function OrderDetails() {
  const { id } = useParams();
  const { data: order, loading, error, reload } = useFetch(() => getOrderById(id), [id]);

  return (
    <div>
      <Navbar />
      <div className="products-page">
        <h2>Order Details</h2>
        <DataState
          loading={loading}
          error={error}
          onRetry={reload}
          loadingText="Loading your order..."
          errorText="We couldn't load this order."
        >
          {order && (
            <div className="order-card">
              <p>Order ID: {order._id}</p>
              <p>Placed on: {formatDate(order.createdAt)}</p>
              <p>Status: {order.status}</p>
              <p>Payment: {order.paymentStatus}</p>

              <h3>Items</h3>
              <OrderItemsList items={toLineItems(order.items)} />
              <p className="order-summary-total">Total: {formatPrice(order.totalAmount)}</p>

              <h3>Shipping To</h3>
              <p>{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.pincode}
              </p>
              <p>Phone: {order.shippingAddress.phone}</p>

              <Link className="button-link" to="/orders">
                Back to My Orders
              </Link>
            </div>
          )}
        </DataState>
      </div>
    </div>
  );
}

export default OrderDetails;
