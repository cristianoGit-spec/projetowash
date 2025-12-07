# 🚀 Script de Deploy Manual - Netlify
# Execute este script para preparar a pasta web para deploy

Write-Host "`n================================================" -ForegroundColor Cyan
Write-Host "  PREPARANDO DEPLOY MANUAL - NETLIFY" -ForegroundColor Green
Write-Host "================================================`n" -ForegroundColor Cyan

# Verificar se a pasta web existe
if (Test-Path "web") {
    Write-Host "✅ Pasta 'web' encontrada" -ForegroundColor Green
    
    # Contar arquivos
    $files = Get-ChildItem -Path "web" -Recurse -File
    $fileCount = $files.Count
    Write-Host "📦 Total de arquivos: $fileCount" -ForegroundColor Yellow
    
    # Mostrar estrutura
    Write-Host "`n📂 Estrutura da pasta web:" -ForegroundColor Cyan
    tree web /F /A
    
    Write-Host "`n================================================" -ForegroundColor Cyan
    Write-Host "  PRONTO PARA DEPLOY!" -ForegroundColor Green
    Write-Host "================================================`n" -ForegroundColor Cyan
    
    Write-Host "🌐 ACESSE O PAINEL NETLIFY:" -ForegroundColor Magenta
    Write-Host "   URL: https://app.netlify.com/projects/quatrocantos/overview" -ForegroundColor Blue
    Write-Host "`n🔐 CREDENCIAIS:" -ForegroundColor Yellow
    Write-Host "   Email: cristiano.s.santos@ba.estudante.senai.br"
    Write-Host "   Senha: 18042016"
    
    Write-Host "`n📋 PASSO A PASSO:" -ForegroundColor Cyan
    Write-Host "   1. Faça login no Netlify"
    Write-Host "   2. Clique em 'Deploys' no menu superior"
    Write-Host "   3. Clique no botão 'Deploy manually'"
    Write-Host "   4. Arraste a pasta 'web' deste projeto"
    Write-Host "   5. Aguarde o upload e deploy (~30 segundos)"
    
    Write-Host "`n🎯 MÉTODO ALTERNATIVO (Drag & Drop):" -ForegroundColor Cyan
    Write-Host "   1. Abra: https://app.netlify.com/drop"
    Write-Host "   2. Arraste a pasta 'web'"
    Write-Host "   3. Deploy instantâneo!"
    
    Write-Host "`n✨ Após o deploy, acesse:" -ForegroundColor Green
    Write-Host "   https://quatrocanto.netlify.app`n" -ForegroundColor Blue
    
    # Abrir o navegador
    $response = Read-Host "`nDeseja abrir o painel do Netlify agora? (S/N)"
    if ($response -eq "S" -or $response -eq "s") {
        Start-Process "https://app.netlify.com/projects/quatrocantos/overview"
        Write-Host "`n✅ Navegador aberto! Faça login e arraste a pasta 'web'`n" -ForegroundColor Green
    }
    
} else {
    Write-Host "❌ ERRO: Pasta 'web' não encontrada!" -ForegroundColor Red
    Write-Host "   Execute este script na raiz do projeto`n" -ForegroundColor Yellow
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
