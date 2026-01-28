// Routes pour l'authentification
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const router = express.Router();

/**
 * POST /api/auth/login
 * Authentifie l'utilisateur et retourne un token JWT
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Vérification basique (À améliorer en production avec bcrypt)
  if (username === config.ADMIN_USERNAME && password === config.ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username, role: 'admin' },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Authentification réussie',
      token,
      user: { username, role: 'admin' }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Identifiant ou mot de passe incorrect'
    });
  }
});

/**
 * POST /api/auth/verify
 * Vérifie la validité du token
 */
router.post('/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ valid: false, message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ valid: false, message: 'Token invalide ou expiré' });
  }
});

module.exports = router;
