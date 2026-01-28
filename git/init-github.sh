#!/bin/bash
# Script d'initialisation Git pour ConsultPro
# À exécuter une seule fois depuis le dossier du projet

# ⚠️ Éditer ces valeurs selon votre profil GitHub
USERNAME="votre-username-github"  # Remplacez par votre username GitHub
NAME="Hugo Perdereau"               # Votre nom complet
EMAIL="hugo.perdereau72@gmail.com"  # Votre email GitHub

# ==================================================
# 🚀 Initialiser le repo Git
# ==================================================
echo "🔧 Initialisation du repository Git..."
git init

# ==================================================
# 👤 Configurer l'utilisateur Git (global)
# ==================================================
echo "👤 Configuration de l'utilisateur..."
git config --global user.name "$NAME"
git config --global user.email "$EMAIL"

# ==================================================
# 📋 Ajouter tous les fichiers
# ==================================================
echo "📋 Ajout des fichiers..."
git add .

# ==================================================
# 💾 Créer le commit initial
# ==================================================
echo "💾 Création du commit initial..."
git commit -m "✨ Initial commit: ConsultPro - Plateforme services avec Stripe et emails"

# ==================================================
# 🔗 Ajouter le remote GitHub
# ==================================================
echo "🔗 Configuration du remote GitHub..."
git remote add origin https://github.com/$USERNAME/consultpro.git

# ==================================================
# 🌿 Renommer la branche en 'main'
# ==================================================
echo "🌿 Renommage de la branche..."
git branch -M main

# ==================================================
# 📤 Pousser le code
# ==================================================
echo "📤 Push du code vers GitHub..."
echo ""
echo "⚠️  Vous allez être invité à vous authentifier."
echo "💡 Utilisez un Personal Access Token si possible:"
echo "   https://github.com/settings/tokens"
echo ""
git push -u origin main

# ==================================================
# ✅ Succès !
# ==================================================
echo ""
echo "✅ Succès ! Votre repo est maintenant en ligne !"
echo "🌐 Consultez-le : https://github.com/$USERNAME/consultpro"
echo ""
