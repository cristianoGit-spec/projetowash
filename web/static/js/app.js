// ============================================================================
// SISTEMA QUATRO CANTOS - JAVASCRIPT PRINCIPAL
// Arquivo: app.js
// Descricao: Funcoes principais do sistema (100% frontend)
// ============================================================================

// Constantes e Configuracoes
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';
const isProduction = window.location.hostname.includes('netlify.app');

// Sistema funciona 100% no frontend (localStorage)
// Dados armazenados localmente no navegador
// Compatível com Netlify e hospedagem estática

// ============================================================================
// FUNCOES DE MODAL
// ============================================================================

/**
 * Exibe o modal com o modulo selecionado
 * @param {string} moduleName - Nome do modulo a ser exibido
 */
function showModule(moduleName) {
    // Dashboard é especial - não usa modal, apenas mostra a seção
    if (moduleName === 'dashboard') {
        // Esconder modal se estiver aberto
        const modal = document.getElementById('modalContainer');
        if (modal) modal.classList.add('hidden');
        
        // Mostrar seção do dashboard
        const dashboardSection = document.getElementById('dashboardSection');
        if (dashboardSection) {
            dashboardSection.style.display = 'block';
        }
        
        // Atualizar estados ativos da sidebar
        updateActiveSidebarItem('dashboard');
        
        // Carregar dados do dashboard
        if (typeof loadDashboard === 'function') {
            loadDashboard().catch(err => {
                console.error('❌ Erro ao carregar dashboard:', err);
                showToast('Erro ao carregar módulo. Tente novamente.', 'error');
            });
        } else {
            console.error('❌ Função loadDashboard não disponível');
        }
        return;
    }
    
    // Para outros módulos, usar modal
    const modal = document.getElementById('modalContainer');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    // Esconder dashboard section se estiver visível
    const dashboardSection = document.getElementById('dashboardSection');
    if (dashboardSection) {
        dashboardSection.style.display = 'none';
    }
    
    // Definir titulo baseado no modulo
    const titles = {
        'operacional': 'Modulo Operacional - Capacidade de Producao',
        'estoque-entrada': 'Modulo Estoque - Entrada de Produtos',
        'estoque-saida': 'Modulo Estoque - Saida de Produtos',
        'financeiro': 'Modulo Financeiro - Custos e Lucros',
        'rh': 'Modulo RH - Folha de Pagamento',
        'visualizar': 'Visualizar Estoque Completo',
        'historico': 'Historico de Movimentacoes',
        'admin': 'Painel de Administração - Gestão de Empresas'
    };
    
    modalTitle.textContent = titles[moduleName] || 'Modulo';
    
    // Atualizar estados ativos da sidebar
    updateActiveSidebarItem(moduleName);
    
    // Carregar conteudo do modulo usando o loader modular
    if (moduleName === 'admin') {
        // Admin é especial e não está no loader modular
        loadAdminModule(modalBody);
    } else if (typeof loadModuleContent === 'function') {
        // Usar o loader modular para os outros módulos
        loadModuleContent(moduleName, modalBody);
    } else {
        console.error('❌ loadModuleContent não está disponível');
        modalBody.innerHTML = '<p>Erro ao carregar módulo. Recarregue a página.</p>';
    }
    
    // Mostrar modal
    modal.classList.remove('hidden');
}

/**
 * Atualiza o item ativo na sidebar
 * @param {string} moduleName - Nome do módulo ativo
 */
function updateActiveSidebarItem(moduleName) {
    // Desktop sidebar
    const sidebarItems = document.querySelectorAll('.module-card-side');
    sidebarItems.forEach(item => {
        item.classList.remove('active');
        const itemModule = item.getAttribute('onclick');
        if (itemModule && itemModule.includes(`'${moduleName}'`)) {
            item.classList.add('active');
        }
    });
    
    // Mobile sidebar
    const mobileButtons = document.querySelectorAll('.module-nav-btn');
    mobileButtons.forEach(btn => {
        btn.classList.remove('active');
        const btnModule = btn.getAttribute('data-module') || btn.getAttribute('onclick');
        if (btnModule && (btnModule === moduleName || btnModule.includes(`'${moduleName}'`))) {
            btn.classList.add('active');
        }
    });
}

/**
 * Fecha o modal e volta para o dashboard
 */
function closeModule() {
    const modal = document.getElementById('modalContainer');
    modal.classList.add('hidden');
    
    // Voltar para o dashboard
    showModule('dashboard');
}

// Fechar modal ao clicar fora
document.addEventListener('DOMContentLoaded', () => {
    const modalContainer = document.getElementById('modalContainer');
    
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModule();
        }
    });
});

// ============================================================================
// FUNCOES DE NOTIFICACAO
// ============================================================================

/**
 * Exibe uma notificacao toast
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da notificacao (success, error, warning)
 */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ============================================================================
// FUNCOES DE LOADING
// ============================================================================

/**
 * Exibe o overlay de loading
 * @param {string} message - Mensagem opcional
 */
function showLoading(message = 'Processando...') {
    const overlay = document.getElementById('loadingOverlay');
    const p = overlay.querySelector('p');
    if (p) p.textContent = message;
    overlay.classList.remove('hidden');
}

/**
 * Oculta o overlay de loading
 */
function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('hidden');
}

// ============================================================================
// FUNCOES DE API (Legado - mantido para compatibilidade)
// ============================================================================

/**
 * Faz uma requisicao a API (Legado)
 * @param {string} endpoint - Endpoint da API
 * @param {object} options - Opcoes da requisicao (method, body, etc)
 * @returns {Promise} Resposta da API
 */
async function apiRequest(endpoint, options = {}) {
    try {
        // Adiciona o header de API Key se estiver definido
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (typeof SERVER_API_KEY !== 'undefined' && SERVER_API_KEY) {
            headers['X-API-KEY'] = SERVER_API_KEY;
        }

        // Adicionar header de Role para RBAC (Segurança)
        const user = typeof localCurrentUser !== 'undefined' ? localCurrentUser : (typeof currentUser !== 'undefined' ? currentUser : null);
        const isUserAdmin = typeof localIsAdmin !== 'undefined' ? localIsAdmin : (typeof isAdmin !== 'undefined' ? isAdmin : false);
        
        if (user || isUserAdmin) {
            let role = 'user';
            if (isUserAdmin) {
                role = 'admin';
            } else if (user && ['Gerente', 'Diretor', 'Supervisor', 'RH', 'Estoque'].includes(user.cargo)) {
                // Cargos de gestão ou específicos assumem papel de manager para suas áreas
                // Na implementação real, o backend validaria se o manager tem permissão para a área específica
                role = 'manager';
            }
            headers['X-User-Role'] = role;
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: headers,
            ...options
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Erro na requisicao');
        }
        
        return data;
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// ============================================================================
// FUNCOES AUXILIARES
// ============================================================================

/**
 * Formata numero como moeda brasileira
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

/**
 * Formata numero com separadores de milhares
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado
 */
function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
}

/**
 * Valida se um campo esta vazio
 * @param {string} value - Valor a ser validado
 * @returns {boolean} True se valido, false caso contrario
 */
function validateRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

/**
 * Valida se um numero e positivo
 * @param {number} value - Valor a ser validado
 * @returns {boolean} True se valido, false caso contrario
 */
function validatePositive(value) {
    return !isNaN(value) && parseFloat(value) > 0;
}

/**
 * Cria elemento HTML a partir de uma string
 * @param {string} html - HTML string
 * @returns {HTMLElement} Elemento HTML
 */
function createElementFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
}

/**
 * Formata timestamp do Firestore (Data e Hora)
 * @param {object} timestamp - Timestamp do Firestore
 * @returns {string} Data e Hora formatada
 */
function formatDateTime(timestamp) {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else {
        date = new Date(timestamp);
    }
    
    return date.toLocaleString('pt-BR');
}

/**
 * Formata timestamp do Firestore (Apenas Data)
 * @param {object} timestamp - Timestamp do Firestore
 * @returns {string} Data formatada
 */
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    let date;
    if (timestamp.toDate) {
        date = timestamp.toDate();
    } else {
        date = new Date(timestamp);
    }
    
    return date.toLocaleDateString('pt-BR');
}

// Mantendo compatibilidade com nome antigo se houver uso
const formatTimestamp = formatDateTime;

// ============================================================================
// FUNCOES DE AUTENTICACAO
// ============================================================================

/**
 * Exibir container de autenticacao
 */
function showAuth() {
    document.getElementById('authContainer').classList.remove('hidden');
    document.getElementById('appContainer').classList.add('hidden');
}

/**
 * Exibir container da aplicacao
 */
function showApp() {
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    
    // Obter usuario atual
    const user = typeof localCurrentUser !== 'undefined' 
        ? localCurrentUser 
        : (typeof currentUser !== 'undefined' ? currentUser : null);
        
    console.log('🔐 showApp() - Usuário logado:', user);
    console.log('🏢 Nome da Empresa:', user?.nomeEmpresa);
    console.log('🆔 ID da Empresa:', user?.companyId);
        
    const userName = user ? (user.email || user.nome || user.displayName || 'Usuario') : 'Usuario';
    
    const userDisplayElement = document.getElementById('userEmail');
    if (userDisplayElement) {
        userDisplayElement.textContent = userName;
    }
    
    // Atualizar informações da empresa
    if (user) {
        const companyNameEl = document.getElementById('companyName');
        const companyIdEl = document.getElementById('companyId');
        const userCompanyInfoEl = document.getElementById('userCompanyInfo');
        
        console.log('📋 Elementos encontrados:', {
            companyNameEl: !!companyNameEl,
            companyIdEl: !!companyIdEl,
            userCompanyInfoEl: !!userCompanyInfoEl
        });
        
        if (companyNameEl) {
            const nomeEmpresa = user.nomeEmpresa || 'Sem empresa';
            companyNameEl.textContent = nomeEmpresa;
            console.log('✅ Nome da empresa atualizado:', nomeEmpresa);
        } else {
            console.warn('⚠️ Elemento companyName não encontrado');
        }
        
        if (companyIdEl) {
            const companyId = user.companyId || 'N/A';
            companyIdEl.textContent = `ID: ${companyId}`;
            console.log('✅ ID da empresa atualizado:', companyId);
        } else {
            console.warn('⚠️ Elemento companyId não encontrado');
        }
        
        if (userCompanyInfoEl) {
            const infoEmpresa = user.nomeEmpresa || 'Empresa não informada';
            userCompanyInfoEl.textContent = infoEmpresa;
            console.log('✅ Info da empresa atualizada:', infoEmpresa);
        } else {
            console.warn('⚠️ Elemento userCompanyInfo não encontrado');
        }
    }
    
    // Mostrar/ocultar botoes admin
    const isUserAdmin = typeof localIsAdmin !== 'undefined' ? localIsAdmin : (typeof isAdmin !== 'undefined' ? isAdmin : false);
    const isSuperAdmin = (typeof localCurrentUser !== 'undefined' && localCurrentUser && localCurrentUser.role === 'superadmin') ||
                         (user && user.role === 'superadmin');
    
    const adminButtons = document.querySelectorAll('.admin-only');
    adminButtons.forEach(btn => {
        if (isUserAdmin || isSuperAdmin) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    });
    
    // Mostrar/ocultar botoes super admin
    const superAdminButtons = document.querySelectorAll('.superadmin-only');
    superAdminButtons.forEach(btn => {
        if (isSuperAdmin) {
            btn.classList.remove('hidden');
        } else {
            btn.classList.add('hidden');
        }
    });

    // Filtrar modulos por cargo
    filterModulesByRole(user, isUserAdmin || isSuperAdmin);
}

/**
 * Filtrar modulos baseado no cargo do usuario
 */
function filterModulesByRole(user, isAdmin) {
    // Selecionar cards e botoes de navegacao
    const modules = document.querySelectorAll('.module-card, .module-nav-btn, .module-card-side');
    
    // Se for admin, mostra tudo (exceto o que ja foi tratado pela classe admin-only)
    if (isAdmin) {
        modules.forEach(module => {
            if (!module.classList.contains('admin-only')) {
                module.classList.remove('hidden');
            }
        });
        return;
    }
    
    const cargo = user && user.cargo ? user.cargo : '';
    const allowedModules = user && user.allowedModules ? user.allowedModules : [];
    
    modules.forEach(module => {
        // Pular modulos admin-only (ja tratados)
        if (module.classList.contains('admin-only')) return;
        
        const moduleName = module.getAttribute('data-module');
        let shouldShow = false;
        
        // Verificar se o modulo esta na lista de permitidos (nova logica)
        if (allowedModules.length > 0) {
            if (allowedModules.includes(moduleName)) {
                shouldShow = true;
            }
        } else {
            // Fallback para logica antiga baseada em cargo
            switch(cargo) {
                case 'Financeiro':
                    if (moduleName === 'financeiro') shouldShow = true;
                    break;
                case 'Estoque':
                    if (['estoque-entrada', 'estoque-saida', 'visualizar'].includes(moduleName)) shouldShow = true;
                    break;
                case 'RH':
                    if (moduleName === 'rh') shouldShow = true;
                    break;
                case 'Administrativo':
                    if (moduleName === 'operacional') shouldShow = true;
                    break;
                default:
                    shouldShow = false;
            }
        }
        
        if (shouldShow) {
            module.classList.remove('hidden');
        } else {
            module.classList.add('hidden');
        }
    });
}

/**
 * Fazer logout do sistema
 */
async function handleLogout() {
    try {
        showLoading('Saindo...');
        
        // Tentar modo local primeiro
        if (typeof logoutLocal !== 'undefined') {
            logoutLocal();
            showAuth();
            showToast('Logout realizado com sucesso', 'success');
        } else {
            // Modo Firebase
            await logout();
        }
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
        showToast('Erro ao fazer logout', 'error');
    } finally {
        hideLoading();
    }
}

// ============================================================================
// FUNCOES DE DADOS (ABSTRAÇÁO)
// ============================================================================

/**
 * Obtem a lista de produtos de qualquer fonte disponivel (Firestore, Local ou API)
 * @returns {Promise<Array>} Lista de produtos
 */
async function obterDadosEstoque() {
    // Priorizar Firebase se estiver inicializado
    if (typeof firebaseInitialized !== 'undefined' && firebaseInitialized && typeof listarProdutos !== 'undefined') {
        return await listarProdutos();
    } else if (typeof listarProdutosLocal !== 'undefined') {
        return await listarProdutosLocal();
    } else {
        try {
            const response = await apiRequest('/estoque/produtos', { method: 'GET' });
            return response.data.produtos || [];
        } catch (e) {
            console.error("Erro ao buscar produtos via API", e);
            return [];
        }
    }
}

/**
 * Obtem historico de movimentacoes de qualquer fonte disponivel
 * @returns {Promise<Array>} Lista de movimentacoes
 */
async function obterHistoricoMovimentacoes() {
    if (typeof firebaseInitialized !== 'undefined' && firebaseInitialized && typeof buscarHistorico !== 'undefined') {
        return await buscarHistorico();
    } else if (typeof buscarHistoricoLocal !== 'undefined') {
        return await buscarHistoricoLocal();
    }
    return [];
}

/**
 * Obtem estatisticas gerais de qualquer fonte disponivel
 * @returns {Promise<Object>} Objeto com estatisticas
 */
async function obterEstatisticas() {
    if (typeof firebaseInitialized !== 'undefined' && firebaseInitialized && typeof buscarEstatisticas !== 'undefined') {
        return await buscarEstatisticas();
    } else if (typeof buscarEstatisticasLocal !== 'undefined') {
        return await buscarEstatisticasLocal();
    }
    return {};
}

/**
 * Salva um novo produto no estoque
 * @param {Object} produto - Dados do produto
 */
async function salvarProdutoEstoque(produto) {
    let result;
    if (typeof firebaseInitialized !== 'undefined' && firebaseInitialized && typeof cadastrarProdutoFirestore !== 'undefined') {
        result = await cadastrarProdutoFirestore(produto);
    } else if (typeof cadastrarProdutoFirestoreLocal !== 'undefined') {
        result = await cadastrarProdutoFirestoreLocal(
            produto.codigo,
            produto.nome,
            produto.quantidade,
            produto.data,
            produto.fornecedor,
            produto.local,
            produto.valor
        );
    } else {
        result = await apiRequest('/estoque/entrada', {
            method: 'POST',
            body: JSON.stringify(produto)
        });
    }
    
    // Atualizar dashboard se estiver ativo
    atualizarDashboardSeAtivo();
    
    return result;
}

/**
 * Registra saida de produto
 * @param {string} nomeProduto - Nome do produto
 * @param {number} quantidade - Quantidade a sair
 * @param {string} produtoId - ID do produto (para modo local)
 * @param {number} valorVenda - Valor da venda (para modo local)
 */
async function registrarSaidaEstoque(nomeProduto, quantidade, produtoId, valorVenda) {
    let result;
    if (typeof firebaseInitialized !== 'undefined' && firebaseInitialized && typeof registrarSaidaProduto !== 'undefined') {
        result = await registrarSaidaProduto(nomeProduto, quantidade);
    } else if (typeof registrarSaidaProdutoLocal !== 'undefined') {
        result = await registrarSaidaProdutoLocal(produtoId, quantidade, valorVenda);
    } else {
        result = await apiRequest('/estoque/saida', {
            method: 'POST',
            body: JSON.stringify({
                nome: nomeProduto,
                quantidade: quantidade
            })
        });
    }
    
    // Atualizar dashboard se estiver ativo
    atualizarDashboardSeAtivo();
    
    return result;
}

/**
 * Atualiza o dashboard se estiver na view ativa
 */
function atualizarDashboardSeAtivo() {
    // Verificar se o dashboard está visível
    const dashboardContainer = document.getElementById('dashboardContainer');
    if (dashboardContainer && !dashboardContainer.classList.contains('hidden') && typeof loadDashboard === 'function') {
        console.log('Atualizando dashboard após movimentação...');
        setTimeout(() => {
            loadDashboard().catch(err => console.error('Erro ao atualizar dashboard:', err));
        }, 500); // Delay para garantir que os dados foram salvos
    }
}

// ============================================================================
// INICIALIZACAO
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sistema Quatro Cantos v2.0 iniciado');
    
    // Verificar modo de operacao
    if (typeof localCurrentUser !== 'undefined') {
        console.log('Modo Local/Demo ativado');
        console.log('Usuario admin padrao: admin@local.com / admin123');
    } else {
        console.log('Modo Firebase ativado');
        console.log('Aguardando autenticacao...');
    }
});


// ============================================================================
// FUNCOES DE UI (MOBILE)
// ============================================================================

/**
 * Alternar menu mobile (Sidebar)
 */
function toggleMobileMenu() {
    const sidebar = document.getElementById('mobileSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }
}

/**
 * Alternar submenu de Estoque na Sidebar Desktop
 */
function toggleEstoqueSubmenu(event) {
    event.stopPropagation();
    
    const submenu = document.getElementById('estoqueSubmenu');
    const button = event.currentTarget;
    
    if (submenu && button) {
        submenu.classList.toggle('open');
        button.classList.toggle('open');
    }
}

/**
 * Alternar submenu de Estoque na Sidebar Mobile
 */
function toggleEstoqueSubmenuMobile(event) {
    event.stopPropagation();
    
    const submenu = document.getElementById('estoqueSubmenuMobile');
    const button = event.currentTarget;
    
    if (submenu && button) {
        submenu.classList.toggle('open');
        button.classList.toggle('open');
    }
}
