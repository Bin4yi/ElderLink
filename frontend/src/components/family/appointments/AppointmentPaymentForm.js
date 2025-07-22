import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { ArrowLeft, Lock, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const AppointmentPaymentForm = ({ amount, appointmentId, onSuccess, onBack }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Payment system not loaded. Please try again.');
      return;
    }

    setLoading(true);

    try {
      const cardElement = elements.getElement(CardElement);
      
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      // For demo purposes, simulate successful payment
      // In production, you would process the payment with your backend
      console.log('Payment method created:', paymentMethod);
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const paymentResult = {
        success: true,
        payment: {
          id: `pay_${Date.now()}`,
          paymentMethodId: paymentMethod.id,
          amount: amount,
          status: 'completed',
          created: new Date().toISOString()
        },
        message: 'Payment successful!'
      };

      toast.success('Payment completed successfully!');
      onSuccess(paymentResult);

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
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
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CreditCard className="w-16 h-16 text-blue-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
        <p className="text-gray-600">Complete your payment to confirm the appointment</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold mb-3">Payment Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Consultation Fee</span>
              <span className="font-medium">${amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Processing Fee</span>
              <span className="font-medium">$0.00</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span className="text-lg text-green-600">${amount}</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="p-4 border border-gray-300 rounded-lg bg-white">
            <CardElement options={cardStyle} />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Your card information is encrypted and secure
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <div className="flex items-center space-x-2 text-sm text-blue-700">
            <Lock className="w-4 h-4" />
            <span>Your payment is secured with 256-bit SSL encryption</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 py-3 px-6 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          
          <button
            type="submit"
            disabled={!stripe || loading}
            className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Pay ${amount}</span>
              </>
            )}
          </button>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          By clicking "Pay", you agree to our terms and conditions
        </div>
      </form>
    </div>
  );
};

export default AppointmentPaymentForm;