# Script PowerShell pour initialiser ConsultPro sur GitHub
# À exécuter depuis le dossier du projet

# ⚠️ Éditer ces valeurs selon votre profil GitHub
$USERNAME = "votre-username-github"  # Remplacez par votre username GitHub
$NAME = "Hugo Perdereau"
$EMAIL = "hugo.perdereau72@gmail.com"

Write-Host "🚀 ConsultPro - Initialisation GitHub" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

# Vérifier que Git est installé
try {
    $gitVersion = git --version
    Write-Host "✅ Git détecté: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git n'est pas installé. Téléchargez-le sur https://git-scm.com/download/win" -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "📝 Configuration Git" -ForegroundColor Cyan
Write-Host "===================="

# Initialiser
Write-Host "🔧 Initialisation du repository..." -ForegroundColor Yellow
git init

# Configurer l'utilisateur
Write-Host "👤 Configuration de l'utilisateur Git..." -ForegroundColor Yellow
git config user.name "$NAME"
git config user.email "$EMAIL"

Write-Host ""
Write-Host "📋 Préparation des fichiers" -ForegroundColor Cyan
Write-Host "==========================="

# Ajouter les fichiers
Write-Host "📋 Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Vérifier le statut
$status = git status --short
if ($status) {
    Write-Host "✅ Fichiers prêts :" -ForegroundColor Green
    Write-Host $status
} else {
    Write-Host "⚠️  Aucun fichier à commiter" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💾 Création du commit" -ForegroundColor Cyan
Write-Host "===================="

# Créer le commit
Write-Host "💾 Création du commit initial..." -ForegroundColor Yellow
git commit -m "✨ Initial commit: ConsultPro - Plateforme services avec Stripe et emails"

Write-Host ""
Write-Host "🔗 Configuration GitHub" -ForegroundColor Cyan
Write-Host "======================"

Write-Host ""
Write-Host "📌 Assurez-vous d'avoir:" -ForegroundColor Yellow
Write-Host "   1. Créé un compte GitHub (https://github.com)" -ForegroundColor White
Write-Host "   2. Créé un repository nommé 'consultpro'" -ForegroundColor White
Write-Host "   3. Généré un Personal Access Token (https://github.com/settings/tokens)" -ForegroundColor White
Write-Host ""

$proceed = Read-Host "Continuer ? (o/n)"
if ($proceed -ne 'o' -and $proceed -ne 'O') {
    Write-Host "Annulé." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "🔗 Ajout du remote GitHub..." -ForegroundColor Yellow
git remote add origin "https://github.com/$USERNAME/consultpro.git"

Write-Host "🌿 Renommage de la branche..." -ForegroundColor Yellow
git branch -M main

Write-Host ""
Write-Host "📤 Push du code" -ForegroundColor Cyan
Write-Host "==============="
Write-Host ""
Write-Host "🔐 Authentification:" -ForegroundColor Yellow
Write-Host "   - Username: Votre username GitHub" -ForegroundColor White
Write-Host "   - Password: Votre Personal Access Token" -ForegroundColor White
Write-Host "   (Pas votre mot de passe GitHub)" -ForegroundColor White
Write-Host ""

git push -u origin main

Write-Host ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Votre repository est en ligne :" -ForegroundColor Green
    Write-Host "   https://github.com/$USERNAME/consultpro" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📝 Prochaines étapes :" -ForegroundColor Yellow
    Write-Host "   1. Testez localement avec: npm start" -ForegroundColor White
    Write-Host "   2. Configurez Stripe dans .env" -ForegroundColor White
    Write-Host "   3. Déployez vers Heroku/Vercel/autre" -ForegroundColor White
} else {
    Write-Host "❌ Une erreur s'est produite." -ForegroundColor Red
    Write-Host "Vérifiez les erreurs ci-dessus." -ForegroundColor Red
}

Write-Host ""
Write-Host "Besoin d'aide ? Consultez GITHUB_SETUP.md" -ForegroundColor Cyan
