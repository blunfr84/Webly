// Routes pour les paiements Stripe
const express = require('express');
const path = require('path');
const fs = require('fs');
const { stripe, BASE_URL } = require('../config/stripe');
const { sendInvoiceEmail } = require('../config/email');
const router = express.Router();

const servicesPath = path.join(__dirname, '../data/services.json');

/**
 * Charger les services depuis le fichier JSON
 */
const loadServices = () => {
  try {
    const data = fs.readFileSync(servicesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lecture services:', error);
    return [];
  }
};

/**
 * POST /api/payments/create-checkout-session
 * Crée une session de paiement Stripe
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { serviceId, quantity = 1, customerEmail } = req.body;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: 'ID du service requis'
      });
    }

    // Charger le service
    const services = loadServices();
    const service = services.find(s => s.id === parseInt(serviceId));

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé'
      });
    }

    // Vérifier que le service a un prix
    if (!service.price) {
      return res.status(400).json({
        success: false,
        message: 'Ce service n\'a pas de prix défini'
      });
    }

    // Créer la session de paiement
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: service.title,
              description: service.description,
              images: []
            },
            unit_amount: Math.round(service.price * 100) // Stripe demande le montant en centimes
          },
          quantity: quantity
        }
      ],
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${BASE_URL}/payment-success.html?session_id={CHECKOUT_SESSION_ID}&service_id=${serviceId}`,
      cancel_url: `${BASE_URL}/services.html?canceled=true`,
      metadata: {
        serviceId: service.id,
        serviceName: service.title,
        quantity: quantity
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error('Erreur création session Stripe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la session de paiement',
      error: error.message
    });
  }
});

/**
 * GET /api/payments/session/:sessionId
 * Récupère les détails d'une session de paiement
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Si le paiement est confirmé et c'est la première fois qu'on vérifie
    if (session.payment_status === 'paid') {
      try {
        // Envoyer la facture par email
        const paymentData = {
          customerEmail: session.customer_email,
          customerName: session.customer_name || session.customer_email.split('@')[0],
          serviceName: session.metadata.serviceName,
          amount: session.amount_total / 100, // Reconvertir en euros
          date: new Date(session.created * 1000).toISOString(),
          transactionId: session.id,
          invoiceNumber: `INV-${session.id.substring(0, 8).toUpperCase()}`
        };

        await sendInvoiceEmail(paymentData);
      } catch (emailError) {
        console.error('⚠️ Erreur lors de l\'envoi de la facture:', emailError);
        // On continue même si l'email échoue
      }
    }

    res.json({
      success: true,
      data: {
        id: session.id,
        status: session.payment_status,
        amount: session.amount_total / 100, // Reconvertir en euros
        customer_email: session.customer_email,
        metadata: session.metadata
      }
    });
  } catch (error) {
    console.error('Erreur récupération session:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la session',
      error: error.message
    });
  }
});

module.exports = router;
