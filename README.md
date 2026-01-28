# 🚀 Webly - Plateforme de Services Professionnels

Une application web moderne et complète pour vendre et gérer des services de consulting, formations et accompagnement, avec **paiement Stripe intégré** et **notifications email en temps réel**.

## ✨ Fonctionnalités Principales

### 👨‍💼 Pour les Visiteurs
- 📱 Site public responsive avec présentation des services
- 🛒 Panier d'achat interactif
- 💳 **Paiement sécurisé via Stripe** (cartes bancaires)
- 📅 Inscription aux événements
- 💬 Formulaire de contact
- 📊 Analytics de visiteurs (sans compter les IP locales)
- ⚡ Interface moderne et performante

### 🔐 Pour les Administrateurs
- 📊 **Tableau de bord temps réel** avec statistiques clés
- 💼 Gestion complète des services (CRUD)
- 📅 Gestion des événements avec capacité
- 💬 **Gestion des messages/commandes** avec filtres (En attente/Effectuées)
- 📈 Suivi des revenus, taux de conversion et performance
- 🔔 **Notifications email automatiques** pour chaque nouveau message
- 👥 Authentification JWT sécurisée

## 🛠️ Technologies

### Backend
- **Node.js + Express** - Serveur web haute performance
- **Stripe API** - Paiement sécurisé et PCI-DSS compliant
- **Nodemailer** - Notifications email avec templates HTML
- **JWT** - Authentification stateless
- **bcryptjs** - Hashage sécurisé des mots de passe

### Frontend
- **HTML5 + CSS3** - Interface moderne et responsive
- **Vanilla JavaScript** - Zéro dépendances lourdes
- **Stripe.js** - Intégration paiement seamless

### Données
- **JSON Files** - Stockage simple et portable

## 🚀 Installation Rapide

### 1. Prérequis
```bash
- Node.js v14+
- npm
- Compte Stripe gratuit
- Git (optionnel)
```

### 2. Cloner/Télécharger le projet
```bash
git clone https://github.com/votre-username/consultpro.git
cd consultpro
```

### 3. Installer les dépendances
```bash
npm install
```

### 4. Configurer l'environnement
```bash
cp .env.example .env
```

Éditez `.env` et remplissez :
```env
# Stripe (obtenir les clés sur https://dashboard.stripe.com/apikeys)
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email (Gmail avec mot de passe d'application)
EMAIL_USER=hugo.perdereau72@gmail.com
EMAIL_PASSWORD=votre_mot_de_passe_app

# Configuration
BASE_URL=http://localhost:3000
```

### 5. Lancer l'application
```bash
npm start
```

### 6. Accéder aux services
- 🏠 **Site public** : http://localhost:3000
- 👨‍💼 **Admin** : http://localhost:3000/admin.html
  - Identifiant : `hugper`
  - Mot de passe : `admin123`

## 📁 Structure du Projet

```
services-web/
├── config/
│   └── config.js              # Configuration globale
├── data/
│   ├── events.json            # Données événements
│   └── services.json          # Données services
├── middleware/
│   └── auth.js                # Middleware authentification JWT
├── routes/
│   ├── auth.js                # Routes authentification
│   ├── services.js            # Routes API services
│   └── events.js              # Routes API événements
├── public/
│   ├── index.html             # Page d'accueil
│   ├── admin.html             # Page administration
│   ├── css/
│   │   ├── style.css          # Styles page publique
│   │   └── admin.css          # Styles page admin
│   └── js/
│       ├── main.js            # Scripts page publique
│       └── admin.js           # Scripts page admin
├── server.js                  # Point d'entrée serveur
├── package.json               # Dépendances Node.js
└── README.md                  # Documentation

```

## 🚀 Installation et Démarrage

### Prérequis
- Node.js 14+ installé
- npm ou yarn

### Installation

1. **Cloner/Télécharger le projet**
   ```bash
   cd services-web
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Démarrer le serveur**
   ```bash
   npm start
   ```

   Ou en mode développement :
   ```bash
   npm run dev
   ```

4. **Accéder au site**
   - Site public : http://localhost:3000
   - Page admin : http://localhost:3000/admin

## 🔐 Identifiants Admin

- **Identifiant** : `admin`
- **Mot de passe** : `admin123`

⚠️ **Important** : À changer en production ! Modifier dans `config/config.js`

## 📋 Guide d'Utilisation

### Page Publique

1. **Consulter les services** : Scrollez jusqu'à la section "Services"
2. **Voir l'agenda** : Section "Agenda & Disponibilités" avec affichage dynamique
3. **Prendre contact** : Remplissez le formulaire en bas de page

### Page Admin

1. **Connexion** : Entrez identifiant et mot de passe
2. **Tableau de bord** : Vue d'ensemble des statistiques
3. **Gestion Services** : Onglet pour CRUD complet
4. **Gestion Événements** : Onglet pour gérer l'agenda
5. **Déconnexion** : Bouton en bas du sidebar

## 📡 API REST

### Endpoints Publics

#### Services
- `GET /api/services` - Récupérer tous les services
- `GET /api/services/:id` - Récupérer un service spécifique

#### Événements
- `GET /api/events` - Récupérer les événements futurs
- `GET /api/events/:id` - Récupérer un événement spécifique

#### Authentification
- `POST /api/auth/login` - Connexion (body: {username, password})
- `POST /api/auth/verify` - Vérifier token (body: {token})

### Endpoints Protégés (Authentification requise)

#### Services
- `POST /api/services` - Créer un service
- `PUT /api/services/:id` - Modifier un service
- `DELETE /api/services/:id` - Supprimer un service

#### Événements
- `POST /api/events` - Créer un événement
- `PUT /api/events/:id` - Modifier un événement
- `DELETE /api/events/:id` - Supprimer un événement
- `GET /api/events/all` - Récupérer tous les événements (y compris passés)

## 🎨 Personnalisation

### Couleurs
Modifiez dans `public/css/style.css` et `public/css/admin.css` :
```css
--primary-color: #2563eb;      /* Couleur principale */
--accent-color: #f59e0b;       /* Couleur d'accent */
--danger-color: #ef4444;       /* Couleur danger */
--success-color: #10b981;      /* Couleur succès */
```

### Contenu
- Logo/Titre : Modifiez dans `public/index.html` et `public/admin.html`
- Services initiales : Éditez `data/services.json`
- Événements initiaux : Éditez `data/events.json`

### Branding
Remplacez :
- Logo emoji 🚀 ConsultPro par votre branding
- Titre, description et contenu
- Couleurs et polices

## 🔧 Configuration

### Sécurité (Production)

1. **Changer les identifiants admin** dans `config/config.js`
2. **Changer la clé JWT** :
   ```javascript
   JWT_SECRET: 'votre-clé-ultra-secrète-très-longue'
   ```
3. **Activer HTTPS**
4. **Implémenter bcrypt** pour hachage des mots de passe

### Variables d'environnement

Créez un fichier `.env` :
```
PORT=3000
NODE_ENV=production
JWT_SECRET=votre-clé-secrète
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## 🚀 Évolutions Futures

- [ ] Intégration Stripe pour paiements
- [ ] Email notifications
- [ ] Base de données PostgreSQL/MongoDB
- [ ] Système de réservation avancé
- [ ] Analytics
- [ ] Multi-langue
- [ ] CMS complet

## 📝 Notes de Développement

### Rafraîchissement Dynamique
- Événements se mettent à jour toutes les 30 secondes (côté client)
- API en temps réel pour le tableau de bord admin

### Stockage
Les données sont sauvegardées en JSON. Pour production :
- Migrer vers SQLite (npm install sqlite3)
- Ou MongoDB (npm install mongoose)
- Ou PostgreSQL

### Gestion Erreurs
Tous les endpoints retournent :
```json
{
  "success": true/false,
  "data": {...},
  "message": "..."
}
```

## 📦 Dépendances

- `express` - Framework web
- `cors` - Gestion CORS
- `body-parser` - Parsing JSON/formulaires
- `jsonwebtoken` - Authentification JWT
- `bcryptjs` - Hachage mots de passe (à implémenter)

## 🤝 Support et Améliorations

- Consulter les commentaires dans le code
- Architecture modulaire prête pour extensibilité
- Facile à déployer sur Heroku, Vercel, etc.

## 📄 Licence

MIT

---

**Créé pour les professionnels du consulting et de la formation.**
Prêt à être personnalisé et déployé ! 🎉
