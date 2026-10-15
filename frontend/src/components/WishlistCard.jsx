import React from 'react';
import { Link } from 'react-router-dom';
import { removeFromWishlist } from '../services/wishlistService';
import { useAsyncAction } from '../hooks/useAsyncAction';
import { formatPrice, getStockText } from '../utils/product';

function WishlistCard({ product, onRemoved }) {
  const removeAction = useAsyncAction(() => 'Unable to remove product. Please try again.');

  function handleRemove() {
    removeAction.run(async () => {
      try {
        await removeFromWishlist(product._id);
      } catch (err) {
        const status = err.response && err.response.status;
        // Already gone (e.g. removed from another tab) - treat as success
        if (status !== 404) throw err;
      }
      onRemoved(product._id);
    });
  }

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <div className="product-card-body">
        <h3>{product.name}</h3>
        <p className="product-category">{product.category}</p>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className="product-stock">{getStockText(product.stock)}</p>

        <div className="card-actions">
          <Link className="button-link" to={`/products/${product._id}`}>
            View Details
          </Link>
          <button
            className="secondary"
            onClick={handleRemove}
            disabled={removeAction.saving}
          >
            {removeAction.saving ? 'Removing...' : 'Remove from Wishlist'}
          </button>
        </div>

        {removeAction.error && <p className="error">{removeAction.error}</p>}
      </div>
    </div>
  );
}

export default WishlistCard;
