import { UserFacingError } from './errors';

const CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

// Loads Razorpay's Checkout script once. Resolves false (never throws) when
// it cannot load, so the caller can show a message instead of crashing.
export function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = CHECKOUT_SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Opens Razorpay Checkout for an order the BACKEND created.
//   resolves -> { razorpay_order_id, razorpay_payment_id, razorpay_signature }
//   rejects  -> UserFacingError when the customer closes the window
//
// A failed attempt does not end things: Razorpay lets the customer retry in the
// same window, and a later success still reaches `handler`. So a failure is only
// remembered, and it is reported if the customer then closes the window.
// Resolving here does NOT mean the payment is valid - the backend must verify it.
export function payWithRazorpay({ checkout, prefill }) {
  return new Promise((resolve, reject) => {
    let lastFailure = null;

    const razorpay = new window.Razorpay({
      key: checkout.key,
      amount: checkout.amount,
      currency: checkout.currency,
      order_id: checkout.razorpayOrderId,
      name: 'ShopKart',
      description: 'ShopKart Order',
      prefill,
      handler: resolve,
      modal: {
        ondismiss: () => {
          reject(
            new UserFacingError(
              lastFailure
                ? `Payment failed (${lastFailure}). Your cart has not been cleared. Please try again.`
                : 'Payment cancelled. Your cart has not been cleared.'
            )
          );
        }
      }
    });

    razorpay.on('payment.failed', (response) => {
      lastFailure = response.error.description || 'unknown reason';
    });

    razorpay.open();
  });
}
