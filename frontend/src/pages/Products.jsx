import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { getWishlist } from '../services/wishlistService';

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Load which products are already saved, so the hearts are correct after a refresh
  useEffect(() => {
    let ignore = false;

    async function loadWishlistIds() {
      try {
        const items = await getWishlist();
        if (!ignore) setWishlistIds(new Set(items.map((item) => item._id)));
      } catch (err) {
        // Browsing products must still work if this fails (e.g. not logged in),
        // so every card simply starts as "not saved".
      }
    }

    loadWishlistIds();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    // Prevents an older, slower response from overwriting a newer one
    // when the user types quickly
    let ignore = false;

    async function fetchProducts() {
      setLoading(true);
      setError('');

      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (category) params.category = category;

        const res = await api.get('/products', { params });
        if (!ignore) setProducts(res.data.products);
      } catch (err) {
        if (!ignore) setError('Something went wrong while loading products.');
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, [search, category]);

  function handleWishlistChange(productId, saved) {
    setWishlistIds((current) => {
      const next = new Set(current);
      if (saved) next.add(productId);
      else next.delete(productId);
      return next;
    });
  }

  return (
    <div>
      <Navbar />
      <div className="products-page">
        <h2>Products</h2>

        <SearchBar
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
        />

        {loading && <p>Loading products...</p>}

        {!loading && error && <p className="error">{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p>No products found.</p>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                isWishlisted={wishlistIds.has(product._id)}
                onWishlistChange={handleWishlistChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
