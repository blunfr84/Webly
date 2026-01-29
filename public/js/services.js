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
          ${service.price ? `<div class="meta-item">💰 <strong>${service.price}€</strong></div>` : ''}
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
            ${service.price ? `<div class="amount">${service.price}€</div>` : `<div class="custom">Sur devis</div>`}
            ${service.type === 'subscription' ? `<div class="label" style="margin-top: 0.5rem; color: #10b981;">/mois</div>` : ''}
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-primary btn-sm" onclick="addToCart(${service.id})">Ajouter au panier</button>
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
function addToCart(serviceId) {
  const service = allServices.find(s => s.id === serviceId);
  if (service) {
    cart.addItem(service, 1);
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
      const subtotal = (item.service.price || 0) * item.quantity;
      return `
        <tr>
          <td>
            <strong>${item.service.title}</strong><br>
            <small style="color: var(--text-light);">${item.service.category || 'Autre'}</small>
          </td>
          <td style="text-align: center;">
            <span style="color: ${item.service.type === 'subscription' ? '#10b981' : '#2563eb'}; font-weight: 600;">
              ${item.service.type === 'subscription' ? 'Abonnement' : 'Achat unique'}
            </span>
          </td>
          <td style="text-align: center;">${item.service.price ? `${item.service.price}€` : '<em>Sur devis</em>'}</td>
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
  const cartDetails = items.map(item => 
    `• ${item.service.title} × ${item.quantity} = ${(item.service.price || 0) * item.quantity}€ (${item.service.type === 'subscription' ? 'Abonnement' : 'Achat unique'})`
  ).join('\n');
  
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
  })
  .catch(error => {
    console.error('Erreur de connexion:', error);
    showNotification('❌ Erreur de connexion: ' + error.message);
    submitBtn.disabled = false;
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
