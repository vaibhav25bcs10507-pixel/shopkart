import { useState } from 'react';

// Every "click a button, call the API, show Saving/an error" card
// (wishlist toggle, wishlist remove, cart add/remove/quantity) needs the
// same three things: a saving flag, an error message, and a guard against
// double clicks. This hook holds that pattern in one place.
//
// getErrorMessage(err) -> string lets each caller word its own error
// (e.g. "Please log in" for a 401 on the wishlist card).
export function useAsyncAction(getErrorMessage) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function run(action) {
    if (saving) return;

    setSaving(true);
    setError('');

    try {
      await action();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return { saving, error, run, setError };
}
