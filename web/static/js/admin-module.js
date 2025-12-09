// ============================================================================
// MÃ“DULO DE ADMINISTRAÃ‡ÃO - SUPER ADMIN
// ============================================================================
// Este mÃ³dulo permite ao super administrador visualizar todas as empresas
// cadastradas no sistema, seus dados e estatÃ­sticas gerais.

// ============================================================================
// FUNÃ‡ÃO PRINCIPAL - CARREGAR PAINEL ADMINISTRATIVO
// ============================================================================

function loadAdminModule(container) {
    const user = JSON.parse(localStorage.getItem('localCurrentUser'));
    
    // Verificar se Ã© super admin
    if (!user || user.role !== 'superadmin') {
        showToast('Acesso negado! Apenas super administradores podem acessar.', 'error');
        return;
    }

    // Se nÃ£o houver container, usar content-area (compatibilidade)
    const contentArea = container || document.getElementById('content-area');
    
    contentArea.innerHTML = `
        <div class="admin-panel">
            <!-- CabeÃ§alho do Painel -->
            <div class="admin-header">
                <div class="admin-title">
                    <i class="fas fa-shield-alt"></i>
                    <h2>Painel do Super Administrador</h2>
                </div>
                <p class="admin-subtitle">VisÃ£o geral de todas as empresas cadastradas no sistema</p>
            </div>

            <!-- EstatÃ­sticas Gerais -->
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
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="empresasAtivas">0</h3>
                        <p>Empresas Ativas</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon orange">
                        <i class="fas fa-industry"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="segmentosMaisUsados">-</h3>
                        <p>Segmento Mais Popular</p>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon purple">
                        <i class="fas fa-calendar-alt"></i>
                    </div>
                    <div class="stat-info">
                        <h3 id="cadastrosRecentes">0</h3>
                        <p>Cadastros Hoje</p>
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
                    <button onclick="exportarEmpresas()" class="btn-export">
                        <i class="fas fa-download"></i> Exportar CSV
                    </button>
                </div>
            </div>

            <!-- Grid de Empresas -->
            <div id="empresasGrid" class="empresas-grid">
                <div class="loading-card">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Carregando empresas...</p>
                </div>
            </div>
        </div>
    `;

    // Popular filtro de segmentos
    popularFiltroSegmentos();

    // Carregar dados das empresas
    carregarEmpresas();

    // Adicionar event listeners para filtros
    document.getElementById('searchEmpresa').addEventListener('input', filtrarEmpresas);
    document.getElementById('filterSegmento').addEventListener('change', filtrarEmpresas);
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
// CARREGAR EMPRESAS DO LOCALSTORAGE
// ============================================================================

function carregarEmpresas() {
    const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
    
    // Filtrar apenas empresas (role = 'admin'), excluindo o super admin
    const empresas = localUsers.filter(u => 
        u.role === 'admin' && 
        u.email !== 'superadmin@quatrocantos.com' &&
        u.companyId && 
        u.companyId !== 'superadmin-master'
    );
    
    console.log('ðŸ“Š Total de empresas encontradas:', empresas.length);
    console.log('ðŸ¢ Empresas:', empresas);
    
    // Atualizar estatÃ­sticas
    atualizarEstatisticas(empresas);
    
    // Renderizar tabela
    renderizarTabelaEmpresas(empresas);
}

// ============================================================================
// ATUALIZAR ESTATÃSTICAS
// ============================================================================

function atualizarEstatisticas(empresas) {
    // Total de empresas
    document.getElementById('totalEmpresas').textContent = empresas.length;
    
    // Empresas ativas (todas estÃ£o ativas por padrÃ£o)
    const ativas = empresas.filter(e => e.ativo !== false).length;
    document.getElementById('empresasAtivas').textContent = ativas;
    
    // Segmento mais popular
    if (empresas.length > 0) {
        const segmentos = {};
        empresas.forEach(e => {
            if (e.segmento) {
                segmentos[e.segmento] = (segmentos[e.segmento] || 0) + 1;
            }
        });
        
        const maisPopular = Object.entries(segmentos).sort((a, b) => b[1] - a[1])[0];
        if (maisPopular && typeof SEGMENTOS_EMPRESARIAIS !== 'undefined') {
            const segmentoInfo = SEGMENTOS_EMPRESARIAIS[maisPopular[0]];
            document.getElementById('segmentosMaisUsados').textContent = segmentoInfo ? segmentoInfo.nome : '-';
        }
    }
    
    // Cadastros hoje
    const hoje = new Date().toISOString().split('T')[0];
    const cadastrosHoje = empresas.filter(e => {
        if (!e.dataCadastro) return false;
        const dataCadastro = new Date(e.dataCadastro).toISOString().split('T')[0];
        return dataCadastro === hoje;
    }).length;
    document.getElementById('cadastrosRecentes').textContent = cadastrosHoje;
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
        
        return `
            <div class="empresa-card ${!isAtiva ? 'empresa-inativa' : ''}">
                <div class="empresa-card-header" style="background: linear-gradient(135deg, ${segmentoInfo ? segmentoInfo.cor : '#2563eb'} 0%, ${segmentoInfo ? segmentoInfo.cor + 'dd' : '#1e40af'} 100%)">
                    <div class="empresa-icon">
                        <i class="fas ${segmentoInfo ? segmentoInfo.icon : 'fa-building'}"></i>
                    </div>
                    <div class="empresa-status">
                        <span class="status-badge ${isAtiva ? 'status-active' : 'status-inactive'}">
                            ${isAtiva ? 'Ativa' : 'Bloqueada'}
                        </span>
                    </div>
                </div>
                
                <div class="empresa-card-body">
                    <h3 class="empresa-nome">${empresa.nomeEmpresa || 'Sem nome'}</h3>
                    <p class="empresa-responsavel">
                        <i class="fas fa-user"></i>
                        ${empresa.nome || 'Administrador'}
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
                            <span>${dataCadastro}</span>
                        </div>
                    </div>
                </div>
                
                <div class="empresa-card-actions">
                    <button onclick="verDetalhesEmpresa('${empresa.uid}')" class="btn-card-action btn-view" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                        <span>Visualizar</span>
                    </button>
                    <button onclick="toggleStatusEmpresa('${empresa.uid}')" class="btn-card-action btn-toggle" title="${isAtiva ? 'Bloquear' : 'Desbloquear'}">
                        <i class="fas fa-${isAtiva ? 'lock' : 'unlock'}"></i>
                        <span>${isAtiva ? 'Bloquear' : 'Desbloquear'}</span>
                    </button>
                    <button onclick="excluirEmpresa('${empresa.uid}')" class="btn-card-action btn-delete" title="Excluir">
                        <i class="fas fa-trash"></i>
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
    
    const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
    
    // Filtrar apenas empresas (role = 'admin'), excluindo o super admin
    let empresas = localUsers.filter(u => 
        u.role === 'admin' && 
        u.email !== 'superadmin@quatrocantos.com' &&
        u.companyId && 
        u.companyId !== 'superadmin-master'
    );
    
    // Filtrar por busca
    if (searchTerm) {
        empresas = empresas.filter(e => 
            (e.nomeEmpresa || '').toLowerCase().includes(searchTerm) ||
            (e.email || '').toLowerCase().includes(searchTerm) ||
            (e.nome || '').toLowerCase().includes(searchTerm)
        );
    }
    
    // Filtrar por segmento
    if (segmentoFilter) {
        empresas = empresas.filter(e => e.segmento === segmentoFilter);
    }
    
    renderizarTabelaEmpresas(empresas);
}

// ============================================================================
// VER DETALHES DA EMPRESA
// ============================================================================

function verDetalhesEmpresa(uid) {
    const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
    const empresa = localUsers.find(u => u.uid === uid);
    
    if (!empresa) {
        showToast('Empresa nÃ£o encontrada!', 'error');
        return;
    }
    
    const segmentoInfo = typeof SEGMENTOS_EMPRESARIAIS !== 'undefined' && empresa.segmento 
        ? SEGMENTOS_EMPRESARIAIS[empresa.segmento] 
        : null;
    
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
                        <label><i class="fas fa-building"></i> Nome da Empresa:</label>
                        <span>${empresa.nomeEmpresa || 'NÃ£o informado'}</span>
                    </div>
                    <div class="detail-row">
                        <label><i class="fas fa-user"></i> ResponsÃ¡vel:</label>
                        <span>${empresa.nome || 'NÃ£o informado'}</span>
                    </div>
                    <div class="detail-row">
                        <label><i class="fas fa-envelope"></i> Email:</label>
                        <span>${empresa.email}</span>
                    </div>
                    <div class="detail-row">
                        <label><i class="fas fa-industry"></i> Segmento:</label>
                        <span>${segmentoInfo ? segmentoInfo.nome : 'NÃ£o definido'}</span>
                    </div>
                    <div class="detail-row">
                        <label><i class="fas fa-calendar-plus"></i> Data de Cadastro:</label>
                        <span>${empresa.dataCadastro ? new Date(empresa.dataCadastro).toLocaleString('pt-BR') : 'NÃ£o informada'}</span>
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

// ============================================================================
// TOGGLE STATUS DA EMPRESA (BLOQUEAR/DESBLOQUEAR)
// ============================================================================

function toggleStatusEmpresa(uid) {
    const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
    const empresaIndex = localUsers.findIndex(u => u.uid === uid);
    
    if (empresaIndex === -1) {
        showToast('Empresa nÃ£o encontrada!', 'error');
        return;
    }
    
    const empresa = localUsers[empresaIndex];
    const novoStatus = !(empresa.ativo !== false);
    const acao = novoStatus ? 'desbloquear' : 'bloquear';
    
    // Confirmar aÃ§Ã£o
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content confirm-modal">
            <div class="modal-header" style="background: ${novoStatus ? '#16a34a' : '#dc2626'}">
                <h3><i class="fas fa-${novoStatus ? 'unlock' : 'lock'}"></i> ${novoStatus ? 'Desbloquear' : 'Bloquear'} Empresa</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p style="margin: 0 0 1.5rem 0; font-size: 1.1rem; text-align: center;">
                    Tem certeza que deseja <strong>${acao}</strong> a empresa <strong>${empresa.nomeEmpresa || empresa.email}</strong>?
                </p>
                ${!novoStatus ? '<p style="margin: 0 0 1.5rem 0; color: #dc2626; text-align: center;"><i class="fas fa-exclamation-triangle"></i> A empresa nÃ£o poderÃ¡ acessar o sistema enquanto estiver bloqueada.</p>' : ''}
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn-cancel">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button onclick="confirmarToggleStatus('${uid}', ${novoStatus})" class="btn-confirm" style="background: ${novoStatus ? '#16a34a' : '#dc2626'}">
                        <i class="fas fa-check"></i> Confirmar
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function confirmarToggleStatus(uid, novoStatus) {
    const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
    const empresaIndex = localUsers.findIndex(u => u.uid === uid);
    
    if (empresaIndex === -1) {
        showToast('Empresa nÃ£o encontrada!', 'error');
        return;
    }
    
    const empresa = localUsers[empresaIndex];
    empresa.ativo = novoStatus;
    
    localUsers[empresaIndex] = empresa;
    localStorage.setItem('localUsers', JSON.stringify(localUsers));
    
    showToast(
        `Empresa ${novoStatus ? 'desbloqueada' : 'bloqueada'} com sucesso!`,
        'success'
    );
    
    // Fechar modal
    document.querySelector('.modal-overlay').remove();
    
    carregarEmpresas();
}

// ============================================================================
// EDITAR EMPRESA
// ============================================================================

function editarEmpresa(uid) {
    const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
    const empresa = localUsers.find(u => u.uid === uid);
    
    if (!empresa) {
        showToast('Empresa nÃ£o encontrada!', 'error');
        return;
    }
    
    const segmentoInfo = typeof SEGMENTOS_EMPRESARIAIS !== 'undefined' && empresa.segmento 
        ? SEGMENTOS_EMPRESARIAIS[empresa.segmento] 
        : null;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content edit-empresa-modal">
            <div class="modal-header" style="background: linear-gradient(135deg, ${segmentoInfo ? segmentoInfo.cor : '#2563eb'} 0%, ${segmentoInfo ? segmentoInfo.cor + 'dd' : '#1e40af'} 100%)">
                <h3><i class="fas fa-edit"></i> Editar Empresa</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="editEmpresaForm" onsubmit="salvarEdicaoEmpresa(event, '${uid}')">
                    <div class="form-group">
                        <label><i class="fas fa-building"></i> Nome da Empresa *</label>
                        <input type="text" id="editNomeEmpresa" value="${empresa.nomeEmpresa || ''}" required class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label><i class="fas fa-user"></i> Nome do ResponsÃ¡vel *</label>
                        <input type="text" id="editNomeResponsavel" value="${empresa.nome || ''}" required class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label><i class="fas fa-envelope"></i> Email *</label>
                        <input type="email" id="editEmail" value="${empresa.email}" required class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label><i class="fas fa-industry"></i> Segmento *</label>
                        <select id="editSegmento" required class="form-input">
                            <option value="">Selecione um segmento</option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" onclick="this.closest('.modal-overlay').remove()" class="btn-cancel">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button type="submit" class="btn-confirm">
                            <i class="fas fa-save"></i> Salvar AlteraÃ§Ãµes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Popular select de segmentos
    const selectSegmento = document.getElementById('editSegmento');
    if (typeof SEGMENTOS_EMPRESARIAIS !== 'undefined') {
        for (const [key, segmento] of Object.entries(SEGMENTOS_EMPRESARIAIS)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = segmento.nome;
            if (key === empresa.segmento) {
                option.selected = true;
            }
            selectSegmento.appendChild(option);
        }
    }
}

function salvarEdicaoEmpresa(event, uid) {
    event.preventDefault();
    
    const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
    const empresaIndex = localUsers.findIndex(u => u.uid === uid);
    
    if (empresaIndex === -1) {
        showToast('Empresa nÃ£o encontrada!', 'error');
        return;
    }
    
    // Obter novos valores
    const nomeEmpresa = document.getElementById('editNomeEmpresa').value.trim();
    const nomeResponsavel = document.getElementById('editNomeResponsavel').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const segmento = document.getElementById('editSegmento').value;
    
    // Verificar se o email jÃ¡ existe em outra empresa
    const emailExiste = localUsers.some(u => u.email === email && u.uid !== uid);
    if (emailExiste) {
        showToast('Este email jÃ¡ estÃ¡ sendo usado por outra empresa!', 'error');
        return;
    }
    
    // Atualizar empresa
    localUsers[empresaIndex] = {
        ...localUsers[empresaIndex],
        nomeEmpresa,
        nome: nomeResponsavel,
        email,
        segmento,
        dataAtualizacao: new Date().toISOString()
    };
    
    localStorage.setItem('localUsers', JSON.stringify(localUsers));
    
    showToast('Empresa atualizada com sucesso!', 'success');
    
    // Fechar modal
    document.querySelector('.modal-overlay').remove();
    
    carregarEmpresas();
}

// ============================================================================
// EXCLUIR EMPRESA
// ============================================================================

function excluirEmpresa(uid) {
    const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
    const empresa = localUsers.find(u => u.uid === uid);
    
    if (!empresa) {
        showToast('Empresa nÃ£o encontrada!', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content confirm-modal">
            <div class="modal-header" style="background: #dc2626">
                <h3><i class="fas fa-exclamation-triangle"></i> Excluir Empresa</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p style="margin: 0 0 1rem 0; font-size: 1.1rem; text-align: center;">
                    Tem certeza que deseja <strong style="color: #dc2626;">EXCLUIR PERMANENTEMENTE</strong> a empresa?
                </p>
                <div style="background: #fee2e2; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="margin: 0 0 0.5rem 0; font-weight: 600;">${empresa.nomeEmpresa || 'Sem nome'}</p>
                    <p style="margin: 0; color: #666;">${empresa.email}</p>
                </div>
                <p style="margin: 0 0 1.5rem 0; color: #dc2626; text-align: center; font-weight: 500;">
                    <i class="fas fa-exclamation-circle"></i> Esta aÃ§Ã£o nÃ£o pode ser desfeita!
                </p>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button onclick="this.closest('.modal-overlay').remove()" class="btn-cancel">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                    <button onclick="confirmarExclusaoEmpresa('${uid}')" class="btn-confirm" style="background: #dc2626">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function confirmarExclusaoEmpresa(uid) {
    const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
    const empresaIndex = localUsers.findIndex(u => u.uid === uid);
    
    if (empresaIndex === -1) {
        showToast('Empresa nÃ£o encontrada!', 'error');
        return;
    }
    
    // Remover empresa
    const empresa = localUsers[empresaIndex];
    localUsers.splice(empresaIndex, 1);
    localStorage.setItem('localUsers', JSON.stringify(localUsers));
    
    showToast(`Empresa "${empresa.nomeEmpresa || empresa.email}" excluÃ­da com sucesso!`, 'success');
    
    // Fechar modal
    document.querySelector('.modal-overlay').remove();
    
    carregarEmpresas();
}

// ============================================================================
// EXPORTAR EMPRESAS PARA CSV
// ============================================================================

function exportarEmpresas() {
    const localUsers = JSON.parse(localStorage.getItem('localUsers') || '[]');
    const empresas = localUsers.filter(u => u.role === 'admin' && u.email !== 'admin@local.com');
    
    if (empresas.length === 0) {
        showToast('Nenhuma empresa para exportar!', 'warning');
        return;
    }
    
    // CabeÃ§alho do CSV
    let csv = 'Nome da Empresa,Email,ResponsÃ¡vel,Segmento,Data de Cadastro,Status\n';
    
    // Dados
    empresas.forEach(empresa => {
        const segmentoInfo = typeof SEGMENTOS_EMPRESARIAIS !== 'undefined' && empresa.segmento 
            ? SEGMENTOS_EMPRESARIAIS[empresa.segmento] 
            : null;
        
        const row = [
            empresa.nomeEmpresa || 'NÃ£o informado',
            empresa.email,
            empresa.nome || 'NÃ£o informado',
            segmentoInfo ? segmentoInfo.nome : 'NÃ£o definido',
            empresa.dataCadastro ? new Date(empresa.dataCadastro).toLocaleString('pt-BR') : 'NÃ£o informada',
            empresa.ativo !== false ? 'Ativa' : 'Inativa'
        ];
        
        csv += row.map(field => `"${field}"`).join(',') + '\n';
    });
    
    // Download do arquivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `empresas_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Arquivo CSV exportado com sucesso!', 'success');
}

