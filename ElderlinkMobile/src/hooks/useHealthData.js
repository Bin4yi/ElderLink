import { useHealth } from '../context/HealthContext';

/**
 * Custom hook to use health data context
 * Provides easy access to health monitoring state and methods
 */
export const useHealthData = () => {
  return useHealth();
};