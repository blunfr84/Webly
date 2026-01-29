// Routes pour les services
const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');
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
 * Sauvegarder les services dans le fichier JSON
 */
const saveServices = (services) => {
  try {
    fs.writeFileSync(servicesPath, JSON.stringify(services, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde services:', error);
    return false;
  }
};

/**
 * GET /api/services
 * Récupère tous les services
 */
router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const services = loadServices();
  res.json({ success: true, data: services });
});

/**
 * GET /api/services/:id
 * Récupère un service par ID
 */
router.get('/:id', (req, res) => {
  const services = loadServices();
  const service = services.find(s => s.id === parseInt(req.params.id));

  if (!service) {
    return res.status(404).json({ success: false, message: 'Service non trouvé' });
  }

  res.json({ success: true, data: service });
});

/**
 * POST /api/services
 * Crée un nouveau service (authentification requise)
 */
router.post('/', authMiddleware, (req, res) => {
  const { title, description, price, duration, features, category, type, subscriptionPrice } = req.body;

  if (!title || !description) {
    return res.status(400).json({ success: false, message: 'Titre et description requis' });
  }

  const services = loadServices();
  const newId = services.length > 0 ? Math.max(...services.map(s => s.id)) + 1 : 1;

  const newService = {
    id: newId,
    category: category || 'Autre',
    title,
    description,
    type: type || 'one-time',
    price: price || null,
    subscriptionPrice: subscriptionPrice || null,
    duration: duration || null,
    features: features || []
  };

  services.push(newService);
  
  if (saveServices(services)) {
    res.status(201).json({ success: true, data: newService });
  } else {
    res.status(500).json({ success: false, message: 'Erreur sauvegarde' });
  }
});

/**
 * PUT /api/services/:id
 * Met à jour un service (authentification requise)
 */
router.put('/:id', authMiddleware, (req, res) => {
  const { title, description, price, duration, features, category, type, subscriptionPrice } = req.body;
  const services = loadServices();
  const serviceIndex = services.findIndex(s => s.id === parseInt(req.params.id));

  if (serviceIndex === -1) {
    return res.status(404).json({ success: false, message: 'Service non trouvé' });
  }

  const updatedService = {
    ...services[serviceIndex],
    ...(category && { category }),
    ...(type && { type }),
    ...(title && { title }),
    ...(description && { description }),
    ...(price !== undefined && { price }),
    ...(subscriptionPrice !== undefined && { subscriptionPrice }),
    ...(duration !== undefined && { duration }),
    ...(features && { features })
  };

  services[serviceIndex] = updatedService;

  if (saveServices(services)) {
    res.json({ success: true, data: updatedService });
  } else {
    res.status(500).json({ success: false, message: 'Erreur sauvegarde' });
  }
});

/**
 * DELETE /api/services/:id
 * Supprime un service (authentification requise)
 */
router.delete('/:id', authMiddleware, (req, res) => {
  const services = loadServices();
  const serviceIndex = services.findIndex(s => s.id === parseInt(req.params.id));

  if (serviceIndex === -1) {
    return res.status(404).json({ success: false, message: 'Service non trouvé' });
  }

  const deletedService = services.splice(serviceIndex, 1)[0];

  if (saveServices(services)) {
    res.json({ success: true, message: 'Service supprimé', data: deletedService });
  } else {
    res.status(500).json({ success: false, message: 'Erreur sauvegarde' });
  }
});

module.exports = router;
