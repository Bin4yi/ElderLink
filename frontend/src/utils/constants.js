// STEP 1: Create the constants file first
// src/utils/constants.js
export const PACKAGE_PLANS = {
  monthly: {
    name: 'Monthly Plan',
    prices: {
      '1_month': 99,
      '6_months': 534,   // 89 * 6
      '1_year': 948      // 79 * 12
    },
    features: [
      'Health monitoring dashboard',
      'Weekly health reports',
      'Emergency alerts',
      'Medication reminders',
      'Family notifications'
    ]
  },
  six_months: {
    name: '6 Months Plan',
    prices: {
      '1_month': 99,
      '6_months': 534,
      '1_year': 948
    },
    features: [
      'Health monitoring dashboard',
      'Weekly health reports',
      'Emergency alerts',
      'Medication reminders',
      'Family notifications'
    ]
  },
  one_year: {
    name: '1 Year Plan',
    prices: {
      '1_month': 99,
      '6_months': 534,
      '1_year': 948
    },
    features: [
      'Health monitoring dashboard',
      'Weekly health reports',
      'Emergency alerts',
      'Medication reminders',
      'Family notifications'
    ]
  }
};

export const DURATION_OPTIONS = [
  { value: '1_month', label: '1 Month', discount: 0 },
  { value: '6_months', label: '6 Months', discount: 10 },
  { value: '1_year', label: '1 Year', discount: 20 }
];

