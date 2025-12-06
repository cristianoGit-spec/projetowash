<div align="center">

# 🏢 Sistema Quatro Cantos

### Sistema de Gestão Empresarial Multi-Empresa com Layout Responsivo

[![Status](https://img.shields.io/badge/Status-Active-success.svg)](https://github.com/cristiano-superacao/projetowash)
[![Deploy](https://img.shields.io/badge/Deploy-Netlify-00C7B7.svg)](https://quatrocanto.netlify.app)
[![License](https://img.shields.io/badge/License-Educational-green.svg)](LICENSE)

**🌐 Demo Online:** [quatrocanto.netlify.app](https://quatrocanto.netlify.app)

</div>

---

## 📋 Visão Geral

O **Sistema Quatro Cantos** é uma solução completa e profissional para gestão empresarial multi-tenant (múltiplas empresas) com controle de acesso baseado em permissões. Interface moderna, responsiva e intuitiva com suporte PWA (Progressive Web App).

### 🎯 Características Principais

| Módulo | Descrição | Status |
|--------|-----------|--------|
| 🔐 **Autenticação** | Sistema completo de login/registro | ✅ Ativo |
| 🏢 **Multi-Empresa** | Suporte a múltiplas empresas com isolamento de dados | ✅ Ativo |
| 👥 **Gestão de Usuários** | Cadastro e gerenciamento de usuários por empresa | ✅ Ativo |
| 🛡️ **Painel Admin** | Super administrador com controle total das empresas | ✅ Ativo |
| 🔒 **Controle de Acesso** | Permissões granulares por módulo (RBAC) | ✅ Ativo |
| ⚙️ **Operacional** | Cálculo de capacidade produtiva por turnos | ✅ Ativo |
| 📦 **Estoque** | Controle completo de entrada e saída de produtos | ✅ Ativo |
| 💰 **Financeiro** | Análise de custos, precificação e projeções | ✅ Ativo |
| 👨‍💼 **RH** | Folha de pagamento com INSS e IR progressivos | ✅ Ativo |

---

## 🚀 Acesso Rápido - Demo Online

### 🌐 URL: [quatrocanto.netlify.app](https://quatrocanto.netlify.app)

### 👤 Credenciais de Teste

**Super Administrador** (Acesso Total)
```
Email: superadmin@quatrocantos.com
Senha: admin@2025
```

**Administrador** (Empresa Demo)
```
Email: admin@local.com
Senha: admin123
```

---

## 🎨 Layout Responsivo e Profissional

O sistema possui design moderno e totalmente adaptável a qualquer dispositivo:

- ✅ **Desktop** - Layout completo com sidebar e dashboard expansivo
- ✅ **Tablet** - Interface otimizada com navegação adaptativa
- ✅ **Mobile** - Menu mobile responsivo e cards otimizados
- ✅ **PWA** - Instalável como aplicativo nativo
- ✅ **Tema Personalizável** - Cores adaptadas ao segmento da empresa

### 🎯 Melhorias Recentes de UI/UX

**Submenu Expandivel:**
- 📦 Menu Estoque com 3 sub-opções (Entrada, Saída, Saldo)
- ⚙️ Animações suaves com `cubic-bezier` profissional
- 🔄 Rotação do ícone chevron em 180°
- 📊 Scroll suave no sidebar com scrollbar customizada

**Otimizações de Layout:**
- 📊 Espaçamento compacto e profissional
- 🎯 Ícones otimizados (38px principais, 34px submenu)
- 🖌️ Fontes balanceadas para melhor legibilidade
- 💡 Hover effects com feedback visual
- 🎨 Background sutil e bordas temáticas

### 🎯 Segmentos Empresariais Suportados

| Segmento | Ícone | Cor |
|----------|-------|-----|
| 🏗️ Construção | `fa-hard-hat` | #d97706 |
| 🍔 Restaurante | `fa-utensils` | #dc2626 |
| 🛒 Varejo | `fa-shopping-cart` | #2563eb |
| 🏥 Saúde | `fa-heartbeat` | #16a34a |
| 🎓 Educação | `fa-graduation-cap` | #7c3aed |
| 🚗 Automotivo | `fa-car` | #0891b2 |
| 🏭 Indústria | `fa-industry` | #64748b |
| 💻 Tecnologia | `fa-laptop-code` | #6366f1 |

---

## 💻 Instalação Local

### 📋 Pré-requisitos

- **Node.js 18+** (para desenvolvimento local)
- **Git** (para clonar o repositório)
- **Navegador moderno** (Chrome, Firefox, Edge, Safari)

### 📥 Passo a Passo

#### 1️⃣ Clone o repositório

```bash
git clone https://github.com/cristiano-superacao/projetowash.git
cd projetowash
```

#### 2️⃣ Inicie o servidor local

```bash
node server.js
```

#### 3️⃣ Acesse no navegador

```
http://localhost:8000
```

---

## 🗄️ Banco de Dados

### LocalStorage (Atual - Modo Demo)

O sistema utiliza `localStorage` do navegador para armazenar dados:

- ✅ Sem necessidade de servidor backend
- ✅ Funciona 100% offline
- ✅ Perfeito para demonstrações
- ✅ Dados persistem no navegador
- ⚠️ Limitado ao navegador/dispositivo

### Estrutura de Dados

**localUsers** - Array de usuários/empresas
```javascript
{
  uid: string,
  nome: string,
  email: string,
  senha: string,
  role: 'admin' | 'superadmin' | 'user',
  nomeEmpresa: string,
  companyId: string,
  segmento: string,
  ativo: boolean,
  dataCadastro: string
}
```

**localCurrentUser** - Usuário logado atualmente
```javascript
{
  uid: string,
  email: string,
  role: string,
  companyId: string,
  // ... outros campos
}
```

### Firebase (Opcional - Produção)

Para ambiente de produção, descomente as linhas no `index.html`:
```html
<!-- <script src="/static/js/firebase-config.js"></script> -->
<!-- <script src="/static/js/firestore-service.js"></script> -->
```

---

## 📁 Estrutura do Projeto

```
projetowash/
│
├── 📂 web/                      # Frontend (deploy no Netlify)
│   ├── index.html               # Página principal
│   ├── favicon.ico              # Ícone do site
│   ├── service-worker.js        # PWA Service Worker
│   │
│   └── 📂 static/
│       ├── 📂 css/
│       │   ├── style.css        # Estilos principais
│       │   ├── admin.css        # Estilos do painel admin
│       │   └── segments.css     # Estilos dos segmentos
│       │
│       ├── 📂 js/
│       │   ├── app.js           # Lógica principal
│       │   ├── auth.js          # Autenticação
│       │   ├── admin-module.js  # Painel super admin
│       │   ├── dashboard.js     # Dashboard principal
│       │   ├── local-auth.js    # Auth localStorage
│       │   ├── local-firestore.js # DB localStorage
│       │   │
│       │   └── 📂 modules/
│       │       ├── operacional.js
│       │       ├── estoque_entrada.js
│       │       ├── estoque_saida.js
│       │       ├── financeiro.js
│       │       ├── rh.js
│       │       └── visualizar_estoque.js
│       │
│       └── 📂 icons/            # Ícones PWA
│
├── 📂 config/
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

## 📞 Suporte

### 🆘 Precisa de Ajuda?

- 🐛 **Issues**: [Reportar Bug ou Sugerir Feature](https://github.com/gabrielamnss1/Quatro-Cantos/issues)
- 📖 **Documentação**: Abra `docs/index.html` no navegador
- 📊 **Fluxograma**: Abra `docs/fluxograma.html` no navegador
- 📘 **Guia de Autenticação**: Leia `GUIA_AUTENTICACAO.md`

### 🔗 Links Úteis

- [Repositório GitHub](https://github.com/gabrielamnss1/Quatro-Cantos)
- [Documentação SQLAlchemy](https://docs.sqlalchemy.org/)
- [Python.org](https://www.python.org/)
- [PEP 8 - Style Guide](https://pep8.org/)

---

## 📜 Licença

Este projeto foi desenvolvido para fins educacionais e de gestão empresarial.

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
  📝 Autora da conta GitHub<br>
  🔗 Integração com repositório remoto<br>
  📊 Gerenciamento do projeto
</td>
</tr>
<tr>
<td align="center">2</td>
<td><strong>Cristiano Silva Santos</strong></td>
<td>cristiano.s.santos@ba.estudante.senai.br</td>
<td>
  💻 Desenvolvedor<br>
  🔐 Sistema de Autenticação<br>
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
  🧪 Testes e Validação<br>
  📊 Análises
</td>
</tr>
</tbody>
</table>

### 🤝 Áreas de Contribuição

Todos os integrantes contribuem ativamente para:

- ✅ **Implementação de Funcionalidades** - Desenvolvimento de módulos e recursos
- ✅ **Testes e Validação** - Garantia de qualidade do código
- ✅ **Documentação** - Manutenção de documentação técnica e de usuário
- ✅ **Revisão de Código** - Code review e melhorias contínuas
- ✅ **Arquitetura** - Decisões técnicas e de design
- ✅ **Suporte** - Auxílio aos usuários e correção de bugs

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
