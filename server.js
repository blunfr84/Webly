// Charger les variables d'environnement
require('dotenv').config();

// Serveur Express principal
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
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

// Sécurité de base
app.disable('x-powered-by');
app.set('trust proxy', config.TRUST_PROXY);

// Headers de sécurité
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "default-src": ["'self'"] ,
      "script-src": ["'self'", "https://js.stripe.com", "'unsafe-inline'"] ,
      "style-src": ["'self'", "'unsafe-inline'"] ,
      "img-src": ["'self'", "data:"] ,
      "connect-src": ["'self'", "https://api.stripe.com"] ,
      "frame-src": ["'self'", "https://js.stripe.com"],
      "object-src": ["'none'"] ,
      "base-uri": ["'self'"] ,
      "frame-ancestors": ["'self'"]
    }
  },
  referrerPolicy: { policy: 'no-referrer' }
}));

// Protection contre la pollution de paramètres
app.use(hpp());

// Middlewares globaux
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (config.CORS_ORIGIN === true) return callback(null, true);
    if (Array.isArray(config.CORS_ORIGIN) && config.CORS_ORIGIN.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(bodyParser.json({ limit: config.BODY_LIMIT }));
app.use(bodyParser.urlencoded({ extended: true, limit: config.BODY_LIMIT }));

// Rate limiting global pour API
const apiLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Trop de requêtes, réessayez plus tard.' }
});
app.use('/api', apiLimiter);

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

// Route racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route admin
app.get(["/admin", "/admin/", "/admin.html"], (req, res) => {
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