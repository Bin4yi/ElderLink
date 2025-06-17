// frontend/src/components/subscription/PaymentForm.js
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, Lock, CreditCard } from 'lucide-react';
import { subscriptionService } from '../../../services/subscription';
import { PACKAGE_PLANS } from '../../../utils/constants';
import { formatCurrency } from '../../../utils/helpers';
import toast from 'react-hot-toast';

const PaymentForm = ({ plan, duration, amount, onBack, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

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

      const response = await subscriptionService.createSubscription({
        plan,
        duration,
        paymentMethodId: paymentMethod.id
      });

      toast.success('Subscription created successfully!');
      onSuccess(response.subscription);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Payment Summary</h4>
        <div className="flex justify-between text-sm">
          <span>{PACKAGE_PLANS[plan].name}</span>
          <span>{formatCurrency(amount)}</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Card Information
        </label>
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
          className="flex-1 btn-primary disabled:opacity-50"
        >
          {loading ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
        </button>
      </div>
    </form>
  );
};

const PaymentFormWrapper = (props) => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold gradient-text mb-4">Complete Your Payment</h2>
        <p className="text-gray-600">Secure payment powered by Stripe</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <PaymentForm {...props} />
      </div>
    </div>
  );
};

export default PaymentFormWrapper;