// Script pour la page des services

const API_BASE = `${window.location.origin}/api`;
let allServices = [];
let currentFilter = 'all';

// Au chargement
document.addEventListener('DOMContentLoaded', () => {
  loadServices();
  initializeCartObserver();
  setupCartEventListeners();
  updateCartCount();
});

/**
 * Charge tous les services depuis l'API
 */
async function loadServices() {
  try {
    const response = await fetch(`${API_BASE}/services`);
    const data = await response.json();

    if (data.success) {
      allServices = data.data;
      displayServices(allServices);
      setupCategoryFilters();
    } else {
      console.error('Erreur chargement services:', data.message);
    }
  } catch (error) {
    console.error('Erreur:', error);
    document.getElementById('services-container').innerHTML = 
      '<p style="grid-column: 1/-1; text-align: center; color: red;">Impossible de charger les services.</p>';
  }
}

/**
 * Configure les boutons de filtrage par catégorie
 */
function setupCategoryFilters() {
  const categories = [...new Set(allServices.map(s => s.category || 'Autre'))];
  
  const filtersContainer = document.getElementById('category-filters');
  filtersContainer.innerHTML = `
    <button class="filter-btn active" onclick="filterByCategory('all')">Tous les services</button>
    ${categories.map(cat => 
      `<button class="filter-btn" onclick="filterByCategory('${cat}')">${cat}</button>`
    ).join('')}
  `;
}

/**
 * Filtre les services par catégorie
 */
function filterByCategory(category) {
  currentFilter = category;
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');

  let filtered = allServices;
  if (category !== 'all') {
    filtered = allServices.filter(s => (s.category || 'Autre') === category);
  }

  displayServices(filtered);
}

/**
 * Affiche les services
 */
function displayServices(services) {
  const container = document.getElementById('services-container');
  
  if (services.length === 0) {
    container.innerHTML = '<div class="no-services"><p>Aucun service trouvé dans cette catégorie.</p></div>';
    return;
  }

  container.innerHTML = services.map(service => `
    <div class="service-page-card">
      <div class="service-header">
        <div class="service-category">${service.category || 'Autre'}</div>
        <h3>${service.title}</h3>
      </div>
      <div class="service-content">
        <p class="service-description">${service.description}</p>
        
        <div class="service-meta">
          ${service.type === 'subscription'
            ? (service.subscriptionPrice || service.price
                ? `<div class="meta-item">💰 <strong>${service.subscriptionPrice ?? service.price}€ /mois</strong></div>`
                : '')
            : (service.price
                ? `<div class="meta-item">💰 <strong>${service.price}€</strong></div>`
                : '')
          }
          ${service.duration ? `<div class="meta-item">⏱️ <strong>${formatDuration(service.duration)}</strong></div>` : ''}
        </div>

        ${service.features && service.features.length > 0 ? `
          <ul class="service-features">
            ${service.features.map(f => `<li>${f}</li>`).join('')}
          </ul>
        ` : ''}

        <div class="service-footer">
          <div class="service-price">
            <div class="label">À partir de</div>
            ${service.type === 'subscription'
              ? (service.subscriptionPrice || service.price
                  ? `<div class="amount">${service.subscriptionPrice ?? service.price}€</div>`
                  : `<div class="custom">Sur devis</div>`)
              : (service.price
                  ? `<div class="amount">${service.price}€</div>`
                  : `<div class="custom">Sur devis</div>`)
            }
            ${service.type === 'subscription' ? `<div class="label" style="margin-top: 0.5rem; color: #10b981;">/mois</div>` : ''}
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${service.options && service.options.length > 0 ? `
              <div style="display: grid; gap: 0.75rem; font-size: 0.85rem; background: var(--light-bg); padding: 1rem; border-radius: 0.5rem;">
                <div style="font-weight: 600; color: var(--text-dark);">📦 Options disponibles:</div>
                ${service.options.map((opt, idx) => `
                  <div style="display: flex; align-items: center; gap: 0.5rem; justify-content: space-between;">
                    <label style="display: flex; align-items: center; gap: 0.5rem;">
                      <span>${opt.name}</span>
                      <span style="color: var(--accent-color); font-weight: 600;">+${opt.price}€${opt.type === 'subscription' ? '/mois' : ''}</span>
                    </label>
                    <input type="number" min="0" max="99" value="0" data-option-service="${service.id}" data-option-name="${opt.name}" id="option-${service.id}-${idx}" style="width: 50px; padding: 0.35rem; border: 1px solid var(--border-color); border-radius: 0.3rem; text-align: center;">
                  </div>
                `).join('')}
              </div>
            ` : ''}
            <div style="display: flex; gap: 0.75rem;">
              <button class="btn btn-primary btn-sm" onclick="addToCart(${service.id})">Ajouter au panier</button>
              ${service.type === 'subscription' ? `<button class="btn btn-success btn-sm" onclick="initiateSubscription(${service.id}, getSelectedOptions(${service.id}))">S'abonner</button>` : ''}
            </div>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  updateCartDisplay();
}

/**
 * Ajoute un service au panier
 */
function getSelectedOptions(serviceId) {
  const options = {};
  document.querySelectorAll(`[data-option-service="${serviceId}"]`).forEach(input => {
    const optionName = input.getAttribute('data-option-name');
    const quantity = parseInt(input.value) || 0;
    if (quantity > 0) {
      options[optionName] = quantity;
    }
  });
  return options;
}

function addToCart(serviceId) {
  const service = allServices.find(s => s.id === serviceId);
  if (service) {
    const selectedOptions = getSelectedOptions(serviceId);
    cart.addItem(service, 1, { selectedOptions });
    showNotification('✓ Service ajouté au panier');
  }
}

/**
 * Met à jour le compteur du panier dans le header
 */
function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  const cartBadge = document.getElementById('cart-badge');
  
  const count = cart.getItemCount();
  
  if (cartCount) {
    cartCount.textContent = count > 0 ? count : '0';
  }
  if (cartBadge) {
    if (count > 0) {
      cartBadge.textContent = count;
      cartBadge.style.display = 'inline-block';
    } else {
      cartBadge.style.display = 'none';
    }
  }
}

/**
 * Met à jour l'affichage du panier
 */
function updateCartDisplay() {
  const cartSection = document.getElementById('cart-section');
  const cartBody = document.getElementById('cart-body');
  const cartBadge = document.getElementById('cart-badge');

  // Mettre à jour le badge
  const itemCount = cart.getItemCount();
  if (cartBadge && itemCount > 0) {
    cartBadge.textContent = itemCount;
    cartBadge.style.display = 'inline-block';
  } else if (cartBadge) {
    cartBadge.style.display = 'none';
  }

  // Afficher/masquer la section panier
  if (cart.isEmpty()) {
    if (cartSection) cartSection.classList.remove('active');
    return;
  }

  if (cartSection) cartSection.classList.add('active');

  // Remplir le tableau
  if (cartBody) {
    cartBody.innerHTML = cart.getItems().map(item => {
      const subtotal = cart.getItemTotal(item);
      return `
        <tr>
          <td>
            <strong>${item.service.title}</strong><br>
            <small style="color: var(--text-light);">${item.service.category || 'Autre'}</small>
            ${item.service.options && item.service.options.length > 0 ? `
              <div style="margin-top: 0.75rem; display: grid; gap: 0.5rem; background: var(--light-bg); padding: 0.75rem; border-radius: 0.3rem; font-size: 0.8rem;">
                ${item.service.options.map((opt) => {
                  const optQty = item.selectedOptions?.[opt.name] || 0;
                  const isSubscription = opt.type === 'subscription';
                  return `
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                      <label style="flex: 1; display: flex; align-items: center; gap: 0.3rem;">
                        <span>${opt.name}</span>
                        <span style="color: ${isSubscription ? '#10b981' : 'var(--accent-color)'}; font-weight: 600; margin-left: auto;">+${opt.price}€${isSubscription ? '/mois' : ''}</span>
                      </label>
                      <div style="display: flex; align-items: center; gap: 0.3rem;">
                        <input type="number" min="0" max="99" value="${optQty}" class="quantity-input-option" style="width: 45px;" onchange="updateOptionQuantity(${item.serviceId}, '${opt.name.replace(/'/g, "\\'")}', this.value)">
                        <span style="color: var(--text-light); font-size: 0.75rem; min-width: 45px; text-align: right;">${(opt.price * optQty).toFixed(2)}€${isSubscription ? '/mois' : ''}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}
          </td>
          <td style="text-align: center;">
            <span style="color: ${item.service.type === 'subscription' ? '#10b981' : '#2563eb'}; font-weight: 600;">
              ${item.service.type === 'subscription' ? 'Abonnement' : 'Achat unique'}
            </span>
          </td>
          <td style="text-align: center;">${cart.getServiceUnitPrice(item.service) ? `${cart.getServiceUnitPrice(item.service)}€${item.service.type === 'subscription' ? '/mois' : ''}` : '<em>Sur devis</em>'}</td>
          <td style="text-align: center;">
            <button class="btn-quantity" onclick="changeQuantity(${item.serviceId}, ${item.quantity - 1})">−</button>
            <input type="number" value="${item.quantity}" class="quantity-input" onchange="changeQuantity(${item.serviceId}, this.value)">
            <button class="btn-quantity" onclick="changeQuantity(${item.serviceId}, ${item.quantity + 1})">+</button>
          </td>
          <td style="text-align: right;"><strong>${subtotal.toFixed(2)}€</strong></td>
          <td style="text-align: center;">
            <button class="btn btn-danger btn-sm" onclick="removeFromCart(${item.serviceId})" title="Supprimer">✕</button>
          </td>
        </tr>
      `;
    }).join('');

    // Afficher le total
    const total = cart.getTotal();
    document.getElementById('cart-total').textContent = total.toFixed(2);
  }

  // Scroll automatique vers le panier
  setTimeout(() => {
    if (cartSection && cartSection.classList.contains('active')) {
      cartSection.scrollIntoView({ behavior: 'smooth' });
    }
  }, 100);
}

/**
 * Change la quantité d'un article
 */
function changeQuantity(serviceId, quantity) {
  const qty = Math.max(1, parseInt(quantity) || 1);
  if (qty <= 0) {
    removeFromCart(serviceId);
  } else {
    cart.updateQuantity(serviceId, qty);
    updateCartDisplay();
  }
}

/**
 * Met à jour la quantité d'une option pour un service
 */
function updateOptionQuantity(serviceId, optionName, quantity) {
  const items = cart.getItems();
  const item = items.find(i => i.serviceId === serviceId);
  if (!item) return;
  
  const qty = Math.max(0, parseInt(quantity) || 0);
  const selected = item.selectedOptions || {};
  
  if (qty > 0) {
    selected[optionName] = qty;
  } else {
    delete selected[optionName];
  }
  
  cart.setSelectedOptions(serviceId, selected);
  updateCartDisplay();
}

/**
 * Active/désactive l'option déplacement (legacy, remplacé par updateOptionQuantity)
 */
function toggleServiceOption(serviceId, optionName, enabled) {
  const qty = enabled ? 1 : 0;
  updateOptionQuantity(serviceId, optionName, qty);
}

/**
 * Retire un article du panier
 */
function removeFromCart(serviceId) {
  cart.removeItem(serviceId);
  updateCartDisplay();
  showNotification('Service retiré du panier');
}

/**
 * Vide complètement le panier
 */
function clearCart() {
  if (confirm('Êtes-vous sûr de vouloir vider le panier ?')) {
    cart.clear();
    updateCartDisplay();
    showNotification('Panier vidé');
  }
}

/**
 * Initialise l'observateur du panier
 */
function initializeCartObserver() {
  cart.subscribe(() => {
    updateCartDisplay();
    updateCartCount();
  });
}

/**
 * Configure les événements du formulaire de paiement
 */
function setupCartEventListeners() {
  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', submitCheckout);
  }
}

/**
 * Ouvre le formulaire de paiement
 */
function openCheckout() {
  if (cart.isEmpty()) {
    showNotification('❌ Votre panier est vide !');
    return;
  }
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    // Mettre à jour le total dans le modal
    const total = cart.getTotal();
    const checkoutTotal = document.getElementById('checkout-total');
    if (checkoutTotal) {
      checkoutTotal.textContent = total.toFixed(2);
    }
    modal.classList.add('active');
  }
}

/**
 * Ferme le formulaire de paiement
 */
function closeCheckout() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('active');
}

/**
 * Envoie la commande
 */
function submitCheckout(e) {
  if (e) e.preventDefault();
  
  // Prévention de double-soumission
  const submitBtn = document.querySelector('#checkout-form button[type="submit"]');
  if (submitBtn.disabled) return false;
  submitBtn.disabled = true;
  
  console.log('Soumission du formulaire...');
  
  const name = document.getElementById('checkout-name').value.trim();
  const email = document.getElementById('checkout-email').value.trim();
  const phone = document.getElementById('checkout-phone').value.trim();
  const payment = document.getElementById('checkout-payment').value.trim();
  const message = document.getElementById('checkout-message').value.trim();
  
  console.log('Données:', { name, email, phone, payment, message: message.substring(0, 20) + '...' });
  
  if (!name || !email || !phone || !payment) {
    showNotification('❌ Veuillez remplir tous les champs obligatoires');
    console.log('Champs vides:', { name: !name, email: !email, phone: !phone, payment: !payment });
    submitBtn.disabled = false;
    return false;
  }

  if (!message) {
    showNotification('❌ Veuillez décrire vos besoins dans le message');
    submitBtn.disabled = false;
    return false;
  }
  
  // 🔴 SI PAIEMENT PAR CARTE: UTILISER STRIPE
  if (payment === 'card') {
    return processStripePayment(name, email, phone, message, submitBtn);
  }
  
  // 🔵 SINON: TRAITER LES AUTRES MODES DE PAIEMENT
  return processOtherPayment(name, email, phone, payment, message, submitBtn);
}

/**
 * Traite les paiements par carte Stripe
 */
async function processStripePayment(name, email, phone, message, submitBtn) {
  try {
    submitBtn.textContent = '⏳ Redirection vers Stripe...';
    
    const items = cart.getItems();
    if (items.length === 0) {
      showNotification('❌ Votre panier est vide');
      submitBtn.disabled = false;
      submitBtn.textContent = '✓ Envoyer la commande';
      return false;
    }

    // Créer une session Stripe avec tous les articles du panier
    const lineItems = items.map(item => {
      const unitPrice = cart.getServiceUnitPrice(item.service);
      const optionsTotal = cart.getOptionsTotal(item);
      const totalPrice = unitPrice + optionsTotal;

      return {
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.service.title,
            description: item.service.description,
            metadata: {
              serviceId: item.service.id,
              options: Array.isArray(item.selectedOptions) ? item.selectedOptions.join(', ') : ''
            }
          },
          unit_amount: Math.round(totalPrice * 100)
        },
        quantity: item.quantity
      };
    });

    const response = await fetch(`${API_BASE}/payments/create-checkout-session-with-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lineItems: lineItems,
        customerEmail: email,
        customerName: name,
        customerPhone: phone,
        message: message
      })
    });

    const data = await response.json();

    if (!data.success) {
      showNotification('❌ Erreur: ' + (data.message || 'Impossible de créer la session de paiement'));
      submitBtn.disabled = false;
      submitBtn.textContent = '✓ Envoyer la commande';
      return false;
    }

    // Attendre que Stripe soit chargé
    if (typeof Stripe === 'undefined') {
      showNotification('❌ Erreur: Stripe.js n\'est pas chargé');
      submitBtn.disabled = false;
      submitBtn.textContent = '✓ Envoyer la commande';
      return false;
    }

    // Charger Stripe et rediriger vers Checkout
    const publishableKey = data.publishableKey || (typeof STRIPE_PUBLISHABLE_KEY !== 'undefined' ? STRIPE_PUBLISHABLE_KEY : null);
    
    if (!publishableKey) {
      showNotification('❌ Erreur: Clé Stripe publique non trouvée');
      submitBtn.disabled = false;
      submitBtn.textContent = '✓ Envoyer la commande';
      return false;
    }

    const stripe = Stripe(publishableKey);
    const { error } = await stripe.redirectToCheckout({
      sessionId: data.sessionId
    });

    if (error) {
      showNotification('❌ Erreur Stripe: ' + error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = '✓ Envoyer la commande';
      return false;
    }
  } catch (error) {
    console.error('Erreur paiement Stripe:', error);
    showNotification('❌ Une erreur s\'est produite: ' + error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = '✓ Envoyer la commande';
    return false;
  }
}

/**
 * Traite les autres modes de paiement (virement, chèque, etc.)
 */
function processOtherPayment(name, email, phone, payment, message, submitBtn) {
  // Mapper les modes de paiement
  const paymentMethods = {
    'card': 'Carte bancaire',
    'transfer': 'Virement bancaire',
    'paypal': 'PayPal',
    'check': 'Chèque',
    'cash': 'Espèces'
  };
  
  // Créer le message avec le panier
  const items = cart.getItems();
  const cartDetails = items.map(item => {
    const unitPrice = cart.getServiceUnitPrice(item.service);
    const optionsTotal = cart.getOptionsTotal(item);
    const lineTotal = (unitPrice + optionsTotal) * item.quantity;
    const optionNames = Array.isArray(item.selectedOptions) ? item.selectedOptions.join(', ') : '';
    const optionsText = optionsTotal > 0 ? ` + Options (${optionNames || 'Sélectionnées'} : ${optionsTotal}€ x ${item.quantity})` : '';
    return `• ${item.service.title} × ${item.quantity} = ${lineTotal}€ (${item.service.type === 'subscription' ? 'Abonnement mensuel' : 'Achat unique'})${optionsText}`;
  }).join('\n');
  
  const total = cart.getTotal();
  
  const fullMessage = `
════════════════════════════════════════
            🛒 NOUVELLE COMMANDE 🛒
════════════════════════════════════════

📋 COORDONNÉES DU CLIENT:
────────────────────────────────────────
Nom: ${name}
Email: ${email}
Téléphone: ${phone}

💰 MODE DE PAIEMENT:
────────────────────────────────────────
${paymentMethods[payment] || payment}

📦 ARTICLES COMMANDÉS:
────────────────────────────────────────
${cartDetails}

─────────────────────────────────────────
TOTAL: ${total.toFixed(2)}€

📝 DÉTAILS DE LA DEMANDE:
────────────────────────────────────────
${message}
════════════════════════════════════════
  `.trim();
  
  console.log('Envoi de la commande...');
  
  fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      phone,
      message: fullMessage,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      read: false
    })
  })
  .then(response => response.json())
  .then(data => {
    console.log('Réponse:', data);
    
    if (data.success) {
      showNotification('✓ Commande envoyée ! Nous vous recontacterons bientôt.');
      clearCart();
      closeCheckout();
      document.getElementById('checkout-form').reset();
      
      // Recharger le dashboard admin si la page admin est ouverte
      if (window.location.pathname === '/admin') {
        setTimeout(() => {
          if (typeof loadDashboard === 'function') {
            loadDashboard();
          }
        }, 500);
      }
    } else {
      showNotification('❌ Erreur: ' + (data.message || 'Erreur lors de l\'envoi'));
      console.error('Erreur:', data.message);
    }
    submitBtn.disabled = false;
    submitBtn.textContent = '✓ Envoyer la commande';
  })
  .catch(error => {
    console.error('Erreur de connexion:', error);
    showNotification('❌ Erreur de connexion: ' + error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = '✓ Envoyer la commande';
  });
  
  return false;
}

/**
 * Affiche une notification temporaire
 */
function showNotification(message, duration = 3000) {
  let notifContainer = document.getElementById('notification-container');
  
  if (!notifContainer) {
    notifContainer = document.createElement('div');
    notifContainer.id = 'notification-container';
    notifContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    `;
    document.body.appendChild(notifContainer);
  }
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    background: #333;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    margin-bottom: 0.5rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  notifContainer.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Ajouter les animations CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Rafraîchir les services toutes les minutes
setInterval(() => {
  loadServices();
}, 60000);
