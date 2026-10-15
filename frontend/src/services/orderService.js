import api from './api';

// Sends only the shipping address. Prices and the total are decided by the server.
export async function createPaymentOrder(shippingAddress) {
  const res = await api.post('/orders/create-payment-order', { shippingAddress });
  return res.data;
}

// Sends Razorpay's three values so the server can verify the signature
export async function verifyPayment(payload) {
  const res = await api.post('/orders/verify-payment', payload);
  return res.data.order;
}

export async function getOrders() {
  const res = await api.get('/orders');
  return res.data.orders;
}

export async function getOrderById(id) {
  const res = await api.get(`/orders/${id}`);
  return res.data.order;
}
