// Routes pour les messages de contact
const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const { sendNotificationEmail } = require('../config/email');
const router = express.Router();

const messagesPath = path.join(__dirname, '../data/messages.json');

/**
 * Charger les messages depuis le fichier JSON
 */
const loadMessages = () => {
  try {
    const data = fs.readFileSync(messagesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lecture messages:', error);
    return [];
  }
};

/**
 * Sauvegarder les messages dans le fichier JSON
 */
const saveMessages = (messages) => {
  try {
    fs.writeFileSync(messagesPath, JSON.stringify(messages, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde messages:', error);
    return false;
  }
};

/**
 * GET /api/messages
 * Récupère tous les messages (authentification requise)
 */
router.get('/', authMiddleware, (req, res) => {
  const messages = loadMessages();
  const sortedMessages = messages.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  res.json({ success: true, data: sortedMessages });
});

/**
 * GET /api/messages/stats
 * Récupère les statistiques des messages (authentification requise)
 */
router.get('/stats', authMiddleware, (req, res) => {
  const messages = loadMessages();
  const unreadCount = messages.filter(m => !m.read).length;

  res.json({ 
    success: true, 
    data: {
      total: messages.length,
      unread: unreadCount,
      read: messages.length - unreadCount
    }
  });
});

/**
 * POST /api/messages
 * Crée un nouveau message (pas d'authentification requise - formulaire public)
 */
router.post('/', (req, res) => {
  const { name, email, phone, company, message, date, time } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: 'Nom, email et message requis' });
  }

  const messages = loadMessages();
  const newId = messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1;

  const newMessage = {
    id: newId,
    name,
    email,
    phone: phone || '',
    company: company || '',
    message,
    date: date || new Date().toISOString().split('T')[0],
    time: time || new Date().toTimeString().slice(0, 5),
    status: 'pending',
    read: false
  };

  messages.push(newMessage);

  if (saveMessages(messages)) {
    // Construire l'URL admin à partir de la requête
    const adminUrl = `${req.protocol}://${req.get('host')}/admin`;

    // Envoyer l'email de notification en arrière-plan (ne pas bloquer la réponse)
    sendNotificationEmail(newMessage, { adminUrl }).catch(err => {
      console.error('Erreur notification email:', err);
    });
    
    res.status(201).json({ 
      success: true, 
      message: 'Message reçu avec succès',
      data: newMessage 
    });
  } else {
    res.status(500).json({ success: false, message: 'Erreur sauvegarde' });
  }
});

/**
 * PUT /api/messages/:id
 * Marque un message comme lu (authentification requise)
 */
router.put('/:id', authMiddleware, (req, res) => {
  const { read, status } = req.body;
  const messages = loadMessages();
  const messageIndex = messages.findIndex(m => m.id === parseInt(req.params.id));

  if (messageIndex === -1) {
    return res.status(404).json({ success: false, message: 'Message non trouvé' });
  }

  if (read !== undefined) {
    messages[messageIndex].read = read;
  }
  if (status) {
    messages[messageIndex].status = status;
  }

  if (saveMessages(messages)) {
    res.json({ success: true, data: messages[messageIndex] });
  } else {
    res.status(500).json({ success: false, message: 'Erreur sauvegarde' });
  }
});

/**
 * DELETE /api/messages/:id
 * Supprime un message (authentification requise)
 */
router.delete('/:id', authMiddleware, (req, res) => {
  const messages = loadMessages();
  const messageIndex = messages.findIndex(m => m.id === parseInt(req.params.id));

  if (messageIndex === -1) {
    return res.status(404).json({ success: false, message: 'Message non trouvé' });
  }

  const deletedMessage = messages.splice(messageIndex, 1)[0];

  if (saveMessages(messages)) {
    res.json({ success: true, message: 'Message supprimé', data: deletedMessage });
  } else {
    res.status(500).json({ success: false, message: 'Erreur sauvegarde' });
  }
});

module.exports = router;
