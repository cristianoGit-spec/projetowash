# Configuracao Netlify Deploy
# Uso: .\configure-netlify.ps1

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURACAO NETLIFY DEPLOY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script ira ajuda-lo a configurar o deploy automatico no Netlify." -ForegroundColor White
Write-Host ""

# Verificar se gh CLI esta instalado
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if (-not $ghInstalled) {
    Write-Host "GitHub CLI (gh) nao esta instalado." -ForegroundColor Red
    Write-Host "Instale com: winget install --id GitHub.cli" -ForegroundColor Yellow
    Write-Host "Ou baixe em: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "Continuando com instrucoes manuais..." -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "   PASSO 1: OBTER SITE ID" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "1. Acesse: https://app.netlify.com/sites/[SEU-SITE]/settings/general" -ForegroundColor White
    Write-Host "2. Role ate 'Site information'" -ForegroundColor White
    Write-Host "   IMPORTANTE: Substitua [SEU-SITE] pelo nome do seu site no Netlify" -ForegroundColor Yellow
    Write-Host "3. Copie o 'Site ID'" -ForegroundColor White
    Write-Host ""
    
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "   PASSO 2: GERAR AUTH TOKEN" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "1. Acesse: https://app.netlify.com/user/applications#personal-access-tokens" -ForegroundColor White
    Write-Host "2. Clique em 'New access token'" -ForegroundColor White
    Write-Host "3. Nome: 'GitHub Actions Deploy'" -ForegroundColor White
    Write-Host "4. Copie o token gerado" -ForegroundColor White
    Write-Host ""
    
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "   PASSO 3: CONFIGURAR SECRETS" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "1. Acesse: https://github.com/cristiano-superacao/projetowash/settings/secrets/actions" -ForegroundColor White
    Write-Host "2. Clique em 'New repository secret'" -ForegroundColor White
    Write-Host "3. Adicione:" -ForegroundColor White
    Write-Host "   - Name: NETLIFY_SITE_ID" -ForegroundColor Yellow
    Write-Host "   - Value: [Cole o Site ID]" -ForegroundColor Yellow
    Write-Host "4. Adicione:" -ForegroundColor White
    Write-Host "   - Name: NETLIFY_AUTH_TOKEN" -ForegroundColor Yellow
    Write-Host "   - Value: [Cole o Auth Token]" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "   PASSO 4: TESTAR O DEPLOY" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Apos configurar os secrets:" -ForegroundColor White
    Write-Host "1. Faca uma pequena alteracao no codigo" -ForegroundColor White
    Write-Host "2. Commit e push:" -ForegroundColor White
    Write-Host "   git add ." -ForegroundColor Yellow
    Write-Host "   git commit -m 'test: Testar deploy automatico'" -ForegroundColor Yellow
    Write-Host "   git push origin main" -ForegroundColor Yellow
    Write-Host "3. Acompanhe em: https://github.com/cristiano-superacao/projetowash/actions" -ForegroundColor White
    Write-Host ""
    
    exit
}

# Se gh CLI estiver instalado
Write-Host "GitHub CLI detectado!" -ForegroundColor Green
Write-Host ""

# Login no GitHub
Write-Host "Fazendo login no GitHub..." -ForegroundColor Cyan
gh auth login

# Verificar se esta logado
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erro ao fazer login no GitHub." -ForegroundColor Red
    exit 1
}

Write-Host "Login realizado com sucesso!" -ForegroundColor Green
Write-Host ""

# Solicitar Site ID
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "   CONFIGURAR NETLIFY_SITE_ID" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Para obter o Site ID:" -ForegroundColor Yellow
Write-Host "1. Acesse: https://app.netlify.com/sites/projetowash/settings/general" -ForegroundColor White
Write-Host "2. Copie o 'Site ID' em 'Site information'" -ForegroundColor White
Write-Host ""

$siteId = Read-Host "Cole o NETLIFY_SITE_ID aqui"

if ([string]::IsNullOrWhiteSpace($siteId)) {
    Write-Host "Site ID nao pode estar vazio." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Site ID recebido: $siteId" -ForegroundColor Green

# Solicitar Auth Token
Write-Host ""
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "   CONFIGURAR NETLIFY_AUTH_TOKEN" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Para gerar o Auth Token:" -ForegroundColor Yellow
Write-Host "1. Acesse: https://app.netlify.com/user/applications#personal-access-tokens" -ForegroundColor White
Write-Host "2. Clique em 'New access token'" -ForegroundColor White
Write-Host "3. Nome: 'GitHub Actions Deploy'" -ForegroundColor White
Write-Host "4. Copie o token gerado" -ForegroundColor White
Write-Host ""

$authToken = Read-Host "Cole o NETLIFY_AUTH_TOKEN aqui"

if ([string]::IsNullOrWhiteSpace($authToken)) {
    Write-Host "Auth Token nao pode estar vazio." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Auth Token recebido" -ForegroundColor Green

# Configurar secrets no GitHub
Write-Host ""
Write-Host "Configurando secrets no GitHub..." -ForegroundColor Cyan

try {
    # Configurar NETLIFY_SITE_ID
    Write-Host "Configurando NETLIFY_SITE_ID..." -ForegroundColor White
    echo $siteId | gh secret set NETLIFY_SITE_ID --repo cristiano-superacao/projetowash
    
    # Configurar NETLIFY_AUTH_TOKEN
    Write-Host "Configurando NETLIFY_AUTH_TOKEN..." -ForegroundColor White
    echo $authToken | gh secret set NETLIFY_AUTH_TOKEN --repo cristiano-superacao/projetowash
    
    Write-Host ""
    Write-Host "Secrets configurados com sucesso!" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "Erro ao configurar secrets: $_" -ForegroundColor Red
    exit 1
}

# Sucesso
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   CONFIGURACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Deploy automatico configurado com sucesso!" -ForegroundColor White
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "1. Faca um commit e push para testar:" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Yellow
Write-Host "   git commit -m 'test: Testar deploy automatico'" -ForegroundColor Yellow
Write-Host "   git push origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Acompanhe o deploy em:" -ForegroundColor White
Write-Host "   https://github.com/cristiano-superacao/projetowash/actions" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Seu site estara disponivel em:" -ForegroundColor White
Write-Host "   https://projetowash.netlify.app" -ForegroundColor Cyan
Write-Host ""
