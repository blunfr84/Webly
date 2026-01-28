// Serveur Express principal
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const config = require('./config/config');

// Importation des routes
const eventsRoutes = require('./routes/events');
const servicesRoutes = require('./routes/services');
const authRoutes = require('./routes/auth');
const messagesRoutes = require('./routes/messages');
const analyticsRoutes = require('./routes/analytics');
const paymentsRoutes = require('./routes/payments');
const configRoutes = require('./routes/config');

// Initialisation de l'application
const app = express();

// Middlewares globaux
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Routes API
app.use('/api/events', eventsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/config', configRoutes);

app.use(express.static('public'));

// Route racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur' });
});

// Démarrage du serveur
app.listen(config.PORT, () => {
  console.log(`✨ Serveur lancé sur http://localhost:${config.PORT}`);
  console.log(`📄 Page d'accueil : http://localhost:${config.PORT}`);
  console.log(`👨‍💼 Page admin : http://localhost:${config.PORT}/admin`);
});