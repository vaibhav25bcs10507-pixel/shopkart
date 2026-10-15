import api from './api';

export async function getCart() {
  const res = await api.get('/cart');
  return res.data.cart;
}

export async function addToCart(productId) {
  const res = await api.post(`/cart/${productId}`);
  return res.data.cart;
}

export async function updateCartQuantity(productId, quantity) {
  const res = await api.patch(`/cart/${productId}`, { quantity });
  return res.data.cart;
}

export async function removeFromCart(productId) {
  const res = await api.delete(`/cart/${productId}`);
  return res.data.cart;
}
