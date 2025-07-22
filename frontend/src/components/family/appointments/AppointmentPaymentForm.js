import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const AppointmentPaymentForm = ({ amount, paymentIntent, appointmentId, onSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // Use the environment variable or fallback to localhost:5000
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      
      // Confirm payment with backend (store in AppointmentPayment table)
      const response = await fetch(`${apiUrl}/api/appointment-payments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          // Add authorization header if you have authentication
          // 'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          appointmentId,
          amount,
          paymentMethodId: paymentMethod.id,
          paymentIntentId: paymentIntent?.id,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success('Payment successful!');
        // Pass the result with proper structure
        onSuccess({
          success: true,
          payment: {
            id: result.payment?.id || 'payment-' + Date.now(),
            paymentMethodId: paymentMethod.id,
            amount: amount,
            status: 'completed'
          },
          message: result.message
        });
      } else {
        toast.error(result.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': { color: '#aab7c4' },
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Appointment Payment</h4>
        <div className="flex justify-between text-sm">
          <span>Consultation Fee</span>
          <span>${amount}</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Information</label>
        <div className="p-4 border border-gray-300 rounded-lg">
          <CardElement options={cardStyle} />
        </div>
      </div>
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <Lock className="w-4 h-4" />
        <span>Your payment information is secure and encrypted</span>
      </div>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Pay $${amount}`}
        </button>
      </div>
    </form>
  );
};

export default AppointmentPaymentForm;