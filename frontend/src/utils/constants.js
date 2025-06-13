// STEP 1: Create the constants file first
// src/utils/constants.js
export const PACKAGE_PLANS = {
  basic: {
    name: 'Basic Care',
    prices: {
      '1_month': 99,
      '6_months': 534,
      '1_year': 1068
    },
    features: [
      'Health monitoring dashboard',
      'Weekly health reports',
      'Basic emergency alerts',
      'Medication reminders',
      'Family notifications'
    ]
  },
  premium: {
    name: 'Premium Care',
    prices: {
      '1_month': 199,
      '6_months': 1074,
      '1_year': 2148
    },
    features: [
      'Everything in Basic',
      'Daily health check-ins',
      '24/7 emergency response',
      'Video consultations',
      'Medicine delivery service',
      'Mental wellness support'
    ]
  },
  comprehensive: {
    name: 'Comprehensive Care',
    prices: {
      '1_month': 299,
      '6_months': 1614,
      '1_year': 3228
    },
    features: [
      'Everything in Premium',
      'Dedicated care coordinator',
      'In-home visits',
      'Specialized healthcare services',
      'Family counseling sessions',
      'Priority support'
    ]
  }
};

export const DURATION_OPTIONS = [
  { value: '1_month', label: '1 Month', discount: 0 },
  { value: '6_months', label: '6 Months', discount: 10 },
  { value: '1_year', label: '1 Year', discount: 20 }


];

