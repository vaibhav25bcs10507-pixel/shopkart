export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// Full ids are long; the last 8 characters are enough to tell orders apart
export function shortOrderId(id) {
  return id.slice(-8);
}
