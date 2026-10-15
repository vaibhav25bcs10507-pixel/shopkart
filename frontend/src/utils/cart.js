// These are never stored - they are always worked out from the current
// cart items, so they can never go out of sync with the real prices/stock.

export function getSubtotal(cartItems) {
  return cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
}

export function getItemCount(cartItems) {
  return cartItems.reduce((total, item) => total + item.quantity, 0);
}

// Cart rows ({ product: { _id, name, price }, quantity }) and saved order items
// ({ product: id, name, price, quantity }) both become { id, name, price, quantity },
// so one list component can show either.
export function toLineItems(items) {
  return items.map((item) =>
    typeof item.product === 'object'
      ? {
          id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }
      : { id: item.product, name: item.name, price: item.price, quantity: item.quantity }
  );
}
