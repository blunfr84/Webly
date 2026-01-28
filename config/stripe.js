// Configuration Stripe
const stripe = require('stripe')(
  process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'
);

const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

// URL de base pour les redirections
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

module.exports = {
  stripe,
  STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY,
  BASE_URL
};
