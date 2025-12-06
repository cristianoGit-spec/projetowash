// ===== CONFIGURAÇÃO DO FIREBASE - SISTEMA MULTI-TENANT =====
// 
// ✅ MODO ATIVO: PRODUÇÃO (Firebase Cloud)
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
//
const firebaseConfig = {
    apiKey: "AIzaSyBqU8Y9xJ5LmKp7NwQzT3VxRyH4SfEaGcI",
    authDomain: "projetowash-production.firebaseapp.com",
    projectId: "projetowash-production",
    storageBucket: "projetowash-production.firebasestorage.app",
    messagingSenderId: "847562931048",
    appId: "1:847562931048:web:a5c3d7e9f1b2c4d6e8f0a2"
};

// Inicializar Firebase
let auth, db;
let firebaseInitialized = false;

try {
    if (firebaseConfig.apiKey.startsWith("AIza")) {
        firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        firebaseInitialized = true;
        console.log("✅ Firebase inicializado! Modo: PRODUÇÃO - Dados na nuvem Google Cloud");
        console.log("📍 Região: southamerica-east1 (São Paulo, Brasil)");
        console.log("🔐 Multi-tenant: Isolamento completo por empresa (companyId)");
    } else {
        console.warn(" Firebase não configurado. Usando modo local offline.");
        console.info("Para ativar Firebase: Configure em firebase-config.js");
    }
} catch (e) {
    console.error(" Erro ao inicializar Firebase:", e);
    console.warn("Usando modo local como fallback");
}

// Estado de autenticacao
let currentUser = null;
let isAdmin = false;

// Observador de autenticacao (apenas se Firebase estiver ativo)
if (firebaseInitialized) {
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            
            // Verificar se eh admin
            try {
                const userDoc = await db.collection('usuarios').doc(user.uid).get();
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    isAdmin = userData.role === 'admin';
                    // Attach companyId to currentUser for easy access
                    currentUser.companyId = userData.companyId;
                    currentUser.role = userData.role;
                    currentUser.cargo = userData.cargo;
                    currentUser.allowedModules = userData.allowedModules;
                }
            } catch (e) {
                console.error("Erro ao buscar dados do usuário", e);
            }
            
            // Mostrar sistema
            showApp();
            loadDashboard();
        } else {
            currentUser = null;
            isAdmin = false;
            showAuth();
        }
    });
}

// Funcao de login
async function login(email, password) {
    if (!firebaseInitialized) {
        throw new Error("Firebase não configurado. Use o modo local.");
    }
    try {
        showLoading('Entrando no sistema...');
        const result = await auth.signInWithEmailAndPassword(email, password);
        hideLoading();
        showToast('Login realizado com sucesso!', 'success');
        return result.user;
    } catch (error) {
        hideLoading();
        let message = 'Erro ao fazer login';
        
        if (error.code === 'auth/user-not-found') {
            message = 'Usuario nao encontrado';
        } else if (error.code === 'auth/wrong-password') {
            message = 'Senha incorreta';
        } else if (error.code === 'auth/invalid-email') {
            message = 'Email invalido';
        }
        
        showToast(message, 'error');
        throw error;
    }
}

// Funcao de cadastro
async function cadastrarUsuario(nome, email, contato, loginUsuario, senha, extraData = {}) {
    if (!firebaseInitialized) {
        throw new Error("Firebase não configurado. Use o modo local.");
    }
    try {
        showLoading('Criando conta...');
        
        // Sempre cadastro de empresa (admin)
        const role = 'admin';
        
        // Criar usuario no Authentication
        const result = await auth.createUserWithEmailAndPassword(email, senha);
        const user = result.user;
        
        // Se for admin (nova empresa), o ID da empresa é o próprio UID do usuário
        if (role === 'admin') {
            companyId = user.uid;
        }
        
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
