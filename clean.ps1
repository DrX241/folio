# Script de nettoyage pour Next.js
Write-Host "Nettoyage du cache Next.js..."

if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host "✓ Cache .next supprimé"
} else {
    Write-Host "✓ Pas de cache .next"
}

if (Test-Path node_modules/.cache) {
    Remove-Item -Recurse -Force node_modules/.cache
    Write-Host "✓ Cache node_modules supprimé"
}

Write-Host "Nettoyage terminé. Redémarrez le serveur avec: npm run dev"

