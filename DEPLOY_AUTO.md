# 🔗 Guia: Conectar Netlify ao GitHub para Deploy Automático

## ⚠️ IMPORTANTE: Configure o Deploy Automático

O deploy automático do Netlify funciona através da conexão com o repositório GitHub. Siga os passos abaixo:

---

## 📋 Passo a Passo

### 1️⃣ Acessar o Painel do Netlify

1. Acesse: https://app.netlify.com/
2. Faça login com: `cristiano.s.santos@ba.estudante.senai.br`
3. Clique no projeto: **quatrocanto**

### 2️⃣ Configurar Deploy do GitHub

1. No painel do projeto, vá em: **Site configuration** → **Build & deploy**
2. Clique em: **Link repository**
3. Selecione: **GitHub**
4. Autorize o Netlify a acessar o GitHub (se necessário)
5. Escolha o repositório: `cristiano-superacao/projetowash`

### 3️⃣ Configurações de Build

Configure exatamente assim:

```
Branch to deploy: main
Base directory: (deixe vazio)
Build command: (deixe vazio ou echo 'Build completo')
Publish directory: web
```

### 4️⃣ Ativar Deploy Automático

1. Em **Build settings**, ative:
   - ✅ **Auto publishing** (Deploy automático)
   - ✅ **Deploy previews** (Preview de PRs)
   - ✅ **Branch deploys** (Deploy de branches)

2. Em **Build hooks** (opcional), você pode criar um webhook para deploy manual

---

## 🎯 Como Funciona o Deploy Automático

Após conectar o GitHub ao Netlify:

1. **Push no GitHub** → Netlify recebe webhook
2. **Netlify clona** o repositório
3. **Netlify publica** a pasta `web/`
4. **Site atualizado** em ~30 segundos

---

## 🔄 Testando o Deploy

### Método 1: Push no GitHub (Recomendado)
```bash
# Faça qualquer mudança
git add .
git commit -m "Test: Testando deploy automatico"
git push origin main

# Aguarde 30s e verifique: https://quatrocanto.netlify.app
```

### Método 2: Deploy Manual pelo Painel
1. Acesse: https://app.netlify.com/projects/quatrocanto/deploys
2. Clique em: **Trigger deploy** → **Deploy site**

### Método 3: Drag & Drop (Emergência)
1. Acesse: https://app.netlify.com/drop
2. Arraste a pasta `web/` do projeto
3. Site será atualizado imediatamente

---

## ✅ Verificar se Está Funcionando

1. Acesse: https://app.netlify.com/projects/quatrocanto/deploys
2. Você deve ver:
   - ✅ **Production: main@[hash]** (último deploy)
   - ✅ **Status: Published**
   - ✅ **Build time: ~10-30s**

---

## 🆘 Solução de Problemas

### Deploy não está acontecendo automaticamente?

**Verifique:**
1. Repositório está conectado?
   - `Site configuration` → `Continuous deployment` → deve mostrar `cristiano-superacao/projetowash`

2. Branch correto?
   - Deve estar em `main` (não `master`)

3. Webhook está ativo?
   - GitHub: `Settings` → `Webhooks` → deve ter `https://api.netlify.com/...`

### Forçar Deploy Manual

Se o automático não funcionar, force manualmente:

```bash
# Via terminal (se tiver Netlify CLI instalado)
netlify deploy --prod --dir=web
```

Ou pelo painel:
- https://app.netlify.com/projects/quatrocanto → **Trigger deploy**

---

## 📱 Monitorar Deploys

**Slack/Discord** (opcional):
- Configure notificações em: `Site configuration` → `Build & deploy` → `Deploy notifications`

**Email**:
- Você receberá emails sobre falhas de deploy automaticamente

---

## 🎉 Status Atual

- ✅ Arquivos configurados: `netlify.toml`, `_redirects`, `_headers`
- ✅ Estrutura pronta: pasta `web/` com todos os arquivos
- ✅ Commits enviados ao GitHub
- ⏳ **PRÓXIMO PASSO**: Conectar repositório no painel do Netlify

---

## 🌐 URLs Importantes

- **Site Produção**: https://quatrocanto.netlify.app
- **Painel Netlify**: https://app.netlify.com/projects/quatrocanto
- **Repositório GitHub**: https://github.com/cristiano-superacao/projetowash
- **Deploy Logs**: https://app.netlify.com/projects/quatrocanto/deploys

---

**💡 Após conectar o repositório, cada `git push` fará deploy automático em ~30 segundos!**
