// frontend/src/components/subscription/PaymentForm.js
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';

const PaymentForm = ({ amount, paymentIntent, onSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const cardElement = elements.getElement(CardElement);

      // If you already have a clientSecret (from paymentIntent), use it
      let clientSecret = paymentIntent?.clientSecret;
      if (!clientSecret) {
        // Fallback: fetch from backend
        const res = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount }),
        });
        const data = await res.json();
        clientSecret = data.clientSecret;
      }

      // Confirm card payment
      const { error, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // Success!
      onSuccess({
        paymentMethodId: confirmedIntent.payment_method,
        id: confirmedIntent.id,
      });
    } catch (error) {
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
        <div className="p-4 border border-gray-300 rounded-lg">
          <CardElement />
        </div>
      </div>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex items-center justify-center py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 btn-primary disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Pay $${amount}`}
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;