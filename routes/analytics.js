// Routes pour les analytics/visiteurs
const express = require('express');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const analyticsPath = path.join(__dirname, '../data/analytics.json');

/**
 * Charger les analytics depuis le fichier JSON
 */
const loadAnalytics = () => {
  try {
    const data = fs.readFileSync(analyticsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lecture analytics:', error);
    return [];
  }
};

/**
 * Sauvegarder les analytics dans le fichier JSON
 */
const saveAnalytics = (analytics) => {
  try {
    fs.writeFileSync(analyticsPath, JSON.stringify(analytics, null, 2));
    return true;
  } catch (error) {
    console.error('Erreur sauvegarde analytics:', error);
    return false;
  }
};

/**
 * GET /api/analytics
 * Récupère les analytics (authentification requise)
 */
router.get('/', authMiddleware, (req, res) => {
  const analytics = loadAnalytics();
  const today = new Date().toISOString().split('T')[0];
  
  let todayAnalytics = analytics.find(a => a.date === today);
  
  if (!todayAnalytics) {
    res.json({ 
      success: true, 
      data: {
        date: today,
        visitors: 0,
        revenue: 0
      }
    });
  } else {
    res.json({ success: true, data: todayAnalytics });
  }
});

/**
 * POST /api/analytics/track
 * Enregistrer une visite (sans authentification - appelé depuis la page publique)
 */
router.post('/track', (req, res) => {
  // Récupérer l'IP du visiteur
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
  
  // Liste des IPs à exclure (localhost et 127.0.0.1)
  const excludedIPs = ['127.0.0.1', '::1', 'localhost', '::ffff:127.0.0.1'];
  const isLocalIP = excludedIPs.some(excludedIP => ip.includes(excludedIP));
  
  // Si c'est une IP locale, ne pas compter
  if (isLocalIP) {
    console.log(`⏭️  Visite locale ignorée (IP: ${ip})`);
    return res.json({ success: true, message: 'Visite locale non comptée', data: null });
  }
  
  const today = new Date().toISOString().split('T')[0];
  const analytics = loadAnalytics();
  
  let todayAnalytics = analytics.find(a => a.date === today);
  
  if (!todayAnalytics) {
    todayAnalytics = {
      id: analytics.length + 1,
      date: today,
      visitors: 1,
      revenue: 0
    };
    analytics.push(todayAnalytics);
  } else {
    todayAnalytics.visitors++;
  }
  
  if (saveAnalytics(analytics)) {
    res.json({ success: true, data: todayAnalytics });
  } else {
    res.status(500).json({ success: false, message: 'Erreur sauvegarde' });
  }
});

/**
 * GET /api/analytics/summary
 * Résumé des analytics (authentification requise)
 */
router.get('/summary', authMiddleware, (req, res) => {
  const analytics = loadAnalytics();
  
  const totalVisitors = analytics.reduce((sum, a) => sum + a.visitors, 0);
  const totalRevenue = analytics.reduce((sum, a) => sum + a.revenue, 0);
  const avgVisitorsPerDay = analytics.length > 0 ? Math.round(totalVisitors / analytics.length) : 0;
  
  res.json({
    success: true,
    data: {
      totalVisitors,
      totalRevenue,
      avgVisitorsPerDay,
      daysTracked: analytics.length,
      analytics: analytics.slice(-30) // 30 derniers jours
    }
  });
});

module.exports = router;
