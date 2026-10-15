import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DataState from '../components/DataState';
import { useFetch } from '../hooks/useFetch';
import { getOrderById } from '../services/orderService';
import { formatPrice } from '../utils/product';

function OrderSuccess() {
  const { id } = useParams();
  const { data: order, loading, error, reload } = useFetch(() => getOrderById(id), [id]);

  return (
    <div>
      <Navbar />
      <div className="products-page">
        <DataState
          loading={loading}
          error={error}
          onRetry={reload}
          loadingText="Loading your order..."
          errorText="We couldn't load your order."
        >
          {order && (
            <div className="empty-state">
              <div className="empty-state-icon">✅</div>
              <h3>Order Placed Successfully</h3>
              <p>Order ID: {order._id}</p>
              <p>Total: {formatPrice(order.totalAmount)}</p>
              <p>Status: {order.status}</p>
              <p>Your order has been saved successfully.</p>
              <div className="card-actions">
                <Link className="button-link" to="/orders">
                  View My Orders
                </Link>
                <Link className="button-link" to="/products">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </DataState>
      </div>
    </div>
  );
}

export default OrderSuccess;
