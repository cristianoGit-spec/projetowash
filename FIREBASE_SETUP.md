# 🔥 Configuração Firebase - Sistema Híbrido Multi-Tenant

## 📋 Pré-requisitos

1. Conta Google/Gmail
2. Acesso ao [Firebase Console](https://console.firebase.google.com/)
3. Node.js instalado (para Firebase CLI)

## 🚀 Passo a Passo - Configuração Completa

### 1. Criar Projeto no Firebase

1. Acesse: https://console.firebase.google.com/
2. Clique em "Adicionar projeto"
3. Nome do projeto: `projetowash-production`
4. Aceite os termos e crie o projeto

### 2. Ativar Authentication

1. No menu lateral, clique em **"Authentication"**
2. Clique em **"Começar"**
3. Na aba **"Sign-in method"**, ative:
   - ✅ **Email/Senha** (clique e ative)
4. Salve as configurações

### 3. Criar Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Selecione **"Modo de produção"**
4. Escolha a localização: **`southamerica-east1` (São Paulo)**
5. Clique em "Ativar"

### 4. Configurar Regras de Segurança

No Firestore, vá em **"Regras"** e cole:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Regra para usuários
    match /usuarios/{userId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || 
                      get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.companyId == resource.data.companyId);
      allow write: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null;
    }
    
    // Regra para estoque (isolamento por empresa)
    match /estoque/{produtoId} {
      allow read, write: if request.auth != null && 
                            request.resource.data.companyId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.companyId;
      allow create: if request.auth != null;
    }
    
    // Regra para movimentações (isolamento por empresa)
    match /movimentacoes/{movId} {
      allow read, write: if request.auth != null && 
                            request.resource.data.companyId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.companyId;
      allow create: if request.auth != null;
    }
    
    // Regra para financeiro (isolamento por empresa)
    match /financeiro/{finId} {
      allow read, write: if request.auth != null && 
                            request.resource.data.companyId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.companyId;
      allow create: if request.auth != null;
    }
    
    // Regra para RH (isolamento por empresa)
    match /rh/{rhId} {
      allow read, write: if request.auth != null && 
                            request.resource.data.companyId == get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.companyId;
      allow create: if request.auth != null;
    }
  }
}
```

Clique em **"Publicar"**

### 5. Obter Configurações do Projeto

1. Clique no ícone de **engrenagem** ⚙️ (Configurações do projeto)
2. Role até "Seus apps" e clique no ícone **< />** (Web)
3. Registre o app com o nome: `Quatro Cantos Web`
4. **NÃO** marque "Configure Firebase Hosting"
5. Clique em "Registrar app"
6. **COPIE** o objeto `firebaseConfig` que aparece

### 6. Atualizar Configuração no Código

Abra o arquivo: `web/static/js/firebase-config.js`

Substitua o bloco `firebaseConfig` pelo que você copiou:

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "projetowash-production.firebaseapp.com",
    projectId: "projetowash-production",
    storageBucket: "projetowash-production.firebasestorage.app",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};
```

### 7. Deploy no Firebase Hosting (Opcional - Acesso Global)

#### Instalar Firebase CLI

```bash
npm install -g firebase-tools
```

#### Fazer Login

```bash
firebase login
```

#### Inicializar Projeto

```bash
cd projetowash
firebase init
```

Selecione:
- ✅ Firestore
- ✅ Hosting

Configurações:
- **Firestore rules**: `config/firestore.rules`
- **Firestore indexes**: `config/firestore.indexes.json`
- **Public directory**: `web`
- **Single-page app**: `Yes`
- **GitHub auto-deploys**: `No`

#### Deploy

```bash
firebase deploy
```

Sua URL será: `https://projetowash-production.web.app`

## 🎯 Funcionalidades Implementadas

### ✅ Sistema Multi-Tenant
- Cada empresa tem um `companyId` único
- Isolamento total de dados entre empresas
- Usuários Joel e Gaby da empresa X não veem dados da empresa Y

### ✅ Acesso de Qualquer Rede
- Dados na nuvem Firebase (Google Cloud)
- Acesso via internet de qualquer dispositivo
- Sincronização em tempo real

### ✅ Sistema Híbrido
- **Online**: Usa Firebase (nuvem)
- **Offline**: Usa localStorage (cache local)
- Sincronização automática quando volta online

### ✅ Segurança
- Authentication com email/senha
- Regras de segurança no Firestore
- Isolamento por empresa
- Criptografia automática Google

## 🔧 Testando

### Teste Local (Localhost)

1. Inicie o servidor:
```bash
python -m http.server 8000 --directory web
```

2. Acesse: `http://localhost:8000`
3. Crie uma empresa
4. Cadastre usuários (Joel, Gaby)
5. Dados salvos no Firebase

### Teste Externo (Outra Rede)

1. Com Firebase Hosting deployado
2. Acesse: `https://projetowash-production.web.app`
3. Faça login com Joel ou Gaby
4. Veja os mesmos dados de qualquer lugar!

## 📊 Verificar Dados no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **"Firestore Database"**
4. Veja as coleções:
   - `usuarios` - Usuários cadastrados
   - `estoque` - Produtos
   - `movimentacoes` - Entradas/Saídas
   - `financeiro` - Dados financeiros
   - `rh` - Dados de RH

## 🆘 Troubleshooting

### Erro: "Firebase not initialized"
- Verifique se colocou a apiKey correta
- Verifique se o Firebase está carregando no console do navegador

### Erro: "Permission denied"
- Verifique as regras do Firestore
- Certifique-se de que o usuário está autenticado
- Verifique se o companyId está sendo salvo corretamente

### Dados não aparecem
- Abra o console do navegador (F12)
- Veja se há erros
- Verifique se `firebaseInitialized = true`
- Force sincronização com `syncFirebaseToLocal()`

## 📞 Suporte

Para dúvidas:
1. Veja os logs no console (F12)
2. Verifique o Firebase Console
3. Teste a conexão com internet

---

**Versão**: 21.0 - Sistema Híbrido Multi-Tenant  
**Data**: Dezembro 2025
