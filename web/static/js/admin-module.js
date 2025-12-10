// ============================================================================
// MÓDULO DE ADMINISTRAÇÃO - SUPER ADMIN
// Versão: 42 - SUPER ADMIN COM ACESSO MASTER TOTAL (Local + Firebase)
// ============================================================================
// SUPER ADMIN = Usuário Master com acesso completo a TODAS as empresas
// Busca empresas do Firebase Cloud E LocalStorage, sem duplicatas

// ============================================================================
// FUNÇÃO PRINCIPAL - CARREGAR PAINEL ADMINISTRATIVO
// ============================================================================

function loadAdminModule(container) {
    const user = JSON.parse(localStorage.getItem('localCurrentUser'));
    
    // Verificar se é super admin
    if (!user || user.role !== 'superadmin') {
        showToast('Acesso negado! Apenas super administradores podem acessar.', 'error');
        return;
    }

    // Se não houver container, usar content-area (compatibilidade)
    const contentArea = container || document.getElementById('content-area');
    
    contentArea.innerHTML = `
        <div class="admin-panel">
            <!-- Cabeçalho do Painel -->
            <div class="admin-header">
                <div class="admin-title">
                    <i class="fas fa-shield-alt"></i>
                    <h2>Painel Master - Gestão Total de Empresas</h2>
                    <button onclick="carregarEmpresas()" class="btn btn-primary" style="margin-left: auto;">
                        <i class="fas fa-sync-alt"></i> Atualizar Dados
                    </button>
                </div>
                <p class="admin-subtitle">✨ SUPER ADMIN: Acesso total a todas as empresas (Local + Nuvem) ✨</p>
            </div>

            <!-- Estatísticas Gerais -->
            <div class="admin-stats">
                <div class="stat-card">
                    <div class="stat-icon blue">
                        <i class="fas fa-building"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="totalEmpresas">0</h3>
                        <p>Empresas Cadastradas</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon green">
                        <i class="fas fa-cloud"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="empresasFirebase">0</h3>
                        <p>No Firebase Cloud</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon orange">
                        <i class="fas fa-hdd"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="empresasLocal">0</h3>
                        <p>No LocalStorage</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon purple">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="empresasAtivas">0</h3>
                        <p>Empresas Ativas</p>
                    </div>
                </div>
            </div>

            <!-- Filtros e Busca -->
            <div class="admin-filters">
                <div class="filter-group">
                    <label>
                        <i class="fas fa-search"></i>
                        <input type="text" id="searchEmpresa" placeholder="Buscar por nome ou email..." class="search-input">
                    </label>
                </div>
                <div class="filter-group">
                    <label>
                        <i class="fas fa-filter"></i>
                        <select id="filterSegmento" class="filter-select">
                            <option value="">Todos os Segmentos</option>
                        </select>
                    </label>
                </div>
                <div class="filter-group">
                    <label>
                        <i class="fas fa-database"></i>
                        <select id="filterOrigem" class="filter-select">
                            <option value="">Todas as Origens</option>
                            <option value="firebase">Firebase Cloud</option>
                            <option value="local">LocalStorage</option>
                        </select>
                    </label>
                </div>
                <div class="filter-group">
                    <button onclick="exportarEmpresas()" class="btn-export">
                        <i class="fas fa-download"></i> Exportar CSV
                    </button>
                </div>
            </div>

            <!-- Grid de Empresas -->
            <div id="empresasGrid" class="empresas-grid">
                <div class="loading-card">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Carregando empresas do sistema...</p>
                </div>
            </div>
        </div>
    `;

    // Popular filtro de segmentos
    popularFiltroSegmentos();

    // Carregar dados das empresas (assíncrono)
    carregarEmpresas().catch(error => {
        console.error('Erro ao carregar empresas:', error);
        const grid = document.getElementById('empresasGrid');
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                <h3>Erro ao carregar empresas</h3>
                <p>${error.message || 'Tente recarregar a página'}</p>
            </div>
        `;
    });

    // Adicionar event listeners para filtros
    document.getElementById('searchEmpresa').addEventListener('input', filtrarEmpresas);
    document.getElementById('filterSegmento').addEventListener('change', filtrarEmpresas);
    document.getElementById('filterOrigem').addEventListener('change', filtrarEmpresas);
}

// ============================================================================
// POPULAR FILTRO DE SEGMENTOS
// ============================================================================

function popularFiltroSegmentos() {
    const select = document.getElementById('filterSegmento');
    
    if (typeof SEGMENTOS_EMPRESARIAIS !== 'undefined') {
        for (const [key, segmento] of Object.entries(SEGMENTOS_EMPRESARIAIS)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = segmento.nome;
            select.appendChild(option);
        }
    }
}

// ============================================================================
// CARREGAR EMPRESAS - SUPER ADMIN COM ACESSO TOTAL
// ============================================================================

async function carregarEmpresas() {
    let empresasFirebase = [];
    let empresasLocal = [];
    
    // Verificar se é super admin
    const currentUser = JSON.parse(localStorage.getItem('localCurrentUser'));
    if (!currentUser || currentUser.role !== 'superadmin') {
        showToast('Acesso negado! Apenas super administradores podem visualizar empresas.', 'error');
        return;
    }
    
    console.log('🔍 [SUPER ADMIN MASTER] Buscando TODAS as empresas do sistema...');
    
    // 1. BUSCAR DO FIREBASE CLOUD
    if (typeof buscarTodasEmpresasFirebase === 'function') {
        try {
            const timestamp = new Date().toISOString();
            console.log(`☁️ [${timestamp}] Buscando empresas do Firebase Cloud...`);
            const resultado = await buscarTodasEmpresasFirebase();
            if (resultado && resultado.length > 0) {
                empresasFirebase = resultado;
                console.log(`✅ Firebase: ${empresasFirebase.length} empresas encontradas`);
            } else {
                console.log('ℹ️ Firebase: Nenhuma empresa encontrada');
            }
        } catch (error) {
            console.warn('⚠️ Erro ao buscar do Firebase:', error.message);
        }
    } else {
        console.log('ℹ️ Firebase não disponível, usando apenas localStorage');
    }
    
    // 2. BUSCAR DO LOCALSTORAGE
    console.log('💾 Buscando empresas do localStorage...');
    const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
    
    // Filtrar APENAS role='admin' (empresas) e excluir o próprio super admin
    empresasLocal = localUsers.filter(u => 
        u.role === 'admin' && 
        u.email !== 'superadmin@quatrocantos.com' &&
        u.companyId !== 'superadmin-master'
    );
    console.log(`✅ LocalStorage: ${empresasLocal.length} empresas encontradas`);
    
    // 3. COMBINAR EMPRESAS (Firebase + Local) - Remover duplicatas por email
    const empresasMap = new Map();
    
    // Adicionar empresas do Firebase (prioridade - dados mais atualizados)
    empresasFirebase.forEach(emp => {
        empresasMap.set(emp.email, { ...emp, origem: 'firebase' });
    });
    
    // Adicionar empresas locais (se NÃO existir no Firebase)
    empresasLocal.forEach(emp => {
        if (!empresasMap.has(emp.email)) {
            empresasMap.set(emp.email, { ...emp, origem: 'local' });
        }
    });
    
    const empresas = Array.from(empresasMap.values());
    
    // Salvar para uso global nos filtros
    window.todasEmpresas = empresas;
    
    console.log('📊 SUPER ADMIN - Resumo Final:');
    console.log(`  • Firebase Cloud: ${empresasFirebase.length} empresas`);
    console.log(`  • LocalStorage: ${empresasLocal.length} empresas`);
    console.log(`  • Total (sem duplicatas): ${empresas.length} empresas`);
    console.log('🏢 Empresas:', empresas);
    
    // Atualizar estatísticas
    atualizarEstatisticas(empresas, empresasFirebase.length, empresasLocal.length);
    
    // Renderizar tabela
    renderizarTabelaEmpresas(empresas);
}

// ============================================================================
// ATUALIZAR ESTATÍSTICAS
// ============================================================================

function atualizarEstatisticas(empresas, countFirebase, countLocal) {
    // Total de empresas
    document.getElementById('totalEmpresas').textContent = empresas.length;
    
    // Empresas por origem
    document.getElementById('empresasFirebase').textContent = countFirebase;
    document.getElementById('empresasLocal').textContent = countLocal;
    
    // Empresas ativas
    const ativas = empresas.filter(e => e.ativo !== false).length;
    document.getElementById('empresasAtivas').textContent = ativas;
}

// ============================================================================
// RENDERIZAR TABELA DE EMPRESAS
// ============================================================================

function renderizarTabelaEmpresas(empresas) {
    const grid = document.getElementById('empresasGrid');
    
    if (empresas.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>Nenhuma empresa cadastrada</h3>
                <p>As empresas cadastradas aparecerão aqui</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = empresas.map(empresa => {
        const segmentoInfo = typeof SEGMENTOS_EMPRESARIAIS !== 'undefined' && empresa.segmento 
            ? SEGMENTOS_EMPRESARIAIS[empresa.segmento] 
            : null;
        
        const dataCadastro = empresa.dataCadastro 
            ? new Date(empresa.dataCadastro).toLocaleDateString('pt-BR')
            : 'Não informada';
        
        const isAtiva = empresa.ativo !== false;
        const origem = empresa.origem || 'local';
        const origemIcon = origem === 'firebase' ? 'fa-cloud' : 'fa-hdd';
        const origemColor = origem === 'firebase' ? '#3b82f6' : '#8b5cf6';
        
        return `
            <div class="empresa-card ${!isAtiva ? 'empresa-inativa' : ''}" data-origem="${origem}">
                <div class="empresa-card-header" style="background: linear-gradient(135deg, ${segmentoInfo ? segmentoInfo.cor : '#2563eb'} 0%, ${segmentoInfo ? segmentoInfo.cor + 'dd' : '#1e40af'} 100%)">
                    <div class="empresa-header-content">
                        <div class="empresa-icon">
                            <i class="fas ${segmentoInfo ? segmentoInfo.icon : 'fa-building'}"></i>
                        </div>
                        <div class="empresa-header-info">
                            <h3 class="empresa-nome">${empresa.nomeEmpresa || 'Sem nome'}</h3>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <span class="status-badge ${isAtiva ? 'status-active' : 'status-inactive'}">
                                    ${isAtiva ? 'Ativa' : 'Bloqueada'}
                                </span>
                                <span class="origem-badge" style="background: ${origemColor};">
                                    <i class="fas ${origemIcon}"></i> ${origem === 'firebase' ? 'Cloud' : 'Local'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="empresa-card-body">
                    <p class="empresa-responsavel">
                        <i class="fas fa-user"></i>
                        <strong>Responsável:</strong> ${empresa.nome || 'Administrador'}
                    </p>
                    
                    <div class="empresa-info-grid">
                        <div class="info-item">
                            <i class="fas fa-envelope"></i>
                            <span>${empresa.email}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-industry"></i>
                            <span>${segmentoInfo ? segmentoInfo.nome : 'Não definido'}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar"></i>
                            <span>Cadastro: ${dataCadastro}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-fingerprint"></i>
                            <span style="font-size: 0.85rem; color: #666;">${empresa.companyId || empresa.uid}</span>
                        </div>
                    </div>
                </div>
                
                <div class="empresa-card-actions">
                    <button onclick="verDetalhesEmpresa('${empresa.uid || empresa.email}')" class="btn-card-action btn-view" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                        <span>Visualizar</span>
                    </button>
                    <button onclick="toggleStatusEmpresa('${empresa.uid || empresa.email}')" class="btn-card-action btn-toggle" title="${isAtiva ? 'Bloquear' : 'Desbloquear'}">
                        <i class="fas fa-${isAtiva ? 'lock' : 'unlock'}"></i>
                        <span>${isAtiva ? 'Bloquear' : 'Desbloquear'}</span>
                    </button>
                    <button onclick="excluirEmpresa('${empresa.uid || empresa.email}')" class="btn-card-action btn-delete" title="Excluir Empresa">
                        <i class="fas fa-trash-alt"></i>
                        <span>Excluir</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================================
// FILTRAR EMPRESAS
// ============================================================================

function filtrarEmpresas() {
    const searchTerm = document.getElementById('searchEmpresa').value.toLowerCase();
    const segmentoFilter = document.getElementById('filterSegmento').value;
    const origemFilter = document.getElementById('filterOrigem').value;
    
    let empresas = window.todasEmpresas || [];
    
    // Filtrar por busca
    if (searchTerm) {
        empresas = empresas.filter(e => 
            (e.nomeEmpresa || '').toLowerCase().includes(searchTerm) ||
            (e.email || '').toLowerCase().includes(searchTerm) ||
            (e.nome || '').toLowerCase().includes(searchTerm) ||
            (e.companyId || '').toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtrar por segmento
    if (segmentoFilter) {
        empresas = empresas.filter(e => e.segmento === segmentoFilter);
    }
    
    // Filtrar por origem
    if (origemFilter) {
        empresas = empresas.filter(e => e.origem === origemFilter);
    }
    
    renderizarTabelaEmpresas(empresas);
}

// ============================================================================
// RESTANTE DAS FUNÇÕES (Ver detalhes, Toggle, Excluir, Exportar)
// ============================================================================

function verDetalhesEmpresa(uid) {
    const empresa = window.todasEmpresas.find(e => e.uid === uid || e.email === uid);
    
    if (!empresa) {
        showToast('Empresa não encontrada!', 'error');
        return;
    }
    
    const segmentoInfo = typeof SEGMENTOS_EMPRESARIAIS !== 'undefined' && empresa.segmento 
        ? SEGMENTOS_EMPRESARIAIS[empresa.segmento] 
        : null;
    
    const origem = empresa.origem || 'local';
    const origemIcon = origem === 'firebase' ? 'fa-cloud' : 'fa-hdd';
    const origemColor = origem === 'firebase' ? '#3b82f6' : '#8b5cf6';
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content empresa-modal">
            <div class="modal-header" style="background: linear-gradient(135deg, ${segmentoInfo ? segmentoInfo.cor : '#2563eb'} 0%, ${segmentoInfo ? segmentoInfo.cor + 'dd' : '#1e40af'} 100%)">
                <h3><i class="fas fa-building"></i> Detalhes da Empresa</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="empresa-details">
                    <div class="detail-row">
                        <label><i class="fas fa-database"></i> Origem dos Dados:</label>
                        <span class="origem-badge" style="background: ${origemColor};">
                            <i class="fas ${origemIcon}"></i> ${origem === 'firebase' ? 'Firebase Cloud' : 'LocalStorage'}
                        </span>
                    </div>
                    <div class="detail-row">
                        <label><i class="fas fa-building"></i> Nome da Empresa:</label>
                        <span>${empresa.nomeEmpresa || 'Não informado'}</span>
                    </div>
                    <div class="detail-row">
                        <label><i class="fas fa-user"></i> Responsável:</label>
                        <span>${empresa.nome || 'Não informado'}</span>
                    </div>
                    <div class="detail-row">
                        <label><i class="fas fa-envelope"></i> Email:</label>
                        <span>${empresa.email}</span>
                    </div>
                    <div class="detail-row">
                        <label><i class="fas fa-industry"></i> Segmento:</label>
                        <span>${segmentoInfo ? segmentoInfo.nome : 'Não definido'}</span>
                    </div>
                    <div class="detail-row">
                        <label><i class="fas fa-calendar-plus"></i> Data de Cadastro:</label>
                        <span>${empresa.dataCadastro ? new Date(empresa.dataCadastro).toLocaleString('pt-BR') : 'Não informada'}</span>
                    </div>
                    <div class="detail-row">
                        <label><i class="fas fa-fingerprint"></i> ID da Empresa:</label>
                        <span class="company-id">${empresa.companyId || empresa.uid}</span>
                    </div>
                    <div class="detail-row">
                        <label><i class="fas fa-signal"></i> Status:</label>
                        <span class="status-badge ${empresa.ativo !== false ? 'status-active' : 'status-inactive'}">
                            ${empresa.ativo !== false ? 'Ativa' : 'Inativa'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function toggleStatusEmpresa(uid) {
    const empresa = window.todasEmpresas.find(e => e.uid === uid || e.email === uid);
    
    if (!empresa) {
        showToast('Empresa não encontrada!', 'error');
        return;
    }
    
    const novoStatus = empresa.ativo === false;
    const acao = novoStatus ? 'ativar' : 'desativar';
    
    if (!confirm(`Deseja realmente ${acao} a empresa "${empresa.nomeEmpresa}"?`)) {
        return;
    }
    
    showLoading(`${novoStatus ? 'Ativando' : 'Desativando'} empresa...`);
    
    // Atualizar no LocalStorage
    if (empresa.origem === 'local' || !empresa.origem) {
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
        const index = localUsers.findIndex(u => u.email === empresa.email);
        
        if (index !== -1) {
            localUsers[index].ativo = novoStatus;
            localStorage.setItem('localUsers', JSON.stringify(localUsers));
            console.log(`✅ Status atualizado no LocalStorage: ${empresa.email} -> ${novoStatus ? 'ATIVA' : 'INATIVA'}`);
        }
    }
    
    // Atualizar no Firebase (se disponível)
    if (empresa.origem === 'firebase' && typeof atualizarEmpresaFirebase === 'function') {
        atualizarEmpresaFirebase(empresa.uid, { ativo: novoStatus })
            .then(() => {
                console.log(`✅ Status atualizado no Firebase: ${empresa.email} -> ${novoStatus ? 'ATIVA' : 'INATIVA'}`);
            })
            .catch(err => {
                console.warn('⚠️ Erro ao atualizar no Firebase:', err.message);
            });
    }
    
    hideLoading();
    showToast(`Empresa ${novoStatus ? 'ativada' : 'desativada'} com sucesso!`, 'success');
    
    // Recarregar lista
    setTimeout(() => carregarEmpresas(), 500);
}

function excluirEmpresa(uid) {
    const empresa = window.todasEmpresas.find(e => e.uid === uid || e.email === uid);
    
    if (!empresa) {
        showToast('Empresa não encontrada!', 'error');
        return;
    }
    
    // Confirmação dupla para segurança
    const confirmacao1 = confirm(`⚠️ ATENÇÃO: Deseja realmente EXCLUIR a empresa "${empresa.nomeEmpresa}"?\n\nEsta ação NÃO pode ser desfeita!`);
    
    if (!confirmacao1) {
        return;
    }
    
    const confirmacao2 = prompt(`Para confirmar a exclusão, digite o nome da empresa:\n"${empresa.nomeEmpresa}"`);
    
    if (confirmacao2 !== empresa.nomeEmpresa) {
        showToast('Nome incorreto. Exclusão cancelada.', 'warning');
        return;
    }
    
    showLoading('Excluindo empresa...');
    
    // Excluir do LocalStorage
    if (empresa.origem === 'local' || !empresa.origem) {
        const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
        const filteredUsers = localUsers.filter(u => u.email !== empresa.email);
        localStorage.setItem('localUsers', JSON.stringify(filteredUsers));
        console.log(`🗑️ Empresa excluída do LocalStorage: ${empresa.email}`);
        
        // Também limpar dados da empresa no localStorage
        const companyId = empresa.companyId || empresa.uid;
        if (companyId) {
            // Limpar estoque
            const estoqueKey = `estoque_${companyId}`;
            localStorage.removeItem(estoqueKey);
            
            // Limpar movimentações
            const movKey = `movimentacoes_${companyId}`;
            localStorage.removeItem(movKey);
            
            // Limpar financeiro
            const financeiroKey = `lancamentos_${companyId}`;
            localStorage.removeItem(financeiroKey);
            
            // Limpar RH
            const rhKey = `funcionarios_${companyId}`;
            localStorage.removeItem(rhKey);
            
            console.log(`🧹 Dados da empresa limpos do localStorage: ${companyId}`);
        }
    }
    
    // Excluir do Firebase (se disponível)
    if (empresa.origem === 'firebase' && typeof deletarEmpresaFirebase === 'function') {
        deletarEmpresaFirebase(empresa.uid)
            .then(() => {
                console.log(`🗑️ Empresa excluída do Firebase: ${empresa.email}`);
            })
            .catch(err => {
                console.warn('⚠️ Erro ao excluir do Firebase:', err.message);
            });
    }
    
    hideLoading();
    showToast('Empresa excluída com sucesso!', 'success');
    
    // Recarregar lista
    setTimeout(() => carregarEmpresas(), 500);
}

function exportarEmpresas() {
    const empresas = window.todasEmpresas || [];
    
    if (empresas.length === 0) {
        showToast('Nenhuma empresa para exportar!', 'warning');
        return;
    }
    
    // Cabeçalho do CSV
    let csv = 'Nome da Empresa,Email,Responsável,Segmento,Data de Cadastro,Status,Origem\n';
    
    // Dados
    empresas.forEach(empresa => {
        const segmentoInfo = typeof SEGMENTOS_EMPRESARIAIS !== 'undefined' && empresa.segmento 
            ? SEGMENTOS_EMPRESARIAIS[empresa.segmento] 
            : null;
        
        const row = [
            empresa.nomeEmpresa || 'Não informado',
            empresa.email,
            empresa.nome || 'Não informado',
            segmentoInfo ? segmentoInfo.nome : 'Não definido',
            empresa.dataCadastro ? new Date(empresa.dataCadastro).toLocaleString('pt-BR') : 'Não informada',
            empresa.ativo !== false ? 'Ativa' : 'Inativa',
            empresa.origem === 'firebase' ? 'Firebase Cloud' : 'LocalStorage'
        ];
        
        csv += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    // Download do arquivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `empresas_superadmin_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Arquivo CSV exportado com sucesso!', 'success');
}
