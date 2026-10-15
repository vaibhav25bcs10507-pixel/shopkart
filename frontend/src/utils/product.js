export function formatPrice(price) {
  return `₹${price.toLocaleString('en-IN')}`;
}

export function getStockText(stock) {
  if (stock <= 0) return 'Out of stock';
  return stock === 1 ? '1 unit left' : `${stock} units left`;
}
