// Script principal de la page publique
// Charge et affiche les services et événements depuis l'API

const API_BASE = `${window.location.origin}/api`;

// Au chargement, tracker les visiteurs
document.addEventListener('DOMContentLoaded', () => {
  trackVisitor();
  loadServices();
  loadEvents();
  setupContactForm();
  updateCartBadge();
  // Mettre à jour le badge du panier quand il change
  if (typeof cart !== 'undefined') {
    cart.subscribe(() => updateCartBadge());
  }
});

/**
 * Met à jour le badge du panier
 */
function updateCartBadge() {
  const badge = document.getElementById('cart-badge');
  if (badge && typeof cart !== 'undefined') {
    const count = cart.getItemCount();
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  }
}

/**
 * Ajoute un service au panier depuis la page d'accueil
 */
function addServiceToCart(serviceId) {
  // Trouver le service par ID
  let service = null;
  const response = fetch(`${API_BASE}/services/${serviceId}`)
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        service = data.data;
        if (typeof cart !== 'undefined') {
          cart.addItem(service, 1);
          // Afficher une notification
          showNotification('✓ Service ajouté au panier');
          updateCartBadge();
        } else {
          alert('Le panier n\'est pas disponible. Veuillez utiliser la page services.');
        }
      }
    });
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

/**
 * Charge et affiche les services
 */
async function loadServices() {
  try {
    const response = await fetch(`${API_BASE}/services`);
    const data = await response.json();

    if (data.success) {
      displayServices(data.data);
    } else {
      console.error('Erreur chargement services:', data.message);
    }
  } catch (error) {
    console.error('Erreur:', error);
    document.getElementById('services-grid').innerHTML = 
      '<p style="grid-column: 1/-1; text-align: center; color: red;">Impossible de charger les services.</p>';
  }
}

/**
 * Affiche les services dans le DOM
 */
function displayServices(services) {
  const grid = document.getElementById('services-grid');
  grid.innerHTML = '';

  services.forEach(service => {
    const card = document.createElement('div');
    card.className = 'service-card';
    
    let priceDisplay = '';
    if (service.price) {
      priceDisplay = `<div class="price">${service.price.toLocaleString('fr-FR')} €</div>`;
    } else {
      priceDisplay = `<div class="price custom">Sur devis</div>`;
    }

    let featuresList = '';
    if (service.features && service.features.length > 0) {
      featuresList = `
        <ul class="features">
          ${service.features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      `;
    }

    card.innerHTML = `
      <h3>${service.title}</h3>
      <p>${service.description}</p>
      ${priceDisplay}
      ${featuresList}
      <button class="btn btn-primary" onclick="addServiceToCart(${service.id})">
        Commander
      </button>
    `;

    grid.appendChild(card);
  });
}

/**
 * Charge et affiche les événements
 */
async function loadEvents() {
  try {
    const response = await fetch(`${API_BASE}/events`);
    const data = await response.json();

    if (data.success) {
      displayEvents(data.data);
    } else {
      console.error('Erreur chargement événements:', data.message);
    }
  } catch (error) {
    console.error('Erreur:', error);
    document.getElementById('events-grid').innerHTML = 
      '<p style="grid-column: 1/-1; text-align: center; color: red;">Impossible de charger l\'agenda.</p>';
  }
}

/**
 * Affiche les événements dans le DOM
 */
function displayEvents(events) {
  const grid = document.getElementById('events-grid');
  grid.innerHTML = '';

  if (events.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Aucun événement à venir. Revenez bientôt!</p>';
    return;
  }

  events.forEach(event => {
    const card = document.createElement('div');
    card.className = 'event-card';

    // Formater la date
    const date = new Date(`${event.date}T${event.time}`);
    const dateFormatted = date.toLocaleDateString('fr-FR', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeFormatted = event.time;

    // Calculer le pourcentage de capacité
    const capacityPercent = (event.participants / event.maxParticipants) * 100;
    const isAvailable = event.participants < event.maxParticipants;
    const availabilityText = isAvailable 
      ? `${event.maxParticipants - event.participants} place(s) disponible(s)`
      : 'Complet';

    card.innerHTML = `
      <div class="date-badge">${dateFormatted} à ${timeFormatted}</div>
      <h3>${event.title}</h3>
      <div class="event-details">
        <div class="event-detail">Durée: ${formatDuration(event.duration)}</div>
        <div class="event-detail">${event.participants}/${event.maxParticipants} inscrits</div>
      </div>
      <div class="capacity">
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
          <span>${availabilityText}</span>
          <span style="font-weight: 600;">${Math.round(capacityPercent)}%</span>
        </div>
        <div class="capacity-bar">
          <div class="capacity-fill" style="width: ${capacityPercent}%"></div>
        </div>
      </div>
      <button class="btn btn-primary" 
              onclick="reserveEvent(${event.id}, '${event.title}')"
              ${isAvailable ? '' : 'disabled style="opacity: 0.5; cursor: not-allowed;"'}>
        ${isAvailable ? 'Réserver' : 'Complet'}
      </button>
    `;

    grid.appendChild(card);
  });
}

/**
 * Réserve un événement
 */
function reserveEvent(eventId, eventTitle) {
  alert(`Réservation pour: ${eventTitle}\n\nVeuillez compléter le formulaire de contact ci-dessous avec vos coordonnées.`);
  document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Configure le formulaire de contact
 */
function setupContactForm() {
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      company: document.getElementById('company').value,
      message: document.getElementById('message').value
    };

    try {
      const response = await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert(`Merci ${formData.name}! Votre message a été envoyé. Nous vous recontacterons rapidement à ${formData.email}`);
        form.reset();
      } else {
        alert('Erreur lors de l\'envoi. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    }
  });
}

// Recharger les événements toutes les 30 secondes pour affichage dynamique
setInterval(loadEvents, 30000);
setInterval(loadServices, 60000);

/**
 * Tracker les visiteurs pour les statistiques admin
 */
function trackVisitor() {
  // Incrémenter le compteur de visiteurs pour le jour
  const today = new Date().toISOString().split('T')[0];
  const visitorsKey = `visitorsToday_${today}`;
  
  let visitors = parseInt(localStorage.getItem(visitorsKey) || '0');
  visitors++;
  
  localStorage.setItem(visitorsKey, visitors.toString());
  localStorage.setItem('visitorsToday', visitors.toString());
}
