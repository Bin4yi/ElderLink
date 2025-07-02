// frontend/src/hooks/useSubscriptionCheck.js
import { useSubscription } from '../context/SubscriptionContext';

export const useSubscriptionCheck = () => {
  const { hasValidSubscription, loading } = useSubscription();

  const requireSubscription = (callback, errorMessage = 'Active subscription required') => {
    if (!hasValidSubscription()) {
      alert(errorMessage);
      return false;
    }
    callback();
    return true;
  };

  return {
    hasValidSubscription,
    loading,
    requireSubscription
  };
};