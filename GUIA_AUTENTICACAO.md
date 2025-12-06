# Guia de Uso - Sistema com Autenticação

## Arquivos Criados

1. **models.py** - Modelos de dados (Empresa, Usuario, Permissao)
2. **gestao_usuarios.py** - Módulo de gerenciamento de usuários
3. **main_auth.py** - Sistema principal com autenticação

## Como Usar

### 1. Primeira Execução - Configuração Inicial

Execute o sistema:
```bash
py main_auth.py
```

No menu principal, escolha a opção **2 - Gestão de Usuários e Empresas**

#### Passo 1: Cadastrar uma Empresa
- Escolha opção **1 - Cadastrar Empresa**
- Informe:
  - Nome da Empresa (Razão Social)
  - CNPJ (14 dígitos, apenas números)
  - Segmento (Indústria, Comércio, Serviços, etc.)

#### Passo 2: Cadastrar o Primeiro Usuário
- Escolha opção **3 - Cadastrar Usuário**
- Selecione a empresa cadastrada
- Informe:
  - Nome completo
  - Email (será usado para login)
  - Senha (mínimo 6 caracteres)
  - Se é administrador (S/N)

**Importante:** O primeiro usuário deve ser um administrador!

#### Passo 3: Configurar Permissões (se não for admin)
- Se o usuário não for administrador, configure as permissões
- Escolha os módulos que ele poderá acessar:
  - 1 - Módulo Operacional
  - 2 - Estoque - Entrada
  - 3 - Estoque - Saída
  - 4 - Módulo Financeiro
  - 5 - Módulo RH

### 2. Fazendo Login

1. No menu principal, escolha **1 - Login**
2. Digite seu email e senha
3. O sistema exibirá seus dados e permissões
4. Você verá apenas os módulos que tem permissão para acessar

### 3. Estrutura de Permissões

#### Administrador
- Tem acesso a TODOS os módulos
- Pode cadastrar empresas
- Pode cadastrar usuários
- Pode configurar permissões de outros usuários

#### Usuário Normal
- Tem acesso apenas aos módulos configurados
- Não pode acessar gestão de usuários
- Vê apenas dados da sua empresa (multi-tenancy)

### 4. Multi-Tenancy (Isolamento por Empresa)

Cada empresa tem seus próprios dados isolados:
- Produtos no estoque
- Funcionários
- Dados operacionais
- Dados financeiros

Os usuários de uma empresa **não podem ver** dados de outras empresas.

## Diferenças entre main.py e main_auth.py

### main.py (Original)
- Sem controle de acesso
- Todos os módulos sempre disponíveis
- Sem conceito de empresa ou usuário
- Ideal para uso simples ou demonstração

### main_auth.py (Novo)
- Com autenticação e autorização
- Módulos baseados em permissões
- Multi-tenancy (várias empresas no mesmo sistema)
- Controle completo de acesso
- Ideal para uso empresarial real

## Exemplos de Uso

### Cenário 1: Empresa com Separação de Funções

**Empresa:** Indústria ABC Ltda

**Usuários:**
1. **João (Administrador)**
   - Acesso: TODOS os módulos
   - Pode cadastrar usuários

2. **Maria (Operacional)**
   - Acesso: Módulo Operacional apenas
   - Calcula capacidade produtiva

3. **Carlos (Estoquista)**
   - Acesso: Estoque Entrada e Saída
   - Gerencia entrada e saída de produtos

4. **Ana (Financeiro)**
   - Acesso: Módulo Financeiro
   - Analisa custos e lucros

5. **Pedro (RH)**
   - Acesso: Módulo RH
   - Calcula folha de pagamento

### Cenário 2: Múltiplas Empresas

O sistema suporta várias empresas simultaneamente:

1. **Indústria ABC** (ID: 1)
   - Usuários: João, Maria, Carlos
   - Dados isolados

2. **Comércio XYZ** (ID: 2)
   - Usuários: Ana, Pedro
   - Dados isolados

Cada empresa vê apenas seus próprios dados!

## Comandos Úteis

### Listar todas as empresas cadastradas
```
Menu Gestão > Opção 2
```

### Listar todos os usuários
```
Menu Gestão > Opção 4
```

### Modificar permissões de um usuário
```
Menu Gestão > Opção 5 > Digite o ID do usuário
```

## Segurança

- Senhas são armazenadas com hash bcrypt (nunca em texto puro)
- Cada usuário só acessa dados da sua empresa
- Permissões são verificadas antes de cada acesso
- Sistema de logs de último login

## Troubleshooting

### "Nenhuma empresa cadastrada"
- Você precisa cadastrar uma empresa primeiro (Opção 2 > 1)

### "Usuário sem permissões"
- Administrador precisa configurar permissões (Opção 2 > 5)

### "Email ou senha incorretos"
- Verifique as credenciais
- Certifique-se que o usuário está ativo

### "Empresa inativa"
- Contate o suporte do sistema

## Próximos Passos

Após configurar o sistema, você pode:
1. Cadastrar mais usuários com diferentes permissões
2. Configurar produtos no estoque
3. Usar os módulos conforme suas permissões
4. Cadastrar outras empresas se necessário

---

**Sistema Quatro Cantos v2.0 - Com Autenticação e Multi-Tenancy**
