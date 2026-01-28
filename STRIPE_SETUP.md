# 💳 Configuration Stripe - Webly

## Installation et Configuration

### 1. Créer un compte Stripe

1. Allez sur [stripe.com](https://stripe.com)
2. Créez un compte gratuit
3. Accédez au [Dashboard Stripe](https://dashboard.stripe.com)

### 2. Obtenir les clés API

1. Dans le Dashboard, allez à **Développeurs → Clés API**
2. Vous verrez deux clés :
   - **Clé publique (Publishable Key)** : commence par `pk_test_` ou `pk_live_`
   - **Clé secrète (Secret Key)** : commence par `sk_test_` ou `sk_live_`

### 3. Configurer les variables d'environnement

1. Créez un fichier `.env` à la racine du projet (copie de `.env.example`) :

```bash
# Copiez vos clés Stripe ici
STRIPE_PUBLISHABLE_KEY=pk_test_votre_cle_publique
STRIPE_SECRET_KEY=sk_test_votre_cle_secrete

# Base URL pour les redirections de paiement
BASE_URL=http://localhost:3000
```

2. **Jamais ne commitez ce fichier** ! Il contient vos clés secrètes.

### 4. Mettre à jour le script Stripe frontend

Dans `public/js/stripe-payment.js`, ligne 2, remplacez:
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_placeholder';
```

Par votre vraie clé publique, ou mieux encore, charger depuis une API :

```javascript
fetch('/api/config/stripe')
  .then(r => r.json())
  .then(data => {
    const STRIPE_PUBLISHABLE_KEY = data.publishableKey;
  });
```

## Fonctionnalités

### Paiement Direct
- Bouton "💳 Payer" sur chaque service avec prix
- Redirection vers Stripe Checkout
- Paiement sécurisé par carte bancaire
- Confirmation de paiement instantanée

### Page de Confirmation
- Vérification automatique du statut de paiement
- Affichage des détails de la transaction
- Redirection après paiement réussi

### Sécurité
- Clés API en variables d'environnement
- Validation côté serveur
- Paiement par carte PCI-DSS compliant

## Routes API

### POST `/api/payments/create-checkout-session`
Crée une session Stripe Checkout

**Body:**
```json
{
  "serviceId": 1,
  "quantity": 1,
  "customerEmail": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "publishableKey": "pk_test_..."
}
```

### GET `/api/payments/session/:sessionId`
Récupère les détails d'une session de paiement

## Mode Test

Stripe fournit des numéros de carte de test :

- **Paiement réussi :** `4242 4242 4242 4242`
- **Paiement refusé :** `4000 0000 0000 0002`
- **Date d'expiration :** N'importe quelle date future
- **CVC :** N'importe quel 3 chiffres

## Mode Production

Quand vous êtes prêt pour la production :

1. Passez en mode live dans votre compte Stripe
2. Obtenez vos vraies clés (commençant par `pk_live_` et `sk_live_`)
3. Changez les clés dans votre fichier `.env`
4. Mettez à jour `BASE_URL` vers votre domaine
5. Testez complètement avant de mettre en ligne

## Dépannage

### Erreur "Stripe is not defined"
- Vérifiez que le script Stripe est bien chargé : `<script src="https://js.stripe.com/v3/"></script>`
- Vérifiez qu'il est avant le script `stripe-payment.js`

### Paiement ne fonctionne pas
- Vérifiez les clés API dans `.env`
- Vérifiez que la clé publique est correcte dans `stripe-payment.js`
- Consultez la console du navigateur pour les erreurs

### Redirection ne fonctionne pas
- Vérifiez que `BASE_URL` est correcte dans `.env`
- Vérifiez que les URLs de redirection sont enregistrées dans Stripe

## Support

Pour plus d'aide, consultez :
- [Documentation Stripe](https://stripe.com/docs)
- [Dashboard Stripe](https://dashboard.stripe.com)
- [Logs d'erreur Stripe](https://dashboard.stripe.com/logs)
