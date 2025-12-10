<div align="center">

# 🏢 Sistema Quatro Cantos v41

### Sistema Completo de Gestão Empresarial Multi-Tenant com Layout Profissional

[![Status](https://img.shields.io/badge/Status-Production-success.svg)](https://github.com/cristiano-superacao/projetowash)
[![Deploy](https://img.shields.io/badge/Deploy-Netlify-00C7B7.svg)](https://quatrocanto.netlify.app)
[![Version](https://img.shields.io/badge/Version-41.0-blue.svg)](https://github.com/cristiano-superacao/projetowash/releases)
[![License](https://img.shields.io/badge/License-Educational-green.svg)](LICENSE)

**🌐 Aplicação Online:** [quatrocanto.netlify.app](https://quatrocanto.netlify.app)

---

### 💎 Sistema de Gestão Empresarial com Arquitetura Híbrida
**Firebase Cloud + LocalStorage | Multi-Tenant | PWA | Layout PrescrMed Inspirado**

</div>

---

## 📋 Sobre o Projeto

O **Sistema Quatro Cantos** é uma solução empresarial completa e profissional desenvolvida com arquitetura moderna, focada em gestão multi-tenant (múltiplas empresas) com isolamento total de dados. Interface responsiva inspirada no PrescrMed com suporte PWA (Progressive Web App) para instalação em dispositivos móveis e desktop.

### 🎯 Módulos e Funcionalidades

| Módulo | Descrição | Fórmulas | Status |
|--------|-----------|----------|--------|
| 🔐 **Autenticação** | Login/Registro com Firebase + Fallback Local | - | ✅ Produção |
| 🏢 **Multi-Tenant** | Isolamento completo de dados por companyId | - | ✅ Produção |
| 👥 **Gestão de Usuários** | CRUD completo com permissões granulares | - | ✅ Produção |
| 🛡️ **Painel Admin** | Super admin para gerenciar todas empresas | - | ✅ Produção |
| 📊 **Dashboard** | KPIs, estatísticas e gráficos em tempo real | `valorEstoque = Σ(qtd × valor)` | ✅ Produção |
| ⚙️ **Operacional** | Capacidade produtiva com análise de turnos | `capDiária = 1.666 × turnos`<br>`capOciosa = capMax - capDiária` | ✅ Produção |
| 📦 **Estoque** | Entrada/Saída com controle automático | `valorTotal = qtd × preço` | ✅ Produção |
| 💰 **Financeiro** | Fluxo de caixa e análise DRE | `saldo = receitas - despesas` | ✅ Produção |
| 👨‍💼 **RH** | Folha de pagamento INSS/IR 2025 | `INSS progressivo`<br>`IR = (base × aliq) - ded`<br>`líquido = bruto - INSS - IR` | ✅ Produção |
| 📈 **Relatórios** | Exportação PDF com jsPDF | - | ✅ Produção |

---

## 🎨 Interface e Design

### Layout Profissional PrescrMed Inspirado

```
✓ Sidebar lateral responsiva
✓ Gradientes modernos em headers
✓ Cards com bordas coloridas e hover effects
✓ Typography consistente e hierárquica
✓ Icons FontAwesome 6.4.0
✓ Animações suaves (transitions)
✓ Mobile-first responsive design
✓ Dark mode ready (estrutura preparada)
```

### Cores do Sistema

```css
Primary:   #3b82f6 → #2563eb (Blue gradient)
Success:   #10b981 (Green)
Warning:   #f59e0b (Amber)
Danger:    #ef4444 (Red)
Info:      #0ea5e9 (Sky)
Purple:    #8b5cf6 (Purple)
Gray:      #6b7280 (Neutral)
```

---

## 🚀 Acesso ao Sistema

### 🌐 Aplicação Online: [quatrocanto.netlify.app](https://quatrocanto.netlify.app)

### 👤 Credenciais de Demonstração

**🔐 Super Administrador** (Acesso Total ao Sistema)
```
Email: superadmin@quatrocantos.com
Senha: admin@2025

Permissões: Gerenciar empresas, visualizar todas as empresas, acesso total
```

**🏢 Administrador de Empresa** (Empresa Demo)
```
Email: admin@local.com
Senha: admin123

Permissões: Acesso completo aos módulos da empresa
```

---

## 💻 Tecnologias Utilizadas

### Frontend
```
├── HTML5 (Semântico e Acessível)
├── CSS3 (Flexbox, Grid, Animations)
├── JavaScript ES6+ (Modular)
├── Font Awesome 6.4.0 (Icons)
└── Chart.js 4.4.0 (Gráficos)
```

### Backend/Database
```
├── Firebase 9.22.0
│   ├── Authentication (Login/Registro)
│   ├── Firestore (Banco NoSQL)
│   └── Hosting (Opcional)
├── LocalStorage (Fallback/Cache)
└── IndexedDB (Dados offline)
```

### Deploy & PWA
```
├── Netlify (Deploy Automático)
├── Service Worker (Cache estratégico)
├── Manifest.json (Instalação PWA)
└── GitHub Actions (CI/CD Ready)
```

### Bibliotecas Adicionais
```
├── jsPDF 2.5.1 (Exportação PDF)
├── jsPDF-AutoTable 3.5.31 (Tabelas PDF)
├── bcrypt.js (Hash de senhas)
└── SweetAlert2 (Alertas elegantes)
```

---

## 📐 Arquitetura do Sistema

### 🏗️ Estrutura de Pastas

```
projetowash/
│
├── web/                          # Frontend da aplicação
│   ├── index.html               # Página principal (SPA)
│   ├── _redirects               # Configuração Netlify
│   ├── _headers                 # Headers de segurança
│   │
│   └── static/                  # Arquivos estáticos
│       ├── manifest.json        # PWA manifest
│       ├── service-worker.js    # Service Worker (Cache)
│       │
│       ├── css/                 # Estilos
│       │   ├── prescrimed-layout.css  # Layout principal
│       │   ├── admin.css        # Estilos admin
│       │   └── segments.css     # Estilos por segmento
│       │
│       ├── js/                  # JavaScript principal
│       │   ├── firebase-config.js      # Config Firebase
│       │   ├── firestore-service.js    # Serviços Firestore
│       │   ├── local-auth.js           # Autenticação local
│       │   ├── local-firestore.js      # Banco local
│       │   ├── auth.js                 # UI de autenticação
│       │   ├── app.js                  # App principal
│       │   ├── modules.js              # Loader de módulos
│       │   ├── dashboard.js            # Dashboard
│       │   ├── admin-module.js         # Painel admin
│       │   ├── pwa.js                  # PWA controller
│       │   │
│       │   └── modules/         # Módulos funcionais
│       │       ├── rh.js               # Folha de pagamento
│       │       ├── operacional.js      # Capacidade produtiva
│       │       ├── financeiro.js       # Fluxo de caixa
│       │       ├── estoque_entrada.js  # Entrada de produtos
│       │       ├── estoque_saida.js    # Saída/Vendas
│       │       ├── visualizar_estoque.js # Saldo de estoque
│       │       ├── gestao-empresas.js  # CRUD empresas
│       │       └── historico.js        # Histórico
│       │
│       └── icons/               # PWA icons
│           ├── icon-192x192.png
│           └── icon-512x512.png
│
├── config/                      # Configurações
│   ├── firebase.json           # Config Firebase
│   ├── firestore.rules         # Regras de segurança
│   ├── firestore.indexes.json  # Índices Firestore
│   └── netlify.toml            # Config Netlify
│
├── tests/                       # Testes automatizados
│   ├── test_auth_utils.py
│   ├── test_multi_tenant.py
│   └── test_integracao_estoque.py
│
├── scripts/                     # Scripts auxiliares
│   └── configure-netlify.ps1
│
├── README.md                    # Este arquivo
├── netlify.toml                # Deploy Netlify
├── package.json                # Dependências Node
└── requirements.txt            # Dependências Python
---

## 💻 Instalação e Execução Local

### 📋 Pré-requisitos

```bash
✓ Git instalado
✓ Node.js 18+ (opcional, para server.js)
✓ Navegador moderno (Chrome, Firefox, Edge, Safari)
```

### 📥 Instalação

#### 1️⃣ Clone o repositório

```bash
git clone https://github.com/cristiano-superacao/projetowash.git
cd projetowash
```

#### 2️⃣ Instale dependências (opcional para server local)

```bash
npm install
```

#### 3️⃣ Inicie o servidor local

**Opção A: Com Node.js**
```bash
node server.js
# Acesse: http://localhost:8000
```

**Opção B: Python HTTP Server**
```bash
cd web
python -m http.server 8000
# Acesse: http://localhost:8000
```

**Opção C: VS Code Live Server**
```
1. Abra a pasta 'web' no VS Code
2. Clique com botão direito em index.html
3. Selecione "Open with Live Server"
```

#### 4️⃣ Acesse o sistema

```
URL: http://localhost:8000
Login: superadmin@quatrocantos.com
Senha: admin@2025
```

---

## 🔥 Firebase Setup (Opcional)

### Para usar Firebase em vez de LocalStorage:

#### 1️⃣ Crie um projeto no Firebase Console

```
https://console.firebase.google.com
```

#### 2️⃣ Configure o arquivo `firebase-config.js`

```javascript
const firebaseConfig = {
    apiKey: "SUA_API_KEY",
    authDomain: "SEU_AUTH_DOMAIN",
    projectId: "SEU_PROJECT_ID",
    storageBucket: "SEU_STORAGE_BUCKET",
    messagingSenderId: "SEU_MESSAGING_SENDER_ID",
    appId: "SEU_APP_ID"
};
```

#### 3️⃣ Descomente as linhas no `index.html`

```html
<!-- Descomente estas linhas: -->
<script src="/static/js/firebase-config.js?v=41"></script>
<script src="/static/js/firestore-service.js?v=41"></script>
```

#### 4️⃣ Configure as regras do Firestore

```javascript
// Em config/firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🗄️ Estrutura de Dados

### 📊 Collections Firebase / LocalStorage

#### `usuarios` / `localUsers`
```javascript
{
  uid: string,              // ID único do usuário
  nome: string,             // Nome completo
  email: string,            // Email (unique)
  senha: string,            // Hash da senha
  role: enum,               // 'superadmin' | 'admin' | 'user'
  nomeEmpresa: string,      // Nome da empresa
  companyId: string,        // ID da empresa (isolamento)
  segmento: string,         // Segmento de atuação
  ativo: boolean,           // Status ativo/inativo
  dataCadastro: timestamp,  // Data de cadastro
  permissions: {            // Permissões granulares
    rh: boolean,
    operacional: boolean,
    financeiro: boolean,
    estoque: boolean
  }
}
```

#### `produtos`
```javascript
{
  id: string,
  codigo: string,           // Código do produto
  nome: string,             // Nome do produto
  quantidade: number,       // Quantidade em estoque
  valor: number,            // Valor unitário (custo)
  fornecedor: string,       // Nome do fornecedor
  local: string,            // Localização no estoque
  companyId: string,        // ID da empresa (multi-tenant)
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `movimentacoes`
```javascript
{
  id: string,
  tipo: enum,               // 'entrada' | 'saida'
  produtoId: string,        // ID do produto
  produtoNome: string,      // Nome do produto
  quantidade: number,       // Quantidade movimentada
  valorUnitario: number,    // Valor por unidade
  valorTotal: number,       // Valor total da movimentação
  valorVenda: number,       // Valor de venda (apenas saída)
  companyId: string,        // ID da empresa
  data: timestamp,          // Data da movimentação
  usuario: string           // Usuário que registrou
}
```

#### `folha_pagamento`
```javascript
{
  id: string,
  mes: string,              // Mês de referência
  ano: number,              // Ano de referência
  data: string,             // Data de geração
  funcionarios: [{
    nome: string,
    cargo: string,
    salarioBase: number,
    horasExtras: number,
    valorHorasExtras: number,
    salarioBruto: number,
    inss: number,           // INSS progressivo 2025
    ir: number,             // IR progressivo 2025
    descontos: number,
    salarioLiquido: number
  }],
  totais: {
    salarioBase: number,
    horasExtras: number,
    salarioBruto: number,
    inss: number,
    ir: number,
    descontos: number,
    salarioLiquido: number
  },
  companyId: string,
  createdAt: timestamp
}
```

#### `financeiro_lancamentos`
```javascript
{
  id: string,
  tipo: enum,               // 'receita' | 'despesa'
  descricao: string,        // Descrição do lançamento
  valor: number,            // Valor do lançamento
  data: string,             // Data do lançamento
  categoria: string,        // Categoria (opcional)
  companyId: string,        // ID da empresa
  createdAt: timestamp
}
```
│   ├── netlify.toml             # Config Netlify
│   ├── firebase.json            # Config Firebase
│   └── firestore.rules          # Regras Firestore
│
├── server.js                    # Servidor local Node.js
├── netlify.toml                 # Config deploy
├── package.json                 # Dependências npm
└── README.md                    # Documentação
├── 📄 .gitignore                # Arquivos ignorados pelo Git
├── 📄 GUIA_AUTENTICACAO.md      # Guia completo do sistema de autenticação
└── 📄 README.md                 # Este arquivo
```

---

## 🎯 Módulos do Sistema

### 1️⃣ Módulo Operacional

Calcula a capacidade de produção da fábrica baseada em turnos de trabalho.

**Recursos:**
- ✅ Capacidade por turno: 1.666 unidades
- ✅ Cálculo de projeções diárias, mensais e anuais
- ✅ Análise de ociosidade e percentual de uso
- ✅ Relatórios detalhados de produtividade

**Exemplo de Uso:**
```
Turnos ativos: 2
Resultado:
├─ Capacidade diária: 3.332 unidades
├─ Capacidade mensal: 99.960 unidades
├─ Capacidade anual: 1.199.520 unidades
└─ Percentual de uso: 66,67%
```

---

### 2️⃣ Gestão de Estoque

Sistema completo de controle de estoque com submenu organizado e responsivo.

**Estrutura do Menu:**
```
📦 Estoque (Menu Principal)
  ├─ 📥 Entrada - Recebimento de produtos
  ├─ 📤 Saída - Expedição e vendas
  └─ 📊 Saldo - Visualização do estoque atual
```

**Entrada de Produtos:**
- ✅ Cadastro de produtos com nome, quantidade e preço
- ✅ Validação de dados e integridade
- ✅ Integração automática com banco de dados
- ✅ Atualização de produtos existentes

**Saída de Produtos:**
- ✅ Registro de vendas e saídas
- ✅ Verificação automática de disponibilidade
- ✅ Atualização em tempo real das quantidades
- ✅ Controle de estoque mínimo

**Saldo de Estoque:**
- ✅ Visualização completa de todos os produtos
- ✅ Estoque atual com valores totais
- ✅ Filtros e busca avançada
- ✅ Export de relatórios

---

### 3️⃣ Módulo Financeiro

Análise financeira completa com cálculos de custos, precificação e projeções.

**Funcionalidades:**
- 💵 Cadastro de custos operacionais (água, luz, impostos, folha)
- 📊 Cálculo de custo por unidade produzida
- 💹 Precificação automática com margem de lucro (50%)
- 📈 Indicadores: ROI, ponto de equilíbrio, margem
- 🎯 Projeções mensais e anuais de receita e lucro
- 📋 Relatórios gerenciais detalhados

**Indicadores Calculados:**
```
├─ Custo por Unidade
├─ Preço de Venda Sugerido
├─ Margem de Lucro (%)
├─ Ponto de Equilíbrio
├─ ROI (Retorno sobre Investimento)
└─ Projeções de Receita e Lucro
```

---

### 4️⃣ Recursos Humanos

Sistema completo de folha de pagamento com cálculos tributários progressivos.

**Características:**
- 👔 Hierarquia de cargos: Operário, Supervisor, Gerente, Diretor
- ⏰ Cálculo de horas extras (valor dobrado)
- 📊 INSS progressivo (tabela oficial 2025)
- 💸 Imposto de Renda progressivo (tabela oficial 2025)
- 📄 Relatório completo e detalhado da folha de pagamento

**Tabela INSS 2025:**

| Faixa Salarial | Alíquota |
|----------------|----------|
| Até R$ 1.412,00 | 7,5% |
| R$ 1.412,01 a R$ 2.666,68 | 9% |
| R$ 2.666,69 a R$ 4.000,03 | 12% |
| R$ 4.000,04 a R$ 7.786,02 | 14% |

**Tabela IR 2025:**

| Base de Cálculo | Alíquota | Dedução |
|-----------------|----------|---------|
| Até R$ 2.259,20 | Isento | R$ 0,00 |
| R$ 2.259,21 a R$ 2.826,65 | 7,5% | R$ 169,44 |
| R$ 2.826,66 a R$ 3.751,05 | 15% | R$ 381,44 |
| R$ 3.751,06 a R$ 4.664,68 | 22,5% | R$ 662,77 |
| Acima de R$ 4.664,68 | 27,5% | R$ 896,00 |

---

## ⚙️ Configuração

### 🗄️ Banco de Dados

Por padrão, o sistema usa **SQLite** (arquivo local). Para usar **PostgreSQL** ou **MySQL**:

#### SQLite (Padrão)
```env
DATABASE_URL=sqlite:///dados.db
```

#### PostgreSQL
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/quatro_cantos
```

#### MySQL
```env
DATABASE_URL=mysql://usuario:senha@localhost:3306/quatro_cantos
```

### 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de dados
DATABASE_URL=sqlite:///dados.db

# Configurações de segurança (opcional)
SECRET_KEY=sua_chave_secreta_aqui
BCRYPT_ROUNDS=12

# Configurações da aplicação (opcional)
DEBUG=False
LOG_LEVEL=INFO
```

---

## 💻 Uso do Sistema

### Fluxo de Trabalho Recomendado

```
1. Executar main_auth.py
   ↓
2. Configuração Inicial (Opção 2)
   ├─ Cadastrar Empresa
   ├─ Cadastrar Primeiro Usuário
   └─ Configurar Permissões
   ↓
3. Login (Opção 1)
   ├─ Informar email
   └─ Informar senha
   ↓
4. Acessar Módulos Permitidos
   ├─ Operacional
   ├─ Estoque (Entrada/Saída)
   ├─ Financeiro
   └─ RH
```

### 📊 Exemplo: Calcular Capacidade Produtiva

```bash
$ python main_auth.py
> Login realizado com sucesso

MENU PRINCIPAL
1 - Módulo Operacional

> Digite: 1
> Quantos turnos estarão ativos (1, 2 ou 3)? 2

========================================
RESULTADO - CAPACIDADE PRODUTIVA
========================================
Turnos ativos: 2
Capacidade por turno: 1.666 unidades

Capacidade diária: 3.332 unidades
Capacidade mensal: 99.960 unidades
Capacidade anual: 1.199.520 unidades

Percentual de uso: 66,67%
Ociosidade: 33,33%
========================================
```

---

## 🛠️ Tecnologias

<div align="center">

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| ![Python](https://img.shields.io/badge/Python-3.7+-3776AB?style=flat&logo=python&logoColor=white) | 3.7+ | Linguagem principal |
| ![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat&logo=sqlalchemy&logoColor=white) | 2.0+ | ORM para banco de dados |
| ![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=flat&logo=sqlite&logoColor=white) | 3.x | Banco de dados padrão |
| ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Optional-336791?style=flat&logo=postgresql&logoColor=white) | 12+ | Banco de dados alternativo |
| ![bcrypt](https://img.shields.io/badge/bcrypt-4.0+-000000?style=flat) | 4.0+ | Hash seguro de senhas |
| ![python-dotenv](https://img.shields.io/badge/dotenv-1.0+-ECD53F?style=flat) | 1.0+ | Gerenciamento de variáveis |

</div>

---

## 🎓 Conceitos de Programação Aplicados

O sistema demonstra diversos conceitos importantes de programação e engenharia de software:

<details>
<summary>📚 Clique para ver todos os conceitos</summary>

### Paradigmas e Padrões
- ✅ **Programação Orientada a Objetos (POO)** - Classes, herança, encapsulamento
- ✅ **ORM (Object-Relational Mapping)** - SQLAlchemy para abstração de banco de dados
- ✅ **Arquitetura Multi-Tenant** - Isolamento de dados por empresa
- ✅ **RBAC (Role-Based Access Control)** - Controle de acesso baseado em permissões

### Boas Práticas
- ✅ **Separação de Responsabilidades** - Módulos independentes e coesos
- ✅ **Funções Puras** - Lógica isolada e testável
- ✅ **Validação de Dados** - Entrada do usuário sempre validada
- ✅ **Tratamento de Exceções** - Try-catch para erros previsíveis
- ✅ **Configuração Externa** - Variáveis de ambiente (.env)

### Segurança
- ✅ **Hash de Senhas** - Bcrypt para armazenamento seguro
- ✅ **Proteção SQL Injection** - ORM previne ataques
- ✅ **Isolamento de Dados** - Multi-tenancy com filtros automáticos
- ✅ **Validação de Permissões** - Checagem antes de cada operação

### Estruturas de Dados
- ✅ **Listas e Dicionários** - Manipulação eficiente de coleções
- ✅ **Relacionamentos** - One-to-Many, Many-to-Many (banco de dados)
- ✅ **Enumerações** - Tipos de permissões definidos

### Algoritmos
- ✅ **Cálculos Progressivos** - INSS e IR por faixas
- ✅ **Projeções Matemáticas** - Capacidade produtiva e financeira
- ✅ **Agregações** - Soma de custos, médias, totais

</details>

---

## 📖 Documentação Completa

Para acessar a documentação detalhada com todos os recursos, exemplos e guias passo a passo:

### 🌐 Documentação HTML

```bash
# Abra no navegador
docs/index.html
```

**Conteúdo da Documentação:**
- 📋 Guia completo de instalação e configuração
- 📊 Descrição detalhada de cada módulo
- 🗄️ Estrutura completa do banco de dados
- 💡 Exemplos práticos de uso
- 📈 Tabelas de INSS e IR atualizadas (2025)
- 🎓 Conceitos de programação aplicados
- 🏗️ Arquitetura e design do sistema
- 🔒 Práticas de segurança implementadas

### 📊 Fluxograma Interativo

```bash
# Visualize o fluxo completo do sistema
docs/fluxograma.html
```

**Recursos do Fluxograma:**
- 🔄 Fluxo principal do sistema
- 📦 Fluxos detalhados de cada módulo
- 🎯 Tabelas de decisão
- 🏗️ Diagramas de arquitetura
- 📱 Layout totalmente responsivo

### 📘 Guia de Autenticação

```bash
# Guia completo do sistema de autenticação
GUIA_AUTENTICACAO.md
```

---

## 🔒 Segurança

O sistema implementa múltiplas camadas de segurança:

| Camada | Implementação | Descrição |
|--------|---------------|-----------|
| 🔐 **Autenticação** | Bcrypt | Senhas armazenadas com hash bcrypt (rounds configuráveis) |
| 🛡️ **Autorização** | RBAC | Permissões granulares por módulo e usuário |
| 🗄️ **Banco de Dados** | ORM | Proteção contra SQL injection via SQLAlchemy |
| 🏢 **Multi-Tenancy** | Filtros | Isolamento automático de dados por empresa |
| ✅ **Validação** | Input Check | Todas as entradas validadas antes do processamento |
| 🔒 **Configuração** | .env | Dados sensíveis em arquivo não versionado |

### Boas Práticas de Segurança Implementadas

```python
✅ Senhas nunca armazenadas em texto plano
✅ Hash bcrypt com salt automático
✅ Validação de tipos e formatos de entrada
✅ Queries parametrizadas (ORM)
✅ Separação de credenciais (.env)
✅ Logs de acesso e operações
✅ Timeout de sessão configurável
✅ Permissões verificadas em cada operação
```

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Siga estas etapas:

### 🔄 Fluxo de Contribuição

1. **Fork o projeto**
   ```bash
   # Clique em "Fork" no GitHub
   ```

2. **Clone seu fork**
   ```bash
   git clone https://github.com/seu-usuario/Quatro-Cantos.git
   cd Quatro-Cantos
   ```

3. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/MinhaNovaFeature
   ```

4. **Faça suas alterações e commit**
   ```bash
   git add .
   git commit -m "Adiciona: Descrição da funcionalidade"
   ```

5. **Push para sua branch**
   ```bash
   git push origin feature/MinhaNovaFeature
   ```

6. **Abra um Pull Request**
   - Acesse o repositório original no GitHub
   - Clique em "New Pull Request"
   - Descreva suas alterações detalhadamente

### 📝 Diretrizes de Commit

```
feat: Nova funcionalidade
fix: Correção de bug
docs: Atualização de documentação
style: Formatação de código
refactor: Refatoração de código
test: Adição de testes
chore: Manutenção geral
```

### ✅ Checklist antes do Pull Request

- [ ] Código segue o padrão PEP 8
- [ ] Todos os testes passam
- [ ] Documentação atualizada
- [ ] Commits com mensagens descritivas
- [ ] Branch atualizada com a main/master

---

---

## 🚀 Como Usar

### 🔐 1. Login no Sistema

#### SuperAdmin (Acesso Total)
```
Email: superadmin@quatrocantos.com
Senha: admin@2025
Permissões: Acesso completo ao sistema + painel de gestão de empresas
```

#### Empresas Demo
```
Indústria:
  Email: industria@demo.com
  Senha: demo123
  Segmento: Indústria

Comércio:
  Email: comercio@demo.com
  Senha: demo123
  Segmento: Comércio

Serviços:
  Email: servicos@demo.com
  Senha: demo123
  Segmento: Serviços
```

### 📊 2. Navegação por Módulos

#### Dashboard
- KPIs principais, gráficos e estatísticas em tempo real

#### Estoque
- **Entrada**: Cadastro de produtos e fornecedores
- **Saída/Venda**: Vendas com cálculo automático de margem 30%
- **Visualização**: Tabela completa com busca e export PDF

#### RH
- Folha de pagamento com INSS/IRRF 2025
- Horas extras CLT (1.5×)
- Relatórios PDF

#### Operacional
- Análise de capacidade produtiva
- Gráficos de turnos e ocupação
- Integração com dados reais

#### Financeiro
- Receitas e despesas
- Saldo e fluxo de caixa
- Gráficos e export PDF

---

## 🤝 Contribuindo

1. Fork o repositório
2. Crie branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m "feat: adiciona nova funcionalidade"`
4. Push: `git push origin feature/nova-feature`
5. Abra Pull Request

**Commits semânticos**: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`

---

## 📞 Suporte

### 🆘 Precisa de Ajuda?

- 🐛 **Issues**: [Reportar Bug ou Sugerir Feature](https://github.com/cristiano-superacao/projetowash/issues)
- 📖 **Documentação**: Leia este README completo
- 💬 **Contato**: GitHub [@cristiano-superacao](https://github.com/cristiano-superacao)

---

## 📜 Licença

Licença **MIT**. Veja LICENSE para detalhes.

---

## 📈 Roadmap

### v42 (Próxima)
- [ ] Dashboard com ROI/EBITDA
- [ ] Export Excel
- [ ] Notificações PWA

### v43
- [ ] Sistema de tarefas
- [ ] API REST
- [ ] Auditoria de ações

### v44
- [ ] Módulo CRM
- [ ] App mobile
- [ ] BI com ML

---

## 👥 Autores e Equipe

<div align="center">

### 🎓 Informações Acadêmicas

**Disciplina:** Lógica de Programação  
**Professor:** Washington Luis Souza Anunciação  
**Data de Início:** 22 de novembro de 2025  
**Instituição:** SENAI

</div>

### 👨‍💻 Integrantes da Equipe

<table align="center">
<thead>
<tr>
<th align="center">#</th>
<th align="left">Nome Completo</th>
<th align="left">Email</th>
<th align="center">Responsabilidades</th>
</tr>
</thead>
<tbody>
<tr>
<td align="center">1</td>
<td><strong>Gabriela M. N. Silva</strong></td>
<td>gabriela.m.silva@ba.estudante.senai.br</td>
<td>
  🎯 Desenvolvedora Principal<br>
  📝 GitHub Owner<br>
  🔗 Integração remota<br>
  📊 Gestão do projeto
</td>
</tr>
<tr>
<td align="center">2</td>
<td><strong>Cristiano Silva Santos</strong></td>
<td>cristiano.s.santos@ba.estudante.senai.br</td>
<td>
  💻 Desenvolvedor<br>
  🔐 Autenticação<br>
  🗄️ Banco de Dados<br>
  📖 Documentação
</td>
</tr>
<tr>
<td align="center">3</td>
<td><strong>Joel Macena Costa</strong></td>
<td>joel.c@ba.estudante.senai.br</td>
<td>
  💻 Desenvolvedor<br>
  ⚙️ Módulos de Negócio<br>
  🧪 Testes<br>
  📊 Análises
</td>
</tr>
</tbody>
</table>

---

## ⭐ Agradecimentos

- **Chart.js** - Gráficos interativos
- **jsPDF** - Geração de PDFs
- **FontAwesome** - Ícones
- **Firebase** - Backend as a Service
- **Netlify** - Hospedagem
- **GitHub Copilot** - Assistência no desenvolvimento

---

<div align="center">

## 🌟 Se este projeto foi útil, deixe uma ⭐ no GitHub!

**Sistema Quatro Cantos v41** - Gestão Empresarial Multi-Tenant Completa

Desenvolvido com ❤️ pela equipe SENAI

[🔗 Acessar Sistema](https://quatrocanto.netlify.app) | [📖 Documentação](https://github.com/cristiano-superacao/projetowash) | [🐛 Issues](https://github.com/cristiano-superacao/projetowash/issues)

---

**© 2025 Sistema Quatro Cantos** | Licença MIT

</div>

---

## 📝 Changelog - Histórico de Atualizações

### 🎯 Versão Atual - Dezembro 2025

#### ✨ Melhorias de UI/UX
- **Submenu Expandível no Estoque**
  - Organização hierárquica: Entrada, Saída e Saldo dentro do menu Estoque
  - Animações suaves com `cubic-bezier(0.4, 0, 0.2, 1)`
  - Ícone chevron com rotação de 180° ao expandir
  - Transição de opacidade (fade in/out) profissional

#### 🔧 Otimizações de Layout
- **Sidebar Responsivo**
  - Scroll suave com scrollbar customizada (6px, cores sutis)
  - Espaçamento compacto para visualizar todos os módulos
  - Padding otimizado: reduzido 35% mantendo legibilidade
  - Ícones redimensionados: 38px (principal) e 34px (submenu)
  
- **Submenu Técnico**
  - `max-height: 1000px` para comportar 3+ itens
  - `overflow: visible` quando expandido
  - `z-index: 1` para evitar sobreposição
  - `padding-bottom: 2rem` para scroll completo

#### 🎨 Melhorias Visuais
- Background sutil nos itens do submenu: `rgba(255, 255, 255, 0.03)`
- Bordas temáticas de 3px com cores por categoria
- Hover effects: `translateX(5px)` + shadow para feedback
- Text overflow com ellipsis para textos longos

#### 🐛 Correções
- ✅ Botão "Saldo" agora completamente visível no submenu
- ✅ Scroll do sidebar funcional em todas as resoluções
- ✅ Animações suaves sem travamentos
- ✅ Layout responsivo mantido em mobile/tablet/desktop

---

<div align="center">

### 📊 Estatísticas do Projeto

![GitHub repo size](https://img.shields.io/github/repo-size/gabrielamnss1/Quatro-Cantos?color=blue)
![GitHub language count](https://img.shields.io/github/languages/count/gabrielamnss1/Quatro-Cantos?color=green)
![GitHub top language](https://img.shields.io/github/languages/top/gabrielamnss1/Quatro-Cantos?color=yellow)
![GitHub last commit](https://img.shields.io/github/last-commit/gabrielamnss1/Quatro-Cantos?color=red)

---

### 📌 Versão e Atualização

**Versão Atual:** `1.0.0`  
**Última Atualização:** Dezembro 2025  
**Status:** ✅ Ativo e em Desenvolvimento

---

### ⭐ Se este projeto foi útil, considere dar uma estrela!

[![GitHub stars](https://img.shields.io/github/stars/gabrielamnss1/Quatro-Cantos?style=social)](https://github.com/gabrielamnss1/Quatro-Cantos/stargazers)

---

**Desenvolvido com** ❤️ **pela Equipe Quatro Cantos**

</div>
