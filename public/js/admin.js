// Script pour le panneau administrateur

const API_BASE = `${window.location.origin}/api`;
let currentToken = localStorage.getItem('token');
let editingId = null;
let editingType = null; // 'service' ou 'event'

// Au chargement
document.addEventListener('DOMContentLoaded', () => {
  if (currentToken) {
    verifyToken();
  } else {
    showLoginPage();
  }

  // Configuration des formulaires
  document.getElementById('service-form').addEventListener('submit', saveService);
  document.getElementById('event-form').addEventListener('submit', saveEvent);

  // Fermer modales quand on clique en dehors
  window.addEventListener('click', (e) => {
    const serviceModal = document.getElementById('service-modal');
    const eventModal = document.getElementById('event-modal');
    
    if (e.target === serviceModal) closeServiceModal();
    if (e.target === eventModal) closeEventModal();
  });
  
  // Mettre à jour le dashboard en direct toutes les 10 secondes
  setInterval(() => {
    if (currentToken) {
      loadDashboard();
      loadMessages();
    }
  }, 10000);
});

/**
 * ===== AUTHENTIFICATION =====
 */

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (data.success) {
      currentToken = data.token;
      localStorage.setItem('token', currentToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      showDashboard();
      loadAllData();
    } else {
      showError('login', data.message || 'Identifiant ou mot de passe incorrect');
    }
  } catch (error) {
    showError('login', 'Erreur de connexion');
    console.error(error);
  }
});

function verifyToken() {
  fetch(`${API_BASE}/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: currentToken })
  })
  .then(r => r.json())
  .then(data => {
    if (data.valid) {
      showDashboard();
      loadAllData();
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      document.getElementById('current-user').textContent = user.username || 'admin';
    } else {
      logout();
    }
  })
  .catch(error => {
    console.error(error);
    logout();
  });
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  currentToken = null;
  showLoginPage();
}

function showLoginPage() {
  document.getElementById('login-page').style.display = 'block';
  document.getElementById('dashboard').classList.remove('active');
}

function showDashboard() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('dashboard').classList.add('active');
}

/**
 * ===== ONGLETS =====
 */

function switchTab(tabName) {
  // Masquer tous les onglets
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  // Désactiver tous les liens menu
  document.querySelectorAll('.menu-link').forEach(link => {
    link.classList.remove('active');
  });

  // Afficher l'onglet sélectionné
  document.getElementById(tabName + '-tab').classList.add('active');

  // Activer le lien menu
  event.target.classList.add('active');

  // Mise à jour du titre
  const titles = {
    'dashboard': 'Tableau de bord',
    'services': 'Gestion des Services',
    'events': 'Gestion des Événements',
    'messages': 'Messages & Commandes'
  };
  document.getElementById('page-title').textContent = titles[tabName] || 'Tableau de bord';
  
  // Si on accède à l'onglet messages, réinitialiser le filtre à 'pending'
  if (tabName === 'messages') {
    currentMessageFilter = 'pending';
    // Mettre à jour les boutons de filtre
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelectorAll('.filter-btn')[1].classList.add('active'); // Deuxième bouton = 'En attente'
    loadMessages();
  }
}

/**
 * ===== CHARGEMENT DES DONNÉES =====
 */

async function loadAllData() {
  loadServices();
  loadEvents();
  loadMessages();
  loadDashboard();
}

async function loadServices() {
  try {
    const response = await fetch(`${API_BASE}/services`);
    const data = await response.json();

    if (data.success) {
      displayServices(data.data);
    }
  } catch (error) {
    console.error('Erreur chargement services:', error);
  }
}

async function loadEvents() {
  try {
    const response = await fetch(`${API_BASE}/events/all`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await response.json();

    if (data.success) {
      displayEvents(data.data);
    }
  } catch (error) {
    console.error('Erreur chargement événements:', error);
  }
}

async function loadDashboard() {
  try {
    const [servicesRes, eventsRes, messagesRes] = await Promise.all([
      fetch(`${API_BASE}/services`),
      fetch(`${API_BASE}/events`),
      fetch(`${API_BASE}/messages`)
    ]);

    const services = await servicesRes.json();
    const events = await eventsRes.json();
    const messages = await messagesRes.json();

    // Statistiques services et événements
    document.getElementById('stat-services').textContent = services.data?.length || 0;
    document.getElementById('stat-events').textContent = events.data?.length || 0;
    
    // Calcul du chiffre d'affaires à partir des commandes (messages)
    let totalRevenue = 0;
    if (messages.data) {
      messages.data.forEach(message => {
        // Chercher "TOTAL: XXX€" dans le message de commande
        const totalMatch = message.message.match(/TOTAL:\s*([\d.]+)€/);
        if (totalMatch) {
          totalRevenue += parseFloat(totalMatch[1]);
        }
      });
    }
    
    // Mettre à jour avec animation
    updateStatWithAnimation('stat-revenue', totalRevenue.toFixed(2) + '€');
    updateStatWithAnimation('stat-services', services.data?.length || 0);
    updateStatWithAnimation('stat-events', events.data?.length || 0);

    // Visiteurs (depuis analytics)
    loadVisitorStats();

    // Performance des services par catégorie (avec données réelles des commandes)
    displayServicePerformance(services.data || [], messages.data || []);

    // Derniers événements
    const upcomingEvents = events.data?.slice(0, 5) || [];
    displayDashboardEvents(upcomingEvents);

    // Taux de conversion
    const visitorCount = parseInt(document.getElementById('stat-visitors').textContent) || 0;
    const totalOrders = (messages.data?.length || 0);
    const conversionRate = visitorCount > 0 ? Math.round((totalOrders / visitorCount) * 100) : 0;
    updateStatWithAnimation('conversion-rate', conversionRate + '%');

    // Revenu moyen par commande
    const avgRevenue = totalOrders > 0 
      ? Math.round(totalRevenue / totalOrders)
      : 0;
    updateStatWithAnimation('avg-revenue', avgRevenue + '€');

    // Activité récente
    displayRecentActivity();
  } catch (error) {
    console.error('Erreur chargement dashboard:', error);
  }
}

/**
 * Met à jour une statistique avec une animation
 */
function updateStatWithAnimation(elementId, newValue) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const oldValue = element.textContent;
  
  // Ajouter la classe d'animation si la valeur a changé
  if (oldValue !== newValue) {
    element.classList.add('stat-update');
    element.textContent = newValue;
    
    // Retirer la classe après l'animation
    setTimeout(() => {
      element.classList.remove('stat-update');
    }, 600);
  }
}

function displayDashboardEvents(events) {
  const tbody = document.getElementById('dashboard-events-body');
  tbody.innerHTML = '';

  if (events.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">Aucun événement à venir</td></tr>';
    return;
  }

  events.forEach(event => {
    const row = document.createElement('tr');
    const date = new Date(`${event.date}T${event.time}`);
    const dateFormatted = date.toLocaleDateString('fr-FR');
    
    row.innerHTML = `
      <td><strong>${event.title}</strong></td>
      <td>${dateFormatted} ${event.time}</td>
      <td>${event.participants}/${event.maxParticipants}</td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * ===== CHARGEMENT MESSAGES =====
 */

async function loadMessages() {
  try {
    const response = await fetch(`${API_BASE}/messages`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await response.json();

    if (data.success) {
      displayMessages(data.data);
      
      // Mettre à jour le chiffre d'affaires
      updateRevenueStats(data.data);
    }
  } catch (error) {
    console.error('Erreur chargement messages:', error);
  }
}

/**
 * Met à jour les statistiques de chiffre d'affaires
 */
function updateRevenueStats(messages) {
  let totalRevenue = 0;
  if (messages) {
    messages.forEach(message => {
      // Chercher "TOTAL: XXX€" dans le message de commande
      const totalMatch = message.message.match(/TOTAL:\s*([\d.]+)€/);
      if (totalMatch) {
        totalRevenue += parseFloat(totalMatch[1]);
      }
    });
  }
  
  // Mettre à jour le chiffre d'affaires
  const revenueElement = document.getElementById('stat-revenue');
  if (revenueElement) {
    revenueElement.textContent = totalRevenue.toFixed(2) + '€';
  }
  
  // Mettre à jour la moyenne par commande
  const avgRevenueElement = document.getElementById('avg-revenue');
  if (avgRevenueElement && messages && messages.length > 0) {
    const avgRevenue = Math.round(totalRevenue / messages.length);
    avgRevenueElement.textContent = avgRevenue + '€';
  }
}

/**
 * ===== AFFICHAGE SERVICES =====
 */

function displayServices(services) {
  const tbody = document.getElementById('services-tbody');
  tbody.innerHTML = '';

  services.forEach(service => {
    const row = document.createElement('tr');
    const type = service.type === 'subscription' ? 'Abonnement' : 'Achat unique';
    const price = service.price ? `${service.price}€` : 'Sur devis';
    const subscriptionPrice = service.subscriptionPrice ? ` / ${service.subscriptionPrice}€/mois` : '';
    const duration = service.duration ? formatDuration(service.duration) : '-';
    const category = service.category || 'Non catégorisé';

    row.innerHTML = `
      <td><strong>${service.title}</strong></td>
      <td>${category}</td>
      <td style="text-align: center;"><span style="color: ${service.type === 'subscription' ? '#10b981' : '#2563eb'}; font-weight: 600;">${type}</span></td>
      <td style="text-align: center;">${price}${subscriptionPrice}</td>
      <td style="text-align: center;">${duration}</td>
      <td>
        <div class="actions">
          <button class="action-btn edit-btn btn-sm" onclick="editService(${service.id})">Modifier</button>
          <button class="action-btn delete-btn btn-sm" onclick="deleteService(${service.id})">Supprimer</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * ===== AFFICHAGE MESSAGES =====
 */

// Variable globale pour stocker le filtre actif
let currentMessageFilter = 'pending';

/**
 * Filtre les messages par statut
 */
function filterMessagesByStatus(status) {
  currentMessageFilter = status;
  
  // Mettre à jour les boutons actifs
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Recharger et afficher les messages
  loadMessages();
}

function displayMessages(messages) {
  const tbody = document.getElementById('messages-tbody');
  tbody.innerHTML = '';

  // Filtrer les messages selon le statut actif
  let filteredMessages = messages;
  if (currentMessageFilter === 'pending') {
    filteredMessages = messages.filter(m => !m.status || m.status === 'pending');
  } else if (currentMessageFilter === 'completed') {
    filteredMessages = messages.filter(m => m.status === 'completed');
  }

  // Mettre à jour le compteur
  const pendingCount = messages.filter(m => !m.status || m.status === 'pending').length;
  const completedCount = messages.filter(m => m.status === 'completed').length;
  
  document.getElementById('messages-count').textContent = 
    `${filteredMessages.length}/${messages.length} - En attente: ${pendingCount} | Effectuées: ${completedCount}`;

  // Mettre à jour le badge
  if (pendingCount > 0) {
    document.getElementById('badge-messages').textContent = pendingCount;
    document.getElementById('badge-messages').style.display = 'inline-flex';
    document.getElementById('badge-messages').style.alignItems = 'center';
    document.getElementById('badge-messages').style.justifyContent = 'center';
  } else {
    document.getElementById('badge-messages').style.display = 'none';
  }

  if (filteredMessages.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">Aucun message ${currentMessageFilter !== 'all' ? 'pour ce filtre' : ''}</td></tr>`;
    return;
  }

  filteredMessages.forEach(message => {
    const row = document.createElement('tr');
    const date = new Date(message.date);
    const dateFormatted = date.toLocaleDateString('fr-FR');
    const timeFormatted = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    const isPending = !message.status || message.status === 'pending';
    const rowStyle = !message.read ? 'background-color: #fef3c7;' : '';
    
    const statusBadge = isPending 
      ? '<span style="background: #fbbf24; color: #78350f; padding: 0.25rem 0.75rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem;">⏳ En attente</span>'
      : '<span style="background: #a7f3d0; color: #065f46; padding: 0.25rem 0.75rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem;">✅ Effectuée</span>';

    row.innerHTML = `
      <td style="${rowStyle}"><strong>${message.name}</strong></td>
      <td style="${rowStyle}">${message.email}</td>
      <td style="${rowStyle}">${message.phone || '-'}</td>
      <td style="${rowStyle}">
        <span title="${message.message}">${message.message.substring(0, 40)}${message.message.length > 40 ? '...' : ''}</span>
      </td>
      <td style="${rowStyle}">${statusBadge}</td>
      <td style="${rowStyle}">${dateFormatted} ${timeFormatted}</td>
      <td>
        <div class="actions">
          <button class="action-btn edit-btn btn-sm" onclick="showMessageDetail(${message.id}, \`${message.message.replace(/`/g, '\\`')}\`)">Voir</button>
          <button class="action-btn ${isPending ? 'success' : 'warning'}-btn btn-sm" onclick="toggleMessageStatus(${message.id}, ${isPending})">${isPending ? '✓ Marquer effectuée' : '↩️ Réouvrir'}</button>
          <button class="action-btn delete-btn btn-sm" onclick="deleteMessage(${message.id})">Supprimer</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * Affiche les détails du message dans un modal
 */
function showMessageDetail(messageId, messageContent) {
  const modal = document.getElementById('message-modal');
  const detailContent = document.getElementById('message-detail-content');
  
  detailContent.textContent = messageContent;
  modal.classList.add('active');
}

/**
 * Ferme le modal des détails du message
/**
 * Ferme le modal des détails du message
 */
function closeMessageModal() {
  const modal = document.getElementById('message-modal');
  modal.classList.remove('active');
}

/**
 * Bascule le statut d'un message (en attente/effectué)
 */
function toggleMessageStatus(messageId, isPending) {
  const newStatus = isPending ? 'completed' : 'pending';
  
  fetch(`${API_BASE}/messages/${messageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify({ status: newStatus })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      showSuccess(`Commande marquée comme ${newStatus === 'completed' ? 'effectuée' : 'en attente'}`);
      loadMessages();
    } else {
      showError('messages', 'Erreur lors de la mise à jour du statut');
    }
  })
  .catch(error => {
    console.error('Erreur:', error);
    showError('messages', 'Erreur de connexion');
  });
}

/**
 * ===== AFFICHAGE ÉVÉNEMENTS =====
 */

function displayEvents(events) {
  const tbody = document.getElementById('events-tbody');
  tbody.innerHTML = '';

  events.forEach(event => {
    const row = document.createElement('tr');
    const date = new Date(`${event.date}T${event.time}`);
    const dateFormatted = date.toLocaleDateString('fr-FR');

    row.innerHTML = `
      <td><strong>${event.title}</strong></td>
      <td>${dateFormatted} ${event.time}</td>
      <td>${event.participants}/${event.maxParticipants}</td>
      <td>
        <div class="actions">
          <button class="action-btn edit-btn btn-sm" onclick="editEvent(${event.id})">Modifier</button>
          <button class="action-btn delete-btn btn-sm" onclick="deleteEvent(${event.id})">Supprimer</button>
        </div>
      </td>
    `;
    tbody.appendChild(row);
  });
}

/**
 * ===== GESTION SERVICES =====
 */

function openServiceModal(serviceId = null) {
  editingId = serviceId;
  const form = document.getElementById('service-form');
  
  if (serviceId) {
    document.getElementById('service-modal-title').textContent = 'Modifier le service';
    // Charger les données du service
    fetch(`${API_BASE}/services/${serviceId}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const s = data.data;
          document.getElementById('service-category').value = s.category || '';
          document.getElementById('service-type').value = s.type || 'one-time';
          document.getElementById('service-title').value = s.title;
          document.getElementById('service-description').value = s.description;
          document.getElementById('service-price').value = s.price || '';
          document.getElementById('service-subscription-price').value = s.subscriptionPrice || '';
          document.getElementById('service-duration').value = s.duration || '';
          document.getElementById('service-features').value = (s.features || []).join('\n');
          toggleSubscriptionPrice();
        }
      });
  } else {
    document.getElementById('service-modal-title').textContent = 'Ajouter un service';
    document.getElementById('service-type').value = 'one-time';
    form.reset();
    toggleSubscriptionPrice();
  }
  
  document.getElementById('service-modal').classList.add('active');
}

function closeServiceModal() {
  document.getElementById('service-modal').classList.remove('active');
  editingId = null;
}

async function saveService(e) {
  e.preventDefault();

  const serviceData = {
    category: document.getElementById('service-category').value || 'Autre',
    type: document.getElementById('service-type').value || 'one-time',
    title: document.getElementById('service-title').value,
    description: document.getElementById('service-description').value,
    price: document.getElementById('service-price').value ? parseFloat(document.getElementById('service-price').value) : null,
    subscriptionPrice: document.getElementById('service-subscription-price').value ? parseFloat(document.getElementById('service-subscription-price').value) : null,
    duration: document.getElementById('service-duration').value ? parseInt(document.getElementById('service-duration').value) : null,
    features: document.getElementById('service-features').value.split('\n').filter(f => f.trim())
  };

  const url = editingId ? `${API_BASE}/services/${editingId}` : `${API_BASE}/services`;
  const method = editingId ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify(serviceData)
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Service enregistré avec succès');
      closeServiceModal();
      loadServices();
    } else {
      showAlert('error', data.message || 'Erreur lors de l\'enregistrement');
    }
  } catch (error) {
    showAlert('error', 'Erreur lors de l\'enregistrement');
    console.error(error);
  }
}

async function editService(serviceId) {
  openServiceModal(serviceId);
}

async function deleteService(serviceId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) return;

  try {
    const response = await fetch(`${API_BASE}/services/${serviceId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Service supprimé avec succès');
      loadServices();
    } else {
      showAlert('error', 'Erreur lors de la suppression');
    }
  } catch (error) {
    showAlert('error', 'Erreur lors de la suppression');
    console.error(error);
  }
}

/**
 * ===== GESTION ÉVÉNEMENTS =====
 */

function openEventModal(eventId = null) {
  editingId = eventId;
  const form = document.getElementById('event-form');

  if (eventId) {
    document.getElementById('event-modal-title').textContent = 'Modifier l\'événement';
    fetch(`${API_BASE}/events/${eventId}`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const e = data.data;
          document.getElementById('event-title').value = e.title;
          document.getElementById('event-date').value = e.date;
          document.getElementById('event-time').value = e.time;
          document.getElementById('event-duration').value = e.duration;
          document.getElementById('event-max').value = e.maxParticipants;
          document.getElementById('event-participants').value = e.participants;
        }
      });
  } else {
    document.getElementById('event-modal-title').textContent = 'Ajouter un événement';
    form.reset();
  }

  document.getElementById('event-modal').classList.add('active');
}

function closeEventModal() {
  document.getElementById('event-modal').classList.remove('active');
  editingId = null;
}

async function saveEvent(e) {
  e.preventDefault();

  const eventData = {
    title: document.getElementById('event-title').value,
    date: document.getElementById('event-date').value,
    time: document.getElementById('event-time').value,
    duration: parseInt(document.getElementById('event-duration').value),
    maxParticipants: parseInt(document.getElementById('event-max').value),
    participants: parseInt(document.getElementById('event-participants').value)
  };

  const url = editingId ? `${API_BASE}/events/${editingId}` : `${API_BASE}/events`;
  const method = editingId ? 'PUT' : 'POST';

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify(eventData)
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Événement enregistré avec succès');
      closeEventModal();
      loadEvents();
      loadDashboard();
    } else {
      showAlert('error', data.message || 'Erreur lors de l\'enregistrement');
    }
  } catch (error) {
    showAlert('error', 'Erreur lors de l\'enregistrement');
    console.error(error);
  }
}

async function editEvent(eventId) {
  openEventModal(eventId);
}

async function deleteEvent(eventId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

  try {
    const response = await fetch(`${API_BASE}/events/${eventId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Événement supprimé avec succès');
      loadEvents();
      loadDashboard();
    } else {
      showAlert('error', 'Erreur lors de la suppression');
    }
  } catch (error) {
    showAlert('error', 'Erreur lors de la suppression');
    console.error(error);
  }
}

/**
 * ===== UTILITAIRES =====
 */

function showSuccess(message) {
  showAlert('success', message);
}

function showError(page, message) {
  if (page === 'login') {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-message').style.display = 'block';
  }
}

function showAlert(type, message) {
  const alertId = type === 'success' ? 'success-alert' : 'error-alert';
  const alert = document.getElementById(alertId);
  alert.textContent = message;
  alert.classList.add('active');

  setTimeout(() => {
    alert.classList.remove('active');
  }, 3000);
}

/**
 * ===== GESTION MESSAGES =====
 */

function viewMessage(messageId, name, email, company, message) {
  alert(`📧 Message de ${name}

Email: ${email}
Entreprise: ${company || '(non renseignée)'}

---

${message}`);
  
  // Marquer comme lu
  fetch(`${API_BASE}/messages/${messageId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${currentToken}`
    },
    body: JSON.stringify({ read: true })
  })
  .then(r => r.json())
  .then(data => {
    if (data.success) {
      loadMessages();
    }
  })
  .catch(error => console.error(error));
}

async function deleteMessage(messageId) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) return;

  try {
    const response = await fetch(`${API_BASE}/messages/${messageId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    const data = await response.json();

    if (data.success) {
      showSuccess('Message supprimé avec succès');
      loadMessages();
    } else {
      showAlert('error', 'Erreur lors de la suppression');
    }
  } catch (error) {
    showAlert('error', 'Erreur lors de la suppression');
    console.error(error);
  }
}

/**
 * ===== DASHBOARD AMÉLIORÉ =====
 */

async function loadVisitorStats() {
  try {
    // Récupérer les stats de visiteurs depuis l'API
    const response = await fetch(`${API_BASE}/analytics`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const data = await response.json();
    
    if (data.success && data.data) {
      const visitorsToday = data.data.visitors || 0;
      document.getElementById('stat-visitors').textContent = visitorsToday;
    } else {
      document.getElementById('stat-visitors').textContent = '0';
    }
  } catch (error) {
    console.error('Erreur chargement visiteurs:', error);
    document.getElementById('stat-visitors').textContent = '0';
  }
}

function displayServicePerformance(services) {
  // Grouper les services par catégorie et compter
  const categories = {};
  
  services.forEach(service => {
    const cat = service.category || 'Autre';
    categories[cat] = (categories[cat] || 0) + 1;
  });

  const total = Object.values(categories).reduce((a, b) => a + b, 0);

  // Mettre à jour les barres de performance avec animation
  const categoryKeys = {
    'Consultations': 'consultations',
    'Audits & Analyses': 'audits',
    'Formations': 'formations',
    'Accompagnement': 'accompagnement'
  };

  Object.entries(categoryKeys).forEach(([catName, varName]) => {
    const count = categories[catName] || 0;
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    
    const perfElement = document.getElementById(`perf-${varName}`);
    const barElement = document.getElementById(`perf-bar-${varName}`);
    
    if (perfElement) {
      const oldValue = perfElement.textContent;
      perfElement.textContent = percentage + '%';
      
      // Ajouter l'animation si la valeur a changé
      if (oldValue !== percentage + '%') {
        perfElement.classList.add('perf-update');
        setTimeout(() => perfElement.classList.remove('perf-update'), 600);
      }
    }
    
    if (barElement) {
      const oldWidth = barElement.style.width;
      barElement.style.width = percentage + '%';
      
      // Ajouter l'animation si la largeur a changé
      if (oldWidth !== percentage + '%') {
        barElement.classList.add('bar-update');
        setTimeout(() => barElement.classList.remove('bar-update'), 600);
      }
    }
  });
}

async function displayRecentActivity() {
  try {
    // Récupérer les données réelles
    const [messagesRes, servicesRes] = await Promise.all([
      fetch(`${API_BASE}/messages`, { headers: { 'Authorization': `Bearer ${currentToken}` } }),
      fetch(`${API_BASE}/services`)
    ]);

    const messagesData = await messagesRes.json();
    const servicesData = await servicesRes.json();
    
    const activities = [];
    
    // Ajouter les messages récents
    if (messagesData.data) {
      messagesData.data.slice(0, 3).forEach(message => {
        const date = new Date(message.date + ' ' + (message.time || '00:00'));
        const timeAgo = getTimeAgo(date);
        
        activities.push({
          icon: '💰',
          title: `Commande de ${message.name}`,
          time: timeAgo
        });
      });
    }
    
    // Ajouter les derniers services
    if (servicesData.data) {
      servicesData.data.slice(0, 2).forEach(service => {
        activities.push({
          icon: '📦',
          title: `Service: ${service.title}`,
          time: 'Disponible'
        });
      });
    }
    
    // Ajouter des informations générales
    activities.push({
      icon: '👥',
      title: `${messagesData.data?.length || 0} commandes`,
      time: 'En total'
    });

    const container = document.getElementById('recent-events-list');
    
    // Vérifier si le contenu a changé
    const newHTML = activities.map(activity => `
      <div class="activity-item activity-fade-in">
        <div class="activity-icon">${activity.icon}</div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-time">${activity.time}</div>
        </div>
      </div>
    `).join('');
    
    if (container && container.innerHTML !== newHTML) {
      container.innerHTML = newHTML;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des activités récentes:', error);
  }
}

/**
 * Calcule le temps écoulé depuis une date
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'à l\'instant';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Il y a ${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

// Fonction pour afficher/masquer le champ de prix d'abonnement
function toggleSubscriptionPrice() {
  const serviceType = document.getElementById('service-type').value;
  const subscriptionPriceGroup = document.getElementById('subscription-price-group');
  
  if (serviceType === 'subscription') {
    subscriptionPriceGroup.style.display = 'block';
  } else {
    subscriptionPriceGroup.style.display = 'none';
  }
}

// Rafraîchir les données toutes les 30 secondes
setInterval(() => {
  if (currentToken) {
    loadAllData();
  }
}, 30000);
