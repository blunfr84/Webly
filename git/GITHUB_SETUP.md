# 📤 Guide : Mettre Webly sur GitHub

## Étape 1 : Créer un compte GitHub
1. Allez sur https://github.com
2. Cliquez sur "Sign up"
3. Suivez les étapes d'inscription

## Étape 2 : Créer un nouveau repository

### Via le web (simple)
1. Connectez-vous à GitHub
2. Cliquez sur l'icône **+** en haut à droite → **New repository**
3. Remplissez :
   - **Repository name** : `Webly` (ou le nom que vous voulez)
   - **Description** : "Plateforme de services avec paiement Stripe"
   - **Visibility** : Public (ou Private si préféré)
   - **Initialize with README** : ✅ Coché
4. Cliquez **Create repository**

## Étape 3 : Configurer Git localement

### 3.1 Installer Git
- **Windows** : Téléchargez sur https://git-scm.com/download/win
- **Mac** : `brew install git`
- **Linux** : `sudo apt-get install git`

### 3.2 Configurer Git avec vos identifiants
```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

## Étape 4 : Initialiser et pousser le code

### 4.1 Depuis le dossier du projet
```bash
cd c:\tmp\services-web
git init
git add .
git commit -m "Initial commit: Webly avec Stripe et emails"
```

### 4.2 Ajouter le remote et pousser
```bash
# Remplacez USERNAME par votre username GitHub
git remote add origin https://github.com/blunfr84/Webly.git
git branch -M main
git push -u origin main
```

### 4.3 Entrer vos identifiants
- Si c'est la première fois, GitHub vous demandera de vous authentifier
- **Préféré** : Utiliser un Personal Access Token
  1. Allez sur GitHub Settings → Developer settings → Personal access tokens
  2. Générez un nouveau token avec `repo` permissions
  3. Utilisez ce token comme mot de passe

## Étape 5 : Vérifier sur GitHub

1. Allez sur votre repo : https://github.com/USERNAME/onsultpro
2. Vérifiez que tous les fichiers sont présents
3. Le README devrait s'afficher automatiquement

## 🔒 Points Importants de Sécurité

### ✅ Le fichier `.gitignore` protège :
- `.env` - Les clés Stripe et mots de passe email
- `node_modules/` - Les dépendances
- Les fichiers de log
- Les données locales

### ❌ Ne commitez JAMAIS :
- Clés API (Stripe, email)
- Mots de passe
- Fichiers `.env` avec vraies valeurs

### ✅ À la place :
- Utilisez `.env.example` pour les templates
- Les vrais `.env` restent locaux
- Documentez la configuration dans `STRIPE_SETUP.md`

## 📝 Commits Futurs

Après chaque changement :
```bash
git add .
git commit -m "Description brève du changement"
git push
```

## 🚀 Partager le projet

Une fois sur GitHub, vous pouvez :
- ✅ Partager le lien avec d'autres
- ✅ Collaborer avec des contributeurs
- ✅ Déployer depuis GitHub
- ✅ Utiliser GitHub Actions pour l'automatisation

## 🆘 Aide

Si vous avez des problèmes :
- Consultez [GitHub Help](https://docs.github.com)
- Utilisez `git --help` dans le terminal
- Consultez les erreurs Git pour des solutions

## Exemple complet

```bash
# 1. Se positionner
cd c:\tmp\services-web

# 2. Initialiser
git init
git config user.name "Hugo Perdereau"
git config user.email "hugo.perdereau72@gmail.com"

# 3. Préparer les fichiers
git add .
git commit -m "✨ Initial commit: ConsultPro - Plateforme services avec Stripe"

# 4. Ajouter le repository GitHub
git remote add origin https://github.com/votre-username/consultpro.git
git branch -M main

# 5. Pousser
git push -u origin main
```

Après cela, votre projet sera en ligne sur GitHub ! 🎉
