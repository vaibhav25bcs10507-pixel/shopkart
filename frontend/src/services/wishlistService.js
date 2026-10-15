import api from './api';

const WISHLIST_CHANGED_EVENT = 'wishlist:changed';

// Tells other parts of the UI (the Navbar count) that the wishlist may have
// changed so they can ask the backend for the new value. No data is shared
// on the client; the backend stays the single source of truth.
function notifyWishlistChanged() {
  window.dispatchEvent(new Event(WISHLIST_CHANGED_EVENT));
}

// Subscribe to changes. Returns a function that unsubscribes.
export function onWishlistChanged(handler) {
  window.addEventListener(WISHLIST_CHANGED_EVENT, handler);
  return () => window.removeEventListener(WISHLIST_CHANGED_EVENT, handler);
}

export async function getWishlist() {
  const res = await api.get('/wishlist');
  return res.data.wishlist;
}

export async function getWishlistCount() {
  const res = await api.get('/wishlist/count');
  return res.data.count;
}

// Adds the product if it is not saved, removes it if it is.
// Resolves to true when the product is now saved, false when it was removed.
export async function toggleWishlist(productId) {
  try {
    const res = await api.patch(`/wishlist/${productId}/toggle`);
    return res.data.saved;
  } finally {
    notifyWishlistChanged();
  }
}

export async function removeFromWishlist(productId) {
  try {
    await api.delete(`/wishlist/${productId}`);
  } finally {
    notifyWishlistChanged();
  }
}
