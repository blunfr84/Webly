// Routes de configuration
const express = require('express');
const router = express.Router();

/**
 * GET /api/config/stripe
 * Retourne la clé publique Stripe (sans authentification)
 */
router.get('/stripe', (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
  });
});

module.exports = router;
