// frontend/src/config/stripe.js
import { loadStripe } from '@stripe/stripe-js';

// Log the key being used (first 20 chars for security)
const stripeKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_stripe_key_here';
console.log('🔑 Stripe Key (first 20 chars):', stripeKey.substring(0, 20));
console.log('🔑 Full key length:', stripeKey.length);
console.log('🔑 Environment:', process.env.NODE_ENV);

// Replace with your actual Stripe publishable key
const stripePromise = loadStripe(stripeKey);

export default stripePromise;