import { useState, useCallback } from 'react';

// Loads the Razorpay Checkout SDK script tag on demand.
export function useRazorpay() {
  const [loading, setLoading] = useState(false);

  const loadScript = useCallback(() => new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(window.Razorpay);
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  }), []);

  const openCheckout = useCallback(async (options) => {
    setLoading(true);
    try {
      const Razorpay = await loadScript();
      return new Promise((resolve, reject) => {
        const rzp = new Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          ...options,
          handler: (response) => resolve(response),
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        });
        rzp.on('payment.failed', (response) => reject(new Error(response.error.description || 'Payment failed')));
        rzp.open();
      });
    } finally {
      setLoading(false);
    }
  }, [loadScript]);

  return { openCheckout, loading };
}
