@echo off
REM Script d'initialisation Git pour ConsultPro sur Windows
REM À exécuter une seule fois depuis le dossier du projet

REM ⚠️ Éditer ces valeurs selon votre profil GitHub
set USERNAME=votre-username-github
set NAME=Hugo Perdereau
set EMAIL=hugo.perdereau72@gmail.com

REM ==================================================
REM 🚀 Initialiser le repo Git
REM ==================================================
echo 🔧 Initialisation du repository Git...
git init

REM ==================================================
REM 👤 Configurer l'utilisateur Git
REM ==================================================
echo 👤 Configuration de l'utilisateur...
git config user.name "%NAME%"
git config user.email "%EMAIL%"

REM ==================================================
REM 📋 Ajouter tous les fichiers
REM ==================================================
echo 📋 Ajout des fichiers...
git add .

REM ==================================================
REM 💾 Créer le commit initial
REM ==================================================
echo 💾 Création du commit initial...
git commit -m "✨ Initial commit: ConsultPro - Plateforme services avec Stripe et emails"

REM ==================================================
REM 🔗 Ajouter le remote GitHub
REM ==================================================
echo 🔗 Configuration du remote GitHub...
git remote add origin https://github.com/%USERNAME%/consultpro.git

REM ==================================================
REM 🌿 Renommer la branche en 'main'
REM ==================================================
echo 🌿 Renommage de la branche...
git branch -M main

REM ==================================================
REM 📤 Pousser le code
REM ==================================================
echo 📤 Push du code vers GitHub...
echo.
echo ⚠️  Vous allez être invité à vous authentifier.
echo 💡 Utilisez un Personal Access Token si possible:
echo    https://github.com/settings/tokens
echo.
git push -u origin main

REM ==================================================
REM ✅ Succès !
REM ==================================================
echo.
echo ✅ Succès! Votre repo est maintenant en ligne!
echo 🌐 Consultez-le: https://github.com/%USERNAME%/consultpro
echo.
pause
