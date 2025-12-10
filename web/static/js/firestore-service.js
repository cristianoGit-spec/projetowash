// Servicos de dados do Firestore
// Sistema Multi-Tenant: Todos os dados são isolados por companyId
// Sistema Híbrido: Firebase (nuvem) + localStorage (cache offline)

console.log('🔄 Firestore Service - Modo Híbrido com Sincronização');

// ===== SINCRONIZAÇÃO HÍBRIDA =====

/**
 * Sincroniza dados do Firebase para localStorage (cache offline)
 */
async function syncFirebaseToLocal() {
    if (!firebaseInitialized || !currentUser) return;
    
    try {
        console.log('⬇️ Sincronizando Firebase → localStorage...');
        
        const companyId = currentUser.companyId;
        
        // Sincronizar estoque
        const estoqueSnapshot = await db.collection('estoque')
            .where('companyId', '==', companyId)
            .get();
        
        const estoque = [];
        estoqueSnapshot.forEach(doc => {
            estoque.push({ id: doc.id, ...doc.data() });
        });
        
        localStorage.setItem('localEstoque', JSON.stringify(estoque));
        
        // Sincronizar movimentações
        const movSnapshot = await db.collection('movimentacoes')
            .where('companyId', '==', companyId)
            .orderBy('timestamp', 'desc')
            .limit(100)
            .get();
        
        const movimentacoes = [];
        movSnapshot.forEach(doc => {
            const data = doc.data();
            movimentacoes.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate?.() || data.timestamp
            });
        });
        
        localStorage.setItem('localMovimentacoes', JSON.stringify(movimentacoes));
        
        console.log('✅ Sincronização concluída:', {
            estoque: estoque.length,
            movimentacoes: movimentacoes.length
        });
        
    } catch (error) {
        console.error('❌ Erro na sincronização:', error);
    }
}

// ===== AUTENTICAÇÃO FIREBASE =====

/**
 * Gerar próximo número de empresa no Firebase
 */
async function getNextEmpresaNumberFirebase() {
    if (!firebaseInitialized || !db) {
        // Fallback para local
        return getNextEmpresaNumber();
    }
    
    try {
        const counterRef = db.collection('system').doc('counters');
        const counterDoc = await counterRef.get();
        
        let counter = 0;
        if (counterDoc.exists) {
            counter = counterDoc.data().empresaCounter || 0;
        }
        
        counter++;
        await counterRef.set({ 
            empresaCounter: counter,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        
        return counter.toString().padStart(4, '0');
    } catch (error) {
        console.error('❌ Erro ao gerar número da empresa:', error);
        // Fallback para local
        return getNextEmpresaNumber();
    }
}

/**
 * Adicionar numeração ao nome da empresa (Firebase)
 */
async function addEmpresaNumberFirebase(nomeEmpresa) {
    // Verificar se já tem número no formato [0001]
    if (/^\[\d{4}\]/.test(nomeEmpresa)) {
        return nomeEmpresa;
    }
    const numero = await getNextEmpresaNumberFirebase();
    return `[${numero}] ${nomeEmpresa}`;
}

/**
 * Cadastrar empresa no Firebase (acesso de qualquer rede)
 */
async function cadastrarEmpresaFirebase(nome, email, contato, loginUsuario, senha, extraData) {
    if (!firebaseInitialized) {
        throw new Error('Firebase não disponível - usando modo local');
    }
    
    try {
        console.log('🏢 Cadastrando empresa no Firebase Cloud...');
        
        // Adicionar numeração ao nome da empresa
        const nomeEmpresaComNumero = await addEmpresaNumberFirebase(extraData.nomeEmpresa);
        
        // Criar usuário no Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        
        // Atualizar perfil
        await user.updateProfile({
            displayName: nome
        });
        
        // Gerar ID único da empresa
        const companyId = 'comp-' + Date.now();
        
        // Criar documento no Firestore
        const userData = {
            uid: user.uid,
            nome: nome,
            email: email,
            contato: contato || '',
            loginUsuario: loginUsuario || email,
            nomeEmpresa: nomeEmpresaComNumero,
            segmento: extraData.segmento || 'outros',
            companyId: companyId,
            role: extraData.role || 'admin',
            cargo: 'Administrador',
            ativo: true,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp(),
            allowedModules: ['operacional', 'estoque-entrada', 'estoque-saida', 'financeiro', 'rh', 'visualizar']
        };
        
        await db.collection('usuarios').doc(user.uid).set(userData);
        
        console.log('✅ Empresa cadastrada no Firebase:', {
            nome: userData.nomeEmpresa,
            email: userData.email,
            companyId: userData.companyId
        });
        console.log('☁️ Dados na nuvem - acessível de qualquer lugar!');
        
        return userData;
        
    } catch (error) {
        console.error('❌ Erro ao cadastrar empresa no Firebase:', error);
        throw error;
    }
}

/**
 * Cadastrar usuário no Firebase (acesso de qualquer rede)
 */
async function cadastrarUsuarioFirebase(nome, email, senha, extraData) {
    // Se for cadastro de empresa (role === 'admin'), usar função específica
    if (extraData && extraData.role === 'admin') {
        return await cadastrarEmpresaFirebase(nome, email, '', '', senha, extraData);
    }
    
    if (!firebaseInitialized) {
        throw new Error('Firebase não disponível - usando modo local');
    }
    
    try {
        console.log('📝 Cadastrando usuário no Firebase...');
        
        // Criar usuário no Authentication
        const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        
        // Atualizar perfil
        await user.updateProfile({
            displayName: nome
        });
        
        // Criar documento no Firestore
        const userData = {
            uid: user.uid,
            nome: nome,
            email: email,
            nomeEmpresa: extraData.nomeEmpresa,
            segmento: extraData.segmento,
            companyId: 'comp-' + Date.now(),
            role: extraData.role || 'admin',
            ativo: true,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('usuarios').doc(user.uid).set(userData);
        
        // Sincronizar para localStorage também (cache)
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
        localUsers.push({
            ...userData,
            senha: senha, // Apenas no localStorage
            dataCadastro: new Date().toISOString()
        });
        localStorage.setItem('localUsers', JSON.stringify(localUsers));
        
        console.log('✅ Usuário cadastrado:', {
            nome: userData.nome,
            empresa: userData.nomeEmpresa,
            companyId: userData.companyId
        });
        
        return userData;
        
    } catch (error) {
        console.error('❌ Erro ao cadastrar no Firebase:', error);
        throw error;
    }
}

/**
 * Login no Firebase (acesso de qualquer rede)
 */
async function loginFirebase(email, senha) {
    if (!firebaseInitialized) {
        throw new Error('Firebase não disponível - usando modo local');
    }
    
    try {
        console.log('🔐 Fazendo login no Firebase...');
        
        const userCredential = await auth.signInWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        
        // Buscar dados adicionais
        const userDoc = await db.collection('usuarios').doc(user.uid).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            currentUser = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                ...userData
            };
            
            isAdmin = userData.role === 'admin' || userData.role === 'superadmin';
            isSuperAdmin = userData.role === 'superadmin';
            
            // Sincronizar dados para acesso offline
            await syncFirebaseToLocal();
            
            console.log('✅ Login Firebase bem-sucedido');
            console.log('🏢 Empresa:', userData.nomeEmpresa);
            console.log('🆔 CompanyID:', userData.companyId);
            
            // Mostrar app
            showApp();
            setTimeout(() => {
                if (typeof showModule === 'function') {
                    showModule('dashboard');
                } else if (typeof loadDashboard === 'function') {
                    loadDashboard();
                }
            }, 150);
            
            return currentUser;
        }
        
        throw new Error('Dados do usuário não encontrados');
        
    } catch (error) {
        console.error('❌ Erro no login Firebase:', error);
        throw error;
    }
}

// ===== USUÁRIOS E GERENCIAMENTO DE EMPRESA =====

// Listar usuários da empresa (apenas admin)
async function listarUsuariosDaEmpresa() {
    if (typeof db === 'undefined' || !db) return [];
    try {
        if (!currentUser || !currentUser.companyId) {
            console.error('CompanyId não encontrado');
            return [];
        }
        
        // Buscar todos os usuários da mesma empresa
        const snapshot = await db.collection('usuarios')
            .where('companyId', '==', currentUser.companyId)
            .get();
        
        const usuarios = [];
        snapshot.forEach(doc => {
            usuarios.push({ uid: doc.id, ...doc.data() });
        });
        
        return usuarios;
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        return [];
    }
}

// ===== ESTOQUE - CRUD Operations =====

// Listar todos os produtos
async function listarProdutos() {
    if (typeof db === 'undefined' || !db) return [];
    try {
        let query = db.collection('estoque');
        
        // Multi-tenancy
        if (currentUser && currentUser.companyId) {
            query = query.where('companyId', '==', currentUser.companyId);
        }
        
        const snapshot = await query.orderBy('nome').get();
        
        const produtos = [];
        snapshot.forEach(doc => {
            produtos.push({ id: doc.id, ...doc.data() });
        });
        
        return produtos;
    } catch (error) {
        console.error('Erro ao listar produtos:', error);
        showToast('Erro ao carregar produtos', 'error');
        return [];
    }
}

// Cadastrar produto
async function cadastrarProdutoFirestore(produto) {
    try {
        // Verificar se ja existe (no contexto da empresa)
        let query = db.collection('estoque')
            .where('codigo', '==', produto.codigo);
            
        if (currentUser && currentUser.companyId) {
            query = query.where('companyId', '==', currentUser.companyId);
        }
            
        const snapshot = await query.get();
        
        if (!snapshot.empty) {
            // Atualizar quantidade
            const doc = snapshot.docs[0];
            const produtoExistente = doc.data();
            await doc.ref.update({
                quantidade: produtoExistente.quantidade + produto.quantidade,
                ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Registrar movimentacao
            await registrarMovimentacao({
                tipo: 'entrada',
                produtoId: doc.id,
                produtoNome: produtoExistente.nome,
                quantidade: produto.quantidade,
                usuarioId: currentUser.uid,
                usuarioNome: currentUser.displayName || currentUser.email
            });
            
            return { id: doc.id, updated: true };
        } else {
            // Criar novo
            const docRef = await db.collection('estoque').add({
                ...produto,
                companyId: currentUser.companyId,
                dataCriacao: firebase.firestore.FieldValue.serverTimestamp(),
                ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp(),
                criadoPor: currentUser.uid
            });
            
            // Registrar movimentacao
            await registrarMovimentacao({
                tipo: 'entrada',
                produtoId: docRef.id,
                produtoNome: produto.nome,
                quantidade: produto.quantidade,
                usuarioId: currentUser.uid,
                usuarioNome: currentUser.displayName || currentUser.email
            });
            
            return { id: docRef.id, updated: false };
        }
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        showToast('Erro ao cadastrar produto', 'error');
        throw error;
    }
}

// Registrar saida de produto
async function registrarSaidaProduto(nomeProduto, quantidade) {
    try {
        // Buscar produto
        let query = db.collection('estoque')
            .where('nome', '==', nomeProduto);
            
        if (currentUser && currentUser.companyId) {
            query = query.where('companyId', '==', currentUser.companyId);
        }
            
        const snapshot = await query.limit(1).get();
        
        if (snapshot.empty) {
            throw new Error('Produto nao encontrado');
        }
        
        const doc = snapshot.docs[0];
        const produto = doc.data();
        
        if (produto.quantidade < quantidade) {
            if (produto.quantidade === 0) {
                throw new Error('Produto esgotado');
            }
            
            // Saida parcial
            const quantidadeVendida = produto.quantidade;
            const valorVenda = quantidadeVendida * produto.valor;
            
            await doc.ref.update({
                quantidade: 0,
                ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await registrarMovimentacao({
                tipo: 'saida',
                subtipo: 'parcial',
                produtoId: doc.id,
                produtoNome: produto.nome,
                quantidadeSolicitada: quantidade,
                quantidadeVendida: quantidadeVendida,
                valorVenda: valorVenda,
                usuarioId: currentUser.uid,
                usuarioNome: currentUser.displayName || currentUser.email
            });
            
            return {
                tipo: 'parcial',
                quantidadeSolicitada: quantidade,
                quantidadeVendida: quantidadeVendida,
                valorVenda: valorVenda
            };
        } else {
            // Saida completa
            const valorVenda = quantidade * produto.valor;
            
            await doc.ref.update({
                quantidade: produto.quantidade - quantidade,
                ultimaAtualizacao: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            await registrarMovimentacao({
                tipo: 'saida',
                subtipo: 'completa',
                produtoId: doc.id,
                produtoNome: produto.nome,
                quantidade: quantidade,
                valorVenda: valorVenda,
                usuarioId: currentUser.uid,
                usuarioNome: currentUser.displayName || currentUser.email
            });
            
            return {
                tipo: 'completa',
                quantidade: quantidade,
                valorVenda: valorVenda,
                estoqueRestante: produto.quantidade - quantidade
            };
        }
    } catch (error) {
        console.error('Erro ao registrar saida:', error);
        showToast(error.message || 'Erro ao registrar saida', 'error');
        throw error;
    }
}

// Registrar movimentacao (historico)
async function registrarMovimentacao(dados) {
    try {
        await db.collection('movimentacoes').add({
            ...dados,
            companyId: currentUser.companyId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error('Erro ao registrar movimentacao:', error);
    }
}

// Buscar historico de movimentacoes
async function buscarHistorico(filtros = {}) {
    if (typeof db === 'undefined' || !db) return [];
    try {
        let query = db.collection('movimentacoes');
        
        if (currentUser && currentUser.companyId) {
            query = query.where('companyId', '==', currentUser.companyId);
        }
        
        query = query.orderBy('timestamp', 'desc').limit(100);
        
        if (filtros.tipo) {
            query = query.where('tipo', '==', filtros.tipo);
        }
        
        const snapshot = await query.get();
        const movimentacoes = [];
        
        snapshot.forEach(doc => {
            movimentacoes.push({ id: doc.id, ...doc.data() });
        });
        
        return movimentacoes;
    } catch (error) {
        console.error('Erro ao buscar historico:', error);
        return [];
    }
}

// FINANCEIRO

// Salvar calculo financeiro
async function salvarCalculoFinanceiro(dados) {
    try {
        const docRef = await db.collection('financeiro').add({
            ...dados,
            companyId: currentUser.companyId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            usuarioId: currentUser.uid,
            usuarioNome: currentUser.displayName || currentUser.email
        });
        
        return docRef.id;
    } catch (error) {
        console.error('Erro ao salvar dados financeiros:', error);
        showToast('Erro ao salvar dados financeiros', 'error');
        throw error;
    }
}

// Buscar historico financeiro
async function buscarHistoricoFinanceiro(limite = 10) {
    try {
        let query = db.collection('financeiro');
        
        if (currentUser && currentUser.companyId) {
            query = query.where('companyId', '==', currentUser.companyId);
        }
        
        const snapshot = await query.orderBy('timestamp', 'desc')
            .limit(limite)
            .get();
        
        const historico = [];
        snapshot.forEach(doc => {
            historico.push({ id: doc.id, ...doc.data() });
        });
        
        return historico;
    } catch (error) {
        console.error('Erro ao buscar historico financeiro:', error);
        return [];
    }
}

// RH - FOLHA DE PAGAMENTO

// Salvar folha de pagamento
async function salvarFolhaPagamento(dados) {
    try {
        const docRef = await db.collection('folha_pagamento').add({
            ...dados,
            companyId: currentUser.companyId,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            usuarioId: currentUser.uid,
            usuarioNome: currentUser.displayName || currentUser.email
        });
        
        return docRef.id;
    } catch (error) {
        console.error('Erro ao salvar folha de pagamento:', error);
        showToast('Erro ao salvar folha de pagamento', 'error');
        throw error;
    }
}

// Buscar historico de folhas de pagamento
async function buscarHistoricoFolha(limite = 10) {
    try {
        let query = db.collection('folha_pagamento');
        
        if (currentUser && currentUser.companyId) {
            query = query.where('companyId', '==', currentUser.companyId);
        }
        
        const snapshot = await query.orderBy('timestamp', 'desc')
            .limit(limite)
            .get();
        
        const historico = [];
        snapshot.forEach(doc => {
            historico.push({ id: doc.id, ...doc.data() });
        });
        
        return historico;
    } catch (error) {
        console.error('Erro ao buscar historico de folha:', error);
        return [];
    }
}

// DASHBOARD - Estatisticas
// Buscar estatisticas gerais
async function buscarEstatisticas() {
    if (typeof db === 'undefined' || !db) {
        return {
            totalProdutos: 0,
            totalItens: 0,
            valorTotal: 0,
            vendasMes: 0,
            movimentacoes: []
        };
    }
    try {
        const [produtos, movimentacoes] = await Promise.all([
            listarProdutos(),
            buscarHistorico()
        ]);
        
        const totalProdutos = produtos.length;
        const totalItens = produtos.reduce((sum, p) => sum + (p.quantidade || 0), 0);
        const valorTotal = produtos.reduce((sum, p) => sum + (p.quantidade * p.valor || 0), 0);
        
        const vendasMes = movimentacoes
            .filter(m => m.tipo === 'saida')
            .slice(0, 30)
            .reduce((sum, m) => sum + (m.valorVenda || 0), 0);
        
        return {
            totalProdutos,
            totalItens,
            valorTotal,
            vendasMes,
            movimentacoes: movimentacoes.slice(0, 15)
        };
    } catch (error) {
        console.error('Erro ao buscar estatisticas:', error);
        return {
            totalProdutos: 0,
            totalItens: 0,
            valorTotal: 0,
            vendasMes: 0,
            movimentacoes: []
        };
    }
}

// Backup automatico
async function realizarBackup() {
    try {
        if (!verificarAdmin()) return;
        
        showLoading('Realizando backup...');
        
        const [produtos, movimentacoes, financeiro, folha] = await Promise.all([
            listarProdutos(),
            buscarHistorico(),
            buscarHistoricoFinanceiro(100),
            buscarHistoricoFolha(100)
        ]);
        
        const backup = {
            data: new Date().toISOString(),
            companyId: currentUser.companyId,
            produtos,
            movimentacoes,
            financeiro,
            folha
        };
        
        await db.collection('backups').add({
            ...backup,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        hideLoading();
        showToast('Backup realizado com sucesso!', 'success');
        
        return backup;
    } catch (error) {
        hideLoading();
        console.error('Erro ao realizar backup:', error);
        showToast('Erro ao realizar backup', 'error');
        throw error;
    }
}
