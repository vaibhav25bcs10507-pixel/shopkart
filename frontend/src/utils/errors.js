// An error whose message is already written for the customer and can be
// shown as-is (e.g. "Payment cancelled"), as opposed to a raw network error.
export class UserFacingError extends Error {}

// One place that turns any failed request into text for the screen.
// The backend's own 400 messages are written for users, so they are shown
// directly; everything else falls back to the caller's wording.
export function getErrorMessage(err, fallback) {
  if (err instanceof UserFacingError) return err.message;

  const status = err.response && err.response.status;
  if (status === 401) return 'Please log in to continue.';

  const serverMessage =
    err.response && err.response.data && err.response.data.message;
  if (status === 400 && serverMessage) return serverMessage;

  return fallback;
}
