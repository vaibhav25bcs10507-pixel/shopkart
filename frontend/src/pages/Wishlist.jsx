import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import WishlistCard from '../components/WishlistCard';
import EmptyState from '../components/EmptyState';
import { getWishlist } from '../services/wishlistService';

function Wishlist() {
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  // Bumping this re-runs the effect, which is how "Try Again" reloads the data
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function loadWishlist() {
      setLoading(true);
      setError(false);

      try {
        const items = await getWishlist();
        if (!ignore) setWishlist(items);
      } catch (err) {
        if (ignore) return;

        if (err.response && err.response.status === 401) {
          navigate('/login');
        } else {
          setError(true);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadWishlist();

    return () => {
      ignore = true;
    };
  }, [attempt, navigate]);

  function handleRemoved(productId) {
    setWishlist((current) => current.filter((product) => product._id !== productId));
  }

  function renderContent() {
    if (loading) {
      return <p>Loading your wishlist...</p>;
    }

    if (error) {
      return (
        <div className="empty-state">
          <h3>Something went wrong.</h3>
          <p>We couldn't load your wishlist.</p>
          <button onClick={() => setAttempt((n) => n + 1)}>Try Again</button>
        </div>
      );
    }

    if (wishlist.length === 0) {
      return (
        <EmptyState
          icon="❤️"
          title="Your wishlist is empty"
          message="Save products you love and find them here later."
          linkTo="/products"
          linkText="Browse Products"
        />
      );
    }

    return (
      <>
        <p className="wishlist-count">
          {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
        </p>
        <div className="product-grid">
          {wishlist.map((product) => (
            <WishlistCard
              key={product._id}
              product={product}
              onRemoved={handleRemoved}
            />
          ))}
        </div>
      </>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="products-page">
        <h2>My Wishlist</h2>
        {renderContent()}
      </div>
    </div>
  );
}

export default Wishlist;
