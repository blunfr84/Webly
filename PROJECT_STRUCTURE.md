# 📦 Structure Webly - Prêt pour GitHub

## 📂 Arborescence du Projet

```
webly/
│
├─ 📄 Configuration & Documentation
│  ├─ README.md                 ✅ Guide complet du projet
│  ├─ GETTING_STARTED.md        ✅ Démarrage rapide
│  ├─ STRIPE_SETUP.md           ✅ Configuration Stripe
│  ├─ GITHUB_SETUP.md           ✅ Mise en ligne GitHub
│  ├─ GIT_COMMANDS.md           ✅ Commandes Git référence
│  ├─ CHANGELOG.md              ✅ Historique des versions
│  ├─ LICENSE                   ✅ Licence MIT
│  ├─ .env.example              ✅ Template variables env
│  ├─ .gitignore                ✅ Fichiers à ignorer
│  └─ package.json              ✅ Dépendances Node
│
├─ 🚀 Backend (Node.js + Express)
│  ├─ server.js                 ✅ Point d'entrée
│  │
│  ├─ config/
│  │  ├─ config.js              ✅ Config globale
│  │  ├─ stripe.js              ✅ Config Stripe
│  │  └─ email.js               ✅ Config Nodemailer
│  │
│  ├─ middleware/
│  │  └─ auth.js                ✅ Authentification JWT
│  │
│  ├─ routes/
│  │  ├─ auth.js                ✅ Connexion/vérification
│  │  ├─ services.js            ✅ Gestion services
│  │  ├─ events.js              ✅ Gestion événements
│  │  ├─ messages.js            ✅ Gestion messages + email
│  │  ├─ analytics.js           ✅ Tracking visiteurs
│  │  ├─ payments.js            ✅ Paiement Stripe
│  │  └─ config.js              ✅ API config (clé pub Stripe)
│  │
│  └─ data/
│     ├─ services.json          📊 Catalogue services
│     ├─ events.json            📅 Événements
│     ├─ messages.json          💬 Messages/commandes
│     └─ analytics.json         📈 Visiteurs du jour
│
├─ 🎨 Frontend (HTML/CSS/JS)
│  ├─ public/
│  │
│  ├─ Pages HTML
│  │  ├─ index.html             🏠 Accueil
│  │  ├─ services.html          🛍️ Catalogue + panier
│  │  ├─ admin.html             👨‍💼 Dashboard admin
│  │  └─ payment-success.html    ✅ Confirmation paiement
│  │
│  ├─ css/
│  │  ├─ style.css              🎨 Styles publics
│  │  └─ admin.css              🎨 Styles admin
│  │
│  └─ js/
│     ├─ main.js                🎯 Accueil
│     ├─ services.js            🛍️ Catalogue services
│     ├─ admin.js               👨‍💼 Dashboard admin
│     ├─ cart.js                🛒 Gestion panier
│     ├─ utils.js               🔧 Utilitaires
│     ├─ stripe-payment.js      💳 Intégration Stripe
│     └─ admin.js               👨‍💼 Dashboard admin
│
└─ 🔧 Scripts Git (optionnel)
   ├─ init-github.ps1           💻 PowerShell Windows
   ├─ init-github.bat           💻 Batch Windows
   └─ init-github.sh            💻 Bash Unix/Mac
```

## 📋 Fichiers Importants

### 🔒 À NE PAS COMMITER (protégés par .gitignore)
```
.env                  ❌ Clés Stripe et mots de passe
node_modules/         ❌ Dépendances (réinstallées avec npm install)
*.log                 ❌ Fichiers log
.DS_Store             ❌ Fichiers système macOS
```

### ✅ À COMMITER
```
Tous les autres fichiers, notamment :
✅ Code source (HTML, CSS, JS)
✅ Configuration template (.env.example)
✅ Documentation (README, guides)
✅ package.json (référence des dépendances)
✅ .gitignore (protection des fichiers sensibles)
✅ LICENSE (conditions d'utilisation)
```

## 🚀 Flux de Déploiement

```
Local Machine
    ↓ npm install
    ↓ npm start (http://localhost:3000)
    ↓
GitHub Repository
    ↓ git push
    ↓
Deployment Platform (Heroku/Vercel/DigitalOcean)
    ↓ npm install --production
    ↓ npm start
    ↓
Production (https://votredomaine.com)
```

## 🔐 Checklist Avant de Pousser sur GitHub

- [ ] ✅ `.env.example` configuré comme template
- [ ] ✅ `.env` local **NON** commité (dans .gitignore)
- [ ] ✅ `node_modules` dans .gitignore
- [ ] ✅ `package.json` à jour avec toutes les dépendances
- [ ] ✅ README.md complet et à jour
- [ ] ✅ Tous les fichiers importants présents
- [ ] ✅ Code testé localement
- [ ] ✅ Pas de secrets en dur dans le code

## 📊 Taille du Projet

```
Code source:        ~100 KB (sans node_modules)
Documentation:      ~50 KB
Total à push:       ~150 KB
```

## 🎯 Après Pousser sur GitHub

1. ✅ Vérifiez : https://github.com/USERNAME/consultpro
2. ✅ Les fichiers importants sont présents
3. ✅ Les fichiers sensibles sont ignorés
4. ✅ Le README s'affiche bien
5. ✅ Configurez les branches protégées (optionnel)
6. ✅ Activez les actions GitHub (optionnel)

## 💡 Conseils

### Pour collaborer
```bash
# Clone pour un collaborateur
git clone https://github.com/USERNAME/consultpro.git
cd consultpro
npm install
npm start
```

### Pour les mises à jour
```bash
# Après modification locale
git add .
git commit -m "✨ Description du changement"
git push
```

### Pour les versions
```bash
# Tagger une version
git tag v1.0.0
git push origin v1.0.0
```

## 🆘 Problèmes Courants

**Mon token n'a pas les bonnes permissions**
→ Regénérez avec le scope "repo" sur https://github.com/settings/tokens

**Le .env a été commité accidentellement**
→ Exécutez : `git rm --cached .env`
→ Ensuite : `git commit -m "🔒 Remove .env from git history"`

**Je veux supprimer un fichier des commits passés**
→ Consultez : https://help.github.com/articles/removing-sensitive-data-from-a-repository/

## 📚 Ressources

- 📖 [Documentation GitHub](https://docs.github.com)
- 📖 [Git Cheat Sheet](https://github.github.com/training-kit/downloads/github-git-cheat-sheet.pdf)
- 📖 [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**Prêt ? Commencez par README.md puis GITHUB_SETUP.md !** 🚀
