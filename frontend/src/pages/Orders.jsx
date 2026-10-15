import React from 'react';
import Navbar from '../components/Navbar';
import DataState from '../components/DataState';
import EmptyState from '../components/EmptyState';
import OrderCard from '../components/OrderCard';
import { useFetch } from '../hooks/useFetch';
import { getOrders } from '../services/orderService';

function Orders() {
  const { data: orders, loading, error, reload } = useFetch(getOrders);

  return (
    <div>
      <Navbar />
      <div className="products-page">
        <h2>My Orders</h2>
        <DataState
          loading={loading}
          error={error}
          onRetry={reload}
          loadingText="Loading your orders..."
          errorText="We couldn't load your orders."
        >
          {orders && orders.length === 0 ? (
            <EmptyState
              icon="📦"
              title="No orders yet"
              message="You have not placed any orders yet."
              linkTo="/products"
              linkText="Start Shopping"
            />
          ) : (
            <div className="cart-items">
              {orders && orders.map((order) => <OrderCard key={order._id} order={order} />)}
            </div>
          )}
        </DataState>
      </div>
    </div>
  );
}

export default Orders;
