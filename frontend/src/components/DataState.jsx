import React from 'react';

// Handles the loading and error screens for any page that fetches data.
// Once the data has arrived it simply renders its children.
function DataState({ loading, error, onRetry, loadingText, errorText, children }) {
  if (loading) {
    return <p>{loadingText}</p>;
  }

  if (error) {
    return (
      <div className="empty-state">
        <h3>Something went wrong.</h3>
        <p>{errorText}</p>
        <button onClick={onRetry}>Try Again</button>
      </div>
    );
  }

  return children;
}

export default DataState;
