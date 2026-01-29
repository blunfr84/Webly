// Configuration de l'application
const corsOriginEnv = process.env.CORS_ORIGIN;
const corsOrigin = corsOriginEnv
  ? corsOriginEnv.split(',').map(origin => origin.trim()).filter(Boolean)
  : true;

module.exports = {
  // [MODIFIABLE] Port d'écoute du serveur - Changer selon votre environnement (production, staging)
  PORT: process.env.PORT || 3000,
  
  // [MODIFIABLE] Environnement d'exécution - 'development', 'production', 'staging'
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // [MODIFIABLE] Clé secrète JWT - OBLIGATOIRE à changer en production pour des raisons de sécurité
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
  
  // [MODIFIABLE] Identifiant administrateur - À personnaliser selon vos besoins
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'hugper',
  
  // [MODIFIABLE] Mot de passe administrateur - CRITIQUE en production, utiliser des variables d'environnement
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Huyagonis72450#',
  
  // [MODIFIABLE] Origines CORS autorisées - Ajouter vos domaines de production/staging
  // Par défaut, on reflète l'origine entrante pour autoriser le front si hébergé ailleurs.
  CORS_ORIGIN: corsOrigin
};
