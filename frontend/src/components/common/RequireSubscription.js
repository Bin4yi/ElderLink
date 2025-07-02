import React from 'react';
import { useSubscription } from '../../context/SubscriptionContext';

const RequireSubscription = ({ children, fallback = null }) => {
  const { hasValidSubscription, loading } = useSubscription();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!hasValidSubscription()) {
    return fallback || (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <h3 className="font-semibold text-yellow-800 mb-2">Subscription Required</h3>
        <p className="text-yellow-700">You need an active subscription to access this feature.</p>
      </div>
    );
  }

  return children;
};

export default RequireSubscription;