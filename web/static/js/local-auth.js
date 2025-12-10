// ============================================================================
// SISTEMA LOCAL - AUTENTICAÇÃO FALLBACK (v15.0)
// ============================================================================
// Este arquivo é usado como FALLBACK quando Firebase não está disponível
// Modo híbrido: Firebase prioritário, localStorage como backup
// ============================================================================

console.log('💾 local-auth.js v15.0 carregado - Modo Fallback Híbrido');

// Variáveis globais locais
let localUsers = [];
let localCurrentUser = null;
let localIsAdmin = false;
let localIsSuperAdmin = false;

// Contador de empresas para numeração automática
let empresaCounter = 0;

// Senhas padrão em texto simples (modo desenvolvimento)
const DEFAULT_PASSWORDS = {
    superadmin: 'admin@2025',
    admin: 'admin123',
    alice: 'alice123',
    superacao: 'super123'
};

// ============================================================================
// FUNÇÕES DE PERSISTÊNCIA LOCAL
// ============================================================================

/**
 * Gerar próximo número de empresa
 */
function getNextEmpresaNumber() {
    const counterKey = 'empresaCounter';
    let counter = parseInt(localStorage.getItem(counterKey) || '0', 10);
    counter++;
    localStorage.setItem(counterKey, counter.toString());
    return counter.toString().padStart(4, '0');
}

/**
 * Adicionar numeração ao nome da empresa se não existir
 */
function addEmpresaNumber(nomeEmpresa) {
    // Verificar se já tem número no formato [0001]
    if (/^\[\d{4}\]/.test(nomeEmpresa)) {
        return nomeEmpresa;
    }
    const numero = getNextEmpresaNumber();
    return `[${numero}] ${nomeEmpresa}`;
}

/**
 * Carregar usuários do localStorage
 */
function loadLocalUsers() {
    const stored = localStorage.getItem('localUsers');
    if (stored) {
        localUsers = JSON.parse(stored);
        
        // Inicializar contador baseado nas empresas existentes
        const empresasComNumero = localUsers.filter(u => u.nomeEmpresa && /^\[\d{4}\]/.test(u.nomeEmpresa));
        if (empresasComNumero.length > 0) {
            const numeros = empresasComNumero.map(u => {
                const match = u.nomeEmpresa.match(/^\[(\d{4})\]/);
                return match ? parseInt(match[1], 10) : 0;
            });
            const maxNumero = Math.max(...numeros);
            localStorage.setItem('empresaCounter', maxNumero.toString());
        }
        
        // Garantir que o super admin exista
        const superAdminIndex = localUsers.findIndex(u => u.email === 'superadmin@quatrocantos.com');
        const defaultSuperAdmin = {
            uid: 'superadmin-master-001',
            nome: 'Super Administrador',
            nomeEmpresa: '[0000] Quatro Cantos - Administração',
            email: 'superadmin@quatrocantos.com',
            senha: DEFAULT_PASSWORDS.superadmin,
            role: 'superadmin',
            segmento: 'construcao',
            companyId: 'superadmin-master',
            ativo: true,
            dataCadastro: new Date().toISOString(),
            allowedModules: ['dashboard', 'admin', 'operacional', 'estoque-entrada', 'estoque-saida', 'financeiro', 'rh', 'visualizar', 'historico']
        };

        if (superAdminIndex === -1) {
            localUsers.unshift(defaultSuperAdmin);
            saveLocalUsers();
        } else {
            localUsers[superAdminIndex] = defaultSuperAdmin;
            saveLocalUsers();
        }
        
        // Garantir que o admin padrao exista e tenha os campos novos
        const adminIndex = localUsers.findIndex(u => u.loginUsuario === 'admin');
        const defaultAdmin = {
            uid: 'admin-local-001',
            nome: 'Administrador',
            nomeEmpresa: '[0001] Empresa Local Demo',
            email: 'admin@local.com',
            contato: '(00) 00000-0000',
            loginUsuario: 'admin',
            senha: DEFAULT_PASSWORDS.admin, // admin123
            role: 'admin',
            companyId: 'comp-default',
            ativo: true,
            dataCadastro: new Date().toISOString()
        };

        if (adminIndex === -1) {
            localUsers.push(defaultAdmin);
            saveLocalUsers();
        } else {
            const admin = localUsers[adminIndex];
            // Atualizar campos faltantes se necessário
            if (!admin.companyId || !admin.nomeEmpresa) {
                admin.companyId = 'comp-default';
                admin.nomeEmpresa = '[0001] Empresa Local Demo';
                localUsers[adminIndex] = admin;
                saveLocalUsers();
            }
        }
    } else {
        // Usuarios padroes: super admin e admin
        localUsers = [
            {
                uid: 'superadmin-master-001',
                nome: 'Super Administrador',
                nomeEmpresa: '[0000] Quatro Cantos - Administração',
                email: 'superadmin@quatrocantos.com',
                senha: DEFAULT_PASSWORDS.superadmin,
                role: 'superadmin',
                segmento: 'construcao',
                companyId: 'superadmin-master',
                ativo: true,
                dataCadastro: new Date().toISOString()
            },
            {
                uid: 'admin-local-001',
                nome: 'Administrador',
                nomeEmpresa: '[0001] Empresa Local Demo',
                email: 'admin@local.com',
                contato: '(00) 00000-0000',
                loginUsuario: 'admin',
                senha: DEFAULT_PASSWORDS.admin,
                role: 'admin',
                companyId: 'comp-default',
                ativo: true,
                dataCadastro: new Date().toISOString()
            },
            {
                uid: 'user-local-alice',
                nome: 'Alice',
                nomeEmpresa: '[0001] Empresa Local Demo',
                email: 'alice@gmail.com',
                contato: '(00) 91234-5678',
                loginUsuario: 'alice',
                senha: DEFAULT_PASSWORDS.admin,
                role: 'user',
                companyId: 'comp-default',
                ativo: true,
                dataCadastro: new Date().toISOString()
            },
            {
                uid: 'user-local-gaby',
                nome: 'Gabriela Silva',
                nomeEmpresa: '[0001] Empresa Local Demo',
                email: 'gaby@gmail.com',
                contato: '(00) 92345-6789',
                loginUsuario: 'gaby',
                senha: DEFAULT_PASSWORDS.admin,
                role: 'user',
                companyId: 'comp-default',
                ativo: true,
                dataCadastro: new Date().toISOString()
            },
            {
                uid: 'user-local-superacao',
                nome: 'Superação',
                nomeEmpresa: '[0001] Empresa Local Demo',
                email: 'alice@gmail.com',
                contato: '(11) 99999-9999',
                loginUsuario: 'alice',
                senha: DEFAULT_PASSWORDS.alice,
                role: 'admin',
                companyId: 'comp-default',
                cargo: 'Diretor',
                ativo: true,
                dataCadastro: new Date().toISOString()
            },
            {
                uid: 'user-local-superacao',
                nome: 'Cristiano Superacao',
                nomeEmpresa: '[0002] Superação Ltda',
                email: 'superacao@gmail.com',
                contato: '(00) 00000-0000',
                loginUsuario: 'superacao',
                senha: DEFAULT_PASSWORDS.superacao,
                role: 'admin',
                companyId: 'comp-superacao',
                cargo: 'CEO',
                ativo: true,
                dataCadastro: new Date().toISOString()
            }
        ];
        saveLocalUsers();
    }
}

// Salvar usuarios no localStorage
function saveLocalUsers() {
    localStorage.setItem('localUsers', JSON.stringify(localUsers));
}

// Carregar usuario atual
function loadLocalCurrentUser() {
    const stored = localStorage.getItem('localCurrentUser');
    if (stored) {
        localCurrentUser = JSON.parse(stored);
        localIsAdmin = localCurrentUser.role === 'admin' || localCurrentUser.role === 'superadmin';
        showApp();
        // Aguardar um momento para garantir que o DOM foi atualizado
        setTimeout(() => {
            if (typeof showModule === 'function') {
                showModule('dashboard');
            } else {
                console.warn('⚠️ showModule não disponível, tentando loadDashboard...');
                if (typeof loadDashboard === 'function') {
                    loadDashboard();
                }
            }
        }, 100);
    } else {
        showAuth();
    }
}

// Atualizar informações do usuário no UI - REMOVIDO (Duplicado em app.js)
// function updateUserInfoUI() { ... }

// Salvar usuario atual
function saveLocalCurrentUser() {
    if (localCurrentUser) {
        localStorage.setItem('localCurrentUser', JSON.stringify(localCurrentUser));
    } else {
        localStorage.removeItem('localCurrentUser');
    }
}

/**
 * Login local (Sistema híbrido - fallback)
 * @param {string} emailOrLogin - Email ou login do usuário
 * @param {string} password - Senha em texto simples
 * @returns {Promise<Object>} - Dados do usuário autenticado
 */
async function loginLocal(emailOrLogin, password) {
    console.log('🔑 Tentando login local:', emailOrLogin);
    console.log('📋 Usuários disponíveis:', localUsers.length);
    
    // Garantir que os usuários foram carregados
    if (localUsers.length === 0) {
        console.warn('⚠️ Nenhum usuário carregado, recarregando...');
        loadLocalUsers();
    }
    
    // Buscar usuário por email ou loginUsuario
    const user = localUsers.find(u => 
        u.email === emailOrLogin || u.loginUsuario === emailOrLogin
    );
    
    if (!user) {
        console.error('❌ Usuário não encontrado:', emailOrLogin);
        console.log('📋 Usuários disponíveis:', localUsers.map(u => ({ email: u.email, login: u.loginUsuario })));
        
        // Mensagem mais amigável com sugestões claras
        const usuariosDisponiveis = localUsers.length > 0 
            ? '\n\n👉 Usuários cadastrados:\n• ' + localUsers.map(u => `${u.email} (${u.nome})`).join('\n• ')
            : '\n\n🚫 Nenhum usuário cadastrado. Crie uma conta primeiro.';
        
        throw new Error(`Email "${emailOrLogin}" não encontrado.${usuariosDisponiveis}`);
    }
    
    console.log('✅ Usuário encontrado:', user.email);
    
    // Verificar senha (texto simples - modo desenvolvimento)
    if (user.senha !== password) {
        console.error('❌ Senha incorreta');
        throw new Error('Senha incorreta');
    }
    
    if (!user.ativo) {
        throw new Error('Usuário inativo. Entre em contato com o administrador.');
    }
    
    console.log('✅ Login bem-sucedido:', user.email);
    
    // Login bem-sucedido
    localCurrentUser = user;
    localIsAdmin = user.role === 'admin' || user.role === 'superadmin';
    localIsSuperAdmin = user.role === 'superadmin';
    saveLocalCurrentUser();
    
    // Carregar dados locais primeiro
    if (typeof loadLocalData === 'function') {
        loadLocalData();
    }
    
    // Mostrar app e dashboard
    showApp();
    setTimeout(() => {
        if (typeof showModule === 'function') {
            showModule('dashboard');
        } else if (typeof loadDashboard === 'function') {
            loadDashboard();
        }
    }, 150);
    
    return user;
}

/**
 * Cadastro local com senha em texto simples
 */
async function cadastrarUsuarioLocal(nome, email, contato, loginUsuario, senha, extraData) {
    // Se Firebase estiver ativo, usar Firebase ao invés de local
    if (typeof firebaseInitialized !== 'undefined' && firebaseInitialized && typeof cadastrarEmpresaFirebase !== 'undefined') {
        console.log('☁️ Cadastrando empresa no Firebase Cloud...');
        return await cadastrarEmpresaFirebase(nome, email, contato, loginUsuario, senha, extraData);
    }
    
    console.warn('💾 Firebase offline - cadastrando localmente');
    
    // Verificar se email ja existe
    if (localUsers.find(u => u.email === email)) {
        throw new Error('Este email já está cadastrado');
    }
    
    // Verificar se login ja existe
    if (localUsers.find(u => u.loginUsuario === loginUsuario)) {
        throw new Error('Este login já está em uso');
    }
    
    // Salvar senha em texto simples (modo local/demo)
    let newUser = {
        uid: 'user-local-' + Date.now(),
        nome: nome,
        email: email,
        contato: contato,
        loginUsuario: loginUsuario,
        senha: senha, // Senha em texto simples para facilitar testes
        ativo: true,
        dataCadastro: new Date().toISOString()
    };

    if (extraData.role === 'admin') {
        // Cadastro de Empresa - Adicionar numeração automática
        newUser.role = 'admin';
        newUser.cargo = 'Administrador';
        newUser.nomeEmpresa = addEmpresaNumber(extraData.nomeEmpresa);
        newUser.segmento = extraData.segmento;
        newUser.companyId = 'comp-' + Date.now();
        newUser.allowedModules = ['operacional', 'estoque-entrada', 'estoque-saida', 'financeiro', 'rh', 'visualizar'];
        
        console.log('✅ Empresa criada:', {
            nome: newUser.nomeEmpresa,
            email: newUser.email,
            segmento: newUser.segmento,
            companyId: newUser.companyId
        });
    } else {
        // Cadastro de Funcionário (vinculado a uma empresa)
        newUser.role = extraData.role || 'user';
        newUser.cargo = extraData.cargo || 'Funcionário';
        newUser.allowedModules = extraData.allowedModules || [];
        
        // Tentar obter dados da empresa do gestor logado
        if (localCurrentUser && localCurrentUser.companyId) {
            newUser.companyId = localCurrentUser.companyId;
            newUser.nomeEmpresa = localCurrentUser.nomeEmpresa;
        } else if (extraData.companyId) {
            // Fallback se passado via extraData
            newUser.companyId = extraData.companyId;
            newUser.nomeEmpresa = extraData.nomeEmpresa;
        } else {
            console.warn('Criando usuário sem empresa vinculada!');
            newUser.companyId = 'comp-default'; // Fallback para evitar erro
        }
    }
    
    localUsers.push(newUser);
    saveLocalUsers();
    
    return newUser;
}

// Logout local
function logoutLocal() {
    localCurrentUser = null;
    localIsAdmin = false;
    saveLocalCurrentUser();
}

// Recuperar senha local
async function recuperarSenhaLocal(email) {
    const user = localUsers.find(u => u.email === email);
    
    if (!user) {
        throw new Error('Usuario nao encontrado');
    }
    
    // Em modo local, apenas mostra a senha
    alert('Sua senha e: ' + user.senha + '\n\n(Em producao com Firebase, seria enviado email)');
}

// Obter dados do usuario atual
function getUserDataLocal() {
    return localCurrentUser;
}

// Verificar se e admin
function verificarAdminLocal() {
    if (!localIsAdmin) {
        showToast('Acesso negado. Apenas administradores.', 'error');
        return false;
    }
    return true;
}

// Resetar localStorage (útil para debug)
function resetLocalStorage() {
    if (confirm(' Isso irá apagar todos os usuários e dados salvos. Deseja continuar?')) {
        // Limpar tudo
        localStorage.clear();
        
        // Recriar usuários padrão imediatamente
        localUsers = [
            {
                uid: 'superadmin-master-001',
                nome: 'Super Administrador',
                nomeEmpresa: 'Quatro Cantos - Administração',
                email: 'superadmin@quatrocantos.com',
                senha: DEFAULT_PASSWORDS.superadmin, // admin@2025
                role: 'superadmin',
                segmento: 'construcao',
                companyId: 'superadmin-master',
                ativo: true,
                dataCadastro: new Date().toISOString()
            },
            {
                uid: 'admin-local-001',
                nome: 'Administrador',
                email: 'admin@local.com',
                contato: '(00) 00000-0000',
                loginUsuario: 'admin',
                senha: DEFAULT_PASSWORDS.admin, // admin123
                role: 'admin',
                companyId: 'comp-default',
                ativo: true,
                dataCadastro: new Date().toISOString()
            }
        ];
        
        saveLocalUsers();
        console.log(' localStorage limpo!');
        console.log('Usuários padrão recriados:');
        console.log('  - superadmin@quatrocantos.com / admin@2025');
        console.log('  - admin@local.com / admin123');
        console.log(' Recarregando página...');
        
        setTimeout(() => location.reload(), 500);
    }
}

// Inicializar modo local
document.addEventListener('DOMContentLoaded', () => {
    loadLocalUsers();
    loadLocalCurrentUser();
});
