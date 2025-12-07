# Script de Deploy Direto via Netlify API
# Este script faz upload direto da pasta web para o Netlify

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  DEPLOY DIRETO - NETLIFY API                  ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Verificar pasta web
if (!(Test-Path "web")) {
    Write-Host "❌ ERRO: Pasta 'web' não encontrada!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Pasta 'web' encontrada" -ForegroundColor Green

# Contar arquivos
$files = Get-ChildItem -Path "web" -Recurse -File
$totalFiles = $files.Count
Write-Host "📦 Total de arquivos: $totalFiles" -ForegroundColor Yellow

# Criar arquivo ZIP
Write-Host "`n📦 Criando arquivo ZIP para upload..." -ForegroundColor Cyan
$zipPath = "netlify-deploy.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

# Comprimir pasta web
Compress-Archive -Path "web\*" -DestinationPath $zipPath -Force

$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "✅ ZIP criado: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Green

Write-Host "`n╔════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║  DEPLOY MANUAL NECESSÁRIO                     ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════╝`n" -ForegroundColor Yellow

Write-Host "OPÇÕES DE DEPLOY:`n" -ForegroundColor Cyan

Write-Host "OPÇÃO 1 - Netlify Drop (RECOMENDADO):" -ForegroundColor Green
Write-Host "  1. Abra: https://app.netlify.com/drop"
Write-Host "  2. Arraste a pasta 'web' (não o ZIP)"
Write-Host "  3. Aguarde o upload completar`n"

Write-Host "OPÇÃO 2 - Usar o ZIP criado:" -ForegroundColor Green
Write-Host "  1. Acesse: https://app.netlify.com/projects/quatrocantos/deploys"
Write-Host "  2. Clique 'Deploy manually'"
Write-Host "  3. Arraste o arquivo: $zipPath`n"

Write-Host "OPÇÃO 3 - Netlify CLI (se instalado):" -ForegroundColor Green
Write-Host "  netlify deploy --prod --dir=web --site=quatrocantos`n"

# Abrir janelas necessárias
$response = Read-Host "`nDeseja abrir o Netlify Drop agora? (S/N)"
if ($response -eq "S" -or $response -eq "s") {
    Start-Process "https://app.netlify.com/drop"
    Start-Process "explorer.exe" -ArgumentList (Get-Location).Path
    Write-Host "`n✅ Janelas abertas! Arraste a pasta 'web' para o Netlify" -ForegroundColor Green
}

Write-Host "`n✨ ZIP disponível em: $zipPath" -ForegroundColor Cyan
Write-Host "📂 Pasta web pronta para deploy" -ForegroundColor Cyan
Write-Host "`nApós deploy, acesse: https://quatrocanto.netlify.app`n" -ForegroundColor Blue
