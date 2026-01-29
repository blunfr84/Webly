// Routes pour les événements/agenda
const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const eventsPath = path.join(__dirname, '../data/events.json');

/**
 * Charger les événements depuis le fichier JSON
 */
const loadEvents = () => {
  try {
    const data = fs.readFileSync(eventsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lecture événements:', error);
    return [];
  }
};

/**
 * Sauvegarder les événements dans le fichier JSON
 */
const saveEvents = (events) => {
  try {
    fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde événements:', error);
    return false;
  }
};

/**
 * GET /api/events
 * Récupère tous les événements
 */
router.get('/', (req, res) => {
  res.set('Cache-Control', 'no-store');
  const events = loadEvents();
  // Filtrer les événements futurs par défaut
  const futureEvents = events.filter(event => {
    const eventDate = new Date(`${event.date}T${event.time}`);
    return eventDate >= new Date();
  }).sort((a, b) => {
    return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
  });

  res.json({ success: true, data: futureEvents });
});

/**
 * GET /api/events/all
 * Récupère tous les événements (y compris passés)
 */
router.get('/all', authMiddleware, (req, res) => {
  const events = loadEvents();
  const sortedEvents = events.sort((a, b) => {
    return new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`);
  });

  res.json({ success: true, data: sortedEvents });
});

/**
 * GET /api/events/:id
 * Récupère un événement par ID
 */
router.get('/:id', (req, res) => {
  const events = loadEvents();
  const event = events.find(e => e.id === parseInt(req.params.id));

  if (!event) {
    return res.status(404).json({ success: false, message: 'Événement non trouvé' });
  }

  res.json({ success: true, data: event });
});

/**
 * POST /api/events
 * Crée un nouvel événement (authentification requise)
 */
router.post('/', authMiddleware, (req, res) => {
  const { title, date, time, duration, maxParticipants } = req.body;

  if (!title || !date || !time) {
    return res.status(400).json({ success: false, message: 'Titre, date et heure requis' });
  }

  const events = loadEvents();
  const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;

  const newEvent = {
    id: newId,
    title,
    date,
    time,
    duration: duration || 60,
    maxParticipants: maxParticipants || 1,
    participants: 0,
    status: 'available'
  };

  events.push(newEvent);

  if (saveEvents(events)) {
    res.status(201).json({ success: true, data: newEvent });
  } else {
    res.status(500).json({ success: false, message: 'Erreur sauvegarde' });
  }
});

/**
 * PUT /api/events/:id
 * Met à jour un événement (authentification requise)
 */
router.put('/:id', authMiddleware, (req, res) => {
  const { title, date, time, duration, maxParticipants, participants, status } = req.body;
  const events = loadEvents();
  const eventIndex = events.findIndex(e => e.id === parseInt(req.params.id));

  if (eventIndex === -1) {
    return res.status(404).json({ success: false, message: 'Événement non trouvé' });
  }

  const updatedEvent = {
    ...events[eventIndex],
    ...(title && { title }),
    ...(date && { date }),
    ...(time && { time }),
    ...(duration !== undefined && { duration }),
    ...(maxParticipants !== undefined && { maxParticipants }),
    ...(participants !== undefined && { participants }),
    ...(status && { status })
  };

  events[eventIndex] = updatedEvent;

  if (saveEvents(events)) {
    res.json({ success: true, data: updatedEvent });
  } else {
    res.status(500).json({ success: false, message: 'Erreur sauvegarde' });
  }
});

/**
 * DELETE /api/events/:id
 * Supprime un événement (authentification requise)
 */
router.delete('/:id', authMiddleware, (req, res) => {
  const events = loadEvents();
  const eventIndex = events.findIndex(e => e.id === parseInt(req.params.id));

  if (eventIndex === -1) {
    return res.status(404).json({ success: false, message: 'Événement non trouvé' });
  }

  const deletedEvent = events.splice(eventIndex, 1)[0];

  if (saveEvents(events)) {
    res.json({ success: true, message: 'Événement supprimé', data: deletedEvent });
  } else {
    res.status(500).json({ success: false, message: 'Erreur sauvegarde' });
  }
});

module.exports = router;
