// frontend/src/components/common/ProtectedOperation.js
import React from 'react';
import { useSubscriptionCheck } from '../../hooks/useSubscriptionCheck';
import { CreditCard, Lock } from 'lucide-react';

const ProtectedOperation = ({ 
  children, 
  operation = "this feature",
  onSubscribe,
  fallbackComponent = null 
}) => {
  const { hasActiveSubscription, loading } = useSubscriptionCheck();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!hasActiveSubscription) {
    return fallbackComponent || (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <Lock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          Subscription Required
        </h3>
        <p className="text-yellow-700 mb-4">
          You need an active subscription to access {operation}.
        </p>
        <button
          onClick={onSubscribe}
          className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors flex items-center space-x-2 mx-auto"
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscribe Now</span>
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedOperation;