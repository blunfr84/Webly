// Configuration de l'application
module.exports = {
  // [MODIFIABLE] Port d'écoute du serveur - Changer selon votre environnement (production, staging)
  PORT: process.env.PORT || 3000,
  
  // [MODIFIABLE] Environnement d'exécution - 'development', 'production', 'staging'
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // [MODIFIABLE] Clé secrète JWT - OBLIGATOIRE à changer en production pour des raisons de sécurité
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  
  // [MODIFIABLE] Identifiant administrateur - À personnaliser selon vos besoins
  ADMIN_USERNAME: 'hugper',
  
  // [MODIFIABLE] Mot de passe administrateur - CRITIQUE en production, utiliser des variables d'environnement
  ADMIN_PASSWORD: 'Huyagonis72450',
  
  // [MODIFIABLE] Origines CORS autorisées - Ajouter vos domaines de production/staging
  CORS_ORIGIN: ['http://localhost:3000', 'http://127.0.0.1:3000']
};
