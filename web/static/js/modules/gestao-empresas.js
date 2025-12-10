/**
 * Módulo de Gestão de Empresas (Super Admin)
 * Permite visualizar, editar e excluir empresas cadastradas no Firebase
 * Acesso restrito a usuários com role === 'superadmin'
 */

let empresasList = [];
let empresaEditando = null;

/**
 * Inicializar módulo
 */
async function initGestaoEmpresas() {
    console.log('[GESTÃO] Iniciando módulo de gestão de empresas...');
    
    // Verificar se usuário é superadmin
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    if (currentUser.role !== 'superadmin') {
        if (typeof mostrarToast === 'function') {
            mostrarToast('Acesso negado. Apenas super administradores podem acessar esta área.', 'error');
        }
        setTimeout(() => showModule('dashboard'), 1000);
        return;
    }
    
    await carregarEmpresas();
    renderizarEmpresas();
    setupEventListeners();
}

/**
 * Carregar empresas do Firebase
 */
async function carregarEmpresas() {
    try {
        if (typeof showLoading === 'function') showLoading();
        
        if (typeof listarTodasEmpresasFirebase !== 'undefined') {
            empresasList = await listarTodasEmpresasFirebase();
            console.log('[GESTÃO] Empresas carregadas:', empresasList.length);
        } else {
            console.warn('[GESTÃO] Firebase offline - usando dados locais');
            empresasList = [];
        }
        
        if (typeof hideLoading === 'function') hideLoading();
    } catch (error) {
        console.error('[GESTÃO] Erro ao carregar empresas:', error);
        if (typeof mostrarToast === 'function') {
            mostrarToast('Erro ao carregar empresas', 'error');
        }
        if (typeof hideLoading === 'function') hideLoading();
    }
}

/**
 * Renderizar lista de empresas
 */
function renderizarEmpresas() {
    const container = document.getElementById('empresas-list-container');
    if (!container) return;
    
    if (empresasList.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
                <svg style="width: 64px; height: 64px; margin: 0 auto 20px; color: #d1d5db;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                <p style="font-size: 16px; font-weight: 500; margin-bottom: 8px;">Nenhuma empresa cadastrada</p>
                <p style="font-size: 14px; color: #9ca3af;">As empresas cadastradas aparecerão aqui</p>
            </div>
        `;
        return;
    }
    
    const tableHTML = `
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="border-bottom: 2px solid #e5e7eb; text-align: left;">
                        <th style="padding: 12px; font-weight: 600; color: #374151;">ID Empresa</th>
                        <th style="padding: 12px; font-weight: 600; color: #374151;">Nome Empresa</th>
                        <th style="padding: 12px; font-weight: 600; color: #374151;">Segmento</th>
                        <th style="padding: 12px; font-weight: 600; color: #374151;">Email Admin</th>
                        <th style="padding: 12px; font-weight: 600; color: #374151;">Data Criação</th>
                        <th style="padding: 12px; font-weight: 600; color: #374151; text-align: center;">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${empresasList.map(empresa => `
                        <tr style="border-bottom: 1px solid #e5e7eb;">
                            <td style="padding: 12px; color: #6b7280; font-family: monospace; font-size: 12px;">${empresa.companyId}</td>
                            <td style="padding: 12px; color: #111827; font-weight: 500;">${empresa.nomeEmpresa}</td>
                            <td style="padding: 12px; color: #6b7280;">${empresa.segmento || '-'}</td>
                            <td style="padding: 12px; color: #6b7280;">${empresa.email}</td>
                            <td style="padding: 12px; color: #6b7280;">${formatarData(empresa.criadoEm)}</td>
                            <td style="padding: 12px; text-align: center;">
                                <button onclick="editarEmpresa('${empresa.uid}')" 
                                        style="padding: 6px 12px; margin: 0 4px; background: #3b82f6; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                                    Editar
                                </button>
                                <button onclick="confirmarExclusao('${empresa.uid}', '${empresa.nomeEmpresa}')" 
                                        style="padding: 6px 12px; margin: 0 4px; background: #ef4444; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s;">
                                    Excluir
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = tableHTML;
}

/**
 * Formatar data para exibição
 */
function formatarData(timestamp) {
    if (!timestamp) return '-';
    
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Editar empresa
 */
function editarEmpresa(uid) {
    empresaEditando = empresasList.find(e => e.uid === uid);
    if (!empresaEditando) return;
    
    // Preencher modal de edição
    document.getElementById('edit-nome-empresa').value = empresaEditando.nomeEmpresa || '';
    document.getElementById('edit-segmento').value = empresaEditando.segmento || '';
    document.getElementById('edit-email').value = empresaEditando.email || '';
    document.getElementById('edit-contato').value = empresaEditando.contato || '';
    
    // Mostrar modal
    document.getElementById('modal-editar-empresa').style.display = 'flex';
}

/**
 * Salvar edição de empresa
 */
async function salvarEdicaoEmpresa() {
    if (!empresaEditando) return;
    
    const nomeEmpresa = document.getElementById('edit-nome-empresa').value.trim();
    const segmento = document.getElementById('edit-segmento').value;
    const email = document.getElementById('edit-email').value.trim();
    const contato = document.getElementById('edit-contato').value.trim();
    
    if (!nomeEmpresa || !email) {
        if (typeof mostrarToast === 'function') {
            mostrarToast('Nome da empresa e email são obrigatórios', 'error');
        }
        return;
    }
    
    try {
        if (typeof showLoading === 'function') showLoading();
        
        const dadosAtualizados = {
            nomeEmpresa,
            segmento,
            email,
            contato
        };
        
        if (typeof atualizarEmpresaFirebase !== 'undefined') {
            await atualizarEmpresaFirebase(empresaEditando.uid, dadosAtualizados);
            if (typeof mostrarToast === 'function') {
                mostrarToast('Empresa atualizada com sucesso', 'success');
            }
        } else {
            throw new Error('Firebase offline');
        }
        
        fecharModalEdicao();
        await carregarEmpresas();
        renderizarEmpresas();
        if (typeof hideLoading === 'function') hideLoading();
        
    } catch (error) {
        console.error('[GESTÃO] Erro ao atualizar empresa:', error);
        if (typeof mostrarToast === 'function') {
            mostrarToast('Erro ao atualizar empresa', 'error');
        }
        if (typeof hideLoading === 'function') hideLoading();
    }
}

/**
 * Fechar modal de edição
 */
function fecharModalEdicao() {
    document.getElementById('modal-editar-empresa').style.display = 'none';
    empresaEditando = null;
}

/**
 * Confirmar exclusão
 */
function confirmarExclusao(uid, nomeEmpresa) {
    const confirma = confirm(`Tem certeza que deseja excluir a empresa "${nomeEmpresa}"?\n\nEsta ação não pode ser desfeita.`);
    if (confirma) {
        excluirEmpresa(uid);
    }
}

/**
 * Excluir empresa
 */
async function excluirEmpresa(uid) {
    try {
        if (typeof showLoading === 'function') showLoading();
        
        if (typeof deletarEmpresaFirebase !== 'undefined') {
            await deletarEmpresaFirebase(uid);
            if (typeof mostrarToast === 'function') {
                mostrarToast('Empresa excluída com sucesso', 'success');
            }
        } else {
            throw new Error('Firebase offline');
        }
        
        await carregarEmpresas();
        renderizarEmpresas();
        if (typeof hideLoading === 'function') hideLoading();
        
    } catch (error) {
        console.error('[GESTÃO] Erro ao excluir empresa:', error);
        if (typeof mostrarToast === 'function') {
            mostrarToast('Erro ao excluir empresa', 'error');
        }
        if (typeof hideLoading === 'function') hideLoading();
    }
}

// Expor funções globalmente
window.initGestaoEmpresas = initGestaoEmpresas;
window.editarEmpresa = editarEmpresa;
window.confirmarExclusao = confirmarExclusao;

console.log('[OK] Módulo Gestão de Empresas carregado');

/**
 * Setup event listeners
 */
function setupEventListeners() {
    const btnRefresh = document.getElementById('btn-refresh-empresas');
    if (btnRefresh) {
        btnRefresh.addEventListener('click', async () => {
            await carregarEmpresas();
            renderizarEmpresas();
        });
    }
    
    const btnSalvarEdicao = document.getElementById('btn-salvar-edicao');
    if (btnSalvarEdicao) {
        btnSalvarEdicao.addEventListener('click', salvarEdicaoEmpresa);
    }
    
    const btnCancelarEdicao = document.getElementById('btn-cancelar-edicao');
    if (btnCancelarEdicao) {
        btnCancelarEdicao.addEventListener('click', fecharModalEdicao);
    }

    const btnLimparBanco = document.getElementById('btn-limpar-banco');
    if (btnLimparBanco) {
        btnLimparBanco.addEventListener('click', abrirModalLimpeza);
    }

    const btnCancelarLimpeza = document.getElementById('btn-cancelar-limpeza');
    if (btnCancelarLimpeza) {
        btnCancelarLimpeza.addEventListener('click', fecharModalLimpeza);
    }

    const btnConfirmarLimpeza = document.getElementById('btn-confirmar-limpeza');
    if (btnConfirmarLimpeza) {
        btnConfirmarLimpeza.addEventListener('click', executarLimpezaBanco);
    }
}

/**
 * Abre o modal de confirmação de limpeza
 */
function abrirModalLimpeza() {
    const modal = document.getElementById('modal-confirmar-limpeza');
    const input = document.getElementById('input-confirmar-limpeza');
    
    if (modal) {
        modal.style.display = 'flex';
        if (input) {
            input.value = '';
            setTimeout(() => input.focus(), 100);
        }
    }
}

/**
 * Fecha o modal de confirmação de limpeza
 */
function fecharModalLimpeza() {
    const modal = document.getElementById('modal-confirmar-limpeza');
    const input = document.getElementById('input-confirmar-limpeza');
    
    if (modal) {
        modal.style.display = 'none';
        if (input) input.value = '';
    }
}

/**
 * Executa a limpeza do banco de dados
 */
async function executarLimpezaBanco() {
    const input = document.getElementById('input-confirmar-limpeza');
    
    if (!input || input.value.trim().toUpperCase() !== 'CONFIRMAR') {
        mostrarToast('Digite CONFIRMAR para prosseguir', 'error');
        return;
    }

    try {
        if (typeof showLoading === 'function') showLoading('Limpando banco de dados... Aguarde...');
        
        fecharModalLimpeza();

        // Chamar função do firestore-service para limpar o banco
        if (typeof limparBancoDadosFirebase === 'function') {
            const resultado = await limparBancoDadosFirebase();
            
            if (resultado.success) {
                mostrarToast(resultado.message, 'success');
                
                // Recarregar a lista de empresas
                setTimeout(async () => {
                    await carregarEmpresas();
                    renderizarEmpresas();
                }, 1500);
            } else {
                mostrarToast(resultado.message || 'Erro ao limpar banco de dados', 'error');
            }
        } else {
            throw new Error('Função limparBancoDadosFirebase não disponível');
        }
        
    } catch (error) {
        console.error('[ERRO] Limpar banco:', error);
        mostrarToast('Erro ao limpar banco de dados', 'error');
    } finally {
        if (typeof hideLoading === 'function') hideLoading();
    }
}

// Expor funções globalmente
window.initGestaoEmpresas = initGestaoEmpresas;
window.editarEmpresa = editarEmpresa;
window.confirmarExclusao = confirmarExclusao;

console.log('[OK] Módulo Gestão de Empresas carregado');

