# 🚀 Guia de Deploy - Netlify

## 📋 Pré-requisitos

- Conta no Netlify: [app.netlify.com](https://app.netlify.com)
- Repositório no GitHub: [github.com/cristiano-superacao/projetowash](https://github.com/cristiano-superacao/projetowash)
- Credenciais: `cristiano.s.santos@ba.estudante.senai.br` / `18042016`

---

## 🌐 Opção 1: Deploy via Interface Web (RECOMENDADO)

### Método Drag & Drop

1. **Acesse**: https://app.netlify.com/drop
2. **Faça login** com suas credenciais
3. **Arraste** a pasta `web` do projeto
4. **Aguarde** o deploy ser concluído
5. **Pronto!** Seu site estará no ar em: `https://quatrocanto.netlify.app`

### Método Manual pelo Painel

1. **Acesse**: https://app.netlify.com/projects/quatrocanto
2. **Clique** em `Deploys` → `Deploy manually`
3. **Arraste** a pasta `web`
4. **Site publicado!**

---

## 🔄 Opção 2: Deploy Automático via GitHub

### Configuração Inicial

1. **Acesse**: https://app.netlify.com/projects/quatrocanto/settings
2. **Vá em**: `Build & deploy` → `Continuous deployment`
3. **Clique**: `Link repository`
4. **Selecione**: GitHub → `cristiano-superacao/projetowash`

### Configurações de Build

```yaml
Branch: main
Base directory: (deixe vazio)
Build command: (deixe vazio)
Publish directory: web
```

### Resultado

- ✅ Todo commit na branch `main` faz deploy automático
- ✅ Preview de pull requests
- ✅ Rollback instantâneo
- ✅ Deploy em ~30 segundos

---

## 📦 Opção 3: Deploy via Netlify CLI

### Instalar Netlify CLI

```bash
npm install -g netlify-cli
```

### Fazer Login

```bash
netlify login
```

### Deploy Manual

```bash
# Deploy de teste
netlify deploy --dir=web

# Deploy em produção
netlify deploy --prod --dir=web
```

---

## ⚙️ Configurações do Site

### Arquivo netlify.toml

O arquivo `netlify.toml` na raiz do projeto configura:

```toml
[build]
  publish = "web"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Variáveis de Ambiente

Se precisar configurar variáveis:

1. Acesse: `Site settings` → `Environment variables`
2. Adicione suas variáveis
3. Redeploy o site

---

## 🔍 Verificação do Deploy

### Checklist Pós-Deploy

- [ ] Site acessível em https://quatrocanto.netlify.app
- [ ] CSS carregando corretamente
- [ ] JavaScript funcionando
- [ ] Login funcionando
- [ ] Painel admin acessível
- [ ] Layout responsivo em mobile
- [ ] PWA instalável
- [ ] Service Worker registrado

### Comandos de Teste

Abra o Console do navegador (F12) e verifique:

```javascript
// Verificar localStorage
console.log('Usuários:', localStorage.getItem('localUsers'));

// Verificar Service Worker
navigator.serviceWorker.getRegistrations().then(console.log);

// Testar autenticação
localStorage.clear(); // Limpar dados
location.reload();    // Recarregar página
```

---

## 🐛 Troubleshooting

### Erro: "Page Not Found"

**Solução**: Verifique se o arquivo `netlify.toml` está configurado corretamente com os redirects.

### Erro: CSS não carrega

**Solução**: 
1. Limpe o cache do navegador (`Ctrl + Shift + R`)
2. Verifique os caminhos dos arquivos CSS no `index.html`

### Erro: Service Worker 404

**Solução**: 
1. Verifique se `service-worker.js` está na pasta `web/`
2. Redeploy o site

### Erro: localStorage vazio

**Solução**:
1. Faça logout
2. Limpe o localStorage: `localStorage.clear()`
3. Recarregue a página
4. Faça login novamente

---

## 🔄 Atualizar o Site

### Via Git (Deploy Automático)

```bash
# 1. Fazer alterações nos arquivos
# 2. Adicionar ao git
git add .

# 3. Fazer commit
git commit -m "Descrição das alterações"

# 4. Enviar para GitHub
git push origin main

# 5. Deploy automático será acionado!
```

### Via Drag & Drop

1. Acesse https://app.netlify.com/projects/quatrocanto
2. Arraste a nova pasta `web` atualizada
3. Confirme o deploy

---

## 📊 Monitoramento

### Analytics

Acesse: `Site settings` → `Analytics`
- Visualizações de página
- Origem dos visitantes
- Dispositivos utilizados

### Logs de Deploy

Acesse: `Deploys` → Clique em um deploy → `Deploy log`
- Veja logs detalhados
- Debug de erros
- Tempo de build

---

## 🌐 Domínio Personalizado (Opcional)

### Adicionar Domínio

1. Acesse: `Site settings` → `Domain management`
2. Clique: `Add custom domain`
3. Digite seu domínio: `seudominio.com`
4. Configure DNS conforme instruções
5. Aguarde propagação (até 48h)

### SSL/HTTPS

- ✅ SSL automático e gratuito (Let's Encrypt)
- ✅ Renovação automática
- ✅ Redirecionamento HTTP → HTTPS

---

## 📝 Notas Finais

- **URL Atual**: https://quatrocanto.netlify.app
- **Repositório**: https://github.com/cristiano-superacao/projetowash
- **Suporte Netlify**: https://docs.netlify.com
- **Status do Site**: https://www.netlifystatus.com

✅ **Sistema pronto para produção com layout responsivo e profissional!**
