import React from 'react';
import { Link } from 'react-router-dom';

// The "nothing here yet" screen shared by Cart, Wishlist, Orders and Checkout
function EmptyState({ icon, title, message, linkTo, linkText }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3>{title}</h3>
      <p>{message}</p>
      <Link className="button-link" to={linkTo}>
        {linkText}
      </Link>
    </div>
  );
}

export default EmptyState;
