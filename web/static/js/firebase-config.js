// ============================================================================
// CONFIGURAÇÃO FIREBASE - SISTEMA HÍBRIDO (v15.0)
// ============================================================================
// 
// 🌐 MODO HÍBRIDO ATIVO: Firebase Cloud + Fallback Local
// 
// PROJETO FIREBASE CONFIGURADO:
// - Projeto: projetowash-production
// - Authentication: Email/Password ativado
// - Firestore Database: Modo produção em southamerica-east1 (São Paulo)
// - Regras de Segurança: Multi-tenant com isolamento por companyId
//
// SISTEMA MULTI-TENANT:
// - Cada empresa cadastrada recebe um companyId único
// - Todos os dados são isolados por companyId (estoque, financeiro, RH, etc)
// - Admin só vê usuários e dados da própria empresa
// - Acesso de qualquer dispositivo/rede (dados na nuvem Firebase)
// - Sincronização automática em tempo real
// - Backup automático na nuvem Google
// - Fallback automático para localStorage se Firebase estiver offline
//
// ============================================================================

console.log('[CONFIG] Inicializando Firebase Config v15.0...');

const firebaseConfig = {
    apiKey: "AIzaSyDqK6vK9xN8mJ5pL7tR3wU2vY4zX6bC8dA", // Configuração de produção
    authDomain: "projetowash-production.firebaseapp.com",
    projectId: "projetowash-production",
    storageBucket: "projetowash-production.firebasestorage.app",
    messagingSenderId: "847562931048",
    appId: "1:847562931048:web:a5c3d7e9f1b2c4d6e8f0a2",
    databaseURL: "https://projetowash-production.firebaseio.com"
};

// Variáveis globais do Firebase
let auth = null;
let db = null;
let firebaseInitialized = false;
let useFirebase = true; // ATIVADO: Usar Firebase na nuvem por padrão

// Inicializar Firebase
try {
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        
        // Configurar persistência offline
        db.enablePersistence({ synchronizeTabs: true })
            .catch((err) => {
                if (err.code == 'failed-precondition') {
                    console.warn('⚠️ Persistência desabilitada - múltiplas abas abertas');
                } else if (err.code == 'unimplemented') {
                    console.warn('⚠️ Persistência não suportada neste navegador');
                }
            });
        
        // Configurar persistência local
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                console.log('[OK] Persistência de autenticação configurada');
            })
            .catch((error) => {
                console.warn('⚠️ Erro ao configurar persistência:', error.message);
            });
        
        firebaseInitialized = true;
        useFirebase = true;
        
        console.log("[OK] Firebase inicializado com sucesso!");
        console.log("🌐 Modo: PRODUÇÃO - Dados na nuvem Google Cloud");
        console.log("[REGION] Região: southamerica-east1 (São Paulo, Brasil)");
        console.log("[SECURITY] Multi-tenant: Isolamento completo por empresa (companyId)");
        console.log("[SYSTEM] Sistema híbrido: Firebase ativo com backup local");
        
    } else {
        throw new Error("Firebase SDK não disponível ou configuração inválida");
    }
} catch (e) {
    console.warn("⚠️ Firebase não disponível:", e.message);
    console.log("[MODE] Usando modo LOCAL como fallback");
    console.log("[STORAGE] Dados serão armazenados apenas no localStorage do navegador");
    firebaseInitialized = false;
    useFirebase = false;
}

// ============================================================================
// ESTADO GLOBAL E OBSERVADORES
// ============================================================================

// Estado de autenticação
let currentUser = null;
let isAdmin = false;
let isSuperAdmin = false;

// Observador de autenticação Firebase
if (firebaseInitialized && auth) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            
            // Buscar dados adicionais do usuário
            try {
                const userDoc = await db.collection('usuarios').doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    
                    // Anexar dados ao currentUser
                    currentUser.companyId = userData.companyId;
                    currentUser.role = userData.role;
                    currentUser.cargo = userData.cargo;
                    currentUser.allowedModules = userData.allowedModules;
                    currentUser.nome = userData.nome;
                    currentUser.nomeEmpresa = userData.nomeEmpresa;
                    
                    // Verificar roles
                    isAdmin = userData.role === 'admin';
                    isSuperAdmin = userData.role === 'superadmin';
                    
                    console.log('[OK] Usuário autenticado:', userData.nome);
                    console.log('[INFO] Empresa:', userData.nomeEmpresa);
                    console.log('🔑 Role:', userData.role);
                }
            } catch (e) {
                console.error("❌ Erro ao buscar dados do usuário:", e);
            }
            
            // Mostrar sistema
            if (typeof showApp === 'function') {
                showApp();
            }
            if (typeof loadDashboard === 'function') {
                loadDashboard();
            }
        } else {
            currentUser = null;
            isAdmin = false;
            isSuperAdmin = false;
            
            // Mostrar tela de autenticação
            if (typeof showAuth === 'function') {
                showAuth();
            }
        }
    });
}

// ============================================================================
// FUNÇÕES DE AUTENTICAÇÃO FIREBASE
// ============================================================================

/**
 * Login com Firebase Authentication
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} - Dados do usuário autenticado
 */
async function loginFirebase(email, password) {
    if (!firebaseInitialized || !auth) {
        throw new Error("Firebase não disponível. Use loginLocal()");
    }
    
    try {
        if (typeof showLoading === 'function') {
            showLoading('Entrando no sistema...');
        }
        
        const result = await auth.signInWithEmailAndPassword(email, password);
        
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        if (typeof showToast === 'function') {
            showToast('Login realizado com sucesso!', 'success');
        }
        
        return result.user;
    } catch (error) {
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        
        let message = 'Erro ao fazer login';
        
        if (error.code === 'auth/user-not-found') {
            message = 'Usuário não encontrado';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Senha incorreta';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Email inválido';
        } else if (error.code === 'auth/network-request-failed') {
            message = 'Erro de conexão. Tente novamente.';
        }
        
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        }
        throw error;
    }
}

/**
 * Cadastro de novo usuário com Firebase
 * @param {string} nome - Nome completo
 * @param {string} email - Email
 * @param {string} senha - Senha
 * @param {Object} extraData - Dados adicionais (nomeEmpresa, segmento, etc)
 * @returns {Promise<Object>} - Dados do usuário criado
 */
async function cadastrarUsuarioFirebase(nome, email, senha, extraData = {}) {
    if (!firebaseInitialized || !auth || !db) {
        throw new Error("Firebase não disponível. Use cadastrarUsuarioLocal()");
    }
    
    try {
        if (typeof showLoading === 'function') {
            showLoading('Criando conta...');
        }
        
        // Sempre cadastro de empresa (admin)
        const role = 'admin';
        const companyId = 'company_' + Date.now(); // ID único da empresa
        
        // Criar usuário no Authentication
        const result = await auth.createUserWithEmailAndPassword(email, senha);
        const user = result.user;
        
        // Criar documento do usuário no Firestore
        const userData = {
            uid: user.uid,
            nome: nome,
            email: email,
            nomeEmpresa: extraData.nomeEmpresa || 'Minha Empresa',
            segmento: extraData.segmento || 'comercio',
            role: role,
            companyId: companyId,
            ativo: true,
            dataCadastro: firebase.firestore.FieldValue.serverTimestamp(),
            allowedModules: ['dashboard', 'operacional', 'estoque-entrada', 'estoque-saida', 'financeiro', 'rh', 'visualizar', 'historico']
        };
        
        await db.collection('usuarios').doc(user.uid).set(userData);
        
        // Criar documento da empresa
        const empresaData = {
            companyId: companyId,
            nome: extraData.nomeEmpresa || 'Minha Empresa',
            segmento: extraData.segmento || 'comercio',
            adminUid: user.uid,
            dataCriacao: firebase.firestore.FieldValue.serverTimestamp(),
            ativo: true
        };
        
        await db.collection('empresas').doc(companyId).set(empresaData);
        
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        if (typeof showToast === 'function') {
            showToast('Conta criada com sucesso!', 'success');
        }
        
        console.log('[OK] Usuário cadastrado:', userData.nome);
        console.log('[INFO] Empresa criada:', empresaData.nome);
        
        return userData;
    } catch (error) {
        if (typeof hideLoading === 'function') {
            hideLoading();
        }
        
        let message = 'Erro ao criar conta';
        
        if (error.code === 'auth/email-already-in-use') {
            message = 'Este email já está em uso';
        } else if (error.code === 'auth/weak-password') {
            message = 'Senha muito fraca. Use no mínimo 6 caracteres';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Email inválido';
        }
        
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        }
        throw error;
    }
}

/**
 * Logout do Firebase
 */
async function logoutFirebase() {
    if (!firebaseInitialized || !auth) {
        throw new Error("Firebase não disponível");
    }
    
    try {
        await auth.signOut();
        if (typeof showToast === 'function') {
            showToast('Logout realizado com sucesso', 'success');
        }
    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
        throw error;
    }
}

/**
 * Cadastrar novo usuário no Firebase com empresa
 */
async function cadastrarUsuarioFirebase(email, senha, nome, contato, loginUsuario, extraData = {}) {
    if (!firebaseInitialized || !auth || !db) {
        throw new Error("Firebase não disponível");
    }
    
    showLoading('Criando conta...');
    
    try {
        // Criar usuário no Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        
        // Atualizar display name
        await user.updateProfile({
            displayName: nome
        });
        
        // Gerar ID da empresa (usar o UID do usuário como companyId)
        const companyId = user.uid;
        
        // Salvar dados adicionais no Firestore
        await db.collection('usuarios').doc(user.uid).set({
            nome: nome,
            email: email,
            contato: contato,
            loginUsuario: loginUsuario,
            role: 'admin',
            companyId: companyId,
            cargo: 'Administrador',
            nomeEmpresa: extraData.nomeEmpresa || '',
            segmento: extraData.segmento || '',
            allowedModules: ['operacional', 'estoque-entrada', 'estoque-saida', 'financeiro', 'rh', 'visualizar'],
            dataCadastro: firebase.firestore.FieldValue.serverTimestamp(),
            ativo: true
        });
        
        // Aplicar tema do segmento
        if (extraData.segmento) {
            aplicarTemaSegmento(extraData.segmento);
        }
        
        hideLoading();
        showToast('Cadastro realizado com sucesso!', 'success');
        return user;
    } catch (error) {
        hideLoading();
        let message = 'Erro ao criar conta';
        
        if (error.code === 'auth/email-already-in-use') {
            message = 'Este email ja esta cadastrado';
        } else if (error.code === 'auth/weak-password') {
            message = 'A senha deve ter no minimo 6 caracteres';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Email invalido';
        } else {
            message = error.message;
        }
        
        showToast(message, 'error');
        throw error;
    }
}

// Funcao para cadastrar funcionario (Admin logado cria outro usuario)
async function cadastrarFuncionario(nome, email, contato, loginUsuario, senha, extraData = {}) {
    if (!firebaseInitialized) {
        throw new Error("Firebase não configurado. Use o modo local.");
    }
    
    let secondaryApp = null;
    
    try {
        showLoading('Cadastrando funcionário...');
        
        // Usar uma instancia secundaria para nao deslogar o admin atual
        secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");
        
        // Criar usuario na instancia secundaria
        const result = await secondaryApp.auth().createUserWithEmailAndPassword(email, senha);
        const newUser = result.user;
        
        // Atualizar perfil
        await newUser.updateProfile({
            displayName: nome
        });
        
        // O companyId DEVE ser o mesmo do admin logado
        const companyId = currentUser.companyId;
        
        if (!companyId) {
            throw new Error("Erro de consistência: Admin sem Company ID");
        }
        
        // Salvar dados no Firestore (usando a instancia principal logada como admin)
        await db.collection('usuarios').doc(newUser.uid).set({
            nome: nome,
            email: email,
            contato: contato,
            loginUsuario: loginUsuario,
            role: 'user', // Funcionarios sao users
            companyId: companyId, // VINCULO IMPORTANTE
            cargo: extraData.cargo || 'Funcionário',
            allowedModules: extraData.allowedModules || [],
            managerLogin: currentUser.email, // Referencia de quem criou
            dataCadastro: firebase.firestore.FieldValue.serverTimestamp(),
            ativo: true
        });
        
        // Logout da instancia secundaria e limpeza
        await secondaryApp.auth().signOut();
        await secondaryApp.delete();
        
        hideLoading();
        return newUser;
        
    } catch (error) {
        hideLoading();
        // Limpar app secundario em caso de erro
        if (secondaryApp) await secondaryApp.delete();
        
        let message = 'Erro ao cadastrar funcionário';
        if (error.code === 'auth/email-already-in-use') {
            message = 'Este email já está em uso por outro funcionário';
        }
        console.error("Erro no cadastro de funcionario:", error);
        throw new Error(message);
    }
}

// Funcao de logout
async function logout() {
    if (!firebaseInitialized) return;
    try {
        showLoading('Saindo...');
        await auth.signOut();
        hideLoading();
        showToast('Logout realizado com sucesso!', 'success');
    } catch (error) {
        hideLoading();
        showToast('Erro ao fazer logout', 'error');
        throw error;
    }
}

// Funcao para recuperar senha
async function recuperarSenha(email) {
    if (!firebaseInitialized) {
        throw new Error("Firebase não configurado.");
    }
    try {
        showLoading('Enviando email...');
        await auth.sendPasswordResetEmail(email);
        hideLoading();
        showToast('Email de recuperacao enviado!', 'success');
    } catch (error) {
        hideLoading();
        let message = 'Erro ao enviar email';
        
        if (error.code === 'auth/user-not-found') {
            message = 'Usuario nao encontrado';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Email invalido';
        }
        
        showToast(message, 'error');
        throw error;
    }
}

// Verificar se usuario eh admin
function verificarAdmin() {
    if (!isAdmin) {
        showToast('Acesso negado. Apenas administradores.', 'error');
        return false;
    }
    return true;
}

// Obter dados do usuario atual
async function getUserData() {
    if (!currentUser || !firebaseInitialized) return null;
    
    const doc = await db.collection('usuarios').doc(currentUser.uid).get();
    if (doc.exists) {
        return { id: doc.id, ...doc.data() };
    }
    return null;
}
