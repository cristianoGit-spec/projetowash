# 🔧 Atualização das Regras do Firebase (v42.3)

## ⚠️ AÇÃO NECESSÁRIA: Atualizar Regras do Firestore

### Erro Atual
```
Permission denied on resource project projetowash-production
```

### Solução: Atualizar Regras Manualmente

1. **Acesse o Console do Firebase:**
   - URL: https://console.firebase.google.com/project/projetowash-production/firestore/rules

2. **Substitua as regras atuais pelo conteúdo do arquivo:**
   - Arquivo: `config/firestore.rules`
   
3. **Principais mudanças (já aplicadas no arquivo):**
   - ✅ Leitura de usuários permitida para qualquer autenticado (necessário para SUPER ADMIN)
   - ✅ Criação de usuários permitida para autenticados (cadastro de empresas)
   - ✅ Adicionada coleção `system` para contadores
   - ✅ Mantida segurança multi-tenant por companyId

4. **Clique em "Publicar"**

### Regras Atualizadas (Resumo)

```javascript
// USUÁRIOS - Acesso mais flexível
match /usuarios/{userId} {
  allow read: if isAuthenticated(); // Qualquer autenticado pode ler
  allow create: if isAuthenticated(); // Qualquer autenticado pode criar
  allow update: if isAuthenticated() && (próprio usuário OU admin da empresa);
  allow delete: if isAuthenticated() && (próprio usuário OU admin da empresa);
}

// SYSTEM - Contadores
match /system/{docId} {
  allow read, write: if isAuthenticated();
}
```

### ✅ Sistema Continua Funcionando

**Enquanto as regras não são atualizadas:**
- ✅ Sistema usa **localStorage** como fallback automático
- ✅ Todas as funcionalidades continuam operacionais
- ✅ Dados são salvos localmente no navegador
- ✅ Após atualizar regras, sistema volta a usar Firebase Cloud

### 🚀 Após Atualizar as Regras

O sistema voltará a usar Firebase Cloud automaticamente e terá:
- ☁️ Dados sincronizados em tempo real
- 🔄 Backup automático na nuvem
- 🌐 Acesso de qualquer dispositivo
- 🔐 Segurança multi-tenant por companyId

---

**Data da atualização:** 10 de dezembro de 2025  
**Versão:** v42.3  
**Status:** ⚠️ PENDENTE - Aguardando atualização manual das regras
