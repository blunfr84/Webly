// Stripe Payment Handler
let STRIPE_PUBLISHABLE_KEY = 'pk_test_placeholder';
const API_BASE = 'http://localhost:3000/api';

// Charger la clé publique depuis l'API au démarrage
(async () => {
  try {
    const response = await fetch(`${API_BASE}/config/stripe`);
    const data = await response.json();
    if (data.success && data.publishableKey) {
      STRIPE_PUBLISHABLE_KEY = data.publishableKey;
    }
  } catch (error) {
    console.error('Erreur chargement config Stripe:', error);
  }
})();

/**
 * Initier un paiement pour un service
 */
async function initiatePayment(serviceId, serviceName, price) {
  try {
    // Obtenir l'email du client
    const customerEmail = prompt('Veuillez entrer votre adresse email:');
    if (!customerEmail) {
      alert('Email requis pour le paiement');
      return;
    }

    // Afficher un indicateur de chargement
    const button = event.target;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = '⏳ Redirection en cours...';

    // Créer une session de paiement
    const response = await fetch(`${API_BASE}/payments/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        serviceId: serviceId,
        quantity: 1,
        customerEmail: customerEmail
      })
    });

    const data = await response.json();

    if (!data.success) {
      alert('Erreur: ' + (data.message || 'Impossible de créer une session de paiement'));
      button.disabled = false;
      button.textContent = originalText;
      return;
    }

    // Charger Stripe et rediriger vers Checkout
    const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    
    const { error } = await stripe.redirectToCheckout({
      sessionId: data.sessionId
    });

    if (error) {
      alert('Erreur Stripe: ' + error.message);
      button.disabled = false;
      button.textContent = originalText;
    }
  } catch (error) {
    console.error('Erreur lors du paiement:', error);
    alert('Une erreur s\'est produite. Veuillez réessayer.');
    event.target.disabled = false;
    event.target.textContent = originalText;
  }
}

/**
 * Vérifier le statut d'un paiement (utilisé sur la page de confirmation)
 */
async function checkPaymentStatus(sessionId) {
  try {
    const response = await fetch(`${API_BASE}/payments/session/${sessionId}`);
    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        status: data.data.status,
        amount: data.data.amount,
        email: data.data.customer_email,
        serviceName: data.data.metadata?.serviceName
      };
    }
    return { success: false };
  } catch (error) {
    console.error('Erreur vérification paiement:', error);
    return { success: false };
  }
}
