#!/usr/bin/env pwsh
# ============================================================
# 🚀 Webly - Commandes Git Prêtes à Copier-Coller
# ============================================================
# Utilisez ce fichier pour référence si vous préférez
# exécuter les commandes manuellement ligne par ligne.
# ============================================================

# ==================================================
# ÉTAPE 1 : Configuration Git (une seule fois)
# ==================================================

# Configurer votre nom et email globalement
git config --global user.name "Votre Nom Complet"
git config --global user.email "votre.email@github.com"

# Vérifier la configuration
git config --global --list


# ==================================================
# ÉTAPE 2 : Initialiser le repository local
# ==================================================

# Se positionner dans le dossier du projet
cd c:\tmp\services-web

# Initialiser le repo Git
git init

# Ajouter tous les fichiers (le .gitignore exclut les sensibles)
git add .

# Vérifier ce qui sera commité
git status

# Créer le commit initial
git commit -m "✨ Initial commit: ConsultPro - Plateforme services avec Stripe et emails"


# ==================================================
# ÉTAPE 3 : Créer le repository sur GitHub
# ==================================================

# 1. Allez sur https://github.com/new
# 2. Repository name: consultpro
# 3. Description: Plateforme de services avec paiement Stripe
# 4. Visibility: Public (optionnel)
# 5. Click "Create repository"

# Vous aurez alors l'URL: https://github.com/VOTRE_USERNAME/consultpro.git


# ==================================================
# ÉTAPE 4 : Connecter le repo local à GitHub
# ==================================================

# Ajouter le remote GitHub (remplacez par votre URL)
git remote add origin https://github.com/VOTRE_USERNAME/consultpro.git

# Renommer la branche par défaut en 'main'
git branch -M main

# Vérifier le remote
git remote -v


# ==================================================
# ÉTAPE 5 : Pousser le code vers GitHub
# ==================================================

# Première fois : avec -u pour tracker la branche
git push -u origin main

# Fois suivantes : simple git push suffira
git push


# ==================================================
# 🔐 Authentification GitHub
# ==================================================

# ⚠️  Important : Utilisez un Personal Access Token, pas votre mot de passe !

# Pour générer un token :
# 1. Allez sur https://github.com/settings/tokens
# 2. Click "Generate new token"
# 3. Sélectionnez le scope "repo"
# 4. Copiez le token
# 5. Utilisez-le comme mot de passe quand Git vous le demande

# Alternative : Configurer l'authentification SSH
# https://docs.github.com/en/authentication/connecting-to-github-with-ssh


# ==================================================
# 📝 Commandes Futures (après modifications)
# ==================================================

# Voir ce qui a changé
git status

# Voir les différences
git diff

# Ajouter des fichiers spécifiques
git add chemin/du/fichier.js

# Ou ajouter tous les fichiers
git add .

# Créer un commit
git commit -m "📝 Description du changement"

# Pousser vers GitHub
git push


# ==================================================
# 🔍 Commandes Utiles de Diagnostic
# ==================================================

# Voir l'historique des commits
git log

# Voir l'historique avec un format joli
git log --oneline --graph

# Voir le statut détaillé
git status

# Voir tous les remotes configurés
git remote -v

# Voir la configuration actuelle
git config --list

# Voir les branches
git branch -a


# ==================================================
# ⚠️  Récupérer les changements de GitHub
# ==================================================

# Récupérer les changements sans les fusionner
git fetch

# Récupérer et fusionner les changements
git pull


# ==================================================
# 🆘 Annuler les changements
# ==================================================

# Abandonner les modifications d'un fichier
git checkout -- chemin/du/fichier

# Abandonner tous les changements
git checkout -- .

# Annuler le dernier commit (mais garder les fichiers)
git reset HEAD~1

# Annuler le dernier commit (supprimer les changements)
git reset --hard HEAD~1


# ==================================================
# ✅ Vérification Finale
# ==================================================

# Une fois tout pushé, vérifiez :
# 1. Allez sur https://github.com/VOTRE_USERNAME/consultpro
# 2. Vérifiez que tous les fichiers sont présents
# 3. Le README s'affiche automatiquement
# 4. Les dossiers privés (.env, node_modules) sont bien ignorés

Write-Host "✅ Prêt ! Suivez les étapes ci-dessus en copiant les commandes." -ForegroundColor Green
