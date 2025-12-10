/**
 * Módulo de Gestão de Empresas (Super Admin) - v40.14
 * Sistema completo de gerenciamento de empresas com layout profissional
 * Funcionalidades: Visualizar, Criar, Editar, Excluir, Buscar, Filtrar
 */

// ========================================
// HELPER FUNCTIONS
// ========================================

function mostrarToastGE(mensagem, tipo = 'info') {
    // Tentar usar toast global
    if (typeof mostrarToast === 'function') {
        mostrarToast(mensagem, tipo);
        return;
    }
    // Fallback para console
    console.log(`[TOAST-GE ${tipo.toUpperCase()}]: ${mensagem}`);
}

function isFirebaseAvailableGE() {
    return typeof firebaseInitialized !== 'undefined' && 
           firebaseInitialized === true && 
           typeof db !== 'undefined' && 
           db !== null;
}

function getCurrentUserGE() {
    // Tentar variável global
    if (typeof currentUser !== 'undefined' && currentUser) {
        return currentUser;
    }
    // Fallback para sessionStorage
    const stored = sessionStorage.getItem('currentUser');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('[GE] Erro ao parsear currentUser:', e);
        }
    }
    return null;
}

function showLoadingGE(message = 'Carregando...') {
    if (typeof showLoading === 'function') {
        showLoading(message);
    }
}

function hideLoadingGE() {
    if (typeof hideLoading === 'function') {
        hideLoading();
    }
}

// ========================================
// ESTADO DO MÓDULO
// ========================================

let empresasList = [];
let empresasFiltered = [];
let empresaEditando = null;
let filtroAtual = 'todas'; // todas, ativas, inativas

// ========================================
// INICIALIZAÇÃO
// ========================================

async function initGestaoEmpresas() {
    console.log('[GESTÃO EMPRESAS] Iniciando módulo...');
    
    // Verificar se usuário é superadmin
    const user = getCurrentUserGE();
    if (!user || user.role !== 'superadmin') {
        mostrarToastGE('⛔ Acesso negado. Apenas super administradores podem acessar esta área.', 'error');
        setTimeout(() => {
            if (typeof showModule === 'function') {
                showModule('dashboard');
            }
        }, 1500);
        return;
    }
    
    // Carregar empresas
    await carregarEmpresas();
    
    // Configurar event listeners
    setupEventListeners();
    
    console.log('[GESTÃO EMPRESAS] Módulo inicializado com sucesso');
}

// ========================================
// CARREGAMENTO DE DADOS
// ========================================

async function carregarEmpresas() {
    try {
        showLoadingGE('Carregando empresas...');
        
        if (!isFirebaseAvailableGE()) {
            console.warn('[GE] Firebase não disponível');
            empresasList = [];
            empresasFiltered = [];
            renderizarEmpresas();
            hideLoadingGE();
            return;
        }
        
        // Buscar todas as empresas do Firestore
        const snapshot = await db.collection('empresas').get();
        
        empresasList = snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        }));
        
        console.log(`[GE] ${empresasList.length} empresas carregadas`);
        
        // Aplicar filtro atual
        aplicarFiltro(filtroAtual);
        
        hideLoadingGE();
        
    } catch (error) {
        console.error('[GE] Erro ao carregar empresas:', error);
        mostrarToastGE('❌ Erro ao carregar empresas', 'error');
        empresasList = [];
        empresasFiltered = [];
        renderizarEmpresas();
        hideLoadingGE();
    }
}

// ========================================
// RENDERIZAÇÃO
// ========================================

function renderizarEmpresas() {
    const container = document.getElementById('empresas-list-container');
    if (!container) {
        console.warn('[GE] Container não encontrado');
        return;
    }
    
    // Estado vazio
    if (empresasFiltered.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 4rem 1.5rem; color: #6b7280;">
                <div style="width: 80px; height: 80px; background: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
                    <i class="fas fa-building" style="font-size: 2.5rem; color: #9ca3af;"></i>
                </div>
                <h3 style="color: #0f172a; margin-bottom: 0.5rem; font-weight: 600; font-size: 1.25rem;">Nenhuma empresa encontrada</h3>
                <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 2rem;">
                    ${empresasList.length === 0 ? 'As empresas cadastradas no sistema aparecerão aqui' : 'Nenhuma empresa corresponde aos filtros aplicados'}
                </p>
                <button onclick="abrirModalNovaEmpresa()" class="btn btn-primary" style="padding: 0.625rem 1.5rem; font-size: 0.875rem;">
                    <i class="fas fa-plus"></i> Cadastrar Nova Empresa
                </button>
            </div>
        `;
        return;
    }
    
    // Renderizar cards de empresas
    const cardsHTML = empresasFiltered.map(empresa => {
        const segmento = empresa.segmento || 'Não especificado';
        const segmentoIcon = getSegmentoIcon(segmento);
        const segmentoColor = getSegmentoColor(segmento);
        const status = empresa.ativo !== false ? 'ativa' : 'inativa';
        const statusColor = status === 'ativa' ? '#10b981' : '#ef4444';
        const statusBg = status === 'ativa' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
        
        return `
            <div class="empresa-card" style="background: white; border: 2px solid #f3f4f6; border-left: 4px solid ${segmentoColor}; border-radius: 12px; padding: 1.5rem; transition: all 0.3s ease; cursor: pointer;" 
                 onmouseover="this.style.borderColor='${segmentoColor}'; this.style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'" 
                 onmouseout="this.style.borderColor='#f3f4f6'; this.style.boxShadow='none'">
                
                <!-- Header do Card -->
                <div style="display: flex; align-items: start; justify-content: space-between; margin-bottom: 1rem;">
                    <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1;">
                        <div style="width: 48px; height: 48px; background: ${segmentoColor}15; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: ${segmentoColor}; flex-shrink: 0;">
                            <i class="${segmentoIcon}" style="font-size: 1.5rem;"></i>
                        </div>
                        <div style="flex: 1; min-width: 0;">
                            <h3 style="font-size: 1.125rem; font-weight: 600; color: #0f172a; margin: 0 0 0.25rem 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                ${empresa.nomeEmpresa}
                            </h3>
                            <span style="display: inline-block; padding: 0.25rem 0.625rem; background: ${statusBg}; color: ${statusColor}; border-radius: 6px; font-size: 0.75rem; font-weight: 500; text-transform: uppercase;">
                                ${status}
                            </span>
                        </div>
                    </div>
                </div>
                
                <!-- Informações -->
                <div style="display: grid; gap: 0.75rem; margin-bottom: 1.25rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-tag" style="color: #6b7280; font-size: 0.875rem; width: 16px;"></i>
                        <span style="color: #6b7280; font-size: 0.875rem;">Segmento:</span>
                        <span style="color: #0f172a; font-weight: 500; font-size: 0.875rem;">${segmento}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-envelope" style="color: #6b7280; font-size: 0.875rem; width: 16px;"></i>
                        <span style="color: #3b82f6; font-size: 0.875rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${empresa.email || '-'}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-phone" style="color: #6b7280; font-size: 0.875rem; width: 16px;"></i>
                        <span style="color: #6b7280; font-size: 0.875rem;">${empresa.contato || 'Não informado'}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-calendar" style="color: #6b7280; font-size: 0.875rem; width: 16px;"></i>
                        <span style="color: #6b7280; font-size: 0.875rem;">Criada em ${formatarDataGE(empresa.criadoEm)}</span>
                    </div>
                </div>
                
                <!-- ID da Empresa -->
                <div style="padding: 0.75rem; background: #f9fafb; border-radius: 8px; margin-bottom: 1.25rem;">
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;">
                        <span style="color: #6b7280; font-size: 0.75rem; font-weight: 500; text-transform: uppercase;">Company ID</span>
                        <button onclick="copiarID('${empresa.companyId}')" style="padding: 0.25rem 0.5rem; background: white; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 0.75rem; color: #6b7280; cursor: pointer; transition: all 0.2s;" title="Copiar ID">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <code style="display: block; margin-top: 0.5rem; color: #0f172a; font-size: 0.8125rem; font-family: 'Courier New', monospace; word-break: break-all;">
                        ${empresa.companyId}
                    </code>
                </div>
                
                <!-- Ações -->
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="editarEmpresa('${empresa.uid}')" 
                            style="flex: 1; padding: 0.625rem; background: #3b82f6; color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"
                            onmouseover="this.style.background='#2563eb'" 
                            onmouseout="this.style.background='#3b82f6'">
                        <i class="fas fa-edit"></i>
                        Editar
                    </button>
                    <button onclick="toggleStatusEmpresa('${empresa.uid}', ${empresa.ativo !== false})" 
                            style="flex: 1; padding: 0.625rem; background: ${status === 'ativa' ? '#f59e0b' : '#10b981'}; color: white; border: none; border-radius: 8px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"
                            onmouseover="this.style.opacity='0.9'" 
                            onmouseout="this.style.opacity='1'">
                        <i class="fas fa-${status === 'ativa' ? 'pause' : 'play'}"></i>
                        ${status === 'ativa' ? 'Desativar' : 'Ativar'}
                    </button>
                    <button onclick="confirmarExclusao('${empresa.uid}', '${empresa.nomeEmpresa.replace(/'/g, "\\'")}', '${empresa.companyId}')" 
                            style="padding: 0.625rem 1rem; background: #ef4444; color: white; border: none; border-radius: 8px; font-size: 0.875rem; cursor: pointer; transition: all 0.2s;"
                            onmouseover="this.style.background='#dc2626'" 
                            onmouseout="this.style.background='#ef4444'"
                            title="Excluir empresa">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem;">
            ${cardsHTML}
        </div>
    `;
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function getSegmentoIcon(segmento) {
    const icons = {
        'Lavanderia': 'fas fa-tshirt',
        'Restaurante': 'fas fa-utensils',
        'Varejo': 'fas fa-store',
        'Serviços': 'fas fa-hand-holding-heart',
        'Saúde': 'fas fa-heartbeat',
        'Educação': 'fas fa-graduation-cap',
        'Tecnologia': 'fas fa-laptop-code',
        'Construção': 'fas fa-hard-hat',
        'Transporte': 'fas fa-truck',
        'Outro': 'fas fa-building'
    };
    return icons[segmento] || 'fas fa-building';
}

function getSegmentoColor(segmento) {
    const colors = {
        'Lavanderia': '#3b82f6',
        'Restaurante': '#f59e0b',
        'Varejo': '#10b981',
        'Serviços': '#8b5cf6',
        'Saúde': '#ef4444',
        'Educação': '#06b6d4',
        'Tecnologia': '#6366f1',
        'Construção': '#f97316',
        'Transporte': '#14b8a6',
        'Outro': '#6b7280'
    };
    return colors[segmento] || '#6b7280';
}

function formatarDataGE(timestamp) {
    if (!timestamp) return 'Data não disponível';
    
    let data;
    if (timestamp.toDate) {
        data = timestamp.toDate();
    } else if (timestamp.seconds) {
        data = new Date(timestamp.seconds * 1000);
    } else {
        data = new Date(timestamp);
    }
    
    return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function copiarID(companyId) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(companyId).then(() => {
            mostrarToastGE('✅ ID copiado para área de transferência', 'success');
        }).catch(err => {
            console.error('[GE] Erro ao copiar:', err);
            mostrarToastGE('❌ Erro ao copiar ID', 'error');
        });
    } else {
        // Fallback
        const el = document.createElement('textarea');
        el.value = companyId;
        document.body.appendChild(el);
        el.select();
        try {
            document.execCommand('copy');
            mostrarToastGE('✅ ID copiado', 'success');
        } catch (err) {
            mostrarToastGE('❌ Erro ao copiar', 'error');
        }
        document.body.removeChild(el);
    }
}

// ========================================
// FILTROS E BUSCA
// ========================================

function aplicarFiltro(filtro) {
    filtroAtual = filtro;
    
    if (filtro === 'todas') {
        empresasFiltered = [...empresasList];
    } else if (filtro === 'ativas') {
        empresasFiltered = empresasList.filter(e => e.ativo !== false);
    } else if (filtro === 'inativas') {
        empresasFiltered = empresasList.filter(e => e.ativo === false);
    }
    
    // Aplicar busca se houver termo
    const searchTerm = document.getElementById('search-empresas')?.value;
    if (searchTerm) {
        buscarEmpresas(searchTerm);
    } else {
        renderizarEmpresas();
    }
    
    // Atualizar UI dos botões de filtro
    atualizarBotoesFiltro();
}

function buscarEmpresas(termo) {
    if (!termo || termo.trim() === '') {
        aplicarFiltro(filtroAtual);
        return;
    }
    
    termo = termo.toLowerCase();
    
    empresasFiltered = empresasFiltered.filter(empresa => {
        return (
            empresa.nomeEmpresa?.toLowerCase().includes(termo) ||
            empresa.email?.toLowerCase().includes(termo) ||
            empresa.segmento?.toLowerCase().includes(termo) ||
            empresa.companyId?.toLowerCase().includes(termo) ||
            empresa.contato?.toLowerCase().includes(termo)
        );
    });
    
    renderizarEmpresas();
}

function atualizarBotoesFiltro() {
    const botoes = {
        'todas': document.getElementById('filtro-todas'),
        'ativas': document.getElementById('filtro-ativas'),
        'inativas': document.getElementById('filtro-inativas')
    };
    
    Object.keys(botoes).forEach(key => {
        const btn = botoes[key];
        if (btn) {
            if (key === filtroAtual) {
                btn.style.background = '#3b82f6';
                btn.style.color = 'white';
            } else {
                btn.style.background = 'white';
                btn.style.color = '#6b7280';
            }
        }
    });
}

// ========================================
// CRUD - CRIAR
// ========================================

function abrirModalNovaEmpresa() {
    const modal = document.getElementById('modal-nova-empresa');
    if (modal) {
        // Limpar campos
        document.getElementById('nova-nome-empresa').value = '';
        document.getElementById('nova-segmento').value = 'Lavanderia';
        document.getElementById('nova-email').value = '';
        document.getElementById('nova-contato').value = '';
        document.getElementById('nova-senha').value = '';
        
        modal.style.display = 'flex';
    }
}

function fecharModalNovaEmpresa() {
    const modal = document.getElementById('modal-nova-empresa');
    if (modal) {
        modal.style.display = 'none';
    }
}

async function cadastrarNovaEmpresa() {
    const nomeEmpresa = document.getElementById('nova-nome-empresa').value.trim();
    const segmento = document.getElementById('nova-segmento').value;
    const email = document.getElementById('nova-email').value.trim();
    const contato = document.getElementById('nova-contato').value.trim();
    const senha = document.getElementById('nova-senha').value;
    
    // Validações
    if (!nomeEmpresa || !email || !senha) {
        mostrarToastGE('❌ Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    if (senha.length < 6) {
        mostrarToastGE('❌ A senha deve ter no mínimo 6 caracteres', 'error');
        return;
    }
    
    if (!email.includes('@')) {
        mostrarToastGE('❌ Email inválido', 'error');
        return;
    }
    
    try {
        showLoadingGE('Cadastrando empresa...');
        
        if (!isFirebaseAvailableGE()) {
            throw new Error('Firebase não disponível');
        }
        
        // Gerar companyId único
        const companyId = 'COMP' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 5).toUpperCase();
        
        // Criar usuário admin no Firebase Auth
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, senha);
        const uid = userCredential.user.uid;
        
        // Criar documento da empresa
        await db.collection('empresas').doc(uid).set({
            companyId: companyId,
            nomeEmpresa: nomeEmpresa,
            segmento: segmento,
            email: email,
            contato: contato,
            role: 'admin',
            ativo: true,
            criadoEm: firebase.firestore.FieldValue.serverTimestamp(),
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        mostrarToastGE('✅ Empresa cadastrada com sucesso!', 'success');
        fecharModalNovaEmpresa();
        await carregarEmpresas();
        hideLoadingGE();
        
    } catch (error) {
        console.error('[GE] Erro ao cadastrar empresa:', error);
        
        let mensagemErro = 'Erro ao cadastrar empresa';
        if (error.code === 'auth/email-already-in-use') {
            mensagemErro = 'Este email já está cadastrado';
        } else if (error.code === 'auth/invalid-email') {
            mensagemErro = 'Email inválido';
        } else if (error.code === 'auth/weak-password') {
            mensagemErro = 'Senha muito fraca';
        }
        
        mostrarToastGE(`❌ ${mensagemErro}`, 'error');
        hideLoadingGE();
    }
}

// ========================================
// CRUD - EDITAR
// ========================================

function editarEmpresa(uid) {
    empresaEditando = empresasList.find(e => e.uid === uid);
    if (!empresaEditando) {
        mostrarToastGE('❌ Empresa não encontrada', 'error');
        return;
    }
    
    // Preencher modal
    document.getElementById('edit-nome-empresa').value = empresaEditando.nomeEmpresa || '';
    document.getElementById('edit-segmento').value = empresaEditando.segmento || 'Lavanderia';
    document.getElementById('edit-email').value = empresaEditando.email || '';
    document.getElementById('edit-contato').value = empresaEditando.contato || '';
    
    // Mostrar modal
    const modal = document.getElementById('modal-editar-empresa');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function fecharModalEdicao() {
    const modal = document.getElementById('modal-editar-empresa');
    if (modal) {
        modal.style.display = 'none';
    }
    empresaEditando = null;
}

async function salvarEdicaoEmpresa() {
    if (!empresaEditando) {
        mostrarToastGE('❌ Nenhuma empresa selecionada', 'error');
        return;
    }
    
    const nomeEmpresa = document.getElementById('edit-nome-empresa').value.trim();
    const segmento = document.getElementById('edit-segmento').value;
    const email = document.getElementById('edit-email').value.trim();
    const contato = document.getElementById('edit-contato').value.trim();
    
    // Validações
    if (!nomeEmpresa || !email) {
        mostrarToastGE('❌ Nome e email são obrigatórios', 'error');
        return;
    }
    
    try {
        showLoadingGE('Salvando alterações...');
        
        if (!isFirebaseAvailableGE()) {
            throw new Error('Firebase não disponível');
        }
        
        const dadosAtualizados = {
            nomeEmpresa,
            segmento,
            email,
            contato,
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('empresas').doc(empresaEditando.uid).update(dadosAtualizados);
        
        mostrarToastGE('✅ Empresa atualizada com sucesso!', 'success');
        fecharModalEdicao();
        await carregarEmpresas();
        hideLoadingGE();
        
    } catch (error) {
        console.error('[GE] Erro ao atualizar empresa:', error);
        mostrarToastGE('❌ Erro ao atualizar empresa', 'error');
        hideLoadingGE();
    }
}

// ========================================
// CRUD - ATIVAR/DESATIVAR
// ========================================

async function toggleStatusEmpresa(uid, ativoAtual) {
    const empresa = empresasList.find(e => e.uid === uid);
    if (!empresa) return;
    
    const novoStatus = !ativoAtual;
    const acao = novoStatus ? 'ativar' : 'desativar';
    
    if (!confirm(`Deseja realmente ${acao} a empresa "${empresa.nomeEmpresa}"?`)) {
        return;
    }
    
    try {
        showLoadingGE(`${novoStatus ? 'Ativando' : 'Desativando'} empresa...`);
        
        if (!isFirebaseAvailableGE()) {
            throw new Error('Firebase não disponível');
        }
        
        await db.collection('empresas').doc(uid).update({
            ativo: novoStatus,
            atualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        mostrarToastGE(`✅ Empresa ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`, 'success');
        await carregarEmpresas();
        hideLoadingGE();
        
    } catch (error) {
        console.error('[GE] Erro ao alterar status:', error);
        mostrarToastGE('❌ Erro ao alterar status da empresa', 'error');
        hideLoadingGE();
    }
}

// ========================================
// CRUD - EXCLUIR
// ========================================

function confirmarExclusao(uid, nomeEmpresa, companyId) {
    empresaEditando = { uid, nomeEmpresa, companyId };
    
    // Preencher modal de confirmação
    document.getElementById('confirm-nome-empresa').textContent = nomeEmpresa;
    document.getElementById('confirm-company-id').textContent = companyId;
    
    // Limpar campo de confirmação
    const confirmInput = document.getElementById('confirm-text-input');
    if (confirmInput) {
        confirmInput.value = '';
    }
    
    // Mostrar modal
    const modal = document.getElementById('modal-confirmar-exclusao');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function fecharModalExclusao() {
    const modal = document.getElementById('modal-confirmar-exclusao');
    if (modal) {
        modal.style.display = 'none';
    }
    empresaEditando = null;
}

async function excluirEmpresa() {
    if (!empresaEditando) return;
    
    const confirmText = document.getElementById('confirm-text-input').value.trim();
    
    if (confirmText !== 'EXCLUIR') {
        mostrarToastGE('❌ Digite "EXCLUIR" para confirmar', 'error');
        return;
    }
    
    try {
        showLoadingGE('Excluindo empresa...');
        
        if (!isFirebaseAvailableGE()) {
            throw new Error('Firebase não disponível');
        }
        
        const uid = empresaEditando.uid;
        const companyId = empresaEditando.companyId;
        
        // Excluir todos os dados da empresa
        const batch = db.batch();
        
        // Excluir produtos
        const produtosSnapshot = await db.collection('produtos').where('companyId', '==', companyId).get();
        produtosSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        // Excluir movimentações
        const movimentacoesSnapshot = await db.collection('movimentacoes').where('companyId', '==', companyId).get();
        movimentacoesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        // Excluir transações financeiras
        const financeiroSnapshot = await db.collection('financeiro').where('companyId', '==', companyId).get();
        financeiroSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        // Excluir funcionários
        const funcionariosSnapshot = await db.collection('funcionarios').where('companyId', '==', companyId).get();
        funcionariosSnapshot.docs.forEach(doc => batch.delete(doc.ref));
        
        // Excluir empresa
        batch.delete(db.collection('empresas').doc(uid));
        
        await batch.commit();
        
        mostrarToastGE('✅ Empresa e todos os seus dados foram excluídos', 'success');
        fecharModalExclusao();
        await carregarEmpresas();
        hideLoadingGE();
        
    } catch (error) {
        console.error('[GE] Erro ao excluir empresa:', error);
        mostrarToastGE('❌ Erro ao excluir empresa', 'error');
        hideLoadingGE();
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

function setupEventListeners() {
    // Botão atualizar
    const btnRefresh = document.getElementById('btn-refresh-empresas');
    if (btnRefresh) {
        btnRefresh.onclick = async () => {
            await carregarEmpresas();
            mostrarToastGE('✅ Lista atualizada', 'success');
        };
    }
    
    // Botão nova empresa
    const btnNova = document.getElementById('btn-nova-empresa');
    if (btnNova) {
        btnNova.onclick = abrirModalNovaEmpresa;
    }
    
    // Busca
    const searchInput = document.getElementById('search-empresas');
    if (searchInput) {
        searchInput.oninput = (e) => {
            const termo = e.target.value;
            aplicarFiltro(filtroAtual);
            if (termo) {
                buscarEmpresas(termo);
            }
        };
    }
    
    // Filtros
    const filtroTodas = document.getElementById('filtro-todas');
    if (filtroTodas) {
        filtroTodas.onclick = () => aplicarFiltro('todas');
    }
    
    const filtroAtivas = document.getElementById('filtro-ativas');
    if (filtroAtivas) {
        filtroAtivas.onclick = () => aplicarFiltro('ativas');
    }
    
    const filtroInativas = document.getElementById('filtro-inativas');
    if (filtroInativas) {
        filtroInativas.onclick = () => aplicarFiltro('inativas');
    }
    
    // Inicializar filtro
    atualizarBotoesFiltro();
}

// ========================================
// INICIALIZAÇÃO AUTOMÁTICA
// ========================================

// Expor funções globalmente
if (typeof window !== 'undefined') {
    window.initGestaoEmpresas = initGestaoEmpresas;
    window.editarEmpresa = editarEmpresa;
    window.confirmarExclusao = confirmarExclusao;
    window.toggleStatusEmpresa = toggleStatusEmpresa;
    window.copiarID = copiarID;
    window.abrirModalNovaEmpresa = abrirModalNovaEmpresa;
    window.fecharModalNovaEmpresa = fecharModalNovaEmpresa;
    window.cadastrarNovaEmpresa = cadastrarNovaEmpresa;
    window.fecharModalEdicao = fecharModalEdicao;
    window.salvarEdicaoEmpresa = salvarEdicaoEmpresa;
    window.fecharModalExclusao = fecharModalExclusao;
    window.excluirEmpresa = excluirEmpresa;
}

console.log('[GESTÃO EMPRESAS] Módulo carregado - v40.14');
