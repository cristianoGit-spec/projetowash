# 🎯 Guia Visual: Deploy Manual no Netlify

## 🔐 Credenciais de Acesso

- **Email**: `cristiano.s.santos@ba.estudante.senai.br`
- **Senha**: `18042016`
- **Projeto**: `quatrocantos`

---

## 📋 Método 1: Deploy pelo Painel do Projeto (RECOMENDADO)

### Passo 1: Acessar o Painel
```
🌐 URL: https://app.netlify.com/projects/quatrocantos/overview
```

1. Abra o link acima
2. Faça login com as credenciais
3. Você verá o painel do projeto "quatrocantos"

### Passo 2: Ir para Deploys
1. Clique na aba **"Deploys"** no topo da página
2. Você verá o histórico de deploys anteriores

### Passo 3: Deploy Manual
1. Clique no botão **"Deploy manually"** (canto superior direito)
2. Uma área de arrastar arquivos aparecerá

### Passo 4: Arrastar a Pasta Web
1. Abra o Explorer do Windows
2. Navegue até: `c:\Users\PrescriMed\Downloads\projetowash-main\projetowash-main`
3. Arraste a pasta **`web`** (não os arquivos dentro dela, mas a pasta inteira)
4. Solte na área indicada no Netlify

### Passo 5: Aguardar Deploy
1. O upload começará automaticamente
2. Progresso será exibido (geralmente 10-30 segundos)
3. Quando concluir, você verá: **"Published"** ✅

### Passo 6: Verificar Site
```
🎉 Acesse: https://quatrocanto.netlify.app
```

---

## 📋 Método 2: Netlify Drop (MAIS RÁPIDO)

### Passo 1: Acessar Netlify Drop
```
🌐 URL: https://app.netlify.com/drop
```

### Passo 2: Login
1. Faça login se necessário
2. Você verá uma área grande com "Drop your site folder here"

### Passo 3: Arrastar Pasta Web
1. Abra o Explorer: `c:\Users\PrescriMed\Downloads\projetowash-main\projetowash-main`
2. Arraste a pasta **`web`** para a área do Netlify Drop
3. Aguarde o upload

### Passo 4: Site Publicado
1. O Netlify criará um site temporário
2. Você verá um URL aleatório (ex: `random-name-123456.netlify.app`)
3. Clique em **"Claim this site"** para vincular ao projeto `quatrocantos`

---

## 📋 Método 3: Conectar GitHub (Deploy Automático)

### Passo 1: Acessar Configurações
```
🌐 URL: https://app.netlify.com/projects/quatrocantos/configuration
```

### Passo 2: Build & Deploy
1. No menu lateral, clique em **"Build & deploy"**
2. Role até **"Continuous Deployment"**
3. Clique em **"Link repository"**

### Passo 3: Selecionar GitHub
1. Clique em **"GitHub"**
2. Autorize o Netlify a acessar sua conta GitHub (se solicitado)
3. Selecione o repositório: **`cristiano-superacao/projetowash`**

### Passo 4: Configurar Build
```yaml
Branch to deploy: main
Base directory: (deixe vazio)
Build command: (deixe vazio)
Publish directory: web
```

### Passo 5: Deploy Automático Ativado
✅ A partir de agora, cada `git push` fará deploy automático!

---

## 🎨 Estrutura da Pasta Web

A pasta `web/` contém:
```
web/
├── index.html              # Página principal
├── deploy-timestamp.txt    # Timestamp do último deploy
├── README.md              # Documentação
├── _redirects             # Configuração de rotas SPA
├── _headers               # Headers de segurança
└── static/                # Assets estáticos
    ├── css/               # Estilos
    │   ├── style.css
    │   ├── admin.css
    │   └── segments.css
    ├── js/                # JavaScript
    │   ├── app.js
    │   ├── auth.js
    │   └── modules/
    └── icons/             # Ícones e imagens
```

---

## ✅ Verificação Pós-Deploy

### 1. Testar o Site
```
🌐 https://quatrocanto.netlify.app
```

**Verificar:**
- ✅ Página carrega corretamente
- ✅ Login funciona
- ✅ Menu lateral responsivo
- ✅ Submenu Estoque expandível
- ✅ Todos os módulos acessíveis

### 2. Verificar Deploy no Painel
```
🌐 https://app.netlify.com/projects/quatrocantos/deploys
```

**Verificar:**
- ✅ Status: **Published**
- ✅ Branch: **main** (ou manual)
- ✅ Deploy time: ~10-30 segundos
- ✅ Sem erros no log

### 3. Testar Funcionalidades
**Login com:**
- Email: `superadmin@quatrocantos.com`
- Senha: `admin@2025`

**Verificar:**
- ✅ Dashboard carrega
- ✅ Menu Estoque expande com 3 sub-itens
- ✅ Entrada, Saída, Saldo visíveis
- ✅ Layout responsivo (teste mobile)

---

## 🆘 Solução de Problemas

### Problema: "Página não encontrada" (404)

**Solução:**
1. Verifique se a pasta `web/` foi arrastada (não os arquivos soltos)
2. Confirme que `index.html` está na raiz da pasta `web/`
3. Verifique se `_redirects` foi incluído no deploy

### Problema: "Deploy falhou"

**Solução:**
1. Verifique os logs em: https://app.netlify.com/projects/quatrocantos/deploys
2. Tente o método Drag & Drop: https://app.netlify.com/drop
3. Limpe o cache e tente novamente

### Problema: "Site não atualiza"

**Solução:**
1. Limpe o cache do navegador: `Ctrl + Shift + R`
2. Verifique o timestamp do último deploy no painel
3. Abra em aba anônima para confirmar

### Problema: "Não consigo fazer login no Netlify"

**Credenciais:**
- Email: `cristiano.s.santos@ba.estudante.senai.br`
- Senha: `18042016`

Se esqueceu a senha:
1. Clique em "Forgot password?"
2. Use o email acima para redefinir

---

## 📱 Deploy via Mobile (Opcional)

1. Instale o app Netlify (iOS/Android)
2. Faça login
3. Selecione o projeto `quatrocantos`
4. Toque em "Deploy" → "Deploy manually"
5. Selecione os arquivos da pasta `web/`

---

## 🎉 Pronto!

Seu site agora está online em:
### 🌐 https://quatrocanto.netlify.app

**Últimas atualizações incluídas:**
- ✅ Submenu Estoque (Entrada/Saída/Saldo)
- ✅ Layout responsivo otimizado
- ✅ Animações suaves profissionais
- ✅ Sidebar com scroll adequado
- ✅ Todos os 3 botões do submenu visíveis

---

**💡 Dica Pro**: Configure o deploy automático via GitHub para nunca mais precisar fazer upload manual!
