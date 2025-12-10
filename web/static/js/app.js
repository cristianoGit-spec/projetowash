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
 * Exibe o módulo na área de conteúdo (SEM MODAL - estilo PrescrMed)
 * @param {string} moduleName - Nome do modulo a ser exibido
 */
function showModule(moduleName) {
    console.log('[NAV] Carregando módulo:', moduleName);
    
    // Obter área de conteúdo
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) {
        console.error('[ERROR] contentArea não encontrada');
        return;
    }
    
    // Atualizar navegação ativa
    updateActiveSidebarItem(moduleName);
    
    // Dashboard é a página principal
    if (moduleName === 'dashboard') {
        // Esconder todo conteúdo e mostrar apenas dashboard
        contentArea.innerHTML = `
            <section id="dashboardSection" class="dashboard-section">
                <!-- Alertas de Estoque Baixo -->
                <div id="stockAlerts" class="hidden"></div>
                
                <!-- Cards de Estatísticas - Estilo Limpo -->
                <div class="cards-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; margin-bottom: 2rem;">
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; border-left: 4px solid #3b82f6; transition: all 0.2s ease;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 48px; height: 48px; background: rgba(59, 130, 246, 0.1); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: #3b82f6; font-size: 1.25rem; flex-shrink: 0;">
                                <i class="fas fa-boxes"></i>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="color: #6b7280; font-size: 0.875rem; margin-bottom: 0.25rem;">Total de Produtos</div>
                                <div style="font-size: 1.875rem; font-weight: 700; color: #0f172a;" id="statTotalProdutos">0</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; border-left: 4px solid #10b981; transition: all 0.2s ease;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 48px; height: 48px; background: rgba(16, 185, 129, 0.1); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: #10b981; font-size: 1.25rem; flex-shrink: 0;">
                                <i class="fas fa-cubes"></i>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="color: #6b7280; font-size: 0.875rem; margin-bottom: 0.25rem;">Itens em Estoque</div>
                                <div style="font-size: 1.875rem; font-weight: 700; color: #0f172a;" id="statTotalItens">0</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; border-left: 4px solid #8b5cf6; transition: all 0.2s ease;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 48px; height: 48px; background: rgba(139, 92, 246, 0.1); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: #8b5cf6; font-size: 1.25rem; flex-shrink: 0;">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="color: #6b7280; font-size: 0.875rem; margin-bottom: 0.25rem;">Valor em Estoque</div>
                                <div style="font-size: 1.875rem; font-weight: 700; color: #0f172a;" id="statValorTotal">R$ 0,00</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: white; border: 1px solid #e5e7eb; border-radius: 0.75rem; padding: 1.5rem; border-left: 4px solid #0ea5e9; transition: all 0.2s ease;">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                            <div style="width: 48px; height: 48px; background: rgba(14, 165, 233, 0.1); border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: #0ea5e9; font-size: 1.25rem; flex-shrink: 0;">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div style="flex: 1; min-width: 0;">
                                <div style="color: #6b7280; font-size: 0.875rem; margin-bottom: 0.25rem;">Vendas do Mês</div>
                                <div style="font-size: 1.875rem; font-weight: 700; color: #0f172a;" id="statVendasMes">R$ 0,00</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Gráficos -->
                <div class="cards-grid mt-4">
                    <div class="card">
                        <div class="card-header">
                            <h3>Movimentações Recentes</h3>
                        </div>
                        <div class="card-body">
                            <canvas id="chartMovimentacoes"></canvas>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3>Top 5 Produtos</h3>
                        </div>
                        <div class="card-body">
                            <canvas id="chartTopProdutos"></canvas>
                        </div>
                    </div>
                </div>

                <div class="card mt-4">
                    <div class="card-header">
                        <h3>Eficiência da Linha</h3>
                    </div>
                    <div class="card-body">
                        <canvas id="chartEficiencia"></canvas>
                    </div>
                </div>
                
                <!-- Histórico Recente -->
                <div class="card mt-4">
                    <div class="card-header">
                        <h3>Últimas Movimentações</h3>
                    </div>
                    <div class="card-body">
                        <div id="historicoRecente" class="history-list">
                            <!-- Preenchido via JS -->
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        // Carregar dados do dashboard
        if (typeof loadDashboard === 'function') {
            setTimeout(() => {
                loadDashboard().catch(err => {
                    console.error('[ERROR] Erro ao carregar dashboard:', err);
                    showToast('Erro ao carregar módulo. Tente novamente.', 'error');
                });
            }, 100);
        }
        return;
    }
    
    // Para outros módulos, carregar na área de conteúdo (SEM MODAL)
    contentArea.innerHTML = '<div id="moduleContent" style="width: 100%;"></div>';
    const moduleContent = document.getElementById('moduleContent');
    
    // Carregar conteúdo do módulo
    if (moduleName === 'admin') {
        // Admin é especial
        if (typeof loadAdminModule === 'function') {
            loadAdminModule(moduleContent);
        } else {
            moduleContent.innerHTML = '<div class="alert alert-danger">Módulo admin não disponível</div>';
        }
    } else if (typeof loadModuleContent === 'function') {
        // Usar o loader modular para os outros módulos
        loadModuleContent(moduleName, moduleContent);
    } else {
        console.error('[ERROR] loadModuleContent não está disponível');
        moduleContent.innerHTML = '<div class="alert alert-danger">Erro ao carregar módulo. Recarregue a página.</div>';
    }
}

/**
 * Atualiza o item ativo na sidebar (NOVO LAYOUT V40)
 * @param {string} moduleName - Nome do módulo ativo
 */
function updateActiveSidebarItem(moduleName) {
    console.log('[NAV] Ativando módulo:', moduleName);
    
    // Atualizar título da página e breadcrumb
    const pageTitle = document.getElementById('pageTitle');
    const breadcrumb = document.getElementById('breadcrumb');
    
    const moduleTitles = {
        'dashboard': 'Dashboard',
        'operacional': 'Operacional',
        'estoque-entrada': 'Entrada de Estoque',
        'estoque-saida': 'Saída de Estoque',
        'visualizar': 'Saldo de Estoque',
        'financeiro': 'Financeiro',
        'rh': 'Recursos Humanos',
        'historico': 'Histórico',
        'admin': 'Administração'
    };
    
    if (pageTitle) {
        pageTitle.textContent = moduleTitles[moduleName] || 'Dashboard';
    }
    
    if (breadcrumb) {
        const modulePath = moduleTitles[moduleName] || 'Dashboard';
        breadcrumb.innerHTML = `
            <div class="breadcrumb-item"><i class="fas fa-home"></i> Início</div>
            <div class="breadcrumb-item active">${modulePath}</div>
        `;
    }
    
    // Atualizar itens ativos da sidebar
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
        
        // Verificar se o onclick corresponde ao módulo
        const onclick = item.getAttribute('onclick');
        if (onclick && onclick.includes(`'${moduleName}'`)) {
            item.classList.add('active');
        }
    });
    
    // Fechar sidebar mobile após navegação
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        if (overlay) overlay.classList.remove('active');
    }
}
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
 * Fecha o modal e volta para o dashboard (REMOVIDO - Agora tudo na mesma área)
 */
function closeModule() {
    console.log('[NAV] Voltando para dashboard');
    showModule('dashboard');
}

// ============================================================================
// FUNCOES DE NOTIFICACAO
// ============================================================================

/**
 * Exibe uma notificação toast
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da notificacao (success, error, warning)
 * @param {number} duration - Duração em ms (padrão 3000)
 */
function showToast(message, type = 'success', duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    // Limpar timeout anterior se existir
    if (window.toastTimeout) {
        clearTimeout(window.toastTimeout);
    }
    
    // Configurar novo timeout
    window.toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
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
    console.log('[START] Mostrando aplicação...');
    
    // Carregar dados locais antes de mostrar o app
    if (typeof loadLocalData === 'function') {
        loadLocalData();
    }
    
    document.getElementById('authContainer').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');
    
    // Obter usuario atual
    const user = typeof localCurrentUser !== 'undefined' 
        ? localCurrentUser 
        : (typeof currentUser !== 'undefined' ? currentUser : null);
        
    const userName = user ? (user.email || user.nome || user.displayName || 'Usuario') : 'Usuario';
    
    console.log('👤 Usuário atual:', userName);
    console.log('[INFO] Empresa:', user?.nomeEmpresa || 'N/A');
    
    const userDisplayElement = document.getElementById('userEmail');
    if (userDisplayElement) {
        userDisplayElement.textContent = userName;
    }
    
    // Atualizar informações da empresa
    if (user) {
        const companyNameEl = document.getElementById('companyName');
        const companyIdEl = document.getElementById('companyId');
        const userCompanyInfoEl = document.getElementById('userCompanyInfo');
        const headerCompanyNameEl = document.getElementById('headerCompanyName');
        
        if (companyNameEl) {
            companyNameEl.textContent = user.nomeEmpresa || 'Sem empresa';
        } 
        
        if (companyIdEl) {
            companyIdEl.textContent = `ID: ${user.companyId || 'N/A'}`;
        } 
        
        if (userCompanyInfoEl) {
            userCompanyInfoEl.textContent = user.nomeEmpresa || 'Empresa não informada';
        }
        
        // Atualizar nome da empresa no header
        if (headerCompanyNameEl) {
            headerCompanyNameEl.textContent = user.nomeEmpresa || 'Empresa Local Demo';
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
    console.log('[OK] Sistema Quatro Cantos v2.0 iniciado');
    
    // Configurar modal para fechar ao clicar fora
    const modalContainer = document.getElementById('modalContainer');
    if (modalContainer) {
        modalContainer.addEventListener('click', (e) => {
            if (e.target === modalContainer) {
                closeModule();
            }
        });
    }
    
    // Verificar modo de operacao
    if (typeof localCurrentUser !== 'undefined' && localCurrentUser) {
        console.log('[MODE] Modo Local/Demo ativado');
    } else {
        console.log('[MODE] Modo Firebase ativado');
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
