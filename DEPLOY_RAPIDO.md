# 🚀 Deploy Rápido - Sistema Multi-Rede

## ✅ Opção 1: Usar Firebase Hosting (RECOMENDADO)

### Passo 1: Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### Passo 2: Login
```bash
firebase login
```

### Passo 3: Deploy
```bash
cd c:\Users\Superação\Downloads\projetowash
firebase deploy
```

✨ **Pronto!** Seu sistema estará em: `https://projetowash-production.web.app`

---

## ✅ Opção 2: Usar Netlify (Alternativa Simples)

### Via Interface Web (Mais Fácil):

1. Acesse: https://www.netlify.com/
2. Arraste a pasta `web` para o Netlify
3. Configure:
   - **Build command**: (deixe vazio)
   - **Publish directory**: `.` (ponto)
4. Deploy!

### Via Netlify CLI:

```bash
npm install -g netlify-cli
netlify login
cd web
netlify deploy --prod
```

---

## ✅ Opção 3: Servidor Local com Ngrok (Teste Rápido)

### Passo 1: Instalar Ngrok
- Download: https://ngrok.com/download
- Extraia o ngrok.exe

### Passo 2: Iniciar Servidor Local
```bash
cd c:\Users\Superação\Downloads\projetowash
python -m http.server 8000 --directory web
```

### Passo 3: Expor para Internet
```bash
ngrok http 8000
```

✨ **Pronto!** Use a URL que aparece (ex: `https://abc123.ngrok.io`)

---

## 🔥 Configurar Firebase (OBRIGATÓRIO para Multi-Rede)

### 1. Criar Projeto Firebase

1. Acesse: https://console.firebase.google.com/
2. Criar projeto: `projetowash-production`
3. Região: São Paulo (southamerica-east1)

### 2. Ativar Authentication

1. Menu → **Authentication**
2. **Sign-in method** → Ativar **Email/Senha**

### 3. Criar Firestore Database

1. Menu → **Firestore Database**
2. **Criar banco de dados**
3. Modo: **Produção**
4. Localização: **southamerica-east1**

### 4. Deploy das Regras de Segurança

```bash
firebase deploy --only firestore:rules
```

Ou copie manualmente de `config/firestore.rules` no Firebase Console.

### 5. Obter Configuração

1. Configurações do projeto ⚙️
2. Seus apps → Web `</>`
3. Copie o `firebaseConfig`
4. Cole em: `web/static/js/firebase-config.js`

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "projetowash-production.firebaseapp.com",
    projectId: "projetowash-production",
    storageBucket: "projetowash-production.firebasestorage.app",
    messagingSenderId: "SEU_ID",
    appId: "SEU_APP_ID"
};
```

---

## 🧪 Testar Acesso Multi-Rede

### Teste 1: Local
```
http://localhost:8000
```

### Teste 2: Mesma Rede (Wi-Fi)
```
http://SEU_IP_LOCAL:8000
```
(Descobrir IP: `ipconfig` no cmd)

### Teste 3: Rede Externa (Internet)
Após deploy:
```
https://projetowash-production.web.app
ou
https://seu-site.netlify.app
ou  
https://abc123.ngrok.io
```

### Teste 4: Celular (4G/5G)
Use a mesma URL do Teste 3 no celular.

---

## ✅ Checklist Pré-Deploy

- [ ] Firebase configurado (Authentication + Firestore)
- [ ] API Key atualizada em `firebase-config.js`
- [ ] Regras de segurança deployadas
- [ ] `useFirebase = true` em `firebase-config.js`
- [ ] Testado localmente (`localhost:8000`)
- [ ] Console do navegador sem erros (F12)

---

## 🎯 Após Deploy

### Criar Primeira Empresa

1. Acesse a URL do deploy
2. Clique em **"Criar conta"**
3. Preencha:
   - Nome: Joel
   - Email: joel@empresa.com
   - Senha: senha123
   - Nome da Empresa: Quatro Cantos
4. Sistema cria empresa e loga automaticamente

### Adicionar Mais Usuários

1. Faça logout
2. Clique em **"Criar conta"** novamente
3. Preencha:
   - Nome: Gaby
   - Email: gaby@empresa.com
   - Senha: senha123
   - **MESMO** Nome da Empresa: Quatro Cantos
4. Gaby agora vê os mesmos dados que Joel!

---

## 🔍 Verificar Dados no Firebase

1. Firebase Console → Firestore Database
2. Veja as coleções:
   - `usuarios` → Joel e Gaby com mesmo `companyId`
   - `estoque` → Produtos da empresa
   - `movimentacoes` → Entradas/Saídas
   - `financeiro` → Dados financeiros

---

## 🆘 Problemas Comuns

### Erro: "Firebase not initialized"
✅ Solução: Verifique se a API Key está correta em `firebase-config.js`

### Erro: "Permission denied"
✅ Solução: Deploy das regras de segurança:
```bash
firebase deploy --only firestore:rules
```

### Dados não aparecem
✅ Solução: 
1. Abra console (F12)
2. Veja se há erros
3. Force sync: no console digite `syncFirebaseToLocal()`

### Não consigo acessar de outra rede
✅ Solução: 
- Verifique se fez deploy (Firebase/Netlify/Ngrok)
- Localhost só funciona na mesma máquina
- Use a URL pública do deploy

---

## 📞 Status do Sistema

- ✅ Firebase configurado
- ✅ Autenticação ativa
- ✅ Banco de dados híbrido (nuvem + local)
- ✅ Multi-tenant (isolamento por empresa)
- ✅ Sincronização automática
- ✅ Acesso offline com cache
- ✅ Regras de segurança implementadas

---

**Próximo Passo**: Escolha uma opção de deploy acima e teste! 🚀
